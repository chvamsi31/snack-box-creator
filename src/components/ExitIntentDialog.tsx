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
  product: Product;
}

const ExitIntentDialog = ({ product }: ExitIntentDialogProps) => {
  const [open, setOpen] = useState(false);
  const hasTriggeredRef = useRef(false);
  const { addToCart, items } = useCart();
  const { activeNudge, setActiveNudge } = useNudge();
  const navigate = useNavigate();

  const hasItemsInCart = items.length > 0;

  useEffect(() => {
    const triggerNudge = () => {
      if (!hasTriggeredRef.current && activeNudge === null) {
        hasTriggeredRef.current = true;
        setOpen(true);
        setActiveNudge("exit");
      }
    };

    // Mouse movement detection - trigger when mouse enters exit zones
    const handleMouseMove = (e: MouseEvent) => {
      if (hasTriggeredRef.current || activeNudge !== null) return;

      const exitZoneHeight = 50; // pixels from top edge
      const backButtonZoneWidth = 150; // pixels from left edge (back button area)
      const closeButtonZoneWidth = 150; // pixels from right edge (close button area)

      // Check if mouse is in top edge zone
      if (e.clientY <= exitZoneHeight) {
        // Back button area (top-left)
        if (e.clientX <= backButtonZoneWidth) {
          triggerNudge();
          return;
        }
        // Close button area (top-right)
        if (e.clientX >= window.innerWidth - closeButtonZoneWidth) {
          triggerNudge();
          return;
        }
      }
    };

    // Mouse leave detection (exit intent leaving viewport at top)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !hasTriggeredRef.current && activeNudge === null) {
        triggerNudge();
      }
    };

    // Back button / popstate detection
    const handlePopState = () => {
      if (!hasTriggeredRef.current && activeNudge === null) {
        triggerNudge();
        // Push state back to prevent actual navigation
        window.history.pushState(null, "", window.location.href);
      }
    };

    // Tab visibility change (switching tabs quickly)
    const handleVisibilityChange = () => {
      if (document.hidden && !hasTriggeredRef.current && activeNudge === null) {
        triggerNudge();
      }
    };

    // Push initial state for back button detection
    window.history.pushState(null, "", window.location.href);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeNudge, setActiveNudge]);

  const handleClose = () => {
    setOpen(false);
    setActiveNudge(null);
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
    handleClose();
  };

  const handleCheckout = () => {
    handleClose();
    navigate("/cart");
  };

  // Get a contextual message based on the product
  const getProductMessage = () => {
    const productName = product.name.toLowerCase();
    const brandName = product.brand;

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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-5 w-5 text-primary" />
            Don't Go Yet!
          </DialogTitle>
          <DialogDescription className="text-base">
            {hasItemsInCart
              ? "Your cart is almost ready — want to checkout with 1-click?"
              : getProductMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex items-center gap-4 rounded-lg border border-border bg-muted/50 p-4">
          <img
            src={product.image}
            alt={product.name}
            className="h-20 w-20 rounded-md object-cover"
          />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{product.brand}</p>
            <p className="font-semibold">{product.name}</p>
            <p className="text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {hasItemsInCart ? (
            <Button size="lg" onClick={handleCheckout} className="gap-2">
              <ShoppingCart className="h-5 w-5" />
              Checkout Now
            </Button>
          ) : (
            <Button size="lg" onClick={handleAddToCart} className="gap-2">
              <ShoppingCart className="h-5 w-5" />
              Add to Cart & Stay
            </Button>
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
