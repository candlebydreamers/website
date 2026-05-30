import { useState, useEffect } from "react";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

interface Category {
  id: string;
  name: string;
}

const FooterSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .order("created_at", { ascending: false })
        .limit(4);
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);
  return (
    <footer className="bg-zinc-950 text-zinc-400 py-16 px-6 md:px-12 border-t border-zinc-900">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          
          {/* Column 1 - Brand Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-white font-black text-xl tracking-[0.2em] uppercase gradient-text">Dreamers</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              Premium hand-poured scented candles crafted with 100% natural organic soy wax and crackling wood wicks to illuminate your dreams and calm your mind.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/candlesbydreamers/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                title="Instagram"
              >
                <Instagram size={14} />
              </a>
              <a
                href="https://facebook.com/candlesbydreamers"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                title="Facebook"
              >
                <Facebook size={14} />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="space-y-5">
            <h4 className="text-xs font-black tracking-[0.25em] uppercase text-white">
              Scent Profiles
            </h4>
            <ul className="space-y-3 text-xs">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link to={`/shop?category=${encodeURIComponent(cat.name)}`} className="hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/shop" className="hover:text-primary transition-colors">
                  All Scents
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Information */}
          <div className="space-y-5">
            <h4 className="text-xs font-black tracking-[0.25em] uppercase text-white">
              Information
            </h4>
            <ul className="space-y-3 text-xs">
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping-returns" className="hover:text-primary transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact Info */}
          <div className="space-y-5">
            <h4 className="text-xs font-black tracking-[0.25em] uppercase text-white">
              Support
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-3 text-zinc-400 hover:text-zinc-200 transition-colors">
                <Phone size={14} className="text-primary flex-shrink-0" />
                <span>+91 9643766546</span>
              </li>
              <li className="flex items-center gap-3 text-zinc-400 hover:text-zinc-200 transition-colors">
                <Mail size={14} className="text-primary flex-shrink-0" />
                <span className="truncate">candlebydreamers@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-zinc-400 hover:text-zinc-200 transition-colors">
                <MapPin size={14} className="text-primary flex-shrink-0" />
                <span>Haryana, India</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider & Copy Bar */}
        <div className="mt-16 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-zinc-500 tracking-wider text-center sm:text-left">
            © {new Date().getFullYear()} Candles by Dreamers. All rights reserved. Created with purpose.
          </p>
          
          {/* Dummy payment badges for premium feel */}
          <div className="flex items-center gap-3 opacity-30 grayscale hover:opacity-50 transition-opacity">
            <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded">
              Razorpay
            </span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded">
              UPI
            </span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded">
              Visa
            </span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded">
              MasterCard
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
