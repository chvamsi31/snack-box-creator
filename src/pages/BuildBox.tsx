import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Tag, ShoppingCart } from "lucide-react";
import { varietyPacks } from "@/lib/varietyPackData";
import { useCart } from "@/contexts/CartContext";
import { mockProducts } from "@/lib/mockData";
import { toast } from "sonner";

const BuildBox = () => {
  const { addToCart } = useCart();

  const handleAddToCart = (packId: string) => {
    const pack = varietyPacks.find(p => p.id === packId);
    if (!pack) return;

    // Add all products from the variety pack to cart
    pack.productIds.forEach(productId => {
      const product = mockProducts.find(p => p.id === productId);
      if (product) {
        addToCart(product);
      }
    });

    toast.success(`${pack.name} added to cart!`);
  };

  return (
    <div className="container mx-auto min-h-screen px-4 py-12">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
          <Package className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Variety Packs</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Discover our curated variety packs - perfectly balanced assortments of your favorite snacks at special prices!
        </p>
      </div>

      {/* Variety Packs Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {varietyPacks.map((pack) => (
          <Card key={pack.id} className="group overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="p-0">
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={pack.image}
                  alt={pack.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {pack.savings && (
                  <div className="absolute right-3 top-3">
                    <Badge className="bg-destructive text-destructive-foreground">
                      Save ${pack.savings.toFixed(2)}
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CardTitle className="mb-2 text-xl">{pack.name}</CardTitle>
              <CardDescription className="mb-4 line-clamp-2">
                {pack.description}
              </CardDescription>
              
              <div className="mb-4 flex flex-wrap gap-2">
                {pack.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>{pack.itemCount} items included</span>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t p-6">
              <div>
                <p className="text-2xl font-bold">${pack.price.toFixed(2)}</p>
                {pack.savings && (
                  <p className="text-xs text-muted-foreground">
                    Was ${(pack.price + pack.savings).toFixed(2)}
                  </p>
                )}
              </div>
              <Button onClick={() => handleAddToCart(pack.id)} size="lg">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BuildBox;
