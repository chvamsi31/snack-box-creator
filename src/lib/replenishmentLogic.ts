import { Product } from "@/types/product";
import { OrderResponse } from "./api";
import { mockProducts } from "./mockData";

// Consumption periods by category (in days)
const CONSUMPTION_PERIODS: Record<string, number> = {
  chips: 7,        // Daily snacking
  popcorn: 10,     // Moderate consumption
  chocolate: 14,   // Occasional treat
  jerky: 14,       // High protein, slower consumption
  "trail-mix": 21, // Healthy snacking
  energy: 21,      // Occasional energy boost
};

// Default consumption period if category not found
const DEFAULT_CONSUMPTION_PERIOD = 14;

// Trigger threshold (show nudge when X% consumed)
const TRIGGER_THRESHOLD = 0.8; // 80%

// Cooldown period in hours
const COOLDOWN_HOURS = 24;

export type UrgencyLevel = "low" | "medium" | "high";

export interface ReplenishmentItem {
  product: Product;
  lastPurchaseDate: string;
  daysSinceLastPurchase: number;
  estimatedDaysUntilEmpty: number;
  urgency: UrgencyLevel;
  purchaseFrequency?: number; // Personal frequency if available
  message: string;
}

/**
 * Get consumption period for a product category
 */
export const getConsumptionPeriod = (category: string): number => {
  return CONSUMPTION_PERIODS[category] || DEFAULT_CONSUMPTION_PERIOD;
};

/**
 * Calculate days since last purchase
 */
export const getDaysSinceLastPurchase = (orderDate: string): number => {
  const lastPurchase = new Date(orderDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastPurchase.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Calculate user's purchase frequency for a product
 * Returns average days between purchases, or null if insufficient data
 */
export const calculatePurchaseFrequency = (
  orders: OrderResponse[],
  productName: string
): number | null => {
  // Filter and sort orders for this product (most recent first)
  const productOrders = orders
    .filter(o => o.productName === productName)
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  // Need at least 2 purchases to calculate frequency
  if (productOrders.length < 2) {
    return null;
  }

  // Calculate intervals between consecutive purchases
  const intervals: number[] = [];
  for (let i = 0; i < productOrders.length - 1; i++) {
    const current = new Date(productOrders[i].orderDate);
    const previous = new Date(productOrders[i + 1].orderDate);
    const daysBetween = Math.ceil((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
    intervals.push(daysBetween);
  }

  // Calculate average interval
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  return Math.round(avgInterval);
};

/**
 * Calculate urgency level based on consumption progress
 */
export const calculateUrgency = (
  daysSince: number,
  consumptionPeriod: number
): UrgencyLevel => {
  const percentConsumed = daysSince / consumptionPeriod;

  if (percentConsumed >= 1.0) return "high";    // Past expected consumption
  if (percentConsumed >= 0.8) return "medium";  // 80%+ consumed
  return "low";                                  // < 80% consumed
};

/**
 * Generate contextual message based on urgency and time
 */
export const generateReplenishmentMessage = (
  daysSince: number,
  urgency: UrgencyLevel,
  hasFrequency: boolean
): string => {
  if (daysSince > 60) {
    return "Been a while - miss it?";
  }

  if (urgency === "high") {
    return "Running low!";
  }

  if (urgency === "medium") {
    if (hasFrequency) {
      return "Time for your usual reorder";
    }
    return "Getting low";
  }

  return "Consider restocking";
};

/**
 * Determine if a product needs replenishment
 */
export const needsReplenishment = (
  product: Product,
  orders: OrderResponse[]
): ReplenishmentItem | null => {
  // Find all orders for this product
  const productOrders = orders
    .filter(o => o.productName === (product.brand +" "+product.name))
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  // No purchase history for this product
  if (productOrders.length === 0) {
    return null;
  }

  // Get last purchase
  const lastPurchase = productOrders[0];
  const daysSinceLastPurchase = getDaysSinceLastPurchase(lastPurchase.orderDate);

  // Determine consumption period (Hybrid approach)
  let consumptionPeriod: number;
  let purchaseFrequency: number | undefined;

  if (productOrders.length >= 2) {
    // Has 2+ purchases → Calculate personal frequency
    const personalFrequency = calculatePurchaseFrequency(orders, product.name);
    const categoryPeriod = getConsumptionPeriod(product.category);

    if (personalFrequency) {
      purchaseFrequency = personalFrequency;
      // Use whichever is shorter (more conservative)
      consumptionPeriod = Math.min(personalFrequency, categoryPeriod);
    } else {
      consumptionPeriod = categoryPeriod;
    }
  } else {
    // Only 1 purchase → Use category default
    consumptionPeriod = getConsumptionPeriod(product.category);
  }

  // Calculate trigger threshold
  const triggerThreshold = consumptionPeriod * TRIGGER_THRESHOLD;

  // Check if needs replenishment
  if (daysSinceLastPurchase < triggerThreshold) {
    return null; // Too early
  }

  // Calculate urgency
  const urgency = calculateUrgency(daysSinceLastPurchase, consumptionPeriod);

  // Generate message
  const message = generateReplenishmentMessage(
    daysSinceLastPurchase,
    urgency,
    !!purchaseFrequency
  );

  return {
    product,
    lastPurchaseDate: lastPurchase.orderDate,
    daysSinceLastPurchase,
    estimatedDaysUntilEmpty: consumptionPeriod,
    urgency,
    purchaseFrequency,
    message,
  };
};

/**
 * Get all products needing replenishment for a user
 * Returns up to 3 products, sorted by urgency
 */
export const getReplenishmentProducts = (
  orders: OrderResponse[]
): ReplenishmentItem[] => {
  const replenishmentItems: ReplenishmentItem[] = [];

  // Check each product in catalog
  for (const product of mockProducts) {
    // Skip out of stock products
    if (!product.inStock) continue;

    const item = needsReplenishment(product, orders);
    if (item) {
      replenishmentItems.push(item);
    }
  }

  // Sort by urgency (high > medium > low) and then by days since purchase (descending)
  const urgencyOrder = { high: 3, medium: 2, low: 1 };
  replenishmentItems.sort((a, b) => {
    const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    if (urgencyDiff !== 0) return urgencyDiff;
    return b.daysSinceLastPurchase - a.daysSinceLastPurchase;
  });

  // Return top 3
  return replenishmentItems.slice(0, 3);
};

/**
 * Check if replenishment nudge was recently shown for a product
 */
export const hasRecentlySeenReplenishmentNudge = (productId: string): boolean => {
  try {
    const tracking = JSON.parse(localStorage.getItem('replenishmentNudgeSeen') || '{}');
    const lastSeen = tracking[productId];

    if (!lastSeen) return false;

    const hoursSinceLastSeen = (Date.now() - lastSeen) / (1000 * 60 * 60);
    return hoursSinceLastSeen < COOLDOWN_HOURS;
  } catch {
    return false;
  }
};

/**
 * Mark that replenishment nudge was shown for a product
 */
export const markReplenishmentNudgeSeen = (productId: string): void => {
  try {
    const tracking = JSON.parse(localStorage.getItem('replenishmentNudgeSeen') || '{}');
    tracking[productId] = Date.now();
    localStorage.setItem('replenishmentNudgeSeen', JSON.stringify(tracking));
  } catch {
    // Silently fail if localStorage is not available
  }
};

/**
 * Mark multiple products as seen
 */
export const markMultipleReplenishmentNudgesSeen = (productIds: string[]): void => {
  try {
    const tracking = JSON.parse(localStorage.getItem('replenishmentNudgeSeen') || '{}');
    const now = Date.now();
    productIds.forEach(id => {
      tracking[id] = now;
    });
    localStorage.setItem('replenishmentNudgeSeen', JSON.stringify(tracking));
  } catch {
    // Silently fail if localStorage is not available
  }
};

/**
 * Filter out products that were recently shown
 */
export const filterRecentlySeenProducts = (
  items: ReplenishmentItem[]
): ReplenishmentItem[] => {
  return items.filter(item => !hasRecentlySeenReplenishmentNudge(item.product.id));
};
