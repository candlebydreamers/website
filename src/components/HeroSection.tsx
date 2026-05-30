import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import bannerImage from "@/assets/banner1.png";
import bannerImage2 from "@/assets/banner2.png";
import bannerImage3 from "@/assets/banner3.png";

const slides = [
  { image: bannerImage },
  { image: bannerImage2 },
  { image: bannerImage3 },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

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
              src={slides[current].image}
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
