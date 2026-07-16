import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { supabase } from "@/lib/supabaseClient";

const HeroSection = () => {
  const [slides, setSlides] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "hero_slideshow_images")
          .single();
        if (data && data.value) {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSlides(parsed);
          }
        }
      } catch (err) {
        console.error("Error fetching hero slideshow images:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  if (slides.length === 0) {
    if (isLoading) {
      return (
        <div className="relative w-full overflow-hidden bg-zinc-950 flex items-center justify-center" style={{ aspectRatio: '1923 / 817' }}>
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden bg-zinc-950">
      {/* Slideshow — aspect ratio preserved, no cropping */}
      <div className="relative w-full" style={{ aspectRatio: '1923 / 817' }}>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={slides[current]}
              alt={`Banner ${current + 1}`}
              className="w-full h-full object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {/* Side Controls */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-primary text-white backdrop-blur-sm shadow-md hover:scale-105 active:scale-95 transition-all border border-white/10"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-primary text-white backdrop-blur-sm shadow-md hover:scale-105 active:scale-95 transition-all border border-white/10"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
        </button>

        {/* Centered Indicators */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                index === current 
                  ? "w-6 md:w-8 bg-primary shadow-sm" 
                  : "w-1.5 md:w-2 bg-white/40 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
