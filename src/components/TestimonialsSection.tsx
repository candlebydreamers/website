import { motion } from "framer-motion";
import { Star, CheckCircle } from "lucide-react";

const reviews = [
  {
    text: "I lit the Lavender & Sage candle during my evening meditation and the fragrance filled my entire living room within minutes. The wood wick crackle is so soothing — feels like a mini spa at home!",
    author: "Priya S.",
    location: "Mumbai, Maharashtra",
    initials: "PS",
  },
  {
    text: "The cedarwood and vanilla candle smells absolutely divine. It is not overpowering at all, just the right amount of luxury. Being soy-based, it burns clean with zero soot. Totally worth every rupee!",
    author: "Arjun M.",
    location: "Bengaluru, Karnataka",
    initials: "AM",
  },
  {
    text: "These candles look gorgeous on my coffee table — the amber glass jars are so aesthetic. I ordered a set for Diwali gifting and everyone loved them. No headaches or black smoke like cheap candles.",
    author: "Sneha K.",
    location: "Delhi, NCR",
    initials: "SK",
  },
  {
    text: "Beautiful packaging and quick delivery! I gifted these for a housewarming and my friends could not stop complimenting the vanilla fragrance. Already placing my second order.",
    author: "Rohit D.",
    location: "Pune, Maharashtra",
    initials: "RD",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 md:py-28 px-4 md:px-6 bg-zinc-55/20">
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
          <p className="text-sm text-zinc-550 max-w-md mx-auto">
            Read stories from fragrance lovers sharing their experiences with our premium hand-poured candles.
          </p>
        </motion.div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {reviews.map((review, i) => (
            <motion.div
              key={review.author}
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
                    {[...Array(5)].map((_, j) => (
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
                  {review.initials}
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
