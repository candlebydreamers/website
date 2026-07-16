import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  ShoppingBag, Menu, X, User, Trash2, Plus, Minus,
  Search, MessageCircle, Mail, Phone, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { supabase } from "@/lib/supabaseClient";
import whatsappIcon from "@/assets/WhatsApp_icon.png.webp";
import logoImg from "@/assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const { cartItems, totalItems, totalPrice, updateQuantity, removeFromCart, isLoading, clearCart } = useCart();
  const [user, setUser] = useState<{ fullName?: string; email?: string } | null>(null);
  
  const [serviceOpen, setServiceOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          fullName: session.user.user_metadata.full_name || session.user.email,
          email: session.user.email
        });
      } else {
        setUser(null);
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          fullName: session.user.user_metadata.full_name || session.user.email,
          email: session.user.email
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".service-trigger-wrap")) {
        setServiceOpen(false);
      }
      if (!target.closest(".user-trigger-wrap")) {
        setUserOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
      setMobileOpen(false);
    }
  };

  const links = ["Home", "Shop", "About", "Contact"];

  const getLinkPath = (link: string) => {
    if (link === "Home") return "/";
    if (link === "Shop") return "/shop";
    if (link === "About") return "/about";
    if (link === "Contact") return "/contact";
    return `/#${link.toLowerCase()}`;
  };

  const isLinkActive = (link: string) => {
    const path = getLinkPath(link);
    if (path === "/") {
      return location.pathname === "/";
    }
    if (path === "/shop") {
      return location.pathname.startsWith("/shop") || location.pathname.startsWith("/product");
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserOpen(false);
    navigate("/auth");
  };

  return (
    <>
      <nav className="relative w-full z-50 shadow-sm border-b border-zinc-100 bg-white animate-fade-in">
        {/* Announcement Bar */}
        <div className="bg-black text-white text-[6.5px] min-[320px]:text-[7px] min-[360px]:text-[8.5px] sm:text-[9.5px] md:text-[11px] font-bold uppercase tracking-normal min-[360px]:tracking-wide sm:tracking-[0.25em] py-2 px-2 sm:px-4 text-center border-b border-zinc-900 flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="truncate">🕯️ Premium Hand-Poured Scented Candles. Bring Home Warmth & Calm. 🕯️</span>
        </div>

        {/* Main Navbar Row */}
        <div className="bg-white">
          <div className="container mx-auto flex items-center justify-between h-20 px-6">
            <Link to="/" className="flex items-center shrink-0">
              <span className="text-xl font-black uppercase tracking-[0.2em] gradient-text">DREAMERS</span>
            </Link>

            {/* Nav Links Beside Search (Desktop) */}
            <div className="hidden lg:flex items-center gap-8 ml-8">
              {links.map((link) => (
                <Link
                  key={link}
                  to={getLinkPath(link)}
                  className={`text-xs font-bold tracking-[0.15em] uppercase transition-colors relative py-2 group ${
                    isLinkActive(link) ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-950"
                  }`}
                >
                  {link}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${
                    isLinkActive(link) ? "w-full" : "w-0 group-hover:w-full"
                  }`} />
                </Link>
              ))}
            </div>
 
            {/* Search Bar - Center (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm mx-6 relative">
              <div className="w-full relative group">
                <input
                  type="text"
                  placeholder="Search our scented candles..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white text-zinc-900 placeholder:text-zinc-400 text-xs px-5 py-2.5 pl-11 pr-4 rounded-full border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 shadow-sm"
                />
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" />
              </div>
            </form>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Central Service dropdown */}
              <div className="relative service-trigger-wrap flex items-center">
                <div 
                  onClick={() => {
                    setServiceOpen(!serviceOpen);
                    setUserOpen(false);
                  }}
                  className="flex items-center gap-2 text-zinc-700 hover:text-black transition-colors cursor-pointer py-2 select-none"
                >
                  <MessageCircle size={20} className="shrink-0" />
                  <div className="hidden md:flex flex-col text-left leading-none">
                    <span className="text-[10px] text-zinc-400 font-medium leading-none">Central</span>
                    <span className="text-xs font-bold leading-tight text-zinc-800 mt-0.5">Support</span>
                  </div>
                </div>
                
                {/* Central Service dropdown tooltip */}
                <div className={`fixed top-20 left-4 right-4 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:w-72 pt-2 transition-all duration-200 z-50 ${serviceOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                  <div className="w-full sm:w-72 bg-white rounded-md border border-zinc-100 shadow-xl p-4 text-zinc-800 font-sans">
                    <a 
                      href="https://wa.me/917015902277" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 py-2.5 border-b border-zinc-100 hover:bg-zinc-50 transition-colors px-2 rounded-sm"
                    >
                      <img src={whatsappIcon} alt="WhatsApp" className="w-5 h-5 shrink-0 object-contain" />
                      <div className="text-left">
                        <div className="text-[9px] text-zinc-400 font-bold uppercase leading-none">WhatsApp:</div>
                        <div className="text-xs font-bold text-zinc-800">+91 70159 02277</div>
                      </div>
                    </a>
                    
                    <a 
                      href="tel:+917015902277" 
                      className="flex items-center gap-3 py-2.5 border-b border-zinc-100 hover:bg-zinc-50 transition-colors px-2 rounded-sm"
                    >
                      <Phone size={14} className="text-zinc-500" />
                      <div className="text-left">
                        <div className="text-[9px] text-zinc-400 font-bold uppercase leading-none">Telephone:</div>
                        <div className="text-xs font-bold text-zinc-800">+91 70159 02277</div>
                      </div>
                    </a>

                    <a 
                      href="mailto:candlebydreamers@gmail.com" 
                      className="flex items-center gap-3 py-2.5 border-b border-zinc-100 hover:bg-zinc-50 transition-colors px-2 rounded-sm"
                    >
                      <Mail size={14} className="text-zinc-500" />
                      <div className="text-left">
                        <div className="text-[9px] text-zinc-400 font-bold uppercase leading-none">E-mail:</div>
                        <div className="text-xs font-bold text-zinc-800">candlebydreamers@gmail.com</div>
                      </div>
                    </a>

                    <div className="flex items-center gap-3 py-2.5 border-b border-zinc-100 px-2">
                      <Clock size={14} className="text-zinc-400" />
                      <div className="text-left">
                        <div className="text-[9px] text-zinc-400 font-bold uppercase leading-none">Opening Hours:</div>
                        <div className="text-[11px] font-semibold text-zinc-600">Mon. to Fri. - 9:00 am to 5:00 pm</div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Link 
                        to="/contact" 
                        className="block w-full text-center bg-zinc-950 hover:bg-primary text-white font-bold uppercase tracking-widest text-[9px] py-2.5 rounded-sm transition-colors"
                      >
                        Contact Us
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative user-trigger-wrap flex items-center">
                {user ? (
                  <>
                    <div 
                      onClick={() => {
                        setUserOpen(!userOpen);
                        setServiceOpen(false);
                      }}
                      className="flex items-center gap-2 text-zinc-700 hover:text-black transition-colors cursor-pointer py-2 select-none"
                    >
                      <User size={20} className="shrink-0" />
                      <div className="hidden md:flex flex-col text-left leading-none">
                        <span className="text-[10px] text-zinc-400 font-medium leading-none">Welcome,</span>
                        <span className="text-xs font-bold leading-tight text-zinc-800 mt-0.5 max-w-[100px] truncate">{user.fullName}</span>
                      </div>
                    </div>
                    <div className={`absolute right-0 top-full pt-2 transition-all duration-200 z-50 origin-top-right ${userOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                      <div className="w-40 rounded-md bg-white border border-zinc-100 shadow-lg py-1 flex flex-col font-sans text-xs tracking-wider">
                        <Link to="/my-orders" className="px-4 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors font-semibold">Orders</Link>
                        <div className="border-t border-zinc-100 my-1"></div>
                        <button 
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-xs text-left text-red-500 hover:bg-zinc-50 transition-colors whitespace-nowrap font-semibold"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/auth" className="flex items-center gap-2 text-zinc-700 hover:text-black transition-colors cursor-pointer py-2">
                      <User size={20} className="shrink-0" />
                      <div className="hidden md:flex flex-col text-left leading-none">
                        <span className="text-[10px] text-zinc-400 font-medium leading-none">Hello, Welcome!</span>
                        <span className="text-xs font-bold leading-tight text-zinc-800 mt-0.5">Log in / Register</span>
                      </div>
                    </Link>
                  </>
                )}
              </div>

              <button 
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-2 text-zinc-700 hover:text-black transition-colors py-2 relative"
              >
                <div className="relative">
                  <ShoppingBag size={20} className="shrink-0" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center shadow-sm">
                      {totalItems}
                    </span>
                  )}
                </div>
                <div className="hidden md:flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-zinc-800 leading-tight">My Bag</span>
                  <span className="text-[10px] text-zinc-400 font-medium mt-0.5">₹{totalPrice.toFixed(2)}</span>
                </div>
              </button>
              <button
                className="md:hidden p-2 text-zinc-700 hover:text-black transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
 
          {/* Mobile Navigation Drawer */}
          <AnimatePresence>
            {mobileOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileOpen(false)}
                  className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm md:hidden"
                />
                {/* Drawer */}
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed right-0 top-0 bottom-0 w-full max-w-[300px] bg-white z-[70] shadow-2xl border-l border-zinc-200 flex flex-col md:hidden"
                >
                  {/* Header with Close Cross Button */}
                  <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                    <span className="text-zinc-950 font-black uppercase tracking-widest text-sm">Navigation</span>
                    <button 
                      onClick={() => setMobileOpen(false)}
                      className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-800"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Body links */}
                  <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 font-sans">
                    {links.map((link) => (
                      <Link
                        key={link}
                        to={getLinkPath(link)}
                        onClick={() => setMobileOpen(false)}
                        className={`text-base tracking-widest uppercase transition-colors border-b pb-3 ${
                          isLinkActive(link) 
                            ? "text-primary border-primary font-black" 
                            : "text-zinc-500 hover:text-zinc-950 border-zinc-100 font-bold"
                        }`}
                      >
                        {link}
                      </Link>
                    ))}

                    {/* Mobile Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="relative mt-4">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        className="w-full bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 text-xs px-4 py-3 pr-10 rounded-xl border border-zinc-200 focus:outline-none focus:border-primary"
                      />
                      <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                        <Search size={15} />
                      </button>
                    </form>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-[70] shadow-2xl border-l border-border flex flex-col font-sans"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag size={24} className="text-primary" />
                  <h2 className="text-xl font-black uppercase tracking-tighter">Your Bag</h2>
                  <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded-full">{totalItems}</span>
                </div>
                <button 
                  onClick={() => setCartOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <ShoppingBag size={48} className="mb-4 stroke-1" />
                    <p className="text-sm uppercase tracking-widest font-bold">Your bag is empty</p>
                    <Link 
                      to="/shop" 
                      onClick={() => setCartOpen(false)}
                      className="mt-6 text-xs text-primary border-b border-primary pb-1 font-bold"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 group">
                        <div className="w-20 h-24 bg-muted rounded overflow-hidden shrink-0 border border-border">
                          {item.product.imageUrls?.[0] ? (
                            <img 
                              src={item.product.imageUrls[0]} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag size={16} className="opacity-20" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="text-sm font-black uppercase tracking-tight line-clamp-1">{item.product.name}</h3>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">Size: {item.size}</p>
                            <div className="flex items-center space-x-1 mt-2">
                              <button 
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center rounded-sm border border-border bg-muted/30 hover:bg-muted hover:border-primary/50 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group/btn"
                              >
                                <Minus size={12} className="group-hover/btn:text-primary transition-colors" />
                              </button>
                              <div className="w-8 h-8 flex items-center justify-center text-xs font-black bg-background border-y border-border">
                                {item.quantity}
                              </div>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-sm border border-border bg-muted/30 hover:bg-muted hover:border-primary/50 transition-all active:scale-95 group/btn"
                              >
                                <Plus size={12} className="group-hover/btn:text-primary transition-colors" />
                              </button>
                            </div>
                          </div>
                          <div className="text-sm font-black text-right">
                            ₹{((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-border bg-muted/20">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Subtotal</span>
                  <span className="text-xl font-black">₹{totalPrice.toFixed(2)}</span>
                </div>
                <button 
                  disabled={cartItems.length === 0}
                  onClick={() => {
                    setCartOpen(false);
                    navigate("/checkout");
                  }}
                  className="w-full gradient-btn py-4 rounded-sm font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale transition-all"
                >
                  Checkout Now
                </button>
                <button 
                  onClick={() => setCartOpen(false)}
                  className="w-full mt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/917015902277"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 duration-300 drop-shadow-xl"
        aria-label="Contact on WhatsApp"
      >
        <img src={whatsappIcon} alt="WhatsApp" className="w-14 h-14 object-contain" />
      </a>
    </>
  );
};

export default Navbar;
