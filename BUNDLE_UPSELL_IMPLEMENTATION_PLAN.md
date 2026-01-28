# Bundle/Upsell Nudge - Analysis & Implementation Plan

## Current State Analysis

### ✅ What Already Exists:

1. **Variety Packs (Pre-built Bundles)**
   - Location: `BuildBox.tsx` page
   - Data: `varietyPackData.ts` with 6 pre-defined packs
   - Features:
     - Curated product combinations
     - Fixed pricing with savings
     - Static bundles (not dynamic)
     - Adds all products to cart at once
   - **Limitation:** Not a nudge/dialog - it's a separate page users must navigate to

2. **Combo Discount System (Infrastructure)**
   - `CartItem` type supports: `comboId`, `originalPrice`, `discountPercentage`
   - Used in HesitationDialog and IdleNudgeDialog
   - Allows grouping products with discount tracking
   - **Limitation:** Only used in existing nudges, not for dedicated upsell

3. **Product Recommendation Logic**
   - HesitationDialog: Finds 2 products from same brand/category
   - IdleNudgeDialog: Shows 3 random products
   - **Limitation:** Not triggered by cart actions or product additions

### ❌ What's Missing:

**No dedicated Bundle/Upsell Nudge that:**
- Triggers when user adds product to cart
- Shows "Frequently Bought Together" suggestions
- Offers bundle discounts for completing the set
- Appears as a dialog/modal (not a separate page)
- Uses smart product pairing logic

---

## Bundle/Upsell Nudge - Concept

### What is it?
A **post-add-to-cart nudge** that appears immediately after a user adds a product to their cart, suggesting complementary products to create a bundle with a discount incentive.

### When should it trigger?
- **Immediately after** user clicks "Add to Cart" on any product
- **Before** the cart confirmation toast disappears
- **Only once per session** per product (avoid spam)

### What should it show?
- The product just added (confirmation)
- 2-3 complementary products based on:
  - Same category (e.g., chips with chips)
  - Complementary categories (e.g., chips with dips, chocolate with trail mix)
  - Same brand
  - Popular pairings
- Bundle discount offer (e.g., "Add these 2 items and save 10%")

---

## Implementation Approach

### **Option 1: Smart Pairing Logic (Recommended)**

#### Trigger:
- After user adds product to cart
- Shows dialog with "Complete Your Snack Box!" message

#### Product Selection Logic:
```
1. Category-based pairing:
   - chips → chips (variety) OR dips/sauces
   - chocolate → trail-mix OR popcorn (sweet combo)
   - jerky → chips OR trail-mix (protein + carbs)
   - popcorn → chocolate OR chips (movie night combo)
   - trail-mix → jerky OR energy (healthy combo)

2. Brand loyalty:
   - If user added Lay's → suggest other Lay's products
   - If user added Smartfood → suggest other Smartfood

3. Price balancing:
   - Suggest products in similar price range
   - Total bundle should be attractive (15-20% savings)
```

#### Discount Structure:
- **Add 1 more item:** 10% off bundle
- **Add 2 more items:** 15% off bundle
- **Add all 3 items:** 20% off bundle

#### UI/UX:
```
┌─────────────────────────────────────────────┐
│  🎉 Great Choice!                           │
│                                             │
│  ✓ [Product Image] Product Name - $X.XX    │
│                                             │
│  Complete your snack box and save!          │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Img] Product 2    $X.XX  [+ Add]   │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ [Img] Product 3    $X.XX  [+ Add]   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  💰 Add both and save 15% ($X.XX off)      │
│                                             │
│  [Add Bundle & Save 15%]  [No Thanks]      │
└─────────────────────────────────────────────┘
```

---

### **Option 2: Variety Pack Upsell (Simpler)**

#### Trigger:
- After user adds product to cart
- Check if product is part of any variety pack

#### Logic:
```
1. Find variety packs containing the added product
2. Show the most relevant pack (best savings or smallest)
3. Offer to upgrade to full variety pack
```

#### UI/UX:
```
┌─────────────────────────────────────────────┐
│  💡 Did you know?                           │
│                                             │
│  This product is part of our               │
│  "Classic Favorites Mix" variety pack!     │
│                                             │
│  [Pack Image]                               │
│  Classic Favorites Mix                      │
│  18 items - Save $5.00                      │
│                                             │
│  Includes:                                  │
│  • Classic Sea Salt Chips (added ✓)        │
│  • Spicy Jalapeño Poppers                  │
│  • Cheddar Cheese Puffs                    │
│                                             │
│  [Upgrade to Pack - $24.99]  [No Thanks]   │
└─────────────────────────────────────────────┘
```

---

## Recommended Implementation: **Hybrid Approach**

### Why Hybrid?
Combines the best of both:
1. **Smart pairing** for products NOT in variety packs
2. **Variety pack upsell** for products that ARE in packs
3. Maximizes conversion opportunities

### Decision Tree:
```
User adds product to cart
    ↓
Is product in a variety pack?
    ↓
YES → Show Variety Pack Upsell
    ↓
NO → Show Smart Pairing Bundle
```

---

## Technical Implementation Plan

### 1. **Create BundleUpsellDialog Component**

**Location:** `src/components/BundleUpsellDialog.tsx`

**Props:**
```typescript
interface BundleUpsellDialogProps {
  addedProduct: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Features:**
- Detects if product is in variety pack
- Falls back to smart pairing if not
- Handles bundle discount calculation
- Adds products with comboId for tracking

### 2. **Create Pairing Logic Utility**

**Location:** `src/lib/productPairing.ts`

**Functions:**
```typescript
// Find complementary products based on category/brand
findComplementaryProducts(product: Product, count: number): Product[]

// Check if product is in any variety pack
findVarietyPacksForProduct(productId: string): VarietyPack[]

// Calculate bundle discount
calculateBundleDiscount(products: Product[], discountPercent: number): number
```

**Pairing Rules:**
```typescript
const categoryPairings = {
  chips: ["chips", "popcorn"],
  chocolate: ["trail-mix", "popcorn"],
  jerky: ["chips", "trail-mix"],
  popcorn: ["chocolate", "chips"],
  "trail-mix": ["jerky", "chocolate"],
  energy: ["trail-mix", "jerky"]
};

const brandBoost = 1.5; // Prefer same brand
```

### 3. **Integrate with CartContext**

**Modify:** `src/contexts/CartContext.tsx`

**Add state:**
```typescript
const [showBundleUpsell, setShowBundleUpsell] = useState(false);
const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null);
```

**Modify addToCart:**
```typescript
const addToCart = (product: Product, ...) => {
  // ... existing logic
  
  // Trigger bundle upsell (only if not already in a combo)
  if (!discount?.comboId) {
    setLastAddedProduct(product);
    setShowBundleUpsell(true);
  }
};
```

### 4. **Add to App.tsx**

**Mount globally:**
```typescript
<BundleUpsellDialog 
  addedProduct={lastAddedProduct}
  open={showBundleUpsell}
  onOpenChange={setShowBundleUpsell}
/>
```

### 5. **Session Tracking (Prevent Spam)**

**Use localStorage:**
```typescript
const hasSeenUpsellForProduct = (productId: string): boolean => {
  const seen = JSON.parse(localStorage.getItem('upsellSeen') || '{}');
  return seen[productId] === true;
};

const markUpsellSeen = (productId: string) => {
  const seen = JSON.parse(localStorage.getItem('upsellSeen') || '{}');
  seen[productId] = true;
  localStorage.setItem('upsellSeen', JSON.stringify(seen));
};
```

---

## Product Pairing Strategy

### Based on Current Products:

| Product Added | Suggested Pairs | Reasoning |
|---------------|----------------|-----------|
| Lay's Sea Salt Chips | Doritos Jalapeño + Cheetos Puffs | Chips variety pack |
| Doritos Jalapeño | Lay's Chips + Chester's Jerky | Spicy + protein combo |
| Smartfood Chocolate Almonds | Simply Trail Mix + Smartfood Popcorn | Sweet snack combo |
| Simply Trail Mix | Chester's Jerky + Tostitos Energy | Healthy/protein combo |
| Chester's Jerky | Simply Trail Mix + Doritos | Protein + carbs |
| Cheetos Puffs | Lay's Chips + Doritos | Chips variety |
| Tostitos Energy | Simply Trail Mix + Chester's Jerky | Energy/healthy combo |
| Smartfood Popcorn | Smartfood Chocolate + Cheetos | Sweet + savory |

---

## Discount Structure

### Tiered Discounts:
- **Add 1 item:** 10% off both items
- **Add 2 items:** 15% off all 3 items
- **Variety Pack:** Use existing pack savings

### Example Calculation:
```
User adds: Lay's Chips ($4.99)
Suggested: Doritos ($5.49) + Cheetos ($3.99)

Option 1: Add Doritos only
  - 10% off: Save $1.05
  - Total: $9.43 (was $10.48)

Option 2: Add both
  - 15% off: Save $2.17
  - Total: $12.29 (was $14.47)

Option 3: Upgrade to Variety Pack
  - Classic Favorites Mix: $24.99
  - Save $5.00 vs individual
```

---

## User Experience Flow

### Scenario 1: Smart Pairing
```
1. User clicks "Add to Cart" on Lay's Chips
2. Toast: "Added to cart!" (brief)
3. Dialog appears: "Complete Your Snack Box!"
4. Shows Lay's (added ✓) + 2 suggestions
5. User can:
   - Add individual items (10% off each)
   - Add both (15% off bundle)
   - Dismiss dialog
6. If user adds items, they're grouped with comboId
7. Dialog closes, user continues shopping
```

### Scenario 2: Variety Pack Upsell
```
1. User adds Lay's Chips to cart
2. System detects it's in "Classic Favorites Mix"
3. Dialog: "Upgrade to Variety Pack?"
4. Shows pack details and savings
5. User can:
   - Upgrade to full pack
   - Continue with single item
6. Dialog closes
```

---

## Benefits of This Approach

### For Business:
✅ **Increases AOV** (Average Order Value)  
✅ **Cross-sells** complementary products  
✅ **Promotes variety packs** (existing inventory)  
✅ **Tracks bundle performance** via comboId  
✅ **Non-intrusive** (only shows once per product)  

### For Users:
✅ **Discovers** complementary products  
✅ **Saves money** with bundle discounts  
✅ **Convenient** (add multiple items quickly)  
✅ **Personalized** (based on what they added)  
✅ **Optional** (easy to dismiss)  

### Technical:
✅ **Reuses existing** combo infrastructure  
✅ **Leverages** variety pack data  
✅ **Simple logic** (category + brand based)  
✅ **Respects** NudgeContext (one nudge at a time)  
✅ **Session-aware** (prevents spam)  

---

## Implementation Complexity

### Effort Estimate:
- **Simple Version** (Variety Pack Upsell only): 2-3 hours
- **Smart Pairing Version**: 4-5 hours
- **Hybrid Version** (Recommended): 5-6 hours

### Files to Create:
1. `src/components/BundleUpsellDialog.tsx` (main component)
2. `src/lib/productPairing.ts` (pairing logic)

### Files to Modify:
1. `src/contexts/CartContext.tsx` (trigger logic)
2. `src/App.tsx` (mount dialog)

### Testing Checklist:
- [ ] Dialog appears after adding product
- [ ] Shows correct complementary products
- [ ] Variety pack upsell works for pack products
- [ ] Discount calculation is accurate
- [ ] ComboId groups bundle items in cart
- [ ] Session tracking prevents spam
- [ ] Respects NudgeContext (no overlap)
- [ ] Mobile responsive
- [ ] Accessible (keyboard navigation)

---

## Alternative: Simpler "You May Also Like" Section

If the dialog approach feels too aggressive, consider:

### Cart Page Upsell Section
- Add "Recommended for You" section at bottom of cart
- Shows 3-4 complementary products
- No dialog, just static recommendations
- Less intrusive but also less effective

### Product Detail Page Upsell
- Add "Frequently Bought Together" section
- Shows before user adds to cart
- More traditional e-commerce pattern
- Lower conversion but less disruptive

---

## Recommendation

**Implement the Hybrid Approach** because:

1. ✅ **Best ROI** - Maximizes conversion opportunities
2. ✅ **Uses existing data** - Leverages variety packs
3. ✅ **Smart fallback** - Pairing logic for non-pack products
4. ✅ **Non-intrusive** - Only shows once per product
5. ✅ **Aligns with current nudge strategy** - Fits the existing pattern

The implementation is clean, maintainable, and provides immediate value while being easy to iterate on based on user feedback.

---

## Next Steps

1. **Review this plan** and approve approach
2. **Decide on discount percentages** (10%/15% or different?)
3. **Confirm pairing logic** (category-based or custom rules?)
4. **Implement BundleUpsellDialog** component
5. **Add pairing utility** functions
6. **Integrate with CartContext**
7. **Test thoroughly** across scenarios
8. **Monitor performance** (conversion rate, AOV impact)

Ready to proceed when you approve! 🚀
