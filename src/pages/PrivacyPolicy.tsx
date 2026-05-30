import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Privacy Policy"
        description="Read our privacy policy to understand how Candles by Dreamers collects, uses, and protects your personal information when you shop for premium scented candles."
        canonicalUrl="https://candlesbydreamers.com/privacy-policy"
      />
      <Navbar />
      
      {/* Header */}
      <section className="bg-zinc-50 border-b border-border py-12 md:py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl text-center space-y-4">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-orange-655 bg-orange-50 px-3 py-1 rounded-full inline-block">
            Legal
          </span>
          <h1 className="text-xl sm:text-2xl md:text-4xl font-black uppercase tracking-tight text-zinc-900">
            Privacy Policy
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
                  <a href="#overview" className="hover:text-orange-600 transition-colors block py-1">
                    1. Overview
                  </a>
                </li>
                <li>
                  <a href="#information-we-collect" className="hover:text-orange-600 transition-colors block py-1">
                    2. Information We Collect
                  </a>
                </li>
                <li>
                  <a href="#how-we-use-data" className="hover:text-orange-600 transition-colors block py-1">
                    3. How We Use Data
                  </a>
                </li>
                <li>
                  <a href="#cookies-tracking" className="hover:text-orange-600 transition-colors block py-1">
                    4. Cookies & Tracking
                  </a>
                </li>
                <li>
                  <a href="#third-party-services" className="hover:text-orange-600 transition-colors block py-1">
                    5. Third-Party Services
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-orange-600 transition-colors block py-1">
                    6. Contact Information
                  </a>
                </li>
              </ul>
            </div>

            {/* Right Column - Policy Text */}
            <div className="lg:col-span-8 space-y-12 text-xs sm:text-sm text-zinc-650 leading-relaxed font-normal">
              
              <motion.div
                id="overview"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4 scrolling-section"
              >
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-900">
                  1. Overview
                </h2>
                <p>
                  At Dreamers, we value your trust and are fully committed to protecting your personal information. This Privacy Policy details how we collect, store, share, and utilize your data when you interact with our e-commerce platform and purchase our hand-poured candles.
                </p>
                <p>
                  By accessing our website or placing an order, you agree to the collection and use of information in accordance with this policy.
                </p>
              </motion.div>

              <motion.div
                id="information-we-collect"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4 scrolling-section"
              >
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-900">
                  2. Information We Collect
                </h2>
                <p>
                  To successfully deliver your orders and improve your shopping experience, we collect:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Personal Identifiers:</strong> Name, billing/shipping address, phone number, and email address.</li>
                  <li><strong>Payment Details:</strong> Razorpay transaction references, purchase history, and items added to your cart.</li>
                  <li><strong>Device Information:</strong> IP addresses, browser types, and navigation history via cookies.</li>
                </ul>
              </motion.div>

              <motion.div
                id="how-we-use-data"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4 scrolling-section"
              >
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-900">
                  3. How We Use Data
                </h2>
                <p>
                  We utilize your information for various business purposes, including:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Fulfilling and shipping purchased scented candles.</li>
                  <li>Providing order confirmations, tracking numbers, and customer support.</li>
                  <li>Analyzing store metrics to improve platform speed and user experience.</li>
                  <li>Preventing fraudulent transactions and keeping checkout secure.</li>
                </ul>
              </motion.div>

              <motion.div
                id="cookies-tracking"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4 scrolling-section"
              >
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-900">
                  4. Cookies & Tracking
                </h2>
                <p>
                  We use cookies to maintain your shopping cart state, save checkout choices, and collect statistics on site interaction. You have the option to disable cookies through your browser settings, though doing so may prevent certain site features from functioning (such as persistent shopping cart data).
                </p>
              </motion.div>

              <motion.div
                id="third-party-services"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4 scrolling-section"
              >
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-900">
                  5. Third-Party Services
                </h2>
                <p>
                  We never sell or rent your personal information to third parties. We share data only with trusted partners required to complete your transactions:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Payment Processors:</strong> Secure gateways (Razorpay) to process orders safely.</li>
                  <li><strong>Delivery Partners:</strong> Local postal and courier services to ship candle orders.</li>
                </ul>
              </motion.div>

              <motion.div
                id="contact"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4 scrolling-section"
              >
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-900">
                  6. Contact Information
                </h2>
                <p>
                  If you have questions about this policy, or wish to request the deletion of your personal data, feel free to contact us:
                </p>
                <p className="border-l-4 border-orange-550 pl-4 py-2 bg-zinc-50 rounded-r-xl font-medium text-zinc-900">
                  Email: candlebydreamers@gmail.com <br />
                  Location: Haryana, India
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

export default PrivacyPolicy;
