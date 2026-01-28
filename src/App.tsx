import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NudgeProvider } from "@/contexts/NudgeContext";
import Navbar from "@/components/Navbar";
import IdleNudgeDialog from "@/components/IdleNudgeDialog";
import BundleUpsellDialog from "@/components/BundleUpsellDialog";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Brands from "./pages/Brands";
import BuildBox from "./pages/BuildBox";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { showBundleUpsell, setShowBundleUpsell, lastAddedProduct } = useCart();

  return (
    <>
      <Toaster />
      <Sonner />
      <IdleNudgeDialog />
      <BundleUpsellDialog
        addedProduct={lastAddedProduct}
        open={showBundleUpsell}
        onOpenChange={setShowBundleUpsell}
      />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/build-box" element={<BuildBox />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <NudgeProvider>
            <AppContent />
          </NudgeProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
