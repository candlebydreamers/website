import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import social1 from "@/assets/social-1.jpg";
import social2 from "@/assets/social-2.jpg";
import social3 from "@/assets/social-3.jpg";
import social4 from "@/assets/social-4.jpg";

const images = [social1, social2, social3, social4];

const SocialSection = () => {
  return (
    <section className="py-24 md:py-32 px-6 border-t border-border">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">
            @candlesbydreamers
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
            On the Gram
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((src, i) => (
            <motion.a
              key={i}
              href="https://www.instagram.com/candlesbydreamers/"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-sm"
            >
              <img
                src={src}
                alt="Dreamers on Instagram"
                loading="lazy"
                width={800}
                height={800}
                className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/50 transition-colors duration-300 flex items-center justify-center">
                <Instagram
                  size={28}
                  className="text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            </motion.a>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="https://www.instagram.com/candlesbydreamers/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors border-b border-muted-foreground hover:border-primary pb-1 font-bold"
          >
            Follow @candlesbydreamers
          </a>
        </div>
      </div>
    </section>
  );
};

export default SocialSection;
