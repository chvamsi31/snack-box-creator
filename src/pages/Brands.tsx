import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { brands, mockProducts } from "@/lib/mockData";
import laysLogo from "@/assets/brands/lays-logo.png";
import simplyLogo from "@/assets/brands/simply-logo.png";
import doritosLogo from "@/assets/brands/doritos-logo.png";
import cheetosLogo from "@/assets/brands/cheetos-logo.png";
import rufflesLogo from "@/assets/brands/ruffles-logo.png";
import fritosLogo from "@/assets/brands/fritos-logo.png";
import smartfoodLogo from "@/assets/brands/smartfood-logo.png";
import funyunsLogo from "@/assets/brands/funyuns-logo.png";
import chestersLogo from "@/assets/brands/chesters-logo.png";
import sunchipsLogo from "@/assets/brands/sunchips-logo.png";
import roldGoldLogo from "@/assets/brands/rold-gold-logo.png";
import tostitosLogo from "@/assets/brands/tostitos-logo.png";

const brandLogos: Record<string, string> = {
  "Lay's": laysLogo,
  "Simply": simplyLogo,
  "Doritos": doritosLogo,
  "Cheetos": cheetosLogo,
  "Ruffles": rufflesLogo,
  "Fritos": fritosLogo,
  "Smartfood": smartfoodLogo,
  "Funyuns": funyunsLogo,
  "Chester's": chestersLogo,
  "Sunchips": sunchipsLogo,
  "Rold Gold": roldGoldLogo,
  "Tostitos": tostitosLogo,
};

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
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 h-32 w-32 flex items-center justify-center">
                    <img
                      src={brandLogos[brand]}
                      alt={`${brand} logo`}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="mb-2 text-xl font-bold group-hover:text-primary transition-colors">
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
