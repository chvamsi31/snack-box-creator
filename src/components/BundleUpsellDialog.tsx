import { useState, useEffect } from "react";
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
import { useNudge } from "@/contexts/NudgeContext";
import { Product } from "@/types/product";
import { VarietyPack } from "@/types/varietyPack";
import { ShoppingCart, Package, Sparkles, Check } from "lucide-react";
import {
  findComplementaryProducts,
  getBestVarietyPackForProduct,
  calculateBundleDiscount,
  markUpsellSeen,
} from "@/lib/productPairing";
import { mockProducts } from "@/lib/mockData";

interface BundleUpsellDialogProps {
  addedProduct: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BundleUpsellDialog = ({ addedProduct, open, onOpenChange }: BundleUpsellDialogProps) => {
  const { addToCart } = useCart();
  const { activeNudge, setActiveNudge } = useNudge();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"variety-pack" | "smart-pairing">("smart-pairing");
  const [varietyPack, setVarietyPack] = useState<VarietyPack | null>(null);
  const [complementaryProducts, setComplementaryProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!addedProduct || !open) return;

    // Check if product is in a variety pack
    const pack = getBestVarietyPackForProduct(addedProduct.id);
    
    if (pack) {
      setMode("variety-pack");
      setVarietyPack(pack);
    } else {
      setMode("smart-pairing");
      const complementary = findComplementaryProducts(addedProduct, 2);
      setComplementaryProducts(complementary);
    }

    // Set active nudge
    if (activeNudge === null) {
      setActiveNudge("bundle");
    }
  }, [addedProduct, open, setActiveNudge, activeNudge]);

  const handleClose = () => {
    if (addedProduct) {
      markUpsellSeen(addedProduct.id);
    }
    setSelectedProducts(new Set());
    onOpenChange(false);
    setActiveNudge(null);
  };

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleAddBundle = () => {
    if (!addedProduct) return;

    const comboId = `bundle-${Date.now()}`;
    const productsToAdd = Array.from(selectedProducts)
      .map(id => mockProducts.find(p => p.id === id))
      .filter((p): p is Product => p !== undefined);

    if (productsToAdd.length === 0) {
      handleClose();
      return;
    }

    // Calculate discount
    const allProducts = [addedProduct, ...productsToAdd];
    const { discountPercent, totalOriginal } = calculateBundleDiscount(
      allProducts,
      productsToAdd.length
    );

    // Add selected products with discount
    productsToAdd.forEach(product => {
      const discountedPrice = product.price * (1 - discountPercent / 100);
      addToCart(
        { ...product, price: discountedPrice },
        1,
        { originalPrice: product.price, discountPercentage: discountPercent, comboId }
      );
    });

    handleClose();
  };

  const handleAddVarietyPack = () => {
    if (!varietyPack) return;

    const comboId = `variety-pack-${Date.now()}`;
    
    // Add all products from variety pack
    varietyPack.productIds.forEach(productId => {
      const product = mockProducts.find(p => p.id === productId);
      if (product && product.id !== addedProduct?.id) {
        // Calculate per-item discount based on pack savings
        const packSavings = varietyPack.savings || 0;
        const totalOriginalPrice = varietyPack.productIds.reduce((sum, id) => {
          const p = mockProducts.find(prod => prod.id === id);
          return sum + (p?.price || 0);
        }, 0);
        const discountPercent = (packSavings / totalOriginalPrice) * 100;
        const discountedPrice = product.price * (1 - discountPercent / 100);
        
        addToCart(
          { ...product, price: discountedPrice },
          1,
          { originalPrice: product.price, discountPercentage: discountPercent, comboId }
        );
      }
    });

    handleClose();
  };

  if (!addedProduct) return null;

  // Calculate discount info for smart pairing
  const selectedProductsList = Array.from(selectedProducts)
    .map(id => mockProducts.find(p => p.id === id))
    .filter((p): p is Product => p !== undefined);
  
  const bundleInfo = selectedProductsList.length > 0
    ? calculateBundleDiscount([addedProduct, ...selectedProductsList], selectedProductsList.length)
    : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {mode === "variety-pack" && varietyPack ? (
          // Variety Pack Upsell Mode
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Package className="h-5 w-5 text-primary" />
                Upgrade to Variety Pack!
              </DialogTitle>
              <DialogDescription className="text-base">
                This product is part of our <span className="font-semibold">{varietyPack.name}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Added Product Confirmation */}
              <div className="flex items-center gap-3 rounded-lg border border-primary/50 bg-primary/5 p-3">
                <Check className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{addedProduct.name}</p>
                  <p className="text-xs text-muted-foreground">Added to cart</p>
                </div>
              </div>

              {/* Variety Pack Details */}
              <div className="rounded-lg border bg-card p-4">
                <img
                  src={varietyPack.image}
                  alt={varietyPack.name}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
                <h3 className="font-bold text-lg mb-2">{varietyPack.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{varietyPack.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {varietyPack.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{varietyPack.itemCount} items</span>
                  <span className="font-semibold text-destructive">
                    Save ${varietyPack.savings?.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground line-through">
                      ${(varietyPack.price + (varietyPack.savings || 0)).toFixed(2)}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      ${varietyPack.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button size="lg" onClick={handleAddVarietyPack} className="w-full">
                  <Package className="h-5 w-5 mr-2" />
                  Upgrade to Pack - ${varietyPack.price.toFixed(2)}
                </Button>
                <Button variant="ghost" onClick={handleClose} className="w-full">
                  No thanks, continue shopping
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Smart Pairing Mode
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-primary" />
                Complete Your Snack Box!
              </DialogTitle>
              <DialogDescription className="text-base">
                Add these items and save up to 15%
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Added Product Confirmation */}
              <div className="flex items-center gap-3 rounded-lg border border-primary/50 bg-primary/5 p-3">
                <Check className="h-5 w-5 text-primary shrink-0" />
                <img
                  src={addedProduct.image}
                  alt={addedProduct.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{addedProduct.name}</p>
                  <p className="text-xs text-muted-foreground">Added to cart</p>
                </div>
                <p className="text-sm font-bold">${addedProduct.price.toFixed(2)}</p>
              </div>

              {/* Complementary Products */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">Add to your order:</p>
                {complementaryProducts.map(product => (
                  <div
                    key={product.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                      selectedProducts.has(product.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50 hover:bg-accent/50"
                    }`}
                    onClick={() => toggleProduct(product.id)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">${product.price.toFixed(2)}</p>
                      {selectedProducts.has(product.id) && (
                        <Check className="h-4 w-4 text-primary ml-auto mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bundle Discount Info */}
              {bundleInfo && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">Bundle Discount ({bundleInfo.discountPercent}% off)</span>
                    <span className="text-sm font-bold text-primary">
                      -${bundleInfo.savings.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground line-through mr-2">
                        ${bundleInfo.totalOriginal.toFixed(2)}
                      </span>
                      <span className="text-lg font-bold text-primary">
                        ${bundleInfo.totalDiscounted.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  size="lg"
                  onClick={handleAddBundle}
                  disabled={selectedProducts.size === 0}
                  className="w-full"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {selectedProducts.size === 0
                    ? "Select items to add"
                    : `Add ${selectedProducts.size} item${selectedProducts.size > 1 ? 's' : ''} & Save ${bundleInfo?.discountPercent}%`}
                </Button>
                <Button variant="ghost" onClick={handleClose} className="w-full">
                  No thanks, continue shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BundleUpsellDialog;
