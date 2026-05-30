import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Truck, RotateCcw, AlertCircle, HelpCircle } from "lucide-react";

const ShippingReturns = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Shipping & Returns"
        description="Learn about our shipping methods, delivery timelines, and hassle-free return policy for Candles by Dreamers premium scented candles across India."
        canonicalUrl="https://candlesbydreamers.com/shipping-returns"
      />
      <Navbar />
      
      {/* Hero Header */}
      <section className="bg-zinc-50 border-b border-border py-12 md:py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl text-center space-y-4">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-orange-655 bg-orange-50 px-3 py-1 rounded-full inline-block">
            Customer Care
          </span>
          <h1 className="text-xl sm:text-2xl md:text-4xl font-black uppercase tracking-tight text-zinc-900">
            Shipping & Returns
          </h1>
          <p className="text-[10px] sm:text-xs text-zinc-500 max-w-md mx-auto">
            Everything you need to know about our fragile-item shipping methods, curing lead times, and unlit returns policy.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* Shipping Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-zinc-150 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-6">
                <Truck className="text-orange-600" size={24} />
              </div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-zinc-900 mb-4">
                Shipping Information
              </h2>
              <ul className="space-y-4 text-xs sm:text-sm text-zinc-650 leading-relaxed">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-zinc-900 block">Processing & Curing</span>
                    Each candle is hand-poured. Orders are processed, cured, and shipped within 2–3 business days.
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-zinc-900 block">Fragile Protection</span>
                    We package our glass jars with recycled, biodegradable padded inserts to prevent breakage.
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-zinc-900 block">Standard Shipping</span>
                    Delivery takes 3–5 business days depending on location. Tracking links are sent upon dispatch.
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Returns Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white border border-zinc-150 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-6">
                <RotateCcw className="text-orange-600" size={24} />
              </div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-zinc-900 mb-4">
                Returns & Damages
              </h2>
              <ul className="space-y-4 text-xs sm:text-sm text-zinc-650 leading-relaxed">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-zinc-900 block">14-Day Window</span>
                    Unused, unlit candles in their original packaging can be returned within 14 days of delivery.
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-zinc-900 block">Damaged On Arrival</span>
                    Glass can be fragile. If your candle arrives cracked or broken, email a photo to get a replacement immediately.
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-zinc-900 block">Easy Returns</span>
                    Email us at <strong className="text-zinc-900">candlebydreamers@gmail.com</strong> with order details.
                  </div>
                </li>
              </ul>
            </motion.div>

          </div>

          {/* Info Notice Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 bg-zinc-50 border border-zinc-200 p-5 sm:p-6 rounded-2xl flex gap-3 sm:gap-4 items-start"
          >
            <AlertCircle size={20} className="text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-[10px] sm:text-xs text-zinc-650 leading-relaxed">
              <strong className="text-zinc-900 font-bold block mb-1">Fragile Transit Guarantee</strong>
              We fully guarantee transit safety. Since glass candle containers can be susceptible to rough handling, any transit damage is covered 100% by us. Simply reach out to support for a free replacement.
            </div>
          </motion.div>

          {/* FAQ Accordion Section */}
          <div className="mt-20 space-y-8">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-zinc-900 text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-zinc-900 flex gap-2 items-center">
                  <HelpCircle size={14} className="text-orange-600" />
                  Can I edit my order details?
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed pl-5">
                  Orders can be edited or cancelled within 1 hour of placing by contacting support. Once the candle matches are cured and packed, we cannot adjust details.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-zinc-900 flex gap-2 items-center">
                  <HelpCircle size={14} className="text-orange-600" />
                  What wax do you use?
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed pl-5">
                  We use 100% organic soy wax and natural wooden wicks. Our ingredients are completely vegan and phthalate-free.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default ShippingReturns;
