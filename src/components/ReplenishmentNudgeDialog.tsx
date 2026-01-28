import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Bell, Clock, AlertCircle } from "lucide-react";
import { ReplenishmentItem, markMultipleReplenishmentNudgesSeen } from "@/lib/replenishmentLogic";

interface ReplenishmentNudgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  replenishmentItems: ReplenishmentItem[];
}

const ReplenishmentNudgeDialog = ({
  open,
  onOpenChange,
  replenishmentItems,
}: ReplenishmentNudgeDialogProps) => {
  const { addToCart } = useCart();
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());

  const handleClose = () => {
    // Mark all shown products as seen
    const productIds = replenishmentItems.map(item => item.product.id);
    markMultipleReplenishmentNudgesSeen(productIds);
    
    setAddedProducts(new Set());
    onOpenChange(false);
  };

  const handleReorder = (item: ReplenishmentItem) => {
    addToCart(item.product, 1);
    setAddedProducts(prev => new Set(prev).add(item.product.id));
  };

  const handleAddAll = () => {
    replenishmentItems.forEach(item => {
      if (!addedProducts.has(item.product.id)) {
        addToCart(item.product, 1);
      }
    });
    handleClose();
  };

  const handleRemindLater = () => {
    handleClose();
  };

  // Get urgency icon and color
  const getUrgencyDisplay = (urgency: ReplenishmentItem["urgency"]) => {
    switch (urgency) {
      case "high":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          badge: "destructive" as const,
        };
      case "medium":
        return {
          icon: <Clock className="h-4 w-4" />,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50 dark:bg-yellow-950",
          badge: "secondary" as const,
        };
      case "low":
        return {
          icon: <Bell className="h-4 w-4" />,
          color: "text-primary",
          bgColor: "bg-primary/10",
          badge: "outline" as const,
        };
    }
  };

  if (replenishmentItems.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bell className="h-5 w-5 text-primary" />
            Time to Restock!
          </DialogTitle>
          <DialogDescription className="text-base">
            Your favorite snacks are running low
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {replenishmentItems.map((item) => {
            const urgencyDisplay = getUrgencyDisplay(item.urgency);
            const isAdded = addedProducts.has(item.product.id);

            return (
              <div
                key={item.product.id}
                className={`rounded-lg border p-4 transition-all ${
                  isAdded
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50 hover:bg-accent/50"
                }`}
              >
                <div className="flex gap-3">
                  {/* Product Image */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-md object-cover shrink-0"
                  />

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-1">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {item.product.brand}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-primary shrink-0">
                        ${item.product.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Status Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Last ordered: {item.daysSinceLastPurchase} days ago</span>
                      </div>

                      {item.purchaseFrequency && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Bell className="h-3 w-3" />
                          <span>You usually reorder every {item.purchaseFrequency} days</span>
                        </div>
                      )}

                      {/* Urgency Badge */}
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={urgencyDisplay.badge}
                          className={`text-xs ${urgencyDisplay.color}`}
                        >
                          <span className="mr-1">{urgencyDisplay.icon}</span>
                          {item.message}
                        </Badge>
                      </div>
                    </div>

                    {/* Reorder Button */}
                    <div className="mt-3">
                      {isAdded ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="w-full"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Added to Cart
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleReorder(item)}
                          className="w-full"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Reorder Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-4 border-t">
          {replenishmentItems.length > 1 && addedProducts.size < replenishmentItems.length && (
            <Button
              size="lg"
              onClick={handleAddAll}
              className="w-full"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add All to Cart
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={handleRemindLater}
            className="w-full"
          >
            Remind Me Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReplenishmentNudgeDialog;
