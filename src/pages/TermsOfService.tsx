import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Terms of Service"
        description="Review the terms and conditions for using the Candles by Dreamers online store, including purchase policies, intellectual property rights, and user conduct."
        canonicalUrl="https://candlesbydreamers.com/terms-of-service"
      />
      <Navbar />
      
      {/* Header */}
      <section className="bg-zinc-50 border-b border-border py-12 md:py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl text-center space-y-4">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-orange-655 bg-orange-50 px-3 py-1 rounded-full inline-block">
            Legal
          </span>
          <h1 className="text-xl sm:text-2xl md:text-4xl font-black uppercase tracking-tight text-zinc-900">
            Terms of Service
          </h1>
          <p className="text-[10px] sm:text-xs text-zinc-400 tracking-wider">
            Last Updated: May 25, 2026
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-12 md:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column - Quick Links (Sticky on Desktop) */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-4 hidden lg:block">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 pb-2 border-b border-zinc-200">
                Table of Contents
              </h3>
              <ul className="space-y-3 text-xs font-bold text-zinc-500">
                <li>
                  <a href="#agreement" className="hover:text-orange-650 transition-colors block py-1">
                    1. Agreement to Terms
                  </a>
                </li>
                <li>
                  <a href="#purchases" className="hover:text-orange-650 transition-colors block py-1">
                    2. Purchases & Payments
                  </a>
                </li>
                <li>
                  <a href="#intellectual-property" className="hover:text-orange-650 transition-colors block py-1">
                    3. Intellectual Property
                  </a>
                </li>
                <li>
                  <a href="#conduct" className="hover:text-orange-650 transition-colors block py-1">
                    4. User Conduct
                  </a>
                </li>
                <li>
                  <a href="#liability" className="hover:text-orange-650 transition-colors block py-1">
                    5. Limitation of Liability
                  </a>
                </li>
                <li>
                  <a href="#governing-law" className="hover:text-orange-650 transition-colors block py-1">
                    6. Governing Law
                  </a>
                </li>
              </ul>
            </div>

            {/* Right Column - Terms Text */}
            <div className="lg:col-span-8 space-y-12 text-xs sm:text-sm text-zinc-650 leading-relaxed font-normal">
              
              <motion.div
                id="agreement"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4 scrolling-section"
              >
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-900">
                  1. Agreement to Terms
                </h2>
                <p>
                  By creating an account, accessing, or placing an order on our platform, you agree to be bound by these Terms of Service. If you disagree with any portion of these terms, you are prohibited from utilizing our site or services.
                </p>
              </motion.div>

              <motion.div
                id="purchases"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4 scrolling-section"
              >
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-900">
                  2. Purchases & Payments
                </h2>
                <p>
                  All transactions placed through our platform are secure. We reserve the right to refuse or cancel any order at our sole discretion:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>In the event of suspected fraud or unauthorized payment attempts.</li>
                  <li>If the selected item is out of stock or incorrectly priced due to a database rendering configuration.</li>
                  <li>If billing details provided are incomplete or incorrect.</li>
                </ul>
              </motion.div>

              <motion.div
                id="intellectual-property"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4 scrolling-section"
              >
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-900">
                  3. Intellectual Property
                </h2>
                <p>
                  All content included on our website—including brand graphics, text, logo assets, UI layouts, styling custom scripts, and physical candle formulations/designs—is the exclusive property of Dreamers and is protected under national and international copyright, trademark, and intellectual property laws.
                </p>
              </motion.div>

              <motion.div
                id="conduct"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4 scrolling-section"
              >
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-900">
                  4. User Conduct
                </h2>
                <p>
                  You agree to use our website for lawful shopping and community purposes only. You are strictly prohibited from:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Attempting to compromise backend APIs or inject malicious scripts.</li>
                  <li>Using automated scraping tools to crawl our inventory or user database.</li>
                  <li>Impersonating support personnel or creating multiple accounts using invalid data.</li>
                </ul>
              </motion.div>

              <motion.div
                id="liability"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4 scrolling-section"
              >
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-900">
                  5. Limitation of Liability
                </h2>
                <p>
                  In no event shall Dreamers, nor its directors, employees, or developers, be liable for any indirect, incidental, or consequential damages resulting from your use of the website or purchased products, including candle soot, safety issues, or fire hazards due to improper wick trimming or leaving burning candles unattended.
                </p>
              </motion.div>

              <motion.div
                id="governing-law"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4 scrolling-section"
              >
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-900">
                  6. Governing Law
                </h2>
                <p>
                  These Terms of Service shall be governed by and construed in accordance with the laws of India, specifically the jurisdiction of courts in Haryana, without regard to its conflict of law provisions.
                </p>
                <p className="border-l-4 border-orange-550 pl-4 py-2 bg-zinc-50 rounded-r-xl font-medium text-zinc-900">
                  For support inquiries regarding terms, contact: candlebydreamers@gmail.com
                </p>
              </motion.div>

            </div>

          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default TermsOfService;
