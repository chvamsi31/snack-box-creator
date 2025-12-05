import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { mockProducts } from "@/lib/mockData";
import { ShoppingBag } from "lucide-react";

const IDLE_TIMEOUT = 10000; // 10 seconds
const DISCOUNT_PERCENTAGE = 10;

const IdleNudgeDialog = () => {
  const [open, setOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const { addToCart } = useCart();
  
  // Get random products for recommendations
  const [recommendedProducts] = useState<Product[]>(() => {
    const inStockProducts = mockProducts.filter(p => p.inStock);
    const shuffled = [...inStockProducts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });

  const resetIdleTimer = useCallback(() => {
    if (hasShown) return;
  }, [hasShown]);

  useEffect(() => {
    if (hasShown) return;

    let idleTimer: NodeJS.Timeout;

    const startIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setOpen(true);
        setHasShown(true);
      }, IDLE_TIMEOUT);
    };

    const handleActivity = () => {
      startIdleTimer();
    };

    // Listen to user activity events
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Start the initial timer
    startIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [hasShown]);

  const handleAddAllWithDiscount = () => {
    const comboId = `idle-combo-${Date.now()}`;
    recommendedProducts.forEach((product) => {
      const discountedPrice = product.price * (1 - DISCOUNT_PERCENTAGE / 100);
      addToCart(
        { ...product, price: discountedPrice },
        1,
        { originalPrice: product.price, discountPercentage: DISCOUNT_PERCENTAGE, comboId }
      );
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Still browsing?
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Here are quick picks based on your earlier flavours. Get flat {DISCOUNT_PERCENTAGE}% off when you add all!
          </p>
        </DialogHeader>
        
        <div className="flex justify-end mb-4">
          <Button size="sm" onClick={() => setOpen(false)}>
            Continue browsing
          </Button>
        </div>

        <div className="space-y-3">
          {recommendedProducts.map((product) => (
            <div 
              key={product.id} 
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{product.name}</h4>
                <p className="text-primary font-bold mt-1">${product.price.toFixed(2)}</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  addToCart(product);
                  setOpen(false);
                }}
                disabled={!product.inStock}
                className="shrink-0"
              >
                <ShoppingBag className="h-4 w-4 mr-1" />
                Add to cart
              </Button>
            </div>
          ))}
        </div>
        
        <Button 
          onClick={handleAddAllWithDiscount}
          size="sm"
          className="w-full mt-4"
        >
          <ShoppingBag className="h-4 w-4 mr-1" />
          Add all above to get flat {DISCOUNT_PERCENTAGE}% off
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default IdleNudgeDialog;
