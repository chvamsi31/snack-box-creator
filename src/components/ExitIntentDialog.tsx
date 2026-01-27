import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useNudge } from "@/contexts/NudgeContext";
import { Product } from "@/types/product";
import { ShoppingCart, Clock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExitIntentDialogProps {
  product?: Product; // Optional - for product detail pages
  pageType?: "product" | "cart"; // To customize messaging
}

const ExitIntentDialog = ({ product, pageType = "product" }: ExitIntentDialogProps) => {
  const [open, setOpen] = useState(false);
  const hasTriggeredRef = useRef(false);
  const { addToCart, items } = useCart();
  const { activeNudge, setActiveNudge } = useNudge();
  const navigate = useNavigate();

  const hasItemsInCart = items.length > 0;
  
  // Get a product to display - either passed prop or first cart item
  const displayProduct = product || items[0];

  useEffect(() => {
    const triggerNudge = () => {
      if (!hasTriggeredRef.current && activeNudge === null) {
        hasTriggeredRef.current = true;
        setOpen(true);
        setActiveNudge("exit");
      }
    };

    // Mouse leave detection - trigger when mouse exits from top
    const handleMouseLeave = (e: MouseEvent) => {
      if (hasTriggeredRef.current || activeNudge !== null) return;
      
      // Trigger when mouse leaves through the top (toward browser controls)
      // Using a small threshold to make it more reliable
      if (e.clientY <= 10) {
        console.log("Exit intent triggered - mouse left top");
        triggerNudge();
      }
    };

    // Back button press detection
    const handlePopState = (e: PopStateEvent) => {
      if (!hasTriggeredRef.current && activeNudge === null) {
        console.log("Exit intent triggered - back button");
        e.preventDefault();
        triggerNudge();
        // Push state back to prevent actual navigation
        window.history.pushState(null, "", window.location.href);
      }
    };

    // Beforeunload as backup (shows browser's native dialog, but we log it)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasItemsInCart && !hasTriggeredRef.current) {
        // This will show browser's native confirmation
        e.preventDefault();
        e.returnValue = "";
      }
    };

    // Push initial state for back button detection
    window.history.pushState(null, "", window.location.href);

    // Use document for mouseleave to catch exits from viewport
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    console.log("ExitIntentDialog mounted and listening");

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [activeNudge, setActiveNudge, hasItemsInCart]);

  const handleClose = () => {
    setOpen(false);
    setActiveNudge(null);
    // Allow trigger again after closing (user might try to exit again)
    setTimeout(() => {
      hasTriggeredRef.current = false;
    }, 5000); // Reset after 5 seconds
  };

  const handleAddToCart = () => {
    if (displayProduct) {
      addToCart(displayProduct, 1);
    }
    handleClose();
  };

  const handleCheckout = () => {
    handleClose();
    navigate("/cart");
  };

  // Get a contextual message based on page type and product
  const getMessage = () => {
    if (pageType === "cart") {
      return "Your cart is almost ready — want to checkout with 1-click?";
    }

    if (!displayProduct) {
      return "Wait! Before you leave, check out our amazing deals.";
    }

    const productName = displayProduct.name?.toLowerCase() || "";
    const brandName = displayProduct.brand || "";

    if (productName.includes("lay's") || brandName === "Lay's") {
      return `Wait! Before you leave, your favourite Lay's is on a limited-time offer.`;
    } else if (productName.includes("doritos") || brandName === "Doritos") {
      return `Hold on! These Doritos are flying off the shelves — grab yours now!`;
    } else if (productName.includes("cheetos") || brandName === "Cheetos") {
      return `Don't leave yet! Chester's got a special deal on Cheetos just for you.`;
    } else if (productName.includes("spicy") || productName.includes("hot")) {
      return `Wait! This spicy favourite is on a limited-time offer.`;
    } else {
      return `Wait! Before you leave, this ${brandName} favourite is on a limited-time offer.`;
    }
  };

  const getTitle = () => {
    if (pageType === "cart") {
      return "Complete Your Order!";
    }
    return "Don't Go Yet!";
  };

  // Don't render if no product to show
  if (!displayProduct && pageType !== "cart") {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-5 w-5 text-primary" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-base">
            {getMessage()}
          </DialogDescription>
        </DialogHeader>

        {displayProduct && (
          <div className="mt-4 flex items-center gap-4 rounded-lg border border-border bg-muted/50 p-4">
            <img
              src={displayProduct.image}
              alt={displayProduct.name}
              className="h-20 w-20 rounded-md object-cover"
            />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{displayProduct.brand}</p>
              <p className="font-semibold">{displayProduct.name}</p>
              <p className="text-lg font-bold text-primary">
                ${displayProduct.price?.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {pageType === "cart" || hasItemsInCart ? (
            <Button size="lg" onClick={handleCheckout} className="gap-2">
              <ShoppingCart className="h-5 w-5" />
              {pageType === "cart" ? "Complete Checkout" : "Go to Cart"}
            </Button>
          ) : (
            displayProduct && (
              <Button size="lg" onClick={handleAddToCart} className="gap-2">
                <ShoppingCart className="h-5 w-5" />
                Add to Cart & Stay
              </Button>
            )
          )}
          <Button variant="ghost" onClick={handleClose} className="gap-2">
            <X className="h-4 w-4" />
            No thanks, I'll leave
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentDialog;
