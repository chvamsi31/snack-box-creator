import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import { mockProducts, brands } from "@/lib/mockData";
import { ArrowRight, Truck } from "lucide-react";

const Home = () => {
  const featuredProducts = mockProducts.filter(p => p.tags.includes("bestseller")).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 px-4">
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-background/20 text-primary-foreground backdrop-blur-sm">
              Free shipping on orders over $15
            </Badge>
            <h1 className="mb-6 text-5xl font-bold text-primary-foreground md:text-6xl lg:text-7xl">
              Snacks That Make You Smile
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/90 md:text-xl">
              Discover premium snacks from your favorite brands. Fresh, delicious, and delivered to your door.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/products">
                <Button size="lg" variant="secondary" className="gap-2 text-base">
                  Shop All Snacks
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/build-box">
                <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/20 bg-background/10 text-base text-primary-foreground backdrop-blur-sm hover:bg-background/20">
                  Build Your Box
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Free Shipping Banner */}
      <section className="border-b border-border bg-accent py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 text-center">
            <Truck className="h-5 w-5 text-accent-foreground" />
            <p className="text-sm font-medium text-accent-foreground md:text-base">
              Free shipping on all orders over $15 • Fast delivery nationwide
            </p>
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-3xl font-bold md:text-4xl">Shop by Brand</h2>
            <p className="text-muted-foreground">Your favorite snack brands, all in one place</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {brands.map((brand) => (
              <Link key={brand} to={`/products?brand=${encodeURIComponent(brand)}`}>
                <Card className="group cursor-pointer transition-all hover:shadow-hover">
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <p className="text-center text-sm font-semibold group-hover:text-primary transition-colors">
                      {brand}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted py-16 px-4">
        <div className="container mx-auto">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-3xl font-bold md:text-4xl">Bestsellers</h2>
            <p className="text-muted-foreground">Our most popular snacks that everyone loves</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/products">
              <Button size="lg" className="gap-2">
                View All Products
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
