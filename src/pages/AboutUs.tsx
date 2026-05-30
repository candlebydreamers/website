import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection";
import SEO from "../components/SEO";
import banner1 from "@/assets/banner1.png";
import poster from "@/assets/poster.png";

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans selection:bg-orange-500/30">
            <SEO 
                title="Our Story | Luxury Hand-Poured Scented Candles"
                description="Learn about the mission and craft of Candles by Dreamers. Discover how we merge natural organic soy wax with therapeutic botanical fragrances."
                keywords="candles by dreamers story, wood wick candles origin, premium soy candle crafting, hand poured candle studio"
                canonicalUrl="https://candlesbydreamers.com/about"
            />
            <Navbar />

            {/* Hero Section with banner1 background */}
            <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center py-16 md:py-28 px-4 sm:px-6 overflow-hidden bg-zinc-950 text-white">
                {/* Background Image with low opacity */}
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
                    style={{ backgroundImage: `url(${banner1})` }}
                />
                {/* Dark Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/40 z-10" />
                
                <div className="container mx-auto relative z-20 text-center max-w-4xl space-y-4 md:space-y-6">
                    <motion.span 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-orange-500 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs bg-orange-950/40 border border-orange-900/50 px-3.5 py-1.5 rounded-full inline-block"
                    >
                        Our Story & Craft
                    </motion.span>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl xs:text-3xl sm:text-4xl md:text-7xl font-black uppercase tracking-tight text-white leading-tight"
                    >
                        DREAMERS: Light <br className="hidden md:inline" /> <span className="text-orange-500">With A Purpose</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs xs:text-sm md:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed font-sans font-medium"
                    >
                        We aren't just selling candles; we are creating atmospheres. Blending premium organic soy wax with therapeutic botanical oils to soothe minds and inspire beautiful dreams.
                    </motion.p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 md:py-24 bg-white border-y border-zinc-200 px-4 sm:px-6">
                <div className="container mx-auto max-w-4xl text-center space-y-8 md:space-y-12">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl md:text-5xl font-black tracking-tight text-zinc-900 uppercase"
                    >
                        LIGHT YOUR DREAMS.
                    </motion.h2>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8 text-zinc-650 font-sans leading-relaxed text-sm md:text-base max-w-3xl mx-auto"
                    >
                        <p>
                            Home is your personal sanctuary. For too long, mass-produced home fragrances have relied on toxic paraffin waxes and synthetic soot-heavy chemical components. We built Dreamers to offer a clean, luxurious, and natural alternative.
                        </p>
                        
                        <div className="border-l-4 border-orange-500 pl-4 md:pl-6 italic text-zinc-800 text-base md:text-xl font-semibold text-left my-6 py-1.5">
                            "Stand firm on the foundation of wellness. Fill your space with warmth. Dream clearly."
                        </div>
                        
                        <p>
                            Every single candle is meticulously designed using sustainable organic wicks, apothecary-inspired amber glass jars, and heavy scent-load infusions of pure essential oils—crafted to soothe, ground, and elevate your space.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Design & Campaign Section (featuring poster.png) */}
            <section className="py-12 md:py-20 bg-white px-4 sm:px-6">
                <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                    {/* Image Block */}
                    <div className="flex-1 w-full relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-2xl -z-10 transform translate-x-3 translate-y-3" />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="aspect-square w-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-200"
                        >
                            <img 
                                src={poster} 
                                alt="Dreamers Candle Campaign" 
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </motion.div>
                    </div>

                    {/* Content Block */}
                    <div className="flex-1 space-y-6 lg:pl-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-655 bg-orange-50 px-2 py-1 rounded">
                            Our Fragrance Ethos
                        </span>
                        <h2 className="text-2xl md:text-5xl font-black tracking-tight text-zinc-950 uppercase">
                            Designed to soothe.
                        </h2>
                        <div className="space-y-4 text-zinc-650 font-sans text-sm md:text-base leading-relaxed font-medium">
                            <p>
                                At Dreamers, we look at candles as a functional canvas for mindfulness and aromatherapy. Every batch represents a carefully curated chapter of botanical sourcing, custom scent testing, and artistic execution.
                            </p>
                            <p>
                                We choose not to cut corners. Our wicks are sourced from natural wood, providing a relaxing, fireplace-like crackling sound. Our soy wax base is strictly organic and non-GMO, ensuring your air stays clean and toxin-free.
                            </p>
                            <p>
                                When you light a Dreamers candle, you join a community that values self-care, wellness, and aesthetic details. Let the soft crackle and rich aroma center your mind.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Pillars / Values */}
            <section className="py-16 md:py-24 px-4 sm:px-6 bg-zinc-50 border-t border-zinc-200">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12 md:mb-16 space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-655 bg-orange-50 px-2.5 py-1 rounded">
                            Our Pillars
                        </span>
                        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-zinc-900">
                            The Foundations of Dreamers
                        </h2>
                        <div className="h-1 w-12 bg-orange-500 mx-auto rounded"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                num: "01",
                                title: "100% Organic Soy",
                                desc: "No petroleum, no paraffin. Just premium, slow-burning soy wax that offers a clean burn and maximizes fragrance longevity."
                            },
                            {
                                num: "02",
                                title: "Campfire Wood Wicks",
                                desc: "Selected wood wicks that crackle softly as they burn, creating a soothing auditory experience along with visual warmth."
                            },
                            {
                                num: "03",
                                title: "Non-Toxic Infusions",
                                desc: "Paraben-free and phthalate-free oils that are safe for pets, kids, and clean breathing. Healthy aromatherapy for all."
                            }
                        ].map((pillar, i) => (
                            <motion.div 
                                key={pillar.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                                className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden"
                            >
                                {/* Subtle corner highlight */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                
                                <div className="space-y-4">
                                    <span className="font-mono text-4xl font-black text-orange-500/20 group-hover:text-orange-500/40 transition-colors block">
                                        {pillar.num}
                                    </span>
                                    <h3 className="text-lg font-bold uppercase tracking-tight text-zinc-900 group-hover:text-orange-655 transition-colors">
                                        {pillar.title}
                                    </h3>
                                    <p className="text-zinc-650 text-xs md:text-sm leading-relaxed font-sans font-medium">
                                        {pillar.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <FooterSection />
        </div>
    );
};

export default AboutUs;
