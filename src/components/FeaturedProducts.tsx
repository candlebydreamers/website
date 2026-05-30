import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  imageUrls: string[];
  isVisible: boolean;
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, description, price, discount_price, category, image_urls, is_visible")
          .eq("is_visible", true)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          const parsed = data.map((p: any) => {
            let urls: string[] = [];
            if (Array.isArray(p.image_urls)) {
              urls = p.image_urls;
            } else if (typeof p.image_urls === "string") {
              try {
                urls = JSON.parse(p.image_urls);
              } catch {
                urls = [];
              }
            }
            return {
              id: p.id,
              name: p.name,
              description: p.description,
              price: Number(p.price),
              discountPrice: p.discount_price ? Number(p.discount_price) : undefined,
              category: p.category,
              imageUrls: urls,
              isVisible: p.is_visible,
            };
          });
          setProducts(parsed.slice(0, 8));
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLatestProducts();
  }, []);

  useEffect(() => {
    const handleDocumentClick = () => {
      setActiveCardId(null);
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  const handleCardClick = (e: React.MouseEvent, productId: string) => {
    if (window.innerWidth < 768) {
      if (activeCardId !== productId) {
        e.preventDefault();
        e.stopPropagation();
        setActiveCardId(productId);
      }
    }
  };

  return (
    <section id="shop" className="py-12 md:py-20 px-4 md:px-6 bg-zinc-50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.35em] uppercase text-primary font-bold mb-3">
            Hand-Crafted Collection
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-zinc-900">
            Featured Scents
          </h2>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center p-20 opacity-50">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-muted-foreground uppercase tracking-widest text-sm flex flex-col items-center py-20 bg-white rounded-2xl border border-zinc-200 shadow-sm">
            <Package className="w-10 h-10 mb-4 opacity-50 text-zinc-400" />
            <p>No products featured yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group cursor-pointer flex flex-col justify-between bg-white border border-zinc-150 p-3 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <Link 
                    to={`/product/${product.id}`} 
                    onClick={(e) => handleCardClick(e, product.id)}
                    className="relative overflow-hidden rounded-xl bg-muted mb-4 aspect-[3/4] block"
                  >
                    {product.discountPrice && (
                      <div className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-sm">
                        Sale
                      </div>
                    )}
                    {product.imageUrls?.[0] ? (
                      <img
                        src={product.imageUrls[0]}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground opacity-30">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/10 transition-colors duration-500" />
                    
                    {/* Action on hover */}
                    <span className={`absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4 bg-zinc-950 text-white py-2 md:py-3 px-1 md:px-4 rounded-full text-[8px] min-[370px]:text-[10px] md:text-xs font-black tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-500 whitespace-nowrap ${
                      activeCardId === product.id 
                        ? "opacity-100 translate-y-0" 
                        : "opacity-0 translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0"
                    }`}>
                      <ShoppingBag className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      View Scent
                    </span>
                  </Link>
                  <div className="px-1 space-y-1">
                     <div className="text-[9px] text-primary font-bold uppercase tracking-[0.2em]">{product.category}</div>
                     <h3 className="text-xs sm:text-sm font-bold uppercase tracking-tight text-zinc-900 group-hover:text-primary transition-colors line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                       <Link to={`/product/${product.id}`}>
                         {product.name}
                       </Link>
                     </h3>
                  </div>
                </div>

                <div className="px-1 pt-3 mt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                     <span className="text-sm font-semibold text-zinc-900">
                       ₹{product.discountPrice || product.price}
                     </span>
                     {product.discountPrice && (
                       <span className="text-[10px] text-zinc-400 line-through">
                         ₹{product.price}
                       </span>
                     )}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-primary transition-colors">
                    Buy &rarr;
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {!isLoading && products.length > 0 && (
          <div className="text-center mt-12">
            <Link to="/shop" className="inline-block bg-white text-primary border border-zinc-200 hover:bg-primary hover:text-white hover:border-primary px-8 py-3 rounded-full text-xs font-bold tracking-[0.25em] uppercase transition-all duration-300 shadow-sm">
               View All Scents
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
