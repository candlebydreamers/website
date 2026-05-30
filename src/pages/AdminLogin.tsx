import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Check credentials against .env variables
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

        if (email === adminEmail && password === adminPassword) {
            localStorage.setItem("isAdminAuthenticated", "true");
            toast.success("Successfully logged in as admin!");
            navigate("/admin-panel");
        } else {
            toast.error("Invalid admin credentials");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50/80 text-foreground p-4">
            <Card className="w-full max-w-md shadow-lg border-primary/10">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <Lock className="text-primary w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Admin Portal</CardTitle>
                    <CardDescription>Enter your secure credentials to manage the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none flex items-center gap-2">
                                <Mail size={14} className="text-muted-foreground" /> Admin Email
                            </label>
                            <Input 
                                type="email" 
                                placeholder="name@example.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none flex items-center gap-2">
                                <Lock size={14} className="text-muted-foreground" /> Password
                            </label>
                            <Input 
                                type="password" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                                className="h-11"
                            />
                        </div>
                        <Button type="submit" className="w-full h-11 text-base font-medium shadow-sm active:scale-[0.98] transition-all">
                            Access Panel
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <a href="/" className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline">
                            Return to Homepage
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLogin;
