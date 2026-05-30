import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { CartProvider } from "./context/CartContext";

// Pages
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import MyOrders from "./pages/MyOrders";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ShippingReturns from "./pages/ShippingReturns";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";

// Auth Guards
import ProtectedRoute from "./components/auth/ProtectedRoute";
import UserProtectedRoute from "./components/auth/UserProtectedRoute";

// Helper to scroll to top on page navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<AboutUs />} />
          
          {/* Policy & Info Routes */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/shipping-returns" element={<ShippingReturns />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* Admin Login */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Protected Customer Routes */}
          <Route element={<UserProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
            <Route path="/my-orders" element={<MyOrders />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin-panel" element={<AdminPanel />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-center" richColors closeButton />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
