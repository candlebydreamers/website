import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Star, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
    id: string;
    product_id: string;
    user_id: string;
    customer_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface ProductReviewsProps {
    productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
            }
        };
        fetchUser();
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const { data, error } = await supabase
                .from("reviews")
                .select("*")
                .eq("product_id", productId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("You must be logged in to review.");
            return;
        }
        if (!comment.trim()) {
            toast.error("Please enter a review comment.");
            return;
        }

        setIsSubmitting(true);
        try {
            const customerName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer";
            
            const { error } = await supabase.from("reviews").insert({
                product_id: productId,
                user_id: user.id,
                customer_name: customerName,
                rating,
                comment: comment.trim()
            });

            if (error) throw error;

            toast.success("Review submitted successfully!");
            setComment("");
            setRating(5);
            fetchReviews();
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error("Failed to submit review.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-16 border-t border-zinc-150">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Left Column: Add Review Form */}
                <div className="lg:col-span-1">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900 mb-6">Write A Review</h3>
                    
                    {!user ? (
                        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-center">
                            <User className="mx-auto text-zinc-300 mb-3" size={32} />
                            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-700 mb-2">Authentication Required</h4>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-4 leading-relaxed">
                                You must be signed in to your account to share your experience with this product.
                            </p>
                            <Link 
                                to="/auth" 
                                className="inline-block px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-amber-600 transition-colors shadow-md"
                            >
                                Sign In / Register
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                            <div className="mb-5">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
                                    Overall Rating
                                </label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star 
                                                size={24} 
                                                className={`transition-colors ${(hoverRating || rating) >= star ? "fill-amber-400 text-amber-400" : "fill-zinc-100 text-zinc-200"}`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
                                    Your Review
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="What did you think of the scent, burn time, and overall quality?"
                                    className="w-full min-h-[120px] p-4 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-y"
                                    required
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Submit Review"}
                            </button>
                        </form>
                    )}
                </div>

                {/* Right Column: Reviews List */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">Customer Reviews</h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">
                            {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin text-primary" size={32} />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-zinc-100 border-dashed">
                            <Star className="mx-auto text-zinc-300 mb-3" size={32} />
                            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-2">No Reviews Yet</h4>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                                Be the first to review this product and share your experience.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <AnimatePresence>
                                {reviews.map((review) => (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={review.id} 
                                        className="bg-white border border-zinc-150 rounded-2xl p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900">{review.customer_name}</h4>
                                                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 block mt-1">
                                                    {new Date(review.created_at).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star 
                                                        key={star} 
                                                        size={14} 
                                                        className={star <= review.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-100 text-zinc-200"} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">
                                            {review.comment}
                                        </p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductReviews;
