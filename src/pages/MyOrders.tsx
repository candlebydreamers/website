import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection";
import { motion } from "framer-motion";
import { ShoppingBag, ChevronRight, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    image: string;
}

interface Order {
    id: string;
    total: number;
    status: 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: string;
    paymentStatus: string;
    createdAt: string;
    items: OrderItem[];
}

const MyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Please login to view your orders");
                navigate("/auth");
                return;
            }
            await fetchOrders(session.user.id);
        };
        
        checkAuthAndFetch();
    }, [navigate]);

    const fetchOrders = async (userId: string) => {
        try {
            const { data: ordersData, error: ordersError } = await supabase
                .from("orders")
                .select("*")
                .eq("user_id", userId)
                .eq("payment_status", "paid")
                .order("created_at", { ascending: false });

            if (ordersError) throw ordersError;

            if (ordersData) {
                const enrichedOrders: Order[] = [];

                for (const order of ordersData) {
                    const { data: itemsData, error: itemsError } = await supabase
                        .from("order_items")
                        .select("*")
                        .eq("order_id", order.id);

                    if (itemsError) throw itemsError;

                    const itemsWithImages: OrderItem[] = [];
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

                    enrichedOrders.push({
                        id: order.id,
                        total: Number(order.total),
                        status: order.status,
                        paymentMethod: order.payment_method,
                        paymentStatus: order.payment_status,
                        createdAt: order.created_at,
                        items: itemsWithImages
                    });
                }

                setOrders(enrichedOrders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Failed to fetch order history");
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock size={16} className="text-amber-500 animate-pulse" />;
            case 'processing': return <Package size={16} className="text-amber-600" />;
            case 'shipped': return <Truck size={16} className="text-indigo-500" />;
            case 'delivered': return <CheckCircle size={16} className="text-emerald-500" />;
            default: return <Clock size={16} className="text-zinc-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-sans selection:bg-primary/30">
            <Navbar />
            
            <main className="container mx-auto px-6 pt-10 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <ShoppingBag size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">Your Orders</h1>
                            <p className="text-xs font-bold text-zinc-400 tracking-widest uppercase mt-1">Track and manage your scented candles purchases</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 animate-pulse">Loading order history...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white border border-zinc-200 rounded-2xl p-20 text-center"
                        >
                            <ShoppingBag size={48} className="mx-auto mb-6 text-zinc-300 stroke-1" />
                            <h2 className="text-lg font-black uppercase tracking-tight text-zinc-800 mb-2">No orders found yet</h2>
                            <p className="text-xs text-zinc-550 max-w-xs mx-auto mb-8 font-semibold leading-relaxed">
                                You haven't made any purchases with us yet. Check out our aromatic collections to find your perfect lighting!
                            </p>
                            <Link 
                                to="/shop" 
                                className="inline-flex items-center gap-2 bg-primary hover:bg-amber-600 text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                            >
                                Start Shopping <ChevronRight size={14} />
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="space-y-8">
                            {orders.map((order, idx) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white border border-zinc-200 rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors shadow-sm"
                                >
                                    {/* Order Header */}
                                    <div className="p-5 border-b border-zinc-150 bg-zinc-50/50 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-6">
                                            <div>
                                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1">Order ID</p>
                                                <p className="text-[10px] font-mono font-black truncate max-w-[120px] uppercase text-zinc-700">{order.id.split("-")[0]}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1">Date</p>
                                                <p className="text-[10px] font-bold text-zinc-800">{new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1">Total</p>
                                                <p className="text-[10px] font-black text-primary">₹{order.total}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1">Payment</p>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-[10px] font-bold uppercase text-zinc-700">Razorpay</p>
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                                                        order.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                                                    }`}>
                                                        {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white border border-zinc-200 px-3 py-1.5 rounded-full">
                                            {getStatusIcon(order.status)}
                                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">{order.status}</span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-5">
                                        <div className="space-y-4">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-4">
                                                    <div className="w-16 h-20 rounded-xl bg-zinc-50 overflow-hidden border border-zinc-150 shrink-0">
                                                        <img 
                                                            src={item.image} 
                                                            alt={item.name} 
                                                            className="w-full h-full object-cover transition-all duration-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <div>
                                                            <h3 className="text-xs font-bold uppercase tracking-tight mb-1 text-zinc-900">{item.name}</h3>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[9px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded uppercase">Size: {item.size}</span>
                                                                <span className="text-[9px] font-bold text-zinc-400">Qty: {item.quantity}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs font-black text-zinc-800">₹{item.price * item.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </main>
            <FooterSection />
        </div>
    );
};

export default MyOrders;
