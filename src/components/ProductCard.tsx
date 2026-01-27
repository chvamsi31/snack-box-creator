import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNudge } from "@/contexts/NudgeContext";
import { ShoppingCart } from "lucide-react";
import HesitationDialog from "./HesitationDialog";
import { mockProducts } from "@/lib/mockData";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { activeNudge, setActiveNudge } = useNudge();
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mousePositionsRef = useRef<{ x: number; y: number; time: number }[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  const detectHesitation = () => {
    const positions = mousePositionsRef.current;
    if (positions.length < 3) return false;

    // Check for oscillating behavior: back-and-forth movement or small movements
    const recentPositions = positions.slice(-6); // Look at last 6 positions
    
    // Calculate total distance traveled
    let totalDistance = 0;
    let directionChanges = 0;
    
    for (let i = 1; i < recentPositions.length; i++) {
      const prev = recentPositions[i - 1];
      const curr = recentPositions[i];
      
      const deltaX = curr.x - prev.x;
      const deltaY = curr.y - prev.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      totalDistance += distance;
      
      // Check for direction changes (oscillation)
      if (i > 1) {
        const prevPrev = recentPositions[i - 2];
        const prevDeltaX = prev.x - prevPrev.x;
        const prevDeltaY = prev.y - prevPrev.y;
        
        // Direction changed in X or Y axis
        if ((deltaX * prevDeltaX < 0) || (deltaY * prevDeltaY < 0)) {
          directionChanges++;
        }
      }
    }
    
    // Hesitation detected if:
    // 1. At least 1 direction change (some back-and-forth movement)
    // 2. Average movement per position is small (< 50px) - indicates hovering/uncertainty
    const avgMovement = totalDistance / (recentPositions.length - 1);
    
    return directionChanges >= 1 && avgMovement < 50;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Only track for non-logged-in users
    if (user) return;
    if (activeNudge !== null) return;
    if (hoverTimerRef.current) return; // Already triggered

    const now = Date.now();
    mousePositionsRef.current.push({
      x: e.clientX,
      y: e.clientY,
      time: now
    });

    // Keep only last 10 positions
    if (mousePositionsRef.current.length > 10) {
      mousePositionsRef.current.shift();
    }

    // Check for hesitation after we have enough data
    if (mousePositionsRef.current.length >= 3) {
      const isHesitating = detectHesitation();
      
      if (isHesitating) {
        // Start timer between 3-5 seconds (random)
        const delay = 3000 + Math.random() * 2000;
        
        hoverTimerRef.current = setTimeout(() => {
          // Check again before showing
          if (activeNudge !== null) return;
          
          // Find 2 recommended products from same brand or category
          const related = mockProducts
            .filter(p => 
              p.id !== product.id && 
              (p.brand === product.brand || p.category === product.category) &&
              p.inStock
            )
            .slice(0, 2);
          
          setRecommendedProducts(related);
          setShowDialog(true);
          setActiveNudge("hesitation");
        }, delay);
      }
    }
  };

  const handleMouseEnter = () => {
    // Reset position tracking
    mousePositionsRef.current = [];
  };

  const handleMouseLeave = () => {
    // Clear timer and reset tracking
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    mousePositionsRef.current = [];
  };

  const handleDialogClose = (isOpen: boolean) => {
    setShowDialog(isOpen);
    if (!isOpen) {
      setActiveNudge(null);
    }
  };

  return (
    <>
      <HesitationDialog
        open={showDialog}
        onOpenChange={handleDialogClose}
        hoveredProduct={product}
        recommendedProducts={recommendedProducts}
      />
      
      <Card 
        ref={cardRef}
        className="group overflow-hidden bg-gradient-card transition-all duration-300 hover:shadow-hover"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Link to={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {!product.inStock && (
            <Badge className="absolute right-2 top-2" variant="secondary">
              Out of Stock
            </Badge>
          )}
          {product.tags.includes("new") && (
            <Badge className="absolute left-2 top-2 bg-primary">
              New
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/products/${product.id}`}>
          <p className="text-xs font-medium text-muted-foreground">{product.brand}</p>
          <h3 className="mt-1 text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="mt-2 flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </Link>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <span className="text-xl font-bold text-primary">${product.price.toFixed(2)}</span>
        <Button
          size="sm"
          onClick={() => addToCart(product)}
          disabled={!product.inStock}
          className="gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          Add
        </Button>
      </CardFooter>
    </Card>
    </>
  );
};

export default ProductCard;
