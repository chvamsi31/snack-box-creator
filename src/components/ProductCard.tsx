import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  return (
    <Card className="group overflow-hidden bg-gradient-card transition-all duration-300 hover:shadow-hover">
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
  );
};

export default ProductCard;
