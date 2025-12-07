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

    // Mouse leave detection - only trigger when mouse leaves viewport at top edge
    // This detects intent to click browser close button (top-right) or back button (top-left)
    const handleMouseLeave = (e: MouseEvent) => {
      if (hasTriggeredRef.current || activeNudge !== null) return;
      
      // Only trigger if mouse left through the top of the viewport
      if (e.clientY <= 0) {
        triggerNudge();
      }
    };

    // Back button press detection
    const handlePopState = () => {
      if (!hasTriggeredRef.current && activeNudge === null) {
        triggerNudge();
        // Push state back to prevent actual navigation
        window.history.pushState(null, "", window.location.href);
      }
    };

    // Push initial state for back button detection
    window.history.pushState(null, "", window.location.href);

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("popstate", handlePopState);
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
