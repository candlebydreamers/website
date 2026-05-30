import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection";
import { useCart } from "../context/CartContext";
import { supabase } from "@/lib/supabaseClient";
import banner1 from "@/assets/banner1.png";

type AuthMode = "login" | "signup";

const Auth = () => {
    const navigate = useNavigate();
    const { refreshCart } = useCart();
    const [mode, setMode] = useState<AuthMode>("login");
    const [isLoading, setIsLoading] = useState(false);
    
    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const sanitizedEmail = email.trim().toLowerCase();

        try {
            if (mode === "signup") {
                const { data, error } = await supabase.auth.signUp({
                    email: sanitizedEmail,
                    password,
                    options: {
                        data: {
                            full_name: fullName
                        }
                    }
                });
                
                if (error) {
                    toast.error(error.message || "Failed to create account");
                } else if (data.user) {
                    await refreshCart();
                    toast.success("Account created successfully! Welcome to Dreamers.");
                    navigate("/");
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: sanitizedEmail,
                    password
                });

                if (error) {
                    toast.error(error.message || "Invalid credentials");
                } else if (data.session) {
                    await refreshCart();
                    toast.success("Login successful! Welcome back.");
                    navigate("/");
                }
            }
        } catch (error) {
            console.error("Auth error:", error);
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/30 flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center pt-10 pb-12 px-6 relative overflow-hidden bg-zinc-50">
                {/* Background Image Overlay with Low Opacity */}
                <div 
                    className="absolute inset-0 z-0 pointer-events-none opacity-[0.1] bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${banner1})` }}
                />
                <div className="w-full max-w-md relative z-10">
                    {/* Background Decorative Frame */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-background to-primary/20 rounded-2xl blur opacity-50"></div>
                    
                    <div className="relative bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-zinc-900">DREAMERS</h2>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-2">
                                {mode === "login" && "Access Your Account"}
                                {mode === "signup" && "Join The Dreamers"}
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.form 
                                key={mode}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                {mode === "signup" && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                                                <User size={16} />
                                            </div>
                                            <input 
                                                type="text" 
                                                required
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-zinc-800"
                                                placeholder="Rahul Sharma"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                                            <Mail size={16} />
                                        </div>
                                        <input 
                                            type="email" 
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-zinc-800"
                                            placeholder="rahul@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                                            <Lock size={16} />
                                        </div>
                                        <input 
                                            type="password" 
                                            required
                                            minLength={6}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-zinc-800"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full mt-6 bg-primary hover:bg-amber-600 text-white font-bold tracking-[0.2em] uppercase py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-md shadow-primary/10"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            {mode === "login" && "Sign In"}
                                            {mode === "signup" && "Create Account"}
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        </AnimatePresence>

                        <div className="mt-8 pt-6 border-t border-zinc-150 text-center">
                            {mode === "login" && (
                                <p className="text-xs text-zinc-400 uppercase tracking-widest">
                                    Don't have an account?{" "}
                                    <button onClick={() => setMode("signup")} className="text-primary font-bold hover:text-amber-700 transition-colors ml-1">
                                        Sign Up
                                    </button>
                                </p>
                            )}
                            {mode === "signup" && (
                                <p className="text-xs text-zinc-400 uppercase tracking-widest">
                                    Already have an account?{" "}
                                    <button onClick={() => setMode("login")} className="text-primary font-bold hover:text-amber-700 transition-colors ml-1">
                                        Sign In
                                    </button>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <FooterSection />
        </div>
    );
};

export default Auth;
