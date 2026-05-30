import { motion } from "framer-motion";
import { Flame, Gem, Leaf, MessageSquare, Gift, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const pillars = [
  {
    icon: Flame,
    title: "Cracking Wood Wicks",
    desc: "Natural wood wicks create a soothing, cozy campfire cracking sound and ensure a clean, even burn.",
  },
  {
    icon: Gem,
    title: "Premium Organic Soy",
    desc: "We use 100% pure organic soy wax which burns slower, cooler, and is entirely free of petroleum or paraffin.",
  },
  {
    icon: Leaf,
    title: "Vegan & Phthalate-Free",
    desc: "Our premium fragrance oils are free of parabens, phthalates, and toxins—healthy for your pets and family.",
  },
  {
    icon: MessageSquare,
    title: "Aromatherapy Blends",
    desc: "Every scent is curated with botanical oils to relieve anxiety, improve sleep, and inspire creative dreams.",
  },
  {
    icon: Gift,
    title: "Luxury Minimalism",
    desc: "Packaged in elegant amber glass jars with metal lids, making them the ultimate aesthetic gift for any occasion.",
  },
  {
    icon: Sparkles,
    title: "Hand-Poured Quality",
    desc: "Poured in small batches inside our local studio to guarantee absolute consistency, scent throw, and care.",
  },
];

const WhyDreamersSection = () => {
  return (
    <section className="py-12 md:py-28 px-4 md:px-6 bg-zinc-50 border-y border-zinc-100">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Left Column - Core Pitch */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-primary bg-amber-50 px-3 py-1 rounded-full">
                Our Foundation
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-zinc-900 leading-none">
                Why <span className="text-primary">Dreamers</span>?
              </h2>
              <p className="text-sm text-zinc-550 leading-relaxed pt-2 font-medium">
                We believe fragrance is more than just a scent—it is an atmosphere that shapes thoughts, inspires dreams, and nurtures well-being.
              </p>
            </motion.div>

            {/* Premium CTA Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-zinc-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-lg group"
            >
              {/* Background gradient glow */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-600/20 rounded-full blur-3xl group-hover:bg-amber-600/35 transition-colors duration-500" />
              
              <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
                The Dreamer Standard
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed mb-5 font-semibold">
                Each candle is blended, hand-poured, cured, and shipped from our studio directly to your doorstep with pristine attention.
              </p>
              <Link 
                to="/shop" 
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white hover:text-primary transition-colors"
              >
                Explore The Collection
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Right Column - 6 Points Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 gap-3 sm:gap-6 md:gap-8">
            {pillars.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 p-3 sm:p-5 bg-white border border-zinc-100 rounded-xl hover:border-amber-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <item.icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-primary group-hover:text-white transition-colors" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-[10px] sm:text-sm font-black text-zinc-800 group-hover:text-zinc-950 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[9px] sm:text-xs text-zinc-550 leading-normal sm:leading-relaxed font-semibold">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyDreamersSection;
