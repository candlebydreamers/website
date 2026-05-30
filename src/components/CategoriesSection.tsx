import { motion } from "framer-motion";
import catTees from "@/assets/cat-tees.jpg";
import catHoodies from "@/assets/cat-hoodies.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";

const categories = [
  { name: "T-Shirts", image: catTees },
  { name: "Hoodies", image: catHoodies },
  { name: "Accessories", image: catAccessories },
];

const CategoriesSection = () => {
  return (
    <section className="py-24 md:py-32 px-6 border-t border-border">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">
            Collections
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">
            Shop by Category
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.a
              key={cat.name}
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-sm cursor-pointer card-hover"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                width={800}
                height={600}
                className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-lg font-bold tracking-wide text-foreground">
                  {cat.name}
                </h3>
                <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-1 group-hover:text-primary transition-colors duration-300">
                  Explore →
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
