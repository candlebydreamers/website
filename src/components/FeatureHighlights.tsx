import { ShieldCheck, Truck, Sparkles, Flame } from "lucide-react";
import { motion } from "framer-motion";

const highlights = [
  {
    icon: ShieldCheck,
    title: "100% Secure Store",
    subtitle: "Secure payment & SSL encrypted checkout"
  },
  {
    icon: Truck,
    title: "Fast Shipping",
    subtitle: "Dispatched within 24-48 hours"
  },
  {
    icon: Sparkles,
    title: "Organic Soy Wax",
    subtitle: "Eco-friendly, clean & non-toxic burn"
  },
  {
    icon: Flame,
    title: "Sensory Aromatherapy",
    subtitle: "Soothing wicks & therapeutic aromas"
  }
];

const FeatureHighlights = () => {
  return (
    <section className="bg-card/45 py-5 sm:py-8 px-4 sm:px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4 group"
            >
              <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <item.icon className="text-primary w-4.5 h-4.5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-wider text-foreground mb-0.5 sm:mb-1">
                  {item.title}
                </h4>
                <p className="text-[9px] sm:text-xs text-muted-foreground font-semibold leading-tight">
                  {item.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;
