import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
    ChevronRight,
    MapPin,
    CreditCard,
    ShieldCheck,
    ArrowLeft,
    Truck,
    Lock,
    Zap
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection";
import { supabase } from "@/lib/supabaseClient";

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, totalPrice, clearCart } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState<"idle" | "creating" | "paying" | "verifying">("idle");

    // Tax & Shipping Configuration state (for display only — actual calculation happens server-side)
    const [taxRate, setTaxRate] = useState(0.05);
    const [shippingCharge, setShippingCharge] = useState(100.0);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(1200.0);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
    });

    // Display-only calculations (actual amounts come from server)
    const subtotal = totalPrice;
    const tax = subtotal * taxRate;
    const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : shippingCharge;
    const grandTotal = subtotal + tax + shipping;

    // Check auth session on mount & fetch settings for display
    useEffect(() => {
        const checkAuthAndSettings = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Please login to access checkout");
                navigate("/auth");
                return;
            }

            // Prefill user details if available
            if (session.user) {
                setFormData(prev => ({
                    ...prev,
                    email: session.user.email || "",
                    fullName: session.user.user_metadata?.full_name || ""
                }));
            }

            // Fetch pricing settings (for display preview only — server recalculates)
            try {
                const { data, error } = await supabase.from("settings").select("*");
                if (data && !error) {
                    const settingsMap = data.reduce((acc: any, curr: any) => {
                        acc[curr.key] = curr.value;
                        return acc;
                    }, {});
                    
                    if (settingsMap.tax_rate) setTaxRate(Number(settingsMap.tax_rate));
                    if (settingsMap.shipping_charge) setShippingCharge(Number(settingsMap.shipping_charge));
                    if (settingsMap.free_shipping_threshold) setFreeShippingThreshold(Number(settingsMap.free_shipping_threshold));
                }
            } catch (err) {
                console.error("Failed to load settings:", err);
            }
        };

        checkAuthAndSettings();
    }, [navigate]);

    // Load Razorpay Script dynamically
    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if ((window as any).Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        setIsProcessing(true);
        setProcessingStep("creating");

        try {
            // --- STEP 1: Load Razorpay SDK ---
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                toast.error("Failed to load Razorpay Payment Gateway. Check your internet connection.");
                setIsProcessing(false);
                setProcessingStep("idle");
                return;
            }

            // --- STEP 2: Get auth token for edge function calls ---
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Session expired. Please login again.");
                navigate("/auth");
                return;
            }

            // --- STEP 3: Create Razorpay order via server-side Edge Function ---
            // The server re-calculates the total from database prices (never trusts the client).
            const { data: orderData, error: createError } = await supabase.functions.invoke(
                "create-razorpay-order",
                {
                    body: {
                        cartItems: cartItems.map(item => ({
                            productId: item.productId,
                            size: item.size,
                            quantity: item.quantity,
                        })),
                        shippingDetails: {
                            fullName: formData.fullName,
                            email: formData.email,
                            phone: formData.phone,
                            address: formData.address,
                            city: formData.city,
                            state: formData.state,
                            zipCode: formData.zipCode,
                        },
                    },
                }
            );

            if (createError || !orderData || orderData.error) {
                const errorMsg = orderData?.error || createError?.message || "Failed to create payment order";
                toast.error(errorMsg);
                setIsProcessing(false);
                setProcessingStep("idle");
                return;
            }

            // --- STEP 4: Open Razorpay Checkout with the server-generated order_id ---
            setProcessingStep("paying");

            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Candles by Dreamers",
                description: "Hand-poured scented candles order",
                order_id: orderData.razorpay_order_id, // Server-generated order — amount is locked
                handler: async function (response: any) {
                    // --- STEP 5: Verify payment signature via server-side Edge Function ---
                    setProcessingStep("verifying");

                    try {
                        const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
                            "verify-razorpay-payment",
                            {
                                body: {
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    db_order_id: orderData.db_order_id,
                                },
                            }
                        );

                        if (verifyError || !verifyData || verifyData.error) {
                            const errorMsg = verifyData?.error || verifyError?.message || "Payment verification failed";
                            toast.error(errorMsg);
                            setIsProcessing(false);
                            setProcessingStep("idle");
                            return;
                        }

                        // --- STEP 6: Payment verified! Clear cart and redirect ---
                        clearCart();
                        toast.success("Payment verified & order confirmed!");
                        navigate(`/checkout-success?orderId=${orderData.db_order_id}`);
                    } catch (verifyErr: any) {
                        console.error("Payment verification error:", verifyErr);
                        toast.error("Payment went through but verification failed. Contact support with your payment ID.");
                        setIsProcessing(false);
                        setProcessingStep("idle");
                    }
                },
                prefill: {
                    name: formData.fullName,
                    email: formData.email,
                    contact: formData.phone,
                },
                theme: {
                    color: "#d97706", // Amber 600 theme color
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                        setProcessingStep("idle");
                        toast.info("Payment cancelled. Your order is saved — you can retry.");
                    },
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on("payment.failed", function (response: any) {
                toast.error(`Payment failed: ${response.error.description}`);
                setIsProcessing(false);
                setProcessingStep("idle");
            });
            rzp.open();
        } catch (error: any) {
            console.error("Checkout error:", error);
            toast.error(error.message || "Could not initialize payment. Try again.");
            setIsProcessing(false);
            setProcessingStep("idle");
        }
    };

    // Processing step labels for the button
    const processingLabels: Record<string, string> = {
        creating: "Creating Secure Order...",
        paying: "Waiting for Payment...",
        verifying: "Verifying Payment...",
    };

    return (
        <div className="min-h-screen bg-zinc-50 text-foreground selection:bg-primary selection:text-white font-sans">
            <Navbar />

            <main className="container mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pt-10 sm:pb-20">
                {/* Header */}
                <div className="mb-6 md:mb-10">
                    <Link to="/shop" className="group inline-flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-3">
                        <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Catalog
                    </Link>
                    <h1 className="text-3xl sm:text-5xl lg:text-[50px] font-black uppercase tracking-tight leading-none mb-3 text-zinc-900">
                        Secure <span className="text-primary">Checkout</span>
                    </h1>
                    <div className="flex items-center gap-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-400">
                        <span className="text-primary">01 Address</span>
                        <ChevronRight size={12} className="text-zinc-300" />
                        <span>02 Payment</span>
                        <ChevronRight size={12} className="text-zinc-300" />
                        <span>03 Confirm</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-7 space-y-8 md:space-y-12">
                        <section className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs sm:text-sm">1</div>
                                <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-zinc-900">
                                    Shipping Details <MapPin size={18} className="text-primary" />
                                </h2>
                            </div>

                            <form className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5" id="checkout-form" onSubmit={handleSubmit}>
                                <div className="sm:col-span-2 space-y-1">
                                    <label className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-zinc-550">Full Name</label>
                                    <input
                                        required
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Rahul Sharma"
                                        className="w-full bg-white border border-zinc-200 focus:border-primary outline-none px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-all text-xs sm:text-sm font-semibold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-zinc-550">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="rahul@example.com"
                                        className="w-full bg-white border border-zinc-200 focus:border-primary outline-none px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-all text-xs sm:text-sm font-semibold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-zinc-555">Phone Number</label>
                                    <input
                                        required
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+91 98765 43210"
                                        className="w-full bg-white border border-zinc-200 focus:border-primary outline-none px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-all text-xs sm:text-sm font-semibold"
                                    />
                                </div>
                                <div className="sm:col-span-2 space-y-1">
                                    <label className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-zinc-555">Shipping Address</label>
                                    <input
                                        required
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="123, MG Road, Sector 5"
                                        className="w-full bg-white border border-zinc-200 focus:border-primary outline-none px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-all text-xs sm:text-sm font-semibold"
                                    />
                                </div>
                                
                                <div className="sm:col-span-2 grid grid-cols-12 gap-3">
                                    <div className="col-span-12 sm:col-span-6 space-y-1">
                                        <label className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-zinc-555">City</label>
                                        <input
                                            required
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Mumbai"
                                            className="w-full bg-white border border-zinc-200 focus:border-primary outline-none px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-all text-xs sm:text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="col-span-6 sm:col-span-3 space-y-1">
                                        <label className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-zinc-555">State</label>
                                        <input
                                            required
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            placeholder="Maharashtra"
                                            className="w-full bg-white border border-zinc-200 focus:border-primary outline-none px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-all text-xs sm:text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="col-span-6 sm:col-span-3 space-y-1">
                                        <label className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-zinc-555">PIN Code</label>
                                        <input
                                            required
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            placeholder="400001"
                                            className="w-full bg-white border border-zinc-200 focus:border-primary outline-none px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-all text-xs sm:text-sm font-semibold"
                                        />
                                    </div>
                                </div>
                            </form>
                        </section>

                        {/* Payment Method — Razorpay */}
                        <section className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs sm:text-sm">2</div>
                                <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-zinc-900">
                                    Payment Method <CreditCard size={18} className="text-primary" />
                                </h2>
                            </div>

                            <div className="p-4 sm:p-5 rounded-xl border-2 border-primary bg-amber-500/5 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
                                            <CreditCard size={18} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-wider text-zinc-900">Razorpay Smart Gateway</p>
                                            <p className="text-[9px] sm:text-[10px] text-zinc-500 font-bold tracking-wide">
                                                UPI • Credit/Debit Cards • NetBanking • Wallets
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
                                        <ShieldCheck size={12} className="text-emerald-600" />
                                        <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">Server Verified</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-zinc-400 pt-2 border-t border-zinc-200">
                                    <div className="flex items-center gap-1">
                                        <Lock size={10} /> End-to-End Encrypted
                                    </div>
                                    <span className="text-zinc-200">|</span>
                                    <div className="flex items-center gap-1">
                                        <ShieldCheck size={10} /> HMAC-SHA256 Verified
                                    </div>
                                    <span className="text-zinc-200">|</span>
                                    <div className="flex items-center gap-1">
                                        <Zap size={10} /> Instant Confirmation
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-32 space-y-6 bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm">
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-zinc-900">Order Summary</h2>

                            <div className="space-y-5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 bg-zinc-50 rounded-xl border border-zinc-150 overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.product.imageUrls?.[0] || "/placeholder.jpg"}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xs font-bold uppercase tracking-tight text-zinc-900 line-clamp-1">{item.product.name}</h3>
                                            <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest mt-1">
                                                Qty: {item.quantity} | Size: {item.size}
                                            </p>
                                            <p className="text-xs font-bold mt-1 text-zinc-800">₹{(item.product.discountPrice || item.product.price) * item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                                {cartItems.length === 0 && (
                                    <p className="text-sm text-zinc-500 italic">Your cart is empty.</p>
                                )}
                            </div>

                            <div className="pt-6 border-t border-zinc-150 space-y-3 text-xs font-semibold text-zinc-600">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>GST / Sales Tax ({(taxRate * 100).toFixed(0)}%)</span>
                                    <span>₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-lg font-black tracking-tight uppercase pt-4 border-t border-zinc-200 text-zinc-900">
                                    <span>Total</span>
                                    <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
                                </div>
                                <p className="text-[9px] text-zinc-400 font-medium italic">
                                    * Final amount is verified server-side before payment
                                </p>
                            </div>

                            <button
                                form="checkout-form"
                                type="submit"
                                disabled={isProcessing || cartItems.length === 0}
                                className="w-full py-5 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-full hover:bg-amber-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden relative shadow-lg shadow-primary/25"
                            >
                                <AnimatePresence mode="wait">
                                    {isProcessing ? (
                                        <motion.div
                                            key="loading"
                                            initial={{ y: 20 }}
                                            animate={{ y: 0 }}
                                            exit={{ y: -20 }}
                                            className="flex items-center gap-2"
                                        >
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {processingLabels[processingStep] || "Processing..."}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="static"
                                            initial={{ y: 20 }}
                                            animate={{ y: 0 }}
                                            exit={{ y: -20 }}
                                            className="flex items-center gap-2"
                                        >
                                            <CreditCard size={18} />
                                            Pay Securely with Razorpay
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>

                            <div className="flex items-center justify-center gap-4 text-[9px] text-zinc-400 font-bold uppercase tracking-widest pt-2">
                                <div className="flex items-center gap-1">
                                    <Lock size={10} /> Secure SSL
                                </div>
                                <div className="flex items-center gap-1">
                                    <Truck size={10} /> Fast Delivery
                                </div>
                                <div className="flex items-center gap-1">
                                    <ShieldCheck size={10} /> Razorpay Safe
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <FooterSection />
        </div>
    );
};

export default Checkout;
