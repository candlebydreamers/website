// supabase/functions/verify-razorpay-payment/index.ts
// Verifies the Razorpay payment signature server-side using HMAC-SHA256.
// Only updates the order to "paid" after cryptographic verification succeeds.
// @ts-nocheck — This file runs on Deno (Supabase Edge Functions), not Node.js.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Verify Razorpay payment signature using Web Crypto API (Deno-compatible).
 * Signature = HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret)
 */
async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${orderId}|${paymentId}`);
  const keyData = encoder.encode(secret);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, data);
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time comparison to prevent timing attacks
  if (expectedSignature.length !== signature.length) return false;
  let result = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    result |= expectedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0;
}

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
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

    // Verify the user is authenticated
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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      db_order_id,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !db_order_id) {
      return new Response(JSON.stringify({ error: "Missing payment verification data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 3. Verify the order belongs to this user and is pending ---
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", db_order_id)
      .eq("user_id", user.id)
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("payment_status", "pending")
      .single();

    if (orderError || !order) {
      console.error("Order lookup failed:", orderError);
      return new Response(JSON.stringify({ error: "Order not found or already processed" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 4. Cryptographically verify the Razorpay signature ---
    const isValid = await verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpayKeySecret
    );

    if (!isValid) {
      // Mark order as failed
      await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "failed",
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", db_order_id);

      console.error("Signature verification failed for order:", db_order_id);
      return new Response(JSON.stringify({ error: "Payment verification failed — signature mismatch" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 5. Signature verified! Update order to PAID ---
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid",
        status: "processing",
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        updated_at: new Date().toISOString(),
      })
      .eq("id", db_order_id);

    if (updateError) {
      console.error("Failed to update order after verification:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update order status" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 6. Return success ---
    return new Response(
      JSON.stringify({
        success: true,
        order_id: db_order_id,
        payment_id: razorpay_payment_id,
        message: "Payment verified and order confirmed",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unhandled error in verify-razorpay-payment:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
