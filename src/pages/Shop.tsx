import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Filter, ChevronDown, ChevronUp, Package, X, Check, ArrowUpDown } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection";
import SEO from "../components/SEO";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    category: string;
    imageUrls: string[];
    isVisible: boolean;
}

interface Category {
    id: string;
    name: string;
}

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    
    // Price Range Filter
    const [minPriceInput, setMinPriceInput] = useState("");
    const [maxPriceInput, setMaxPriceInput] = useState("");
    const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
    const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);

    // Sorting Custom Select State
    const [sortOrder, setSortOrder] = useState<"featured" | "price-asc" | "price-desc">("featured");
    const [isSortOpen, setIsSortOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);

    // Accordion States for Sidebar Filters
    const [accordions, setAccordions] = useState({
        category: true,
        price: true
    });

    // Mobile sidebar toggle
    const [showSidebar, setShowSidebar] = useState(false);

    // Close sort dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sync categories and products from Supabase and handle URL queries
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    supabase.from("products").select("*").eq("is_visible", true).order("created_at", { ascending: false }),
                    supabase.from("categories").select("*").order("name", { ascending: true })
                ]);

                let fetchedCategories: Category[] = [];
                if (categoriesRes.data) {
                    fetchedCategories = categoriesRes.data;
                    setCategories(fetchedCategories);
                }

                if (productsRes.data) {
                    const parsedProducts = productsRes.data.map((p: any) => {
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
                            isVisible: p.is_visible
                        };
                    });
                    setProducts(parsedProducts);
                }

                // Process initial URL search param using fetched categories
                const query = searchParams.get("category") || searchParams.get("search") || "";
                if (query) {
                    const matchedCategory = fetchedCategories.find(
                        c => c.name.toLowerCase() === query.toLowerCase()
                    );
                    if (matchedCategory) {
                        setSelectedCategories([matchedCategory.name]);
                        setSearchQuery("");
                    } else {
                        setSearchQuery(query);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch shop data from Supabase:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [searchParams]);

    // Dynamic counts (Amazon style)
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        products.forEach(p => {
            counts[p.category] = (counts[p.category] || 0) + 1;
        });
        return counts;
    }, [products]);

    // Derived state for filtering and sorting
    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p => 
                p.name?.toLowerCase().includes(q) || 
                p.description?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q)
            );
        }

        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(p.category));
        }

        if (appliedMinPrice !== null) {
            result = result.filter(p => (p.discountPrice || p.price) >= appliedMinPrice);
        }

        if (appliedMaxPrice !== null) {
            result = result.filter(p => (p.discountPrice || p.price) <= appliedMaxPrice);
        }

        switch (sortOrder) {
            case "price-asc":
                result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
                break;
            case "price-desc":
                result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
                break;
            default:
                // Keep default fetched order (newest first)
                break;
        }

        return result;
    }, [products, searchQuery, selectedCategories, appliedMinPrice, appliedMaxPrice, sortOrder]);

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev => 
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    const applyPriceFilter = () => {
        const minVal = minPriceInput === "" ? null : Number(minPriceInput);
        const maxVal = maxPriceInput === "" ? null : Number(maxPriceInput);
        setAppliedMinPrice(minVal);
        setAppliedMaxPrice(maxVal);
    };

    const applyQuickPrice = (min: number | null, max: number | null) => {
        setMinPriceInput(min === null ? "" : String(min));
        setMaxPriceInput(max === null ? "" : String(max));
        setAppliedMinPrice(min);
        setAppliedMaxPrice(max);
    };

    const clearAllFilters = () => {
        setSearchQuery("");
        setSelectedCategories([]);
        setMinPriceInput("");
        setMaxPriceInput("");
        setAppliedMinPrice(null);
        setAppliedMaxPrice(null);
        setSortOrder("featured");
        setSearchParams({});
    };

    const toggleAccordion = (section: "category" | "price") => {
        setAccordions(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const sortLabels = {
        featured: "Default Sort",
        "price-asc": "Price: Low to High",
        "price-desc": "Price: High to Low"
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            <SEO 
                title="The Scent Catalog | Shop Luxury Candles"
                description="Browse our hand-poured candle collection. Filter by botanical, earthy, vanilla, and citrus categories to find the perfect aromatherapy experience."
                keywords="candles by dreamers collection, soy candles, aromatherapy, hand-poured candles, luxury candles"
                canonicalUrl="https://candlesbydreamers.com/shop"
            />
            <Navbar />
            
            {/* Infinite Marquee Droplist Ribbon */}
            <div className="w-full bg-zinc-950 text-white overflow-hidden py-4 border-b border-primary/20 relative select-none z-10">
                <style>{`
                    @keyframes marquee-shop {
                        0% { transform: translate3d(0, 0, 0); }
                        100% { transform: translate3d(-50%, 0, 0); }
                    }
                    .animate-marquee-shop {
                        display: inline-flex;
                        animation: marquee-shop 75s linear infinite;
                    }
                `}</style>
                <div className="animate-marquee-shop whitespace-nowrap flex gap-12 text-xs font-black uppercase tracking-[0.25em] text-zinc-300">
                    {Array(4).fill(null).map((_, idx) => (
                        <div key={idx} className="flex-shrink-0 flex items-center gap-12">
                            <span>THE CATALOG</span>
                            <span className="text-primary">✦</span>
                            <span className="text-zinc-500 font-semibold normal-case">Organic soy wax & wood wicks</span>
                            <span className="text-primary">✦</span>
                            <span>AROMATHERAPY WITH A PURPOSE</span>
                            <span className="text-primary">✦</span>
                            <span className="text-zinc-500 font-semibold normal-case">Handcrafted for peaceful dreaming</span>
                            <span className="text-primary">✦</span>
                            <span>FAST SHIPMENT & SECURE PAYMENTS</span>
                            <span className="text-primary">✦</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter & Search Bar Header */}
            <div className="bg-white border-b border-zinc-200 py-3 sm:py-4 px-4 sm:px-6 shadow-sm">
                <div className="container mx-auto flex flex-col lg:flex-row gap-3 sm:gap-4 items-center justify-between">
                    
                    {/* Search Bar Group */}
                    <div className="w-full lg:max-w-2xl flex items-center bg-zinc-50 border border-zinc-200 rounded-full overflow-hidden focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 focus-within:bg-white transition-all shadow-inner h-10 sm:h-12">
                        <div className="pl-2.5 sm:pl-4 flex items-center text-zinc-400">
                            <Search size={16} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="What aroma or candle name are you looking for?" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-full px-1 sm:px-4 bg-transparent text-[10px] sm:text-sm text-zinc-800 placeholder-zinc-400 placeholder:text-[8.5px] xs:placeholder:text-[10px] sm:placeholder:text-sm outline-none"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery("")}
                                className="p-1 text-zinc-400 hover:text-zinc-600 mr-1"
                            >
                                <X size={14} />
                            </button>
                        )}
                        <button 
                            className="h-full px-2.5 sm:px-6 bg-zinc-950 hover:bg-primary text-white font-bold text-[9px] sm:text-xs uppercase tracking-widest transition-colors flex-shrink-0"
                            onClick={() => {}}
                        >
                            Search
                        </button>
                    </div>

                    {/* Sorting & Filter Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
                        <button 
                            onClick={() => setShowSidebar(true)}
                            className="flex-1 md:hidden h-10 flex items-center justify-center gap-1.5 border border-zinc-200 bg-white rounded-full text-[10px] sm:text-xs uppercase tracking-wider font-bold text-zinc-700 hover:border-zinc-400 transition-colors shadow-sm whitespace-nowrap px-3"
                        >
                            <Filter size={12} /> Filter
                        </button>
                        
                        {/* Custom Dropdown */}
                        <div className="relative w-full md:w-60" ref={sortRef}>
                            <button
                                onClick={() => setIsSortOpen(!isSortOpen)}
                                className="w-full h-10 px-3 sm:px-4 bg-white border border-zinc-200 rounded-full text-[10px] sm:text-xs uppercase tracking-wider font-black text-zinc-800 hover:border-zinc-300 transition-colors flex items-center justify-between shadow-sm whitespace-nowrap"
                            >
                                <span className="flex items-center gap-1.5 sm:gap-2 truncate">
                                    <ArrowUpDown size={11} className="text-zinc-400 flex-shrink-0" />
                                    <span className="truncate">{sortLabels[sortOrder]}</span>
                                </span>
                                <ChevronDown size={12} className={`text-zinc-500 transition-transform flex-shrink-0 ml-1 ${isSortOpen ? "rotate-180" : ""}`} />
                            </button>
                            
                            <AnimatePresence>
                                {isSortOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-full bg-white border border-zinc-150 rounded-2xl shadow-xl z-30 py-1 overflow-hidden"
                                    >
                                        {(Object.keys(sortLabels) as Array<keyof typeof sortLabels>).map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => {
                                                    setSortOrder(option);
                                                    setIsSortOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-[10px] sm:text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-between ${sortOrder === option ? "bg-amber-50 text-primary" : "text-zinc-700 hover:bg-zinc-50"}`}
                                            >
                                                {sortLabels[option]}
                                                {sortOrder === option && <Check size={12} className="text-primary" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </div>

            {/* Active Filters row */}
            {(selectedCategories.length > 0 || searchQuery || appliedMinPrice !== null || appliedMaxPrice !== null) && (
                <div className="bg-white border-b border-zinc-150 py-3 px-6">
                    <div className="container mx-auto flex flex-wrap gap-2 items-center text-xs">
                        <span className="text-zinc-500 font-bold uppercase tracking-wider mr-2">Active filters:</span>
                        
                        {searchQuery && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 font-medium">
                                Search: {searchQuery}
                                <X size={12} className="cursor-pointer text-zinc-400 hover:text-zinc-600" onClick={() => setSearchQuery("")} />
                            </span>
                        )}

                        {selectedCategories.map(cat => (
                            <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-primary font-medium">
                                Category: {cat}
                                <X size={12} className="cursor-pointer text-primary hover:text-amber-700" onClick={() => toggleCategory(cat)} />
                            </span>
                        ))}

                        {(appliedMinPrice !== null || appliedMaxPrice !== null) && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 font-medium">
                                Price: {appliedMinPrice !== null ? `₹${appliedMinPrice}` : "₹0"} - {appliedMaxPrice !== null ? `₹${appliedMaxPrice}` : "∞"}
                                <X size={12} className="cursor-pointer text-zinc-400 hover:text-zinc-650" onClick={() => {
                                    setMinPriceInput("");
                                    setMaxPriceInput("");
                                    setAppliedMinPrice(null);
                                    setAppliedMaxPrice(null);
                                }} />
                            </span>
                        )}

                        <button 
                            onClick={clearAllFilters}
                            className="text-[10px] uppercase font-bold text-primary hover:text-amber-700 tracking-widest pl-2"
                        >
                            Reset All
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 container mx-auto px-4 md:px-6 py-8 flex gap-8 items-start relative">
                
                {/* Desktop Sidebar Filter Panel */}
                <aside className="w-56 flex-shrink-0 bg-white border border-zinc-200/80 rounded-2xl p-4 hidden md:block sticky top-[80px] shadow-sm space-y-6">
                    
                    {/* Filter Category Block: Category */}
                    <div className="border-b border-zinc-100 pb-5">
                        <button
                            onClick={() => toggleAccordion("category")}
                            className="w-full flex items-center justify-between text-xs font-black uppercase tracking-[0.2em] text-zinc-800 hover:text-primary transition-colors"
                        >
                            <span>Categories</span>
                            {accordions.category ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        
                        <AnimatePresence initial={false}>
                            {accordions.category && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-4 space-y-3"
                                >
                                    {categories.map(category => {
                                        const isChecked = selectedCategories.includes(category.name);
                                        const count = categoryCounts[category.name] || 0;
                                        return (
                                            <div 
                                                key={category.id} 
                                                onClick={() => toggleCategory(category.name)} 
                                                className="flex items-center justify-between cursor-pointer group text-xs text-zinc-600 hover:text-zinc-900"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-all ${isChecked ? "bg-primary border-primary text-white" : "border-zinc-300 bg-white group-hover:border-primary"}`}>
                                                        {isChecked && <Check size={10} strokeWidth={3} />}
                                                    </div>
                                                    <span className="font-semibold uppercase tracking-wider">
                                                        {category.name}
                                                    </span>
                                                </div>
                                                <span className="font-mono text-[10px] text-zinc-400 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded">
                                                    {count}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Filter Category Block: Price */}
                    <div>
                        <button
                            onClick={() => toggleAccordion("price")}
                            className="w-full flex items-center justify-between text-xs font-black uppercase tracking-[0.2em] text-zinc-800 hover:text-primary transition-colors"
                        >
                            <span>Price</span>
                            {accordions.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        
                        <AnimatePresence initial={false}>
                            {accordions.price && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-4 space-y-4"
                                >
                                    {/* Quick Ranges */}
                                    <div className="space-y-3 text-[11px] text-zinc-650">
                                        {[
                                            { label: "Under ₹500", min: null, max: 500 },
                                            { label: "₹500 to ₹1000", min: 500, max: 1000 },
                                            { label: "₹1000 & Above", min: 1000, max: null }
                                        ].map((range, index) => {
                                            const isActive = appliedMinPrice === range.min && appliedMaxPrice === range.max;
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => applyQuickPrice(range.min, range.max)}
                                                    className={`w-full flex items-center justify-between text-left group transition-colors uppercase tracking-wider font-semibold ${isActive ? "text-primary font-bold" : "text-zinc-650 hover:text-zinc-950"}`}
                                                >
                                                    <span>{range.label}</span>
                                                    {isActive && <Check size={12} className="text-primary" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </aside>

                {/* Products Grid Column */}
                <main className="flex-1 min-w-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                            <span className="uppercase tracking-widest text-xs font-bold text-zinc-500">Loading Catalog...</span>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="bg-white border border-zinc-200 rounded-2xl py-20 text-center px-6">
                            <Package className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                            <h2 className="text-xl font-black uppercase tracking-tight text-zinc-800 mb-2">No candles found</h2>
                            <p className="text-zinc-550 text-xs uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                                We could not find any candles matching your filters.
                            </p>
                            <button 
                                onClick={clearAllFilters}
                                className="mt-8 px-6 py-3 bg-zinc-950 text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-primary transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-xs font-black uppercase tracking-widest text-zinc-400">
                                Showing {filteredProducts.length} Results
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {filteredProducts.map(product => (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4 }}
                                        className="group bg-white border border-zinc-200/60 rounded-2xl overflow-hidden p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Image container */}
                                            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-zinc-50 relative mb-4">
                                                {product.imageUrls?.[0] ? (
                                                    <img 
                                                        src={product.imageUrls[0]} 
                                                        alt={product.name} 
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300">
                                                        <Package className="w-10 h-10 mb-1" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                                                    </div>
                                                )}
                                                
                                                {/* View Product CTA on hover */}
                                                <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                                                    <Link 
                                                        to={`/product/${product.id}`}
                                                        className="py-3 px-6 bg-white text-zinc-900 text-center font-black uppercase tracking-widest text-xs rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-white"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="px-1 space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[9px] text-primary font-bold uppercase tracking-[0.25em]">
                                                        {product.category}
                                                    </span>
                                                </div>
                                                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-tight text-zinc-900 line-clamp-2 group-hover:text-primary transition-colors min-h-[2rem] sm:min-h-[2.5rem]">
                                                    {product.name}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="px-1 pt-3 mt-4 border-t border-zinc-100 flex items-center justify-between">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="font-bold text-sm text-zinc-900">
                                                    ₹{product.discountPrice || product.price}
                                                </span>
                                                {product.discountPrice && (
                                                    <span className="text-[11px] text-zinc-400 line-through font-medium">
                                                        ₹{product.price}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-primary transition-colors">
                                                Buy &rarr;
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Mobile Sidebar Filter Drawer */}
            <AnimatePresence>
                {showSidebar && (
                    <>
                        {/* Overlay backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSidebar(false)}
                            className="fixed inset-0 bg-black/60 z-[90] md:hidden"
                        />
                        
                        {/* Drawer body */}
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                            className="fixed right-0 top-0 h-[100dvh] w-80 bg-white z-[100] shadow-2xl md:hidden flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-zinc-100 flex items-center justify-between flex-shrink-0">
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">Filters</h2>
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Refine aromas</p>
                                </div>
                                <button 
                                    onClick={() => setShowSidebar(false)} 
                                    className="w-8 h-8 flex items-center justify-center bg-zinc-100 text-zinc-500 rounded-full hover:bg-zinc-200 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Scrollable middle container */}
                            <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-8">
                                {/* Mobile Category Filter */}
                                <div className="border-b border-zinc-100 pb-5">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-800 mb-4">
                                        Categories
                                    </h3>
                                    <div className="space-y-3">
                                        {categories.map(category => {
                                            const isChecked = selectedCategories.includes(category.name);
                                            const count = categoryCounts[category.name] || 0;
                                            return (
                                                <div 
                                                    key={category.id} 
                                                    onClick={() => toggleCategory(category.name)} 
                                                    className="flex items-center justify-between cursor-pointer group text-xs text-zinc-600"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 border rounded flex items-center justify-center transition-all ${isChecked ? "bg-primary border-primary text-white" : "border-zinc-300 bg-white"}`}>
                                                            {isChecked && <Check size={10} strokeWidth={3} />}
                                                        </div>
                                                        <span className="font-semibold uppercase tracking-wider">
                                                            {category.name}
                                                        </span>
                                                    </div>
                                                    <span className="font-mono text-[10px] text-zinc-400 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded">
                                                        {count}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Mobile Price Filter */}
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-800 mb-4">
                                        Price
                                    </h3>
                                    <div className="space-y-4">
                                        {/* Quick Ranges */}
                                        <div className="space-y-3 text-[11px] text-zinc-650">
                                            {[
                                                { label: "Under ₹500", min: null, max: 500 },
                                                { label: "₹500 to ₹1000", min: 500, max: 1000 },
                                                { label: "₹1000 & Above", min: 1000, max: null }
                                            ].map((range, index) => {
                                                const isActive = appliedMinPrice === range.min && appliedMaxPrice === range.max;
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            applyQuickPrice(range.min, range.max);
                                                            setShowSidebar(false);
                                                        }}
                                                        className={`w-full flex items-center justify-between text-left group transition-colors uppercase tracking-wider font-semibold ${isActive ? "text-primary font-bold" : "text-zinc-650 hover:text-zinc-950"}`}
                                                    >
                                                        <span>{range.label}</span>
                                                        {isActive && <Check size={12} className="text-primary" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <FooterSection />
        </div>
    );
};

export default Shop;
