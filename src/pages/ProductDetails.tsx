import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, ChevronRight, Package, ArrowLeft, Flame, Clock, Sparkles, Heart, X } from "lucide-react";
import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection";
import SEO from "../components/SEO";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { supabase } from "@/lib/supabaseClient";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    category: string;
    imageUrls: string[];
    isVisible: boolean;
    sizes: string[];
    scentProfile?: string;
    burnTime?: string;
    jarCategories?: string[];
    price250g?: number;
    discountPrice250g?: number;
}

const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedJarCategory, setSelectedJarCategory] = useState<string | null>(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data, error } = await supabase
                    .from("products")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) throw error;

                if (data) {
                    let urls: string[] = [];
                    if (Array.isArray(data.image_urls)) {
                        urls = data.image_urls;
                    } else if (typeof data.image_urls === "string") {
                        try {
                            urls = JSON.parse(data.image_urls);
                        } catch {
                            urls = [];
                        }
                    }

                    let parsedSizes: string[] = [];
                    if (Array.isArray(data.sizes)) {
                        parsedSizes = data.sizes;
                    } else if (typeof data.sizes === "string") {
                        try {
                            parsedSizes = JSON.parse(data.sizes);
                        } catch {
                            parsedSizes = [];
                        }
                    }

                    let parsedJarCategories: string[] = [];
                    if (Array.isArray(data.jar_categories)) {
                        parsedJarCategories = data.jar_categories;
                    } else if (typeof data.jar_categories === "string") {
                        try {
                            parsedJarCategories = JSON.parse(data.jar_categories);
                        } catch {
                            parsedJarCategories = [];
                        }
                    }

                    const parsedProduct: Product = {
                        id: data.id,
                        name: data.name,
                        description: data.description,
                        price: Number(data.price),
                        discountPrice: data.discount_price ? Number(data.discount_price) : undefined,
                        price250g: data.price_250g ? Number(data.price_250g) : undefined,
                        discountPrice250g: data.discount_price_250g ? Number(data.discount_price_250g) : undefined,
                        category: data.category,
                        imageUrls: urls,
                        isVisible: data.is_visible,
                        sizes: parsedSizes,
                        scentProfile: data.scent_profile,
                        burnTime: data.burn_time,
                        jarCategories: parsedJarCategories
                    };

                    setProduct(parsedProduct);
                    
                    // Set primary initial image
                    if (urls.length > 0) {
                        setActiveImage(urls[0]);
                    }
                    
                    // Preselect a size if available
                    if (parsedSizes.length > 0) {
                        setSelectedSize(parsedSizes[0]);
                    }

                    // Preselect a jar category if available
                    if (parsedJarCategories.length > 0) {
                        setSelectedJarCategory(parsedJarCategories[0]);
                    }
                } else {
                    toast.error("Product not found");
                }
            } catch (error) {
                console.error("Error fetching product details from Supabase:", error);
                toast.error("Failed to load product details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleAddToCart = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            toast.error("Please login to add items to cart");
            navigate("/auth");
            return;
        }

        if (!selectedSize && product?.sizes && product.sizes.length > 0) {
            toast.error("Please select a size first");
            return;
        }

        if (!selectedJarCategory && product?.jarCategories && product.jarCategories.length > 0) {
            toast.error("Please select a jar type first");
            return;
        }
        
        if (product) {
            const finalSize = selectedJarCategory ? `${selectedSize || "One Size"} - ${selectedJarCategory}` : selectedSize || "One Size";
            await addToCart(product.id, finalSize);
        }
    };

    const handleBuyNow = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            toast.error("Please login to proceed with purchase");
            navigate("/auth");
            return;
        }

        if (!selectedSize && product?.sizes && product.sizes.length > 0) {
            toast.error("Please select a size first");
            return;
        }

        if (!selectedJarCategory && product?.jarCategories && product.jarCategories.length > 0) {
            toast.error("Please select a jar type first");
            return;
        }
        
        if (product) {
            const finalSize = selectedJarCategory ? `${selectedSize || "One Size"} - ${selectedJarCategory}` : selectedSize || "One Size";
            await addToCart(product.id, finalSize);
            navigate("/checkout");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background font-sans flex flex-col">
                <Navbar />
                <div className="flex-1 flex justify-center items-center opacity-50">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-background font-sans flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col justify-center items-center">
                    <Package className="w-16 h-16 opacity-30 mb-4 text-zinc-400" />
                    <h2 className="text-2xl font-black uppercase tracking-widest mb-4">Candle Not Found</h2>
                    <Link to="/shop" className="text-sm font-bold uppercase tracking-widest text-primary border-b border-primary pb-1 hover:text-foreground hover:border-foreground transition-all">
                        Return to Catalog
                    </Link>
                </div>
            </div>
        );
    }

    const availableImages = product.imageUrls || [];

    const is250g = (selectedSize || "").includes("250g");
    const displayPrice = (is250g && product.price250g != null) ? product.price250g : product.price;
    const displayDiscountPrice = (is250g && product.price250g != null) ? product.discountPrice250g : product.discountPrice;

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/30">
            <SEO 
                title={`${product.name} | ${product.category}`}
                description={`${product.description} Shop this premium ${product.category} candle at Candles by Dreamers - priced at ₹${displayDiscountPrice || displayPrice}.`}
                keywords={`${product.name}, ${product.category}, candles, soy wax, aromatherapy, luxury candles`}
                canonicalUrl={`https://candlesbydreamers.com/product/${product.id}`}
                ogImage={product.imageUrls?.[0] || "https://candlesbydreamers.com/logo.png"}
                ogType="product"
                productData={{
                    name: product.name,
                    price: displayDiscountPrice || displayPrice,
                    image: product.imageUrls?.[0],
                    category: product.category,
                    availability: "InStock"
                }}
            />
            <Navbar />

            {/* Breadcrumb Navigation */}
            <div className="pt-8 pb-2 px-4 sm:px-6">
                <div className="container mx-auto flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-zinc-400 whitespace-nowrap overflow-x-auto font-sans tracking-wide">
                    <Link to="/shop" className="hover:text-black transition-colors flex items-center gap-1 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                        <ArrowLeft size={11} className="shrink-0" /> Catalog
                    </Link>
                    <ChevronRight size={9} className="text-zinc-300 shrink-0" />
                    <span className="capitalize">{product.category}</span>
                    <ChevronRight size={9} className="text-zinc-300 shrink-0" />
                    <span className="text-zinc-850 font-bold truncate">{product.name}</span>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">
                    
                    {/* Left Frame: Image Gallery */}
                    <div className="w-[85%] md:w-full lg:w-[46%] xl:w-[42%] mx-auto md:mx-0 flex flex-col md:flex-row items-start gap-4 select-none lg:max-w-[480px] xl:max-w-[520px]">
                        {/* Image Thumbnails Row / Column */}
                        {availableImages.length > 1 && (
                            <div className="flex md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-x-visible md:overflow-y-auto pb-2 md:pb-0 scrollbar-none w-full md:w-24 shrink-0 md:max-h-[520px] lg:max-h-[420px]" style={{ scrollbarWidth: 'none' }}>
                                {availableImages.map((imgUrl, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => setActiveImage(imgUrl)}
                                        className={`shrink-0 w-16 md:w-full aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeImage === imgUrl ? "border-primary scale-[1.03] shadow-md shadow-primary/10" : "border-zinc-200/60 opacity-60 hover:opacity-100"}`}
                                    >
                                        <img src={imgUrl} alt={`${product.name} Preview ${index+1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Primary Image View */}
                        <div 
                            className="flex-1 min-w-0 order-1 md:order-2 aspect-square bg-black rounded-2xl border border-zinc-100 overflow-hidden relative shadow-sm group cursor-zoom-in"
                            onClick={() => activeImage && setIsLightboxOpen(true)}
                        >
                            {displayDiscountPrice && (
                                <div className="absolute top-4 left-4 z-10 bg-primary text-white text-[10px] font-black uppercase tracking-[0.25em] px-3.5 py-2 rounded-full shadow-sm animate-pulse">
                                    Sale
                                </div>
                            )}
                            {activeImage ? (
                                <motion.img 
                                    key={activeImage}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    src={activeImage} 
                                    alt={product.name} 
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                    <Package className="w-16 h-16 opacity-30" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Frame: Details and Action */}
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full lg:w-[54%] xl:w-[58%] flex flex-col font-sans"
                    >
                        <div className="mb-6">
                            <span className="inline-block text-[10px] font-extrabold tracking-[0.25em] uppercase text-primary bg-amber-50 px-3 py-1.5 rounded-full mb-3">
                                {product.category}
                            </span>
                            <h1 className="text-xl sm:text-3xl lg:text-[40px] font-bold uppercase tracking-wider text-zinc-900 mb-3 leading-[1.1]">
                                {product.name}
                            </h1>
                            
                            <div className="flex items-end gap-3 mb-6">
                                <span className="text-2xl sm:text-3xl font-semibold text-zinc-950">
                                    ₹{displayDiscountPrice || displayPrice}
                                </span>
                                {displayDiscountPrice && (
                                    <span className="text-sm sm:text-lg text-zinc-400 line-through font-normal mb-1">
                                        ₹{displayPrice}
                                    </span>
                                )}
                            </div>
                            
                            {/* Scent & Burn specifications */}
                            <div className="grid grid-cols-2 gap-4 mb-6 bg-zinc-50 border border-zinc-150 p-4 rounded-xl">
                                {product.scentProfile && (
                                    <div className="flex items-start gap-2.5">
                                        <Flame size={18} className="text-primary mt-0.5" />
                                        <div>
                                            <span className="block text-[9px] uppercase tracking-widest text-zinc-400 font-extrabold">Scent Profile</span>
                                            <span className="text-xs font-bold text-zinc-800">{product.scentProfile}</span>
                                        </div>
                                    </div>
                                )}
                                {product.burnTime && (
                                    <div className="flex items-start gap-2.5">
                                        <Clock size={18} className="text-primary mt-0.5" />
                                        <div>
                                            <span className="block text-[9px] uppercase tracking-widest text-zinc-400 font-extrabold">Burn Time</span>
                                            <span className="text-xs font-bold text-zinc-800">{product.burnTime}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="w-full h-px bg-zinc-150 my-5"></div>
                            
                            <div className="text-zinc-650 text-sm leading-relaxed max-w-none font-semibold whitespace-pre-wrap break-words">
                                {product.description}
                            </div>
                        </div>

                        {/* Jar Category Selection (Core Detail) */}
                        {product.jarCategories && product.jarCategories.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-zinc-800">Select Jar Category</h3>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {product.jarCategories.map((cat) => (
                                        <button 
                                            key={cat}
                                            onClick={() => setSelectedJarCategory(cat)}
                                            className={`h-11 min-w-[3.5rem] px-5 rounded-xl border-2 font-black uppercase tracking-wider text-xs transition-all duration-200 ${selectedJarCategory === cat ? "bg-primary border-primary text-white shadow-md shadow-primary/10 scale-105" : "border-zinc-200 hover:border-zinc-800 text-zinc-700 hover:text-black"}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Weight/Size Selection */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-zinc-800">Select Weight / Size</h3>
                            </div>
                            
                            {product.sizes && product.sizes.length > 0 ? (
                                <div className="flex flex-wrap gap-2.5">
                                    {product.sizes.map((size) => (
                                        <button 
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`h-11 min-w-[3.5rem] px-4 rounded-xl border-2 font-black uppercase tracking-wider text-xs transition-all duration-200 ${selectedSize === size ? "bg-primary border-primary text-white shadow-md shadow-primary/10 scale-105" : "border-zinc-200 hover:border-zinc-800 text-zinc-700 hover:text-black"}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-11 inline-flex items-center px-5 border border-zinc-200 rounded-xl font-bold uppercase tracking-wider text-xs text-zinc-400 cursor-not-allowed">
                                    Standard Jar (8 oz)
                                </div>
                            )}
                        </div>

                        {/* Status Message */}
                        <div className="mb-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Hand-Poured & Cured (Available)
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3.5 mt-2">
                            <button 
                                onClick={handleAddToCart}
                                className="w-full sm:flex-1 h-12 sm:h-14 shrink-0 bg-white border-2 border-zinc-200 hover:border-primary rounded-full flex items-center justify-center gap-2 font-bold uppercase tracking-[0.2em] text-xs hover:bg-primary hover:text-white transition-all duration-300 active:scale-[0.98] text-zinc-700"
                            >
                                <ShoppingBag size={15} /> Add to Cart
                            </button>
                            <button 
                                onClick={handleBuyNow}
                                className="w-full sm:flex-1 h-12 sm:h-14 shrink-0 bg-primary hover:bg-amber-600 text-white rounded-full font-bold uppercase tracking-[0.2em] text-xs shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98]"
                            >
                                Buy It Now
                            </button>
                        </div>
                        
                        {/* Guarantee Badges */}
                        <div className="mt-8 pt-6 border-t border-zinc-150 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            <div className="flex flex-col items-center">
                                <span className="block text-[8px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-1">Secure</span>
                                <span className="text-xs font-bold text-zinc-800">SSL Checkout</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="block text-[8px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-1">Fast</span>
                                <span className="text-xs font-bold text-zinc-800">48h Dispatch</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="block text-[8px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-1">Wax Type</span>
                                <span className="text-xs font-bold text-zinc-800">Organic Soy</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="block text-[8px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-1">Production</span>
                                <span className="text-xs font-bold text-zinc-800">Hand-Poured</span>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>
            {/* Fullscreen Lightbox */}
            {isLightboxOpen && activeImage && (
                <div 
                    className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[210] w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all hover:scale-110 active:scale-95"
                        aria-label="Close fullscreen view"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <motion.img 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        src={activeImage} 
                        alt={product.name}
                        className="max-w-full max-h-full object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            <FooterSection />
        </div>
    );
};

export default ProductDetails;
