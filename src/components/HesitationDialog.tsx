import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";

interface HesitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hoveredProduct: Product;
  recommendedProducts: Product[];
}

const HesitationDialog = ({ 
  open, 
  onOpenChange, 
  hoveredProduct, 
  recommendedProducts 
}: HesitationDialogProps) => {
  const { addToCart } = useCart();
  
  const allProducts = [hoveredProduct, ...recommendedProducts].slice(0, 3);
  const discountPercentage = 15;
  
  const handleAddAllWithDiscount = () => {
    const comboId = `combo-${Date.now()}`;
    allProducts.forEach((product) => {
      const discountedPrice = product.price * (1 - discountPercentage / 100);
      addToCart(
        { ...product, price: discountedPrice },
        1,
        { originalPrice: product.price, discountPercentage, comboId }
      );
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Can help you find something?
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            It looks like you've paused for a bit. Here are your top 3 matching snacks 
            based on what you were exploring.
          </p>
        </DialogHeader>
        
        <div className="flex justify-end mb-4">
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Shop now
          </Button>
        </div>

        <div className="space-y-3">
          {allProducts.map((product) => (
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
                  onOpenChange(false);
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
          Add all above to get flat {discountPercentage}% off
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default HesitationDialog;
