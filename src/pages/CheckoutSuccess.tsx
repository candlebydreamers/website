import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { 
  CheckCircle2, 
  Loader2, 
  AlertTriangle, 
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Package
} from "lucide-react";
import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection";
import { supabase } from "@/lib/supabaseClient";

interface VerifiedOrder {
  id: string;
  total: number;
  paymentStatus: string;
  paymentMethod: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    image: string;
  }>;
}

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [status, setStatus] = useState<"verifying" | "success" | "timeout">("verifying");
  const [order, setOrder] = useState<VerifiedOrder | null>(null);

  useEffect(() => {
    if (!orderId) {
      setStatus("timeout");
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        // Fetch order from Supabase
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (orderError || !orderData) {
          throw new Error("Order not found");
        }

        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", orderId);

        if (itemsError) throw itemsError;

        // Fetch image details for each order item
        const itemsWithImages = [];
        for (const item of (itemsData || [])) {
          const { data: prodData } = await supabase
            .from("products")
            .select("image_urls")
            .eq("id", item.product_id)
            .single();

          let imgUrl = "/placeholder.jpg";
          if (prodData?.image_urls) {
            let urls: string[] = [];
            if (Array.isArray(prodData.image_urls)) {
              urls = prodData.image_urls;
            } else if (typeof prodData.image_urls === "string") {
              try {
                urls = JSON.parse(prodData.image_urls);
              } catch {}
            }
            if (urls.length > 0) {
              imgUrl = urls[0];
            }
          }

          itemsWithImages.push({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
            size: item.size || "Standard",
            image: imgUrl
          });
        }

        setOrder({
          id: orderData.id,
          total: Number(orderData.total),
          paymentStatus: orderData.payment_status,
          paymentMethod: orderData.payment_method,
          items: itemsWithImages
        });

        setStatus("success");
      } catch (err) {
        console.error("Error fetching order details for success page:", err);
        setStatus("timeout");
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Verifying state
  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col justify-between font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                <Loader2 size={40} className="text-primary animate-spin" />
              </div>
              <motion.div
                className="absolute inset-0 w-24 h-24 rounded-full border-2 border-primary/20 mx-auto"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight mb-3 text-zinc-900">
                Confirming Order
              </h1>
              <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
                We're fetching details of your transaction from the database. Please wait...
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
              <ShieldCheck size={14} />
              Secure verification in progress
            </div>
          </motion.div>
        </div>
        <FooterSection />
      </div>
    );
  }

  // Timeout / Error state
  if (status === "timeout") {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col justify-between font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={40} className="text-amber-500" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">
              Order <span className="text-amber-550">Processing</span>
            </h1>
            <p className="text-zinc-500 max-w-md mx-auto text-sm leading-relaxed">
              Your transaction went through but we're experiencing a delay rendering details.
              Rest assured your order is placed safely! You can track it in:
              <br />
              <Link to="/my-orders" className="text-primary underline font-bold">My Orders</Link>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/my-orders"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-amber-600 transition-all active:scale-95 shadow-md shadow-primary/10"
              >
                <Package size={16} />
                My Orders
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-zinc-50 transition-all"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
        <FooterSection />
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between font-sans">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-24 h-24 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle2 size={48} className="text-emerald-500" />
          </motion.div>

          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black uppercase tracking-tight mb-3 text-zinc-900"
            >
              Order <span className="text-emerald-600">Confirmed!</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-zinc-500 max-w-md mx-auto text-sm leading-relaxed"
            >
              Your payment has been successfully processed via Razorpay. We are hand-pouring your candles.
            </motion.p>
          </div>

          {/* Order summary */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white border border-zinc-200 rounded-2xl p-6 text-left space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Order ID
                </span>
                <span className="text-[10px] font-mono font-black uppercase text-zinc-700">
                  #{order.id.split("-")[0]}
                </span>
              </div>

              <div className="space-y-3 border-t border-zinc-150 pt-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-150 overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-tight text-zinc-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider">
                        Qty: {item.quantity} • Size: {item.size}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-900">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-dashed border-zinc-200">
                <span className="text-xs font-black uppercase tracking-tight text-zinc-900">Total Paid</span>
                <span className="text-lg font-black text-emerald-600">₹{order.total}</span>
              </div>

              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-2 rounded-full w-fit border border-emerald-100">
                <ShieldCheck size={12} className="text-emerald-600" />
                Payment Verified via Razorpay
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/my-orders"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-amber-600 transition-all active:scale-95 shadow-md shadow-primary/10"
            >
              <ShoppingBag size={16} />
              View My Orders
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-zinc-50 transition-all text-zinc-700"
            >
              Continue Shopping
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
      <FooterSection />
    </div>
  );
};

export default CheckoutSuccess;
