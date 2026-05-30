import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureHighlights from "@/components/FeatureHighlights";
import FeaturedProducts from "@/components/FeaturedProducts";
import BotanicalCollectionSection from "@/components/BotanicalCollectionSection";
import WhyDreamersSection from "@/components/WhyDreamersSection";
import BrandMessageSection from "@/components/BrandMessageSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Official Store | Premium Scented Candles"
        description="Welcome to Candles by Dreamers. Hand-poured luxury soy wax scented candles with organic wood wicks designed to soothe and inspire dreams."
        keywords="candles by dreamers, scented candles, aromatherapy candles, soy candles, wood wick candles, home fragrance, gift candles"
        canonicalUrl="https://candlesbydreamers.com"
      />
      <Navbar />
      <HeroSection />
      <hr className="border-t border-zinc-150" />
      <FeatureHighlights />
      <hr className="border-t border-zinc-150" />
      <FeaturedProducts />
      <hr className="border-t border-zinc-150" />
      <BrandMessageSection />
      <hr className="border-t border-zinc-150" />
      <BotanicalCollectionSection />
      <hr className="border-t border-zinc-150" />
      <WhyDreamersSection />
      <hr className="border-t border-zinc-150" />
      <TestimonialsSection />
      <hr className="border-t border-zinc-150" />
      <FooterSection />
    </div>
  );
};

export default Index;
