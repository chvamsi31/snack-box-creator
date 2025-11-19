import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { brands, mockProducts } from "@/lib/mockData";

const Brands = () => {
  const getBrandProductCount = (brand: string) => {
    return mockProducts.filter((p) => p.brand === brand).length;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Shop by Brand</h1>
          <p className="text-muted-foreground">
            Explore our collection of premium snack brands
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {brands.map((brand) => (
            <Link key={brand} to={`/products?brand=${encodeURIComponent(brand)}`}>
              <Card className="group h-full transition-all hover:shadow-hover">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <h3 className="mb-2 text-2xl font-bold group-hover:text-primary transition-colors">
                    {brand}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getBrandProductCount(brand)} products
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Brands;
