import { motion } from "framer-motion";
import posterImage from "@/assets/poster.png";
import { Sparkles, Flame } from "lucide-react";

const BrandMessageSection = () => {
  return (
    <section className="py-20 md:py-28 px-4 md:px-6 bg-white overflow-hidden">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Image Card with floating elements */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 relative"
          >
            {/* Soft decorative background glow */}
            <div className="absolute -left-8 -top-8 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl -z-10" />
            
            {/* Main Image Container */}
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200/60 shadow-xl aspect-square max-w-[500px] mx-auto bg-zinc-100">
              <img 
                src={posterImage}  
                alt="Candles Brand Message" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-zinc-950/10 to-transparent" />
              
              {/* Bottom text overlay on image */}
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-sm font-semibold tracking-wide mt-1">
                  Lighting Up Your Dreams
                </p>
              </div>
            </div>

            {/* Decorative float badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -right-4 top-10 bg-white border border-zinc-150 p-4 rounded-xl shadow-lg hidden sm:flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Flame size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider">Eco-Friendly</p>
                <p className="text-[9px] text-zinc-500">100% Pure Soy Wax</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-primary bg-amber-55/40 px-3 py-1 rounded-full">
                Our Purpose
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-zinc-900 leading-tight">
                It's not just a candle. <br />
                <span className="text-primary">It's a dream lit up.</span>
              </h2>
              <p className="text-sm md:text-base text-zinc-500 leading-relaxed pt-2">
                We believe that premium home fragrance has the power to transform spaces and inspire minds. Every candle is hand-poured with love, using natural soy wax, custom essential oils, and organic cotton wicks.
              </p>
            </motion.div>

            {/* Quote Block */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="border-l-4 border-primary pl-6 py-2 bg-zinc-50 rounded-r-xl"
            >
              <p className="text-xs italic text-zinc-600 leading-relaxed">
                "The future belongs to those who believe in the beauty of their dreams."
              </p>
              <p className="text-[10px] uppercase font-black text-zinc-400 mt-2 tracking-widest">
                Eleanor Roosevelt
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BrandMessageSection;
