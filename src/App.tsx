import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NudgeProvider, useNudge } from "@/contexts/NudgeContext";
import Navbar from "@/components/Navbar";
import IdleNudgeDialog from "@/components/IdleNudgeDialog";
import BundleUpsellDialog from "@/components/BundleUpsellDialog";
import ReplenishmentNudgeDialog from "@/components/ReplenishmentNudgeDialog";
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
  const { replenishmentItems, hasPendingReplenishment, clearPendingReplenishment } = useAuth();
  const { activeNudge, setActiveNudge } = useNudge();
  const [showReplenishment, setShowReplenishment] = useState(false);

  // Handle replenishment nudge display logic
  useEffect(() => {
    if (hasPendingReplenishment && activeNudge === null && !showReplenishment) {
      // Pending replenishment and no other nudge is active - show it!
      setShowReplenishment(true);
      setActiveNudge("replenishment");
    } else if (hasPendingReplenishment && activeNudge !== null && activeNudge !== "replenishment") {
      // Another nudge is active - clear the pending flag to avoid showing later
      clearPendingReplenishment();
    }
  }, [hasPendingReplenishment, activeNudge, showReplenishment, clearPendingReplenishment, setActiveNudge]);

  const handleReplenishmentClose = (isOpen: boolean) => {
    setShowReplenishment(isOpen);
    if (!isOpen) {
      clearPendingReplenishment();
      setActiveNudge(null);
    }
  };

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
      <ReplenishmentNudgeDialog
        open={showReplenishment}
        onOpenChange={handleReplenishmentClose}
        replenishmentItems={replenishmentItems}
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
