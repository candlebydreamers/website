import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Testimonial {
  id: string;
  text: string;
  author: string;
  location: string;
  rating: number;
}

const getInitials = (name: string) => {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .order("created_at", { ascending: true });
        if (error) throw error;
        setTestimonials(data || []);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 md:py-28 px-4 md:px-6 bg-zinc-50/20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 md:py-28 px-4 md:px-6 bg-zinc-50/20">
      <div className="container mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-3"
        >
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-primary bg-amber-50 px-3 py-1 rounded-full inline-block">
            Our Community
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-zinc-900">
            The Voice of Dreamers
          </h2>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            Read stories from fragrance lovers sharing their experiences with our premium hand-poured candles.
          </p>
        </motion.div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {testimonials.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border border-zinc-150/80 hover:border-amber-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Rating */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(review.rating || 5)].map((_, j) => (
                      <Star
                        key={j}
                        size={12}
                        className="fill-primary text-primary"
                      />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-zinc-650 leading-relaxed italic mb-6">
                  "{review.text}"
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="border-t border-zinc-100 pt-4 flex items-center gap-3">
                {/* Avatar Initials */}
                <div className="w-9 h-9 rounded-full bg-amber-50 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {getInitials(review.author)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-zinc-900 truncate">
                      {review.author}
                    </p>
                    <span title="Verified Purchase">
                      <CheckCircle size={12} className="text-emerald-500 fill-emerald-50" />
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {review.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
