import { Product } from "@/types/product";
import { VarietyPack } from "@/types/varietyPack";
import { mockProducts } from "./mockData";
import { varietyPacks } from "./varietyPackData";

// Category pairing rules - which categories go well together
const categoryPairings: Record<string, string[]> = {
  chips: ["chips", "popcorn", "jerky"],
  chocolate: ["trail-mix", "popcorn", "energy"],
  jerky: ["chips", "trail-mix", "energy"],
  popcorn: ["chocolate", "chips"],
  "trail-mix": ["jerky", "chocolate", "energy"],
  energy: ["trail-mix", "jerky"],
};

/**
 * Find variety packs that contain the given product
 */
export const findVarietyPacksForProduct = (productId: string): VarietyPack[] => {
  return varietyPacks.filter(pack => pack.productIds.includes(productId));
};

/**
 * Find complementary products based on category, brand, and pairing rules
 */
export const findComplementaryProducts = (
  product: Product,
  count: number = 2
): Product[] => {
  const availableProducts = mockProducts.filter(
    p => p.id !== product.id && p.inStock
  );

  // Score each product based on compatibility
  const scoredProducts = availableProducts.map(p => {
    let score = 0;

    // Same brand gets highest boost
    if (p.brand === product.brand) {
      score += 3;
    }

    // Same category gets medium boost (for variety)
    if (p.category === product.category) {
      score += 2;
    }

    // Complementary category gets good boost
    const compatibleCategories = categoryPairings[product.category] || [];
    if (compatibleCategories.includes(p.category)) {
      score += 2.5;
    }

    // Similar price range (within $2) gets small boost
    const priceDiff = Math.abs(p.price - product.price);
    if (priceDiff <= 2) {
      score += 1;
    }

    // Bestseller tag gets small boost
    if (p.tags.includes("bestseller")) {
      score += 0.5;
    }

    return { product: p, score };
  });

  // Sort by score (descending) and return top N
  return scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(item => item.product);
};

/**
 * Calculate bundle discount based on number of items
 */
export const calculateBundleDiscount = (
  products: Product[],
  itemCount: number
): { discountPercent: number; totalOriginal: number; totalDiscounted: number; savings: number } => {
  // Discount tiers
  const discountPercent = itemCount === 1 ? 10 : itemCount >= 2 ? 15 : 0;

  const totalOriginal = products.reduce((sum, p) => sum + p.price, 0);
  const totalDiscounted = totalOriginal * (1 - discountPercent / 100);
  const savings = totalOriginal - totalDiscounted;

  return {
    discountPercent,
    totalOriginal,
    totalDiscounted,
    savings,
  };
};

/**
 * Check if user has already seen upsell for this product in current session
 */
export const hasSeenUpsellForProduct = (productId: string): boolean => {
  try {
    const seen = JSON.parse(localStorage.getItem('upsellSeen') || '{}');
    return seen[productId] === true;
  } catch {
    return false;
  }
};

/**
 * Mark that user has seen upsell for this product
 */
export const markUpsellSeen = (productId: string): void => {
  try {
    const seen = JSON.parse(localStorage.getItem('upsellSeen') || '{}');
    seen[productId] = true;
    localStorage.setItem('upsellSeen', JSON.stringify(seen));
  } catch {
    // Silently fail if localStorage is not available
  }
};

/**
 * Get the best variety pack for a product (smallest or best savings)
 */
export const getBestVarietyPackForProduct = (productId: string): VarietyPack | null => {
  const packs = findVarietyPacksForProduct(productId);
  if (packs.length === 0) return null;

  // Sort by savings (descending) and return the best one
  return packs.sort((a, b) => (b.savings || 0) - (a.savings || 0))[0];
};
