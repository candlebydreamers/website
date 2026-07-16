import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
    LayoutDashboard, 
    PlusCircle, 
    LogOut, 
    Package, 
    Users, 
    TrendingUp,
    Store,
    Tag,
    Menu,
    Edit,
    Trash2,
    Plus,
    X,
    Upload,
    Eye,
    EyeOff,
    FileText,
    MessageSquare,
    CheckCircle2,
    Ruler,
    Star,
    Settings,
    Truck,
    IndianRupee,
    Save,
    Loader2,
    Image
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

interface Category {
    id: string;
    name: string;
    description?: string;
}

interface Size {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    price250g?: number;
    discountPrice250g?: number;
    category: string;
    imageUrls: string[];
    sizes: string[];
    stock: number;
    isVisible: boolean;
    createdAt: string;
    scentProfile?: string;
    burnTime?: string;
    jarCategories?: string[];
}

interface JarCategory {
    id: string;
    name: string;
}

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    createdAt: string;
}

interface CustomerUser {
    id: string;
    fullName: string;
    email: string;
    createdAt: string;
}

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    image: string;
}

interface Order {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    total: number;
    status: string;
    createdAt: string;
    paymentMethod: string;
    paymentStatus: string;
    items: OrderItem[];
}

interface AdminReview {
    id: string;
    product_id: string;
    customer_name: string;
    rating: number;
    comment: string;
    created_at: string;
    products?: { name: string };
}

interface DashboardStats {
    totalEarnings: number;
    totalProducts: number;
    totalCustomers: number;
    totalCategories: number;
    totalInquiries: number;
}

const AdminPanel = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [jarCategories, setJarCategories] = useState<JarCategory[]>([]);
    const [newJarCategoryName, setNewJarCategoryName] = useState("");
    const [editingJarCategory, setEditingJarCategory] = useState<JarCategory | null>(null);
    const [availableSizes, setAvailableSizes] = useState<Size[]>([]);
    const [newSizeName, setNewSizeName] = useState("");
    const [editingSize, setEditingSize] = useState<Size | null>(null);
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [customers, setCustomers] = useState<CustomerUser[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [viewingMessage, setViewingMessage] = useState<ContactMessage | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState<DashboardStats>({
        totalEarnings: 0,
        totalProducts: 0,
        totalCustomers: 0,
        totalCategories: 0,
        totalInquiries: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [hasFetchedProfiles, setHasFetchedProfiles] = useState(false);

    // Settings State
    const [settingsShippingCharge, setSettingsShippingCharge] = useState("");
    const [settingsFreeShippingThreshold, setSettingsFreeShippingThreshold] = useState("");
    const [settingsTaxRate, setSettingsTaxRate] = useState("");
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    // Media Management State
    const [heroSlideshowImages, setHeroSlideshowImages] = useState<string[]>([]);
    const [ourPurposeImage, setOurPurposeImage] = useState("");
    const [isSavingMedia, setIsSavingMedia] = useState(false);
    const [isUploadingHero, setIsUploadingHero] = useState(false);
    const [isUploadingPurpose, setIsUploadingPurpose] = useState(false);

    // Testimonials State
    interface Testimonial {
        id: string;
        text: string;
        author: string;
        location: string;
        rating: number;
    }
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [testimonialText, setTestimonialText] = useState("");
    const [testimonialAuthor, setTestimonialAuthor] = useState("");
    const [testimonialLocation, setTestimonialLocation] = useState("");
    const [testimonialRating, setTestimonialRating] = useState(5);
    const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
    const [isSavingTestimonial, setIsSavingTestimonial] = useState(false);

    // Product Form State
    const [productName, setProductName] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [productDiscountPrice, setProductDiscountPrice] = useState("");
    const [productPrice250g, setProductPrice250g] = useState("");
    const [productDiscountPrice250g, setProductDiscountPrice250g] = useState("");
    const [productCategory, setProductCategory] = useState("");
    const [productStock, setProductStock] = useState("");
    const [productScentProfile, setProductScentProfile] = useState("");
    const [productBurnTime, setProductBurnTime] = useState("");
    const [productJarCategories, setProductJarCategories] = useState<string[]>([]);
    const [productSizes, setProductSizes] = useState<string[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [urlInput, setUrlInput] = useState("");

    useEffect(() => {
        const checkAdminAuth = () => {
            const isAuth = localStorage.getItem("isAdminAuthenticated");
            if (isAuth !== "true") {
                toast.error("Access denied. Please log in first.");
                navigate("/admin");
            }
        };
        checkAdminAuth();
    }, [navigate]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        await Promise.all([
            fetchCategories(),
            fetchJarCategories(),
            fetchSizes(),
            fetchProducts(),
            fetchMessages(),
            fetchOrders(),
            fetchCustomers(),
            fetchReviews(),
            fetchSettings(),
            fetchTestimonials()
        ]);
        setIsLoading(false);
    };

    const fetchCustomers = async () => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });
            
            if (error) {
                console.warn("Profiles table not found, falling back to orders list:", error.message);
                return;
            }
            
            if (data) {
                setCustomers(data.map((u: any) => ({
                    id: u.id,
                    fullName: u.full_name || u.email,
                    email: u.email,
                    createdAt: u.created_at
                })));
                setHasFetchedProfiles(true);
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };

    // Auto update/refresh stats whenever orders or products change
    useEffect(() => {
        calculateStats();
    }, [orders, products, categories, messages, hasFetchedProfiles, customers.length]);

    const calculateStats = () => {
        const totalEarnings = orders
            .filter(o => o.paymentStatus === "paid")
            .reduce((acc, curr) => acc + curr.total, 0);

        const seenEmails = new Set();
        orders.forEach(o => seenEmails.add(o.email));
        
        setStats({
            totalEarnings,
            totalProducts: products.length,
            totalCustomers: hasFetchedProfiles ? customers.length : seenEmails.size,
            totalCategories: categories.length,
            totalInquiries: messages.length
        });

        // Set customer users dynamically based on order histories if database profiles aren't used
        if (!hasFetchedProfiles) {
            const customerList: CustomerUser[] = [];
            const addedEmails = new Set();
            orders.forEach(o => {
                if (!addedEmails.has(o.email)) {
                    addedEmails.add(o.email);
                    customerList.push({
                        id: o.id,
                        fullName: o.fullName,
                        email: o.email,
                        createdAt: o.createdAt
                    });
                }
            });
            setCustomers(customerList);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("name", { ascending: true });
            
            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Failed to load categories");
        }
    };

    const fetchSizes = async () => {
        try {
            const { data, error } = await supabase
                .from("sizes")
                .select("*")
                .order("name", { ascending: true });
            
            if (error) throw error;
            setAvailableSizes(data || []);
        } catch (error) {
            console.error("Error fetching sizes:", error);
        }
    };

    const handleAddSize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSizeName.trim()) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("sizes")
                .insert({ name: newSizeName.trim() });

            if (error) throw error;
            toast.success("Size added successfully");
            setNewSizeName("");
            fetchSizes();
        } catch (error) {
            toast.error("Failed to add size");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateSize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSize || !editingSize.name.trim()) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("sizes")
                .update({ name: editingSize.name.trim() })
                .eq("id", editingSize.id);

            if (error) throw error;
            toast.success("Size updated");
            setEditingSize(null);
            fetchSizes();
        } catch (error) {
            toast.error("Failed to update size");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSize = async (id: string) => {
        if (!confirm("Are you sure you want to delete this size?")) return;

        try {
            const { error } = await supabase
                .from("sizes")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Size deleted");
            fetchSizes();
        } catch (error) {
            toast.error("Failed to delete size");
        }
    };

    const fetchJarCategories = async () => {
        try {
            const { data, error } = await supabase.from("jar_categories").select("*").order("name", { ascending: true });
            if (error) throw error;
            setJarCategories(data || []);
        } catch (error) {
            console.error("Error fetching jar categories:", error);
        }
    };

    const handleAddJarCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newJarCategoryName.trim()) return;
        setIsLoading(true);
        try {
            const { error } = await supabase.from("jar_categories").insert({ name: newJarCategoryName.trim() });
            if (error) throw error;
            toast.success("Jar category added");
            setNewJarCategoryName("");
            fetchJarCategories();
        } catch (error) {
            toast.error("Failed to add jar category");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateJarCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingJarCategory || !editingJarCategory.name.trim()) return;
        setIsLoading(true);
        try {
            const { error } = await supabase.from("jar_categories").update({ name: editingJarCategory.name.trim() }).eq("id", editingJarCategory.id);
            if (error) throw error;
            toast.success("Jar category updated");
            setEditingJarCategory(null);
            fetchJarCategories();
        } catch (error) {
            toast.error("Failed to update jar category");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteJarCategory = async (id: string) => {
        if (!confirm("Are you sure you want to delete this jar category?")) return;
        try {
            const { error } = await supabase.from("jar_categories").delete().eq("id", id);
            if (error) throw error;
            toast.success("Jar category deleted");
            fetchJarCategories();
        } catch (error) {
            toast.error("Failed to delete jar category");
        }
    };

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            if (data) {
                const parsed: Product[] = data.map((p: any) => {
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

                    let parsedSizes: string[] = [];
                    if (Array.isArray(p.sizes)) {
                        parsedSizes = p.sizes;
                    } else if (typeof p.sizes === "string") {
                        try {
                            parsedSizes = JSON.parse(p.sizes);
                        } catch {
                            parsedSizes = [];
                        }
                    }

                    let parsedJarCategories: string[] = [];
                    if (Array.isArray(p.jar_categories)) {
                        parsedJarCategories = p.jar_categories;
                    } else if (typeof p.jar_categories === "string") {
                        try {
                            parsedJarCategories = JSON.parse(p.jar_categories);
                        } catch {
                            parsedJarCategories = [];
                        }
                    }

                    return {
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        price: Number(p.price),
                        discountPrice: p.discount_price ? Number(p.discount_price) : undefined,
                        price250g: p.price_250g ? Number(p.price_250g) : undefined,
                        discountPrice250g: p.discount_price_250g ? Number(p.discount_price_250g) : undefined,
                        category: p.category,
                        imageUrls: urls,
                        sizes: parsedSizes,
                        stock: p.stock,
                        isVisible: p.is_visible,
                        createdAt: p.created_at,
                        scentProfile: p.scent_profile,
                        burnTime: p.burn_time,
                        jarCategories: parsedJarCategories
                    };
                });
                setProducts(parsed);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Failed to load products");
        }
    };

    const fetchMessages = async () => {
        try {
            const { data, error } = await supabase
                .from("contacts")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            if (data) {
                setMessages(data.map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    email: m.email,
                    subject: m.subject,
                    message: m.message,
                    createdAt: m.created_at
                })));
            }
        } catch (error) {
            console.error("Error fetching contact messages:", error);
        }
    };

    const fetchOrders = async () => {
        try {
            // Join query orders and order items
            const { data: ordersData, error: ordersError } = await supabase
                .from("orders")
                .select("*, order_items(*)")
                .eq("payment_status", "paid")
                .order("created_at", { ascending: false });

            if (ordersError) throw ordersError;

            // Fetch product images for mapped list
            const { data: prodData } = await supabase.from("products").select("id, image_urls");
            const productImagesMap: Record<string, string> = {};
            if (prodData) {
                prodData.forEach((p: any) => {
                    let urls = [];
                    if (Array.isArray(p.image_urls)) {
                        urls = p.image_urls;
                    } else if (typeof p.image_urls === "string") {
                        try {
                            urls = JSON.parse(p.image_urls);
                        } catch {}
                    }
                    productImagesMap[p.id] = urls[0] || "/placeholder.jpg";
                });
            }

            if (ordersData) {
                const mapped: Order[] = ordersData.map((o: any) => ({
                    id: o.id,
                    fullName: o.full_name,
                    email: o.email,
                    phone: o.phone,
                    address: `${o.address}, ${o.city}, ${o.state} ${o.zip_code}`,
                    total: Number(o.total),
                    status: o.status,
                    createdAt: o.created_at,
                    paymentMethod: o.payment_method,
                    paymentStatus: o.payment_status,
                    items: (o.order_items || []).map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        price: Number(item.price),
                        quantity: item.quantity,
                        size: item.size || "Standard",
                        image: productImagesMap[item.product_id] || "/placeholder.jpg"
                    }))
                }));
                setOrders(mapped);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const fetchReviews = async () => {
        try {
            const { data, error } = await supabase
                .from("reviews")
                .select("*, products(name)")
                .order("created_at", { ascending: false });
            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const handleDeleteReview = async (id: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;
        try {
            const { error } = await supabase.from("reviews").delete().eq("id", id);
            if (error) throw error;
            toast.success("Review deleted successfully");
            fetchReviews();
        } catch (error) {
            console.error("Error deleting review:", error);
            toast.error("Failed to delete review");
        }
    };

    const fetchTestimonials = async () => {
        try {
            const { data, error } = await supabase
                .from("testimonials")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            setTestimonials(data || []);
        } catch (error) {
            console.error("Error fetching testimonials:", error);
        }
    };

    const handleSaveTestimonial = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testimonialText.trim() || !testimonialAuthor.trim() || !testimonialLocation.trim()) {
            toast.error("Please fill in all fields");
            return;
        }
        setIsSavingTestimonial(true);
        try {
            if (editingTestimonialId) {
                const { error } = await supabase
                    .from("testimonials")
                    .update({
                        text: testimonialText.trim(),
                        author: testimonialAuthor.trim(),
                        location: testimonialLocation.trim(),
                        rating: testimonialRating
                    })
                    .eq("id", editingTestimonialId);
                if (error) throw error;
                toast.success("Testimonial updated successfully");
            } else {
                const { error } = await supabase
                    .from("testimonials")
                    .insert([{
                        text: testimonialText.trim(),
                        author: testimonialAuthor.trim(),
                        location: testimonialLocation.trim(),
                        rating: testimonialRating
                    }]);
                if (error) throw error;
                toast.success("Testimonial added successfully");
            }
            setTestimonialText("");
            setTestimonialAuthor("");
            setTestimonialLocation("");
            setTestimonialRating(5);
            setEditingTestimonialId(null);
            fetchTestimonials();
        } catch (error) {
            console.error("Error saving testimonial:", error);
            toast.error("Failed to save testimonial");
        } finally {
            setIsSavingTestimonial(false);
        }
    };

    const handleEditTestimonial = (testimonial: Testimonial) => {
        setEditingTestimonialId(testimonial.id);
        setTestimonialText(testimonial.text);
        setTestimonialAuthor(testimonial.author);
        setTestimonialLocation(testimonial.location);
        setTestimonialRating(testimonial.rating);
    };

    const handleDeleteTestimonial = async (id: string) => {
        if (!confirm("Are you sure you want to delete this testimonial?")) return;
        try {
            const { error } = await supabase.from("testimonials").delete().eq("id", id);
            if (error) throw error;
            toast.success("Testimonial deleted successfully");
            fetchTestimonials();
        } catch (error) {
            console.error("Error deleting testimonial:", error);
            toast.error("Failed to delete testimonial");
        }
    };

    const toggleSize = (size: string) => {
        setProductSizes(prev => 
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        );
    };

    const toggleJarCategory = (cat: string) => {
        setProductJarCategories(prev => 
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const handleAddImageUrl = () => {
        if (!urlInput.trim()) return;
        setImagePreviews(prev => [...prev, urlInput.trim()]);
        setUrlInput("");
        toast.success("Image URL added to list");
    };

    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        toast.info("Uploading images to Supabase storage...");
        for (const file of files) {
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `products/${fileName}`;

                const { data, error } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file);

                if (error) {
                    throw error;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath);

                setImagePreviews(prev => [...prev, publicUrl]);
                toast.success(`Uploaded ${file.name} successfully`);
            } catch (err: any) {
                console.error("Storage upload failed, fallback to local preview URL or random unsplash image:", err);
                // Fallback to random unsplash candle photo to prevent any blockage
                const fallbackUrls = [
                    "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=60",
                    "https://images.unsplash.com/photo-1602872030219-cbf948a907b8?w=600&auto=format&fit=crop&q=60",
                    "https://images.unsplash.com/photo-1596435764223-4a53e39d554a?w=600&auto=format&fit=crop&q=60"
                ];
                const selectedFallback = fallbackUrls[Math.floor(Math.random() * fallbackUrls.length)];
                setImagePreviews(prev => [...prev, selectedFallback]);
                toast.warning(`Storage bucket 'product-images' not set up. Used placeholder instead.`);
            }
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const productData = {
                name: productName,
                description: productDescription,
                price: Number(productPrice),
                discount_price: productDiscountPrice ? Number(productDiscountPrice) : null,
                price_250g: productPrice250g ? Number(productPrice250g) : null,
                discount_price_250g: productDiscountPrice250g ? Number(productDiscountPrice250g) : null,
                category: productCategory,
                stock: Number(productStock),
                sizes: productSizes,
                image_urls: imagePreviews,
                scent_profile: productScentProfile || null,
                burn_time: productBurnTime || null,
                jar_categories: productJarCategories,
                is_visible: true
            };

            let resError = null;

            if (editingProduct) {
                const { error } = await supabase
                    .from("products")
                    .update(productData)
                    .eq("id", editingProduct.id);
                resError = error;
            } else {
                const { error } = await supabase
                    .from("products")
                    .insert(productData);
                resError = error;
            }

            if (resError) throw resError;

            toast.success(editingProduct ? "Candle updated successfully" : "Candle added successfully");
            handleCancelEdit();
            fetchProducts();
            setActiveTab("listed-products");
        } catch (error: any) {
            console.error("Error saving product:", error);
            toast.error(error.message || "Failed to save product details");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setProductName(product.name);
        setProductDescription(product.description);
        setProductPrice(product.price.toString());
        setProductDiscountPrice(product.discountPrice?.toString() || "");
        setProductPrice250g(product.price250g?.toString() || "");
        setProductDiscountPrice250g(product.discountPrice250g?.toString() || "");
        setProductCategory(product.category);
        setProductStock(product.stock.toString());
        setProductScentProfile(product.scentProfile || "");
        setProductBurnTime(product.burnTime || "");
        setProductJarCategories(product.jarCategories || []);
        setProductSizes(product.sizes || []);
        setImagePreviews(product.imageUrls || []);
        setActiveTab("add-products");
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
        setProductName("");
        setProductDescription("");
        setProductPrice("");
        setProductDiscountPrice("");
        setProductPrice250g("");
        setProductDiscountPrice250g("");
        setProductCategory("");
        setProductStock("");
        setProductScentProfile("");
        setProductBurnTime("");
        setProductJarCategories([]);
        setProductSizes([]);
        setImagePreviews([]);
    };

    const handleToggleVisibility = async (product: Product) => {
        try {
            const { error } = await supabase
                .from("products")
                .update({ is_visible: !product.isVisible })
                .eq("id", product.id);

            if (error) throw error;
            toast.success("Visibility updated");
            fetchProducts();
        } catch (error) {
            toast.error("Failed to update visibility");
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this product?")) return;

        try {
            const { error } = await supabase
                .from("products")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Product deleted successfully");
            fetchProducts();
        } catch (error) {
            toast.error("Failed to delete product");
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("categories")
                .insert({ name: newCategoryName.trim() });

            if (error) throw error;
            toast.success("Category added successfully");
            setNewCategoryName("");
            fetchCategories();
        } catch (error) {
            toast.error("Failed to add category");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory || !editingCategory.name.trim()) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("categories")
                .update({ name: editingCategory.name.trim() })
                .eq("id", editingCategory.id);

            if (error) throw error;
            toast.success("Category updated");
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            toast.error("Failed to update category");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            const { error } = await supabase
                .from("categories")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Category deleted");
            fetchCategories();
        } catch (error) {
            toast.error("Failed to delete category");
        }
    };

    const handleDeleteMessage = async (id: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return;

        try {
            const { error } = await supabase
                .from("contacts")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Message deleted");
            fetchMessages();
        } catch (error) {
            toast.error("Failed to delete message");
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Permanently delete this customer account? This will remove them from authentication and they will no longer be able to log in.")) return;
        try {
            const { data, error } = await supabase.functions.invoke("delete-user", {
                body: { userId: id }
            });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            toast.success("Customer account permanently deleted");
            fetchCustomers();
        } catch (error: any) {
            console.error("Delete user error:", error);
            toast.error(error.message || "Failed to delete customer");
        }
    };

    const handleUpdateOrderStatus = async (id: string, status: string) => {
        try {
            const { error } = await supabase
                .from("orders")
                .update({ status })
                .eq("id", id);

            if (error) throw error;
            toast.success(`Order status set to ${status}`);
            fetchOrders();
        } catch (error) {
            toast.error("Failed to update order status");
        }
    };

    const handleDeleteOrder = async (id: string) => {
        if (!confirm("Permanently delete this order?")) return;
        try {
            const { error } = await supabase
                .from("orders")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Order deleted from database");
            fetchOrders();
        } catch (error) {
            toast.error("Failed to delete order");
        }
    };

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from("settings")
                .select("*");
            
            if (error) throw error;
            
            if (data) {
                const settingsMap = data.reduce((acc: any, curr: any) => {
                    acc[curr.key] = curr.value;
                    return acc;
                }, {});
                
                setSettingsShippingCharge(settingsMap.shipping_charge || "100");
                setSettingsFreeShippingThreshold(settingsMap.free_shipping_threshold || "1200");
                setSettingsTaxRate(settingsMap.tax_rate || "0.05");

                if (settingsMap.hero_slideshow_images) {
                    try {
                        const parsed = JSON.parse(settingsMap.hero_slideshow_images);
                        if (Array.isArray(parsed)) {
                            setHeroSlideshowImages(parsed);
                        }
                    } catch (e) {
                        console.error("Failed to parse hero slideshow images:", e);
                    }
                }
                if (settingsMap.our_purpose_image) {
                    setOurPurposeImage(settingsMap.our_purpose_image);
                }

                setSettingsLoaded(true);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        try {
            // Validate inputs
            const charge = parseFloat(settingsShippingCharge);
            const threshold = parseFloat(settingsFreeShippingThreshold);
            const taxRateVal = parseFloat(settingsTaxRate);

            if (isNaN(charge) || charge < 0) {
                toast.error("Please enter a valid delivery charge amount");
                setIsSavingSettings(false);
                return;
            }
            if (isNaN(threshold) || threshold < 0) {
                toast.error("Please enter a valid free delivery threshold");
                setIsSavingSettings(false);
                return;
            }
            if (isNaN(taxRateVal) || taxRateVal < 0 || taxRateVal > 1) {
                toast.error("Tax rate must be between 0 and 1 (e.g. 0.05 for 5%)");
                setIsSavingSettings(false);
                return;
            }

            // Upsert each setting
            const updates = [
                { key: "shipping_charge", value: charge.toFixed(2) },
                { key: "free_shipping_threshold", value: threshold.toFixed(2) },
                { key: "tax_rate", value: taxRateVal.toString() }
            ];

            for (const setting of updates) {
                const { error } = await supabase
                    .from("settings")
                    .update({ value: setting.value })
                    .eq("key", setting.key);
                
                if (error) throw error;
            }

            toast.success("Store settings saved successfully!");
        } catch (error: any) {
            console.error("Error saving settings:", error);
            toast.error(error.message || "Failed to save settings");
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploadingHero(true);
        toast.info("Uploading slideshow image(s)...");
        for (const file of files) {
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `hero/${fileName}`;

                const { data, error } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file);

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath);

                setHeroSlideshowImages(prev => [...prev, publicUrl]);
                toast.success(`Uploaded ${file.name} successfully`);
            } catch (err: any) {
                console.error("Upload failed:", err);
                toast.error(`Failed to upload ${file.name}`);
            }
        }
        setIsUploadingHero(false);
    };

    const handlePurposeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploadingPurpose(true);
        toast.info("Uploading purpose image...");
        const file = files[0];
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `purpose/${fileName}`;

            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            setOurPurposeImage(publicUrl);
            toast.success("Uploaded purpose image successfully");
        } catch (err: any) {
            console.error("Upload failed:", err);
            toast.error("Failed to upload purpose image");
        }
        setIsUploadingPurpose(false);
    };

    const handleSaveMedia = async () => {
        setIsSavingMedia(true);
        try {
            const updates = [
                { key: "hero_slideshow_images", value: JSON.stringify(heroSlideshowImages) },
                { key: "our_purpose_image", value: ourPurposeImage }
            ];

            for (const setting of updates) {
                const { error } = await supabase
                    .from("settings")
                    .update({ value: setting.value })
                    .eq("key", setting.key);
                
                if (error) throw error;
            }

            toast.success("Media assets saved successfully!");
        } catch (err: any) {
            console.error("Error saving media:", err);
            toast.error("Failed to save media assets");
        } finally {
            setIsSavingMedia(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("isAdminAuthenticated");
        toast.info("Logged out from admin session");
        navigate("/admin");
    };

    return (
        <div className="flex min-h-screen bg-zinc-50 text-foreground font-sans">
            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-[60] md:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-white border-r border-zinc-200 flex flex-col fixed md:sticky top-0 h-screen z-[70] transition-transform duration-300 ease-in-out
                ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                            <Store className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight uppercase">Dreamers Admin</span>
                    </div>
                    <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="md:hidden p-2 hover:bg-zinc-550 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {[
                        { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
                        { id: "categories", label: "Categories", Icon: Tag },
                        { id: "jar-categories", label: "Jar Categories", Icon: Package },
                        { id: "sizes", label: "Sizes/Weights", Icon: Ruler },
                        { id: "add-products", label: "Add Candles", Icon: PlusCircle },
                        { id: "listed-products", label: "Listed Candles", Icon: Package },
                        { id: "messages", label: "Inquiries", Icon: MessageSquare, section: "Management" },
                        { id: "reviews", label: "Testimonials", Icon: Star },
                        { id: "customers", label: "Customers", Icon: Users },
                        { id: "orders", label: "Orders", Icon: Package, section: "Storefront" },
                        { id: "settings", label: "Settings", Icon: Settings, section: "Configuration" },
                        { id: "media", label: "Media Assets", Icon: Image }
                    ].map((item) => (
                        <div key={item.id}>
                            {item.section && (
                                <div className="pt-4 pb-2 px-3 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">{item.section}</div>
                            )}
                            <button 
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"}`}
                            >
                                <item.Icon size={16} /> {item.label}
                            </button>
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-zinc-200 mt-auto">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-red-655 hover:bg-red-50 transition-all active:scale-95"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-y-auto">
                <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 flex items-center justify-between px-6 md:px-8">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 text-foreground hover:bg-zinc-100 rounded-md transition-colors"
                        >
                            <Menu size={22} />
                        </button>
                        <h2 className="font-black text-lg uppercase tracking-tight text-zinc-800">{activeTab.replace('-', ' ')}</h2>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        <span className="hidden sm:inline">Session status:</span>
                        <div className="flex items-center gap-2 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="font-black text-emerald-600">Active</span>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-6xl mx-auto">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsContent value="dashboard" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                                <Card className="shadow-sm border-zinc-200">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Total Earnings</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-emerald-550" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-black tracking-tight text-zinc-900">
                                            ₹{stats.totalEarnings.toFixed(2)}
                                        </div>
                                        <p className="text-[9px] text-zinc-400 mt-1 uppercase font-bold tracking-widest">
                                            <span className="text-emerald-600 inline-flex items-center gap-0.5">Live <span className="w-1 h-1 rounded-full bg-emerald-550 animate-ping"></span></span> • Paid Orders Only
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-sm border-zinc-200">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Products Listed</CardTitle>
                                        <Package className="h-4 w-4 text-amber-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-black tracking-tight text-zinc-900">
                                            {stats.totalProducts}
                                        </div>
                                        <p className="text-[9px] text-zinc-400 mt-1 uppercase font-bold tracking-widest">In catalog</p>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-sm border-zinc-200">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Total Customers</CardTitle>
                                        <Users className="h-4 w-4 text-indigo-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-black tracking-tight text-zinc-900">
                                            {stats.totalCustomers}
                                        </div>
                                        <p className="text-[9px] text-zinc-400 mt-1 uppercase font-bold tracking-widest">Registered Users</p>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-sm border-zinc-200">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Total Inquiries</CardTitle>
                                        <MessageSquare className="h-4 w-4 text-cyan-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-black tracking-tight text-zinc-900">
                                            {stats.totalInquiries}
                                        </div>
                                        <p className="text-[9px] text-zinc-400 mt-1 uppercase font-bold tracking-widest">Contact Messages</p>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-sm border-zinc-200">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Total Categories</CardTitle>
                                        <Tag className="h-4 w-4 text-rose-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-black tracking-tight text-zinc-900">
                                            {stats.totalCategories}
                                        </div>
                                        <p className="text-[9px] text-zinc-400 mt-1 uppercase font-bold tracking-widest">Scent Profiles</p>
                                    </CardContent>
                                </Card>
                            </div>
                            
                            <Card className="shadow-sm border-zinc-200 min-h-[300px] flex items-center justify-center border-dashed border-2">
                                <div className="text-center p-8">
                                    <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <LayoutDashboard className="text-zinc-400 w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-zinc-700 text-lg uppercase tracking-tight">Sales Analytics</h3>
                                    <p className="text-zinc-450 text-xs max-w-xs mx-auto mt-2 leading-relaxed">
                                        Fulfillment and financial insights will populate in standard layout chart once sales transaction values grow.
                                    </p>
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="listed-products" className="mt-0">
                            <Card className="shadow-sm border-zinc-200">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Currently Listed Candles</CardTitle>
                                        <CardDescription>Manage your inventory catalog, pricing, and visibility status.</CardDescription>
                                    </div>
                                    <div className="bg-zinc-100 text-zinc-800 px-3 py-1 rounded-full text-xs font-bold font-mono">
                                        Total: {products.length}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white">
                                        <table className="w-full text-sm">
                                            <thead className="bg-zinc-50 border-b border-zinc-200">
                                                <tr>
                                                    <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400">Product</th>
                                                    <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400">Category</th>
                                                    <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400">Price</th>
                                                    <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400">Visibility</th>
                                                    <th className="p-4 text-right font-mono uppercase tracking-widest text-[10px] text-zinc-400">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-150">
                                                {products.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="p-12 text-center text-zinc-400 italic">
                                                            No products listed yet. Go to "Add Candles" tab to publish.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    products.map((product) => (
                                                        <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                                                            <td className="p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 flex-shrink-0">
                                                                        {product.imageUrls?.[0] ? (
                                                                            <img src={product.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center">
                                                                                <Package className="text-zinc-300 w-5 h-5" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-zinc-800 line-clamp-1">{product.name}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className="text-[9px] font-bold px-2 py-1 bg-amber-50 text-primary border border-amber-100 rounded-full uppercase tracking-wider">
                                                                    {product.category}
                                                                </span>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="font-bold text-zinc-850">
                                                                    ₹{product.discountPrice || product.price}
                                                                </div>
                                                                {product.discountPrice && (
                                                                    <div className="text-[10px] text-zinc-400 line-through">₹{product.price}</div>
                                                                )}
                                                            </td>
                                                            <td className="p-4">
                                                                <button 
                                                                    onClick={() => handleToggleVisibility(product)}
                                                                    className={`px-3 py-1 text-[9px] uppercase font-bold tracking-widest border rounded-full transition-all ${
                                                                        product.isVisible 
                                                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                                                            : "bg-zinc-100 text-zinc-450 border-zinc-200"
                                                                    }`}
                                                                >
                                                                    {product.isVisible ? "Visible" : "Hidden"}
                                                                </button>
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <button 
                                                                        onClick={() => handleEditClick(product)}
                                                                        className="p-2 text-zinc-400 hover:text-primary hover:bg-amber-50 rounded-xl transition-all"
                                                                        title="Edit Details"
                                                                    >
                                                                        <Edit size={16} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDeleteProduct(product.id)}
                                                                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                                        title="Delete Permanently"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="messages" className="space-y-6 mt-0">
                            {/* Full Message View Modal */}
                            {viewingMessage && (
                                <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewingMessage(null)}>
                                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                                        <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-black text-lg uppercase tracking-tight text-zinc-800">Inquiry Details</h3>
                                                <p className="text-xs text-zinc-400 font-mono mt-1">
                                                    Received on {new Date(viewingMessage.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} IST
                                                </p>
                                            </div>
                                            <button onClick={() => setViewingMessage(null)} className="p-2 hover:bg-zinc-100 rounded-xl transition-all">
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <div className="p-6 space-y-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400 block mb-1">Name</label>
                                                    <p className="text-sm font-bold text-zinc-800">{viewingMessage.name}</p>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400 block mb-1">Email</label>
                                                    <p className="text-sm font-semibold text-primary">{viewingMessage.email}</p>
                                                </div>
                                            </div>
                                            {viewingMessage.subject && (
                                                <div>
                                                    <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400 block mb-1">Subject</label>
                                                    <p className="text-sm font-semibold text-zinc-700">{viewingMessage.subject}</p>
                                                </div>
                                            )}
                                            <div>
                                                <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400 block mb-2">Full Message</label>
                                                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                                                    {viewingMessage.message}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 border-t border-zinc-200 flex justify-end">
                                            <Button variant="outline" className="rounded-xl" onClick={() => setViewingMessage(null)}>Close</Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <Card className="shadow-sm border-zinc-200">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Contact Inquiries</CardTitle>
                                        <CardDescription>Review messages submitted by visitors using the Contact Us form.</CardDescription>
                                    </div>
                                    <div className="bg-zinc-100 text-zinc-800 px-3 py-1 rounded-full text-xs font-bold font-mono">
                                        Total: {messages.length}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white">
                                        <table className="w-full text-sm">
                                            <thead className="bg-zinc-50 border-b border-zinc-200">
                                                <tr>
                                                    <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400 whitespace-nowrap">Date</th>
                                                    <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400 whitespace-nowrap">Contact</th>
                                                    <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400 w-1/2">Message</th>
                                                    <th className="p-4 text-right font-mono uppercase tracking-widest text-[10px] text-zinc-400">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-150 relative">
                                                {messages.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="p-12 text-center text-zinc-400">
                                                            <MessageSquare className="w-8 h-8 opacity-20 mx-auto mb-2 text-zinc-400" />
                                                            No customer messages found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    messages.map((msg) => (
                                                        <tr key={msg.id} className="hover:bg-zinc-50/50 transition-colors">
                                                            <td className="p-4 align-top">
                                                                <span className="text-xs text-zinc-400 font-semibold font-mono">
                                                                    {new Date(msg.createdAt).toLocaleDateString('en-IN')}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 align-top">
                                                                <div className="flex flex-col font-mono text-xs gap-1">
                                                                    <span className="font-bold text-zinc-800 text-sm tracking-tight">{msg.name}</span>
                                                                    <span className="text-primary truncate max-w-[150px]">{msg.email}</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 align-top">
                                                                <div className="text-xs text-zinc-500 bg-zinc-50 p-4 rounded-xl border border-zinc-200 max-h-32 overflow-y-auto leading-relaxed font-semibold">
                                                                    {msg.message}
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-right align-top">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <button
                                                                        onClick={() => setViewingMessage(msg)}
                                                                        className="p-2 text-zinc-400 hover:text-primary hover:bg-amber-50 rounded-xl transition-all"
                                                                        title="View Full Inquiry"
                                                                    >
                                                                        <Eye size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                                        title="Delete Message"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="reviews" className="space-y-6 mt-0">
                            {/* Create / Edit Form Card */}
                            <Card className="shadow-sm border-zinc-200">
                                <CardHeader>
                                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                        <Star className="w-5 h-5 text-primary fill-primary" /> {editingTestimonialId ? "Edit Testimonial" : "Add New Testimonial"}
                                    </CardTitle>
                                    <CardDescription className="text-xs font-semibold text-zinc-400 tracking-wide">
                                        Create or update testimonials displayed on the storefront home page.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSaveTestimonial} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Author Name</label>
                                                <Input 
                                                    value={testimonialAuthor}
                                                    onChange={(e) => setTestimonialAuthor(e.target.value)}
                                                    placeholder="e.g. Priya S."
                                                    className="h-10 text-xs font-bold border-zinc-200 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Location</label>
                                                <Input 
                                                    value={testimonialLocation}
                                                    onChange={(e) => setTestimonialLocation(e.target.value)}
                                                    placeholder="e.g. Mumbai, Maharashtra"
                                                    className="h-10 text-xs font-bold border-zinc-200 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Rating (Stars)</label>
                                                <select 
                                                    value={testimonialRating}
                                                    onChange={(e) => setTestimonialRating(Number(e.target.value))}
                                                    className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 focus:outline-none focus:border-primary"
                                                >
                                                    <option value={5}>5 Stars</option>
                                                    <option value={4}>4 Stars</option>
                                                    <option value={3}>3 Stars</option>
                                                    <option value={2}>2 Stars</option>
                                                    <option value={1}>1 Star</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Testimonial Text</label>
                                            <Textarea 
                                                value={testimonialText}
                                                onChange={(e) => setTestimonialText(e.target.value)}
                                                placeholder="Write the customer's quote here..."
                                                className="min-h-[80px] text-xs font-bold border-zinc-200 rounded-xl resize-none"
                                            />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Button 
                                                type="submit" 
                                                disabled={isSavingTestimonial}
                                                className="bg-primary hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[10px] px-6 py-4 rounded-xl shadow-sm transition-all"
                                            >
                                                {isSavingTestimonial ? (
                                                    <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Saving...</>
                                                ) : (
                                                    <>{editingTestimonialId ? "Update Testimonial" : "Add Testimonial"}</>
                                                )}
                                            </Button>
                                            {editingTestimonialId && (
                                                <Button 
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setEditingTestimonialId(null);
                                                        setTestimonialText("");
                                                        setTestimonialAuthor("");
                                                        setTestimonialLocation("");
                                                        setTestimonialRating(5);
                                                    }}
                                                    className="border-zinc-200 text-zinc-650 hover:bg-zinc-50 font-black uppercase tracking-widest text-[10px] px-6 py-4 rounded-xl"
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Testimonials List Card */}
                            <Card className="shadow-sm border-zinc-200">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-black uppercase tracking-tight">Active Testimonials</CardTitle>
                                        <CardDescription className="text-xs font-semibold text-zinc-400 tracking-wide">
                                            These testimonials are displayed live on the storefront homepage.
                                        </CardDescription>
                                    </div>
                                    <div className="bg-zinc-100 text-zinc-800 px-3 py-1 rounded-full text-xs font-bold font-mono">
                                        Total: {testimonials.length}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {testimonials.length === 0 ? (
                                        <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-zinc-100 border-dashed">
                                            <Star className="mx-auto text-zinc-300 mb-3" size={32} />
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-2">No Testimonials Found</h4>
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                                                Add testimonials using the form above to see them here.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {testimonials.map((testimonial) => (
                                                <div key={testimonial.id} className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900">{testimonial.author}</h4>
                                                                <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold mt-1">{testimonial.location}</p>
                                                            </div>
                                                            <div className="flex items-center gap-0.5 shrink-0">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star 
                                                                        key={star} 
                                                                        size={10} 
                                                                        className={star <= testimonial.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-100 text-zinc-200"} 
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-zinc-600 mb-4 leading-relaxed italic">
                                                            "{testimonial.text}"
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-auto">
                                                        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                                                            Added on {new Date(testimonial.created_at || "").toLocaleDateString()}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={() => handleEditTestimonial(testimonial)}
                                                                className="h-7 px-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-650 hover:bg-zinc-50 rounded-lg"
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={() => handleDeleteTestimonial(testimonial.id)}
                                                                className="h-7 px-2.5 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="customers" className="space-y-6 mt-0">
                            <Card className="shadow-sm border-zinc-200">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Registered Customers</CardTitle>
                                        <CardDescription>All accounts that have signed up on the platform via email and password.</CardDescription>
                                    </div>
                                    <div className="bg-zinc-100 text-zinc-800 px-3 py-1 rounded-full text-xs font-bold font-mono">
                                        Total: {customers.length}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white">
                                        <table className="w-full text-sm">
                                            <thead className="bg-zinc-50 border-b border-zinc-200">
                                                <tr>
                                                    <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400 whitespace-nowrap">Joined</th>
                                                    <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400 whitespace-nowrap">Name</th>
                                                    <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400">Email Address</th>
                                                    <th className="p-4 text-right font-mono uppercase tracking-widest text-[10px] text-zinc-400">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-150 relative">
                                                {customers.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="p-12 text-center text-zinc-400">
                                                            <Users className="w-8 h-8 opacity-20 mx-auto mb-2 text-zinc-400" />
                                                            No customer accounts found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    customers.map((user) => (
                                                        <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                                                            <td className="p-4 align-middle">
                                                                <span className="text-xs text-zinc-400 font-semibold font-mono">
                                                                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 align-middle font-bold text-zinc-800">
                                                                {user.fullName}
                                                            </td>
                                                            <td className="p-4 align-middle text-zinc-500 font-mono text-xs">
                                                                {user.email}
                                                            </td>
                                                            <td className="p-4 text-right align-middle">
                                                                <button
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                                    title="Delete Customer"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="categories" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Add/Edit Category Form */}
                                <Card className="shadow-sm border-zinc-200 h-fit">
                                    <CardHeader>
                                        <CardTitle>{editingCategory ? "Edit Category" : "Add New Category"}</CardTitle>
                                        <CardDescription>
                                            {editingCategory ? "Update the name of an existing scent family." : "Create a new product fragrance family."}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400">Fragrance Group Name</label>
                                                <Input 
                                                    value={editingCategory ? editingCategory.name : newCategoryName}
                                                    onChange={(e) => editingCategory 
                                                        ? setEditingCategory({...editingCategory, name: e.target.value}) 
                                                        : setNewCategoryName(e.target.value)
                                                    }
                                                    placeholder="e.g. Lavender & Oak" 
                                                    required 
                                                    className="rounded-xl border border-zinc-200 bg-white"
                                                />
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button type="submit" disabled={isLoading} className="flex-1 bg-primary text-white rounded-xl hover:bg-amber-600 shadow-md">
                                                    {isLoading ? "Saving..." : (editingCategory ? "Update" : "Add Category")}
                                                </Button>
                                                {editingCategory && (
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        onClick={() => setEditingCategory(null)}
                                                        className="rounded-xl border-zinc-200 hover:bg-zinc-50"
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>

                                {/* Categories List */}
                                <Card className="lg:col-span-2 shadow-sm border-zinc-200">
                                    <CardHeader>
                                        <CardTitle>Fragrance Families</CardTitle>
                                        <CardDescription>Manage the scent categories available for classification.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white">
                                            <table className="w-full text-sm">
                                                <thead className="bg-zinc-50 border-b border-zinc-200">
                                                    <tr>
                                                        <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400">Fragrance Name</th>
                                                        <th className="p-4 text-right font-mono uppercase tracking-widest text-[10px] text-zinc-400">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-150">
                                                    {categories.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={2} className="p-8 text-center text-zinc-400 italic">
                                                                No categories found. Add your first scent profile grouping.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        categories.map((category) => (
                                                            <tr key={category.id} className="hover:bg-zinc-50/50 transition-colors">
                                                                <td className="p-4 font-bold text-zinc-800">{category.name}</td>
                                                                <td className="p-4 text-right space-x-2">
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        className="h-8 w-8 p-0 text-zinc-400 hover:text-primary rounded-xl"
                                                                        onClick={() => setEditingCategory(category)}
                                                                    >
                                                                        <Edit size={14} />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        className="h-8 w-8 p-0 text-zinc-400 hover:text-red-500 rounded-xl"
                                                                        onClick={() => handleDeleteCategory(category.id)}
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="sizes" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Add/Edit Size Form */}
                                <Card className="shadow-sm border-zinc-200 h-fit">
                                    <CardHeader>
                                        <CardTitle>{editingSize ? "Edit Size" : "Add New Size"}</CardTitle>
                                        <CardDescription>
                                            {editingSize ? "Update this size/weight option." : "Create a new size or weight variant for candles."}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={editingSize ? handleUpdateSize : handleAddSize} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400">Size / Weight Label</label>
                                                <Input 
                                                    value={editingSize ? editingSize.name : newSizeName}
                                                    onChange={(e) => editingSize 
                                                        ? setEditingSize({...editingSize, name: e.target.value}) 
                                                        : setNewSizeName(e.target.value)
                                                    }
                                                    placeholder="e.g. 200g, 8 oz, Travel Tin" 
                                                    required 
                                                    className="rounded-xl border border-zinc-200 bg-white"
                                                />
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button type="submit" disabled={isLoading} className="flex-1 bg-primary text-white rounded-xl hover:bg-amber-600 shadow-md">
                                                    {isLoading ? "Saving..." : (editingSize ? "Update" : "Add Size")}
                                                </Button>
                                                {editingSize && (
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        onClick={() => setEditingSize(null)}
                                                        className="rounded-xl border-zinc-200 hover:bg-zinc-50"
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>

                                {/* Sizes List */}
                                <Card className="lg:col-span-2 shadow-sm border-zinc-200">
                                    <CardHeader>
                                        <CardTitle>Size & Weight Options</CardTitle>
                                        <CardDescription>Manage the size/weight variants available when listing candles.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white">
                                            <table className="w-full text-sm">
                                                <thead className="bg-zinc-50 border-b border-zinc-200">
                                                    <tr>
                                                        <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400">Size Label</th>
                                                        <th className="p-4 text-right font-mono uppercase tracking-widest text-[10px] text-zinc-400">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-150">
                                                    {availableSizes.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={2} className="p-8 text-center text-zinc-400 italic">
                                                                No sizes found. Add your first size/weight option.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        availableSizes.map((size) => (
                                                            <tr key={size.id} className="hover:bg-zinc-50/50 transition-colors">
                                                                <td className="p-4 font-bold text-zinc-800">{size.name}</td>
                                                                <td className="p-4 text-right space-x-2">
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        className="h-8 w-8 p-0 text-zinc-400 hover:text-primary rounded-xl"
                                                                        onClick={() => setEditingSize(size)}
                                                                    >
                                                                        <Edit size={14} />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        className="h-8 w-8 p-0 text-zinc-400 hover:text-red-500 rounded-xl"
                                                                        onClick={() => handleDeleteSize(size.id)}
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="jar-categories" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <Card className="shadow-sm border-zinc-200 h-fit">
                                    <CardHeader>
                                        <CardTitle>{editingJarCategory ? "Edit Jar Category" : "Add New Jar Category"}</CardTitle>
                                        <CardDescription>
                                            {editingJarCategory ? "Update this jar category name." : "Create a new jar container option."}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={editingJarCategory ? handleUpdateJarCategory : handleAddJarCategory} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400">Jar Type / Material</label>
                                                <Input 
                                                    value={editingJarCategory ? editingJarCategory.name : newJarCategoryName}
                                                    onChange={(e) => editingJarCategory 
                                                        ? setEditingJarCategory({...editingJarCategory, name: e.target.value}) 
                                                        : setNewJarCategoryName(e.target.value)
                                                    }
                                                    placeholder="e.g. Glass Jar, Tin, Ceramic" 
                                                    required 
                                                    className="rounded-xl border border-zinc-200 bg-white"
                                                />
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button type="submit" disabled={isLoading} className="flex-1 bg-primary text-white rounded-xl hover:bg-amber-600 shadow-md">
                                                    {isLoading ? "Saving..." : (editingJarCategory ? "Update" : "Add Jar Type")}
                                                </Button>
                                                {editingJarCategory && (
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        onClick={() => setEditingJarCategory(null)}
                                                        className="rounded-xl border-zinc-200 hover:bg-zinc-50"
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>

                                <Card className="lg:col-span-2 shadow-sm border-zinc-200">
                                    <CardHeader>
                                        <CardTitle>Jar Types</CardTitle>
                                        <CardDescription>Manage the jar categories available when listing candles.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white">
                                            <table className="w-full text-sm">
                                                <thead className="bg-zinc-50 border-b border-zinc-200">
                                                    <tr>
                                                        <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400">Jar Category Name</th>
                                                        <th className="p-4 text-right font-mono uppercase tracking-widest text-[10px] text-zinc-400">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-150">
                                                    {jarCategories.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={2} className="p-8 text-center text-zinc-400 italic">
                                                                No jar categories found. Add your first jar type.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        jarCategories.map((cat) => (
                                                            <tr key={cat.id} className="hover:bg-zinc-50/50 transition-colors">
                                                                <td className="p-4 font-bold text-zinc-800">{cat.name}</td>
                                                                <td className="p-4 text-right space-x-2">
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        className="h-8 w-8 p-0 text-zinc-400 hover:text-primary rounded-xl"
                                                                        onClick={() => setEditingJarCategory(cat)}
                                                                    >
                                                                        <Edit size={14} />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        className="h-8 w-8 p-0 text-zinc-400 hover:text-red-500 rounded-xl"
                                                                        onClick={() => handleDeleteJarCategory(cat.id)}
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="add-products" className="mt-0">
                            <Card className="shadow-sm border-zinc-200 max-w-4xl">
                                <CardHeader>
                                    <CardTitle>{editingProduct ? `Edit Candle: ${editingProduct.name}` : "Publish New Scented Candle"}</CardTitle>
                                    <CardDescription>Fill in specifications below to list your hand-poured aroma.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form className="space-y-8" onSubmit={handleAddProduct}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            {/* Basic Info */}
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400">Candle Name / Title</label>
                                                    <Input 
                                                        value={productName}
                                                        onChange={(e) => setProductName(e.target.value)}
                                                        placeholder="e.g. Vanilla Dreamscape" 
                                                        required 
                                                        className="rounded-xl border border-zinc-200 bg-white"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400">100g Base Price (₹)</label>
                                                        <Input 
                                                            type="number" 
                                                            min="0"
                                                            step="0.01" 
                                                            value={productPrice}
                                                            onChange={(e) => setProductPrice(e.target.value)}
                                                            placeholder="e.g. 500" 
                                                            required 
                                                            className="rounded-xl border border-zinc-200 bg-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400">100g Discount Price (₹)</label>
                                                        <Input 
                                                            type="number" 
                                                            min="0"
                                                            step="0.01" 
                                                            value={productDiscountPrice}
                                                            onChange={(e) => setProductDiscountPrice(e.target.value)}
                                                            placeholder="e.g. 400" 
                                                            className="rounded-xl border border-zinc-200 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400">250g Base Price (₹)</label>
                                                        <Input 
                                                            type="number" 
                                                            min="0"
                                                            step="0.01" 
                                                            value={productPrice250g}
                                                            onChange={(e) => setProductPrice250g(e.target.value)}
                                                            placeholder="e.g. 900" 
                                                            className="rounded-xl border border-zinc-200 bg-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400">250g Discount Price (₹)</label>
                                                        <Input 
                                                            type="number" 
                                                            min="0"
                                                            step="0.01" 
                                                            value={productDiscountPrice250g}
                                                            onChange={(e) => setProductDiscountPrice250g(e.target.value)}
                                                            placeholder="e.g. 750" 
                                                            className="rounded-xl border border-zinc-200 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400">Category Fragrance</label>
                                                        <select 
                                                            value={productCategory}
                                                            onChange={(e) => setProductCategory(e.target.value)}
                                                            required
                                                            className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary transition-all text-zinc-800 font-semibold"
                                                        >
                                                            <option value="">Select Fragrance</option>
                                                            {Array.isArray(categories) && categories.map(cat => (
                                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400 block">Available Jar Categories</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {Array.isArray(jarCategories) && jarCategories.map(cat => (
                                                                <button
                                                                    key={cat.id}
                                                                    type="button"
                                                                    onClick={() => toggleJarCategory(cat.name)}
                                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border transition-all ${
                                                                        productJarCategories.includes(cat.name)
                                                                            ? "bg-primary text-white border-primary shadow-sm scale-105"
                                                                            : "bg-white text-zinc-500 border-zinc-200 hover:border-primary/50"
                                                                    }`}
                                                                >
                                                                    {cat.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400">Scent Profile</label>
                                                        <Input 
                                                            value={productScentProfile}
                                                            onChange={(e) => setProductScentProfile(e.target.value)}
                                                            placeholder="e.g. Sage, Honey & Lavender" 
                                                            className="rounded-xl border border-zinc-200 bg-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400">Average Burn Time</label>
                                                        <Input 
                                                            value={productBurnTime}
                                                            onChange={(e) => setProductBurnTime(e.target.value)}
                                                            placeholder="e.g. 45 hours" 
                                                            className="rounded-xl border border-zinc-200 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400 block">Available Sizes/Weights</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {availableSizes.map(size => (
                                                            <button
                                                                key={size.id}
                                                                type="button"
                                                                onClick={() => toggleSize(size.name)}
                                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border transition-all ${
                                                                    productSizes.includes(size.name)
                                                                        ? "bg-primary text-white border-primary shadow-sm scale-105"
                                                                        : "bg-white text-zinc-500 border-zinc-200 hover:border-primary/50"
                                                                }`}
                                                            >
                                                                {size.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400">Product Description</label>
                                                    <Textarea 
                                                        value={productDescription}
                                                        onChange={(e) => setProductDescription(e.target.value)}
                                                        placeholder="Describe the aromatic note details..." 
                                                        className="min-h-[120px] rounded-xl border border-zinc-200 bg-white" 
                                                        required 
                                                    />
                                                </div>
                                            </div>

                                            {/* Image Urls list */}
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400 block">Media Gallery</label>
                                                
                                                {/* Upload form files */}
                                                <div className="flex items-center gap-3 bg-zinc-50 p-4 border border-zinc-200 rounded-2xl">
                                                    <Upload className="text-primary w-6 h-6 shrink-0" />
                                                    <div className="flex-1">
                                                        <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-700">Upload Files</span>
                                                        <span className="block text-[9px] text-zinc-450 mt-0.5">Select image files from local system</span>
                                                    </div>
                                                    <label className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer">
                                                        Select
                                                        <input 
                                                            type="file" 
                                                            multiple 
                                                            className="hidden" 
                                                            onChange={handleFileUpload}
                                                            accept="image/*"
                                                        />
                                                    </label>
                                                </div>

                                                {/* Paste url */}
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Or Paste Image URL</label>
                                                    <div className="flex gap-2">
                                                        <Input 
                                                            value={urlInput}
                                                            onChange={(e) => setUrlInput(e.target.value)}
                                                            placeholder="https://images.unsplash.com/..." 
                                                            className="rounded-xl border border-zinc-200 bg-white"
                                                        />
                                                        <Button type="button" onClick={handleAddImageUrl} className="bg-zinc-900 text-white rounded-xl hover:bg-zinc-800">
                                                            <Plus size={16} />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Previews grid */}
                                                <div className="grid grid-cols-3 gap-3">
                                                    {imagePreviews.map((preview, index) => (
                                                        <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100">
                                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                                            <button 
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute top-1.5 right-1.5 bg-black/75 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end gap-3">
                                            {editingProduct && (
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    onClick={handleCancelEdit} 
                                                    className="h-12 px-6 rounded-xl border-zinc-200 hover:bg-zinc-100 font-bold uppercase text-xs tracking-widest"
                                                >
                                                    Cancel Edit
                                                </Button>
                                            )}
                                            <Button type="submit" disabled={isLoading} className="h-12 px-12 bg-primary text-white rounded-xl hover:bg-amber-600 shadow-md font-bold uppercase text-xs tracking-widest">
                                                {isLoading ? "Saving..." : (editingProduct ? "Update Candle" : "Publish Candle")}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="orders" className="space-y-6 mt-0">
                            <Card className="shadow-sm border-zinc-200">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Customer Orders</CardTitle>
                                        <CardDescription>Track and manage your sales and fulfillment status.</CardDescription>
                                    </div>
                                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-mono font-bold">
                                        Active: {orders.length}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white">
                                        <table className="w-full text-sm">
                                            <thead className="bg-zinc-50 border-b border-zinc-200">
                                                <tr>
                                                    <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400 whitespace-nowrap">Order Info</th>
                                                    <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400">Customer</th>
                                                    <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400">Amount</th>
                                                    <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400">Payment</th>
                                                    <th className="p-4 text-left font-mono uppercase tracking-widest text-[10px] text-zinc-400">Status</th>
                                                    <th className="p-4 text-right font-mono uppercase tracking-widest text-[10px] text-zinc-400">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-150 relative">
                                                {orders.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="p-12 text-center text-zinc-400">
                                                            <Package className="w-12 h-12 opacity-10 mx-auto mb-2 text-zinc-400" />
                                                            No orders placed yet.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    orders.map((order) => (
                                                        <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                                                            <td className="p-4 align-top">
                                                                <div className="font-mono text-[10px] text-zinc-400 mb-1 uppercase">#{order.id.split('-')[0]}</div>
                                                                <div className="text-xs font-bold text-zinc-800">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                            </td>
                                                            <td className="p-4 align-top">
                                                                <div className="font-bold text-sm tracking-tight text-zinc-800">{order.fullName}</div>
                                                                <div className="text-[10px] text-zinc-400 font-mono flex flex-col mt-1 space-y-0.5">
                                                                    <span>{order.email}</span>
                                                                    <span>{order.phone}</span>
                                                                    <span className="truncate max-w-[200px] italic text-zinc-450">{order.address}</span>
                                                                </div>
                                                                {/* Order Items Summary */}
                                                                <div className="mt-3 grid grid-cols-1 gap-2">
                                                                    {order.items?.map((item, idx) => (
                                                                        <div key={idx} className="flex items-center gap-3 p-1.5 bg-zinc-50 rounded-xl border border-zinc-200">
                                                                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-200 bg-white">
                                                                                <img 
                                                                                    src={item.image} 
                                                                                    alt={item.name} 
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            </div>
                                                                            <div className="flex flex-col min-w-0">
                                                                                <span className="text-[10px] font-bold text-zinc-800 truncate max-w-[150px]">
                                                                                    {item.name}
                                                                                </span>
                                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                                    <span className="text-[9px] font-mono text-zinc-400 bg-white border border-zinc-200 px-1 rounded uppercase">SIZE: {item.size}</span>
                                                                                    <span className="text-[9px] font-mono font-bold text-primary">QTY: {item.quantity}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td className="p-4 align-top font-bold text-zinc-800">
                                                                ₹{order.total.toFixed(2)}
                                                            </td>
                                                            <td className="p-4 align-top">
                                                                <div className="flex flex-col gap-1.5">
                                                                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-amber-50 text-primary border-amber-200 w-fit text-center">
                                                                        Razorpay
                                                                    </span>
                                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border w-fit text-center ${
                                                                        order.paymentStatus === 'paid' 
                                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                                                            : order.paymentStatus === 'failed'
                                                                                ? 'bg-red-50 text-red-600 border-red-200'
                                                                                : 'bg-amber-50 text-amber-600 border-amber-200'
                                                                    }`}>
                                                                        {order.paymentStatus === 'paid' ? '● Paid' : order.paymentStatus === 'failed' ? '● Failed' : '● Pending'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 align-top">
                                                                <select 
                                                                    value={order.status}
                                                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 rounded-xl border transition-all outline-none bg-white ${
                                                                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                                                                        order.status === 'cancelled' ? 'bg-red-50 text-red-655 border-red-200' :
                                                                        'bg-blue-50 text-blue-600 border-blue-200'
                                                                    }`}
                                                                >
                                                                    <option value="pending">Pending</option>
                                                                    <option value="processing">Processing</option>
                                                                    <option value="packed">Packed</option>
                                                                    <option value="shipped">Shipped</option>
                                                                    <option value="delivered">Delivered</option>
                                                                    <option value="cancelled">Cancelled</option>
                                                                </select>
                                                            </td>
                                                            <td className="p-4 text-right align-top">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="text-red-500 hover:text-red-650 hover:bg-red-50 rounded-xl h-8 w-8"
                                                                    onClick={() => handleDeleteOrder(order.id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ===== SETTINGS TAB ===== */}
                        <TabsContent value="settings" className="space-y-6 mt-0">
                            <Card className="shadow-sm border-zinc-200">
                                <CardHeader>
                                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-primary" /> Delivery & Pricing Settings
                                    </CardTitle>
                                    <CardDescription className="text-xs font-semibold text-zinc-400 tracking-wide">
                                        Configure delivery charges, free delivery threshold, and tax rate. These values are applied in real-time to the checkout page.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {!settingsLoaded ? (
                                        <div className="flex items-center justify-center py-12 text-zinc-400">
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Loading settings...</span>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Free Delivery Threshold */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                                        <IndianRupee className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">Free Delivery Threshold</h3>
                                                        <p className="text-[10px] text-zinc-400 font-semibold">Orders above this amount get free delivery</p>
                                                    </div>
                                                </div>
                                                <div className="relative max-w-sm">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={settingsFreeShippingThreshold}
                                                        onChange={(e) => setSettingsFreeShippingThreshold(e.target.value)}
                                                        placeholder="1200"
                                                        className="pl-8 h-12 text-sm font-bold border-zinc-200 focus:border-primary rounded-xl"
                                                    />
                                                </div>
                                                <p className="text-[10px] font-bold text-zinc-400 tracking-wide">
                                                    Currently: Orders ≥ ₹{parseFloat(settingsFreeShippingThreshold || "0").toLocaleString("en-IN")} qualify for free delivery
                                                </p>
                                            </div>

                                            <div className="border-t border-zinc-100" />

                                            {/* Delivery Charge */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
                                                        <Truck className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">Delivery Charge</h3>
                                                        <p className="text-[10px] text-zinc-400 font-semibold">Flat fee charged on orders below the free delivery threshold</p>
                                                    </div>
                                                </div>
                                                <div className="relative max-w-sm">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={settingsShippingCharge}
                                                        onChange={(e) => setSettingsShippingCharge(e.target.value)}
                                                        placeholder="100"
                                                        className="pl-8 h-12 text-sm font-bold border-zinc-200 focus:border-primary rounded-xl"
                                                    />
                                                </div>
                                                <p className="text-[10px] font-bold text-zinc-400 tracking-wide">
                                                    Currently: ₹{parseFloat(settingsShippingCharge || "0").toLocaleString("en-IN")} delivery fee on orders below ₹{parseFloat(settingsFreeShippingThreshold || "0").toLocaleString("en-IN")}
                                                </p>
                                            </div>

                                            <div className="border-t border-zinc-100" />

                                            {/* Tax Rate */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                                                        <FileText className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">GST / Tax Rate</h3>
                                                        <p className="text-[10px] text-zinc-400 font-semibold">Tax percentage applied to all orders (enter as decimal, e.g. 0.05 = 5%)</p>
                                                    </div>
                                                </div>
                                                <div className="relative max-w-sm">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="1"
                                                        step="0.01"
                                                        value={settingsTaxRate}
                                                        onChange={(e) => setSettingsTaxRate(e.target.value)}
                                                        placeholder="0.05"
                                                        className="h-12 text-sm font-bold border-zinc-200 focus:border-primary rounded-xl"
                                                    />
                                                </div>
                                                <p className="text-[10px] font-bold text-zinc-400 tracking-wide">
                                                    Currently: {(parseFloat(settingsTaxRate || "0") * 100).toFixed(1)}% GST applied on all orders
                                                </p>
                                            </div>

                                            <div className="border-t border-zinc-100" />

                                            {/* Summary Preview */}
                                            <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-5 space-y-3">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Preview — How This Looks at Checkout</h4>
                                                <div className="space-y-2 text-xs font-semibold text-zinc-600">
                                                    <div className="flex justify-between">
                                                        <span>Subtotal (example)</span>
                                                        <span>₹1,000.00</span>
                                                    </div>
                                                    <div className="flex justify-between text-zinc-500 font-medium">
                                                        <span>GST Included ({(parseFloat(settingsTaxRate || "0") * 100).toFixed(0)}%)</span>
                                                        <span>₹{(1000 - (1000 / (1 + parseFloat(settingsTaxRate || "0")))).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Delivery</span>
                                                        <span>{1000 >= parseFloat(settingsFreeShippingThreshold || "0") ? <span className="text-emerald-600 font-black">FREE</span> : `₹${parseFloat(settingsShippingCharge || "0").toFixed(2)}`}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm font-black text-zinc-900 pt-2 border-t border-zinc-200">
                                                        <span>Total</span>
                                                        <span className="text-primary">
                                                            ₹{(1000 + (1000 >= parseFloat(settingsFreeShippingThreshold || "0") ? 0 : parseFloat(settingsShippingCharge || "0"))).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Save Button */}
                                            <Button
                                                onClick={handleSaveSettings}
                                                disabled={isSavingSettings}
                                                className="bg-primary hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[11px] px-8 py-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                                            >
                                                {isSavingSettings ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                                                ) : (
                                                    <><Save className="w-4 h-4 mr-2" /> Save Settings</>
                                                )}
                                            </Button>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ===== MEDIA TAB ===== */}
                        <TabsContent value="media" className="space-y-6 mt-0">
                            <Card className="shadow-sm border-zinc-200">
                                <CardHeader>
                                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                        <Image className="w-5 h-5 text-primary" /> Media Assets Management
                                    </CardTitle>
                                    <CardDescription className="text-xs font-semibold text-zinc-400 tracking-wide">
                                        Upload and customize the hero banners slideshow and the brand purpose/about us page illustration.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {/* Hero Slideshow Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-wide text-zinc-800">Hero Slideshow Banners</h3>
                                        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Recommended Aspect Ratio: 1920 x 820. Multi-upload supported.</p>
                                        
                                        {/* Current Banners Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {heroSlideshowImages.map((imgUrl, idx) => (
                                                <div key={idx} className="relative aspect-[1920/820] rounded-xl overflow-hidden border border-zinc-200 group bg-zinc-950">
                                                    <img src={imgUrl} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button 
                                                            onClick={() => setHeroSlideshowImages(prev => prev.filter((_, i) => i !== idx))}
                                                            className="p-2 bg-red-600 hover:bg-red-750 text-white rounded-full transition-all hover:scale-110"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-[8px] font-black text-white px-2 py-0.5 rounded-full">
                                                        Slide {idx + 1}
                                                    </span>
                                                </div>
                                            ))}
                                            
                                            {/* Empty State */}
                                            {heroSlideshowImages.length === 0 && (
                                                <div className="sm:col-span-3 border border-dashed border-zinc-200 rounded-xl p-8 text-center text-zinc-400">
                                                    <Image className="mx-auto w-8 h-8 mb-2 stroke-1" />
                                                    <p className="text-xs font-semibold">No custom banners uploaded. Showing default system banners.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Upload Button */}
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-sm transition-all active:scale-[0.98]">
                                                {isUploadingHero ? (
                                                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                                                ) : (
                                                    <><Upload size={14} /> Upload Banner(s)</>
                                                )}
                                                <input 
                                                    type="file" 
                                                    multiple 
                                                    accept="image/*" 
                                                    onChange={handleHeroUpload} 
                                                    disabled={isUploadingHero} 
                                                    className="hidden" 
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="border-t border-zinc-150" />

                                    {/* Purpose / About Us Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-wide text-zinc-800">Our Purpose & About Us Image</h3>
                                        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Recommended Aspect Ratio: 1:1 Square. Updating this changes it on both the Home (Purpose) and About pages.</p>
                                        
                                        {/* Current Purpose Image Preview */}
                                        <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-zinc-200 group bg-zinc-50">
                                            {ourPurposeImage ? (
                                                <>
                                                    <img src={ourPurposeImage} alt="Purpose / About Us" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button 
                                                            onClick={() => setOurPurposeImage("")}
                                                            className="p-2 bg-red-600 hover:bg-red-750 text-white rounded-full transition-all hover:scale-110"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 text-center p-4">
                                                    <Image size={24} className="stroke-1 mb-1 text-zinc-300" />
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Default Poster Image Active</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Upload Button */}
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-sm transition-all active:scale-[0.98]">
                                                {isUploadingPurpose ? (
                                                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                                                ) : (
                                                    <><Upload size={14} /> Upload Image</>
                                                )}
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={handlePurposeUpload} 
                                                    disabled={isUploadingPurpose} 
                                                    className="hidden" 
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="border-t border-zinc-150" />

                                    {/* Save Button */}
                                    <Button
                                        onClick={handleSaveMedia}
                                        disabled={isSavingMedia || isUploadingHero || isUploadingPurpose}
                                        className="bg-primary hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[11px] px-8 py-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                                    >
                                        {isSavingMedia ? (
                                            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving Assets...</>
                                        ) : (
                                            <><Save className="w-4 h-4 mr-2" /> Save Media Assets</>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                    </Tabs>
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;
