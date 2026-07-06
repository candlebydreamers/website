// supabase/functions/create-razorpay-order/index.ts
// Creates a Razorpay order server-side with verified pricing.
// The amount is calculated from the database — never trusted from the client.
// @ts-nocheck — This file runs on Deno (Supabase Edge Functions), not Node.js.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- 1. Authenticate the user ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

    // Create a Supabase client with the user's JWT to verify auth
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 2. Parse the request body ---
    const body = await req.json();
    const { cartItems, shippingDetails } = body;

    // cartItems expected: [{ productId: string, size: string, quantity: number }]
    // shippingDetails expected: { fullName, email, phone, address, city, state, zipCode }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!shippingDetails || !shippingDetails.fullName || !shippingDetails.email || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.city || !shippingDetails.state || !shippingDetails.zipCode) {
      return new Response(JSON.stringify({ error: "Missing shipping details" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 3. Verify pricing from database (NEVER trust client-side amounts) ---
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const productIds = [...new Set(cartItems.map((item: any) => item.productId))];
    const { data: products, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, discount_price, price_250g, discount_price_250g, is_visible")
      .in("id", productIds);

    if (productError || !products) {
      return new Response(JSON.stringify({ error: "Failed to fetch products" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build a product map for fast lookups
    const productMap = new Map(products.map((p: any) => [p.id, p]));

    // Validate each cart item and compute server-side subtotal
    let subtotal = 0;
    const verifiedItems: any[] = [];

    for (const item of cartItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        return new Response(JSON.stringify({ error: `Product not found: ${item.productId}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!product.is_visible) {
        return new Response(JSON.stringify({ error: `Product is no longer available: ${product.name}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const quantity = Math.max(1, Math.floor(Number(item.quantity)));
      const is250g = (item.size || "").includes("250g");
      let unitPrice = 0;
      if (is250g && product.price_250g != null) {
          unitPrice = product.discount_price_250g ? Number(product.discount_price_250g) : Number(product.price_250g);
      } else {
          unitPrice = product.discount_price ? Number(product.discount_price) : Number(product.price);
      }
      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;

      verifiedItems.push({
        product_id: product.id,
        name: product.name,
        price: unitPrice,
        quantity: quantity,
        size: item.size || "Standard",
      });
    }

    // --- 4. Fetch tax/shipping settings from database ---
    const { data: settings } = await supabaseAdmin.from("settings").select("*");
    const settingsMap: Record<string, string> = {};
    if (settings) {
      for (const s of settings) {
        settingsMap[s.key] = s.value;
      }
    }

    const taxRate = Number(settingsMap.tax_rate || "0.18");
    const shippingCharge = Number(settingsMap.shipping_charge || "100");
    const freeShippingThreshold = Number(settingsMap.free_shipping_threshold || "1200");

    const tax = subtotal * taxRate;
    const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : shippingCharge;
    const grandTotal = subtotal + tax + shipping;
    const amountInPaise = Math.round(grandTotal * 100);

    if (amountInPaise < 100) {
      return new Response(JSON.stringify({ error: "Order total is too low" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 5. Create a Razorpay Order via their API ---
    const razorpayOrderPayload = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        user_id: user.id,
        user_email: user.email,
        item_count: String(verifiedItems.length),
      },
    };

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + btoa(`${razorpayKeyId}:${razorpayKeySecret}`),
      },
      body: JSON.stringify(razorpayOrderPayload),
    });

    if (!razorpayResponse.ok) {
      const errBody = await razorpayResponse.text();
      console.error("Razorpay order creation failed:", errBody);
      return new Response(JSON.stringify({ error: "Failed to create payment order" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const razorpayOrder = await razorpayResponse.json();

    // --- 6. Create a PENDING order in the database ---
    const { data: dbOrder, error: dbOrderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        full_name: shippingDetails.fullName.trim(),
        email: shippingDetails.email.trim().toLowerCase(),
        phone: shippingDetails.phone.trim(),
        address: shippingDetails.address.trim(),
        city: shippingDetails.city.trim(),
        state: shippingDetails.state.trim(),
        zip_code: shippingDetails.zipCode.trim(),
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: grandTotal,
        payment_method: "razorpay",
        payment_status: "pending",
        razorpay_order_id: razorpayOrder.id,
        status: "pending",
      })
      .select()
      .single();

    if (dbOrderError || !dbOrder) {
      console.error("DB order creation failed:", dbOrderError);
      return new Response(JSON.stringify({ error: "Failed to create order record" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert order items
    const orderItemsToInsert = verifiedItems.map((item: any) => ({
      order_id: dbOrder.id,
      ...item,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error("DB order items insertion failed:", itemsError);
      // Clean up the order if items fail
      await supabaseAdmin.from("orders").delete().eq("id", dbOrder.id);
      return new Response(JSON.stringify({ error: "Failed to save order items" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 7. Return the Razorpay order details to the frontend ---
    return new Response(
      JSON.stringify({
        razorpay_order_id: razorpayOrder.id,
        amount: amountInPaise,
        currency: "INR",
        db_order_id: dbOrder.id,
        key_id: razorpayKeyId,
        subtotal,
        tax,
        shipping,
        total: grandTotal,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unhandled error in create-razorpay-order:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
