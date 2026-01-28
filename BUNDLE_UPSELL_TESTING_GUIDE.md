# Bundle/Upsell Nudge - Testing Guide

## Overview
The Bundle/Upsell Nudge appears immediately after a user adds a product to their cart, suggesting complementary products or variety pack upgrades with attractive discounts.

---

## Implementation Complete ✅

### What Was Built:

1. **BundleUpsellDialog Component**
   - Hybrid approach: Variety Pack OR Smart Pairing
   - Automatic mode detection
   - Interactive product selection
   - Real-time discount calculation

2. **Product Pairing Logic**
   - Category-based pairing rules
   - Brand preference boost
   - Price balancing
   - Bestseller prioritization

3. **Session Tracking**
   - Shows once per product per session
   - Uses localStorage to prevent spam
   - Resets on browser refresh

4. **Cart Integration**
   - Triggers automatically on add-to-cart
   - 500ms delay for smooth UX
   - Skips if product is already part of a bundle

---

## How It Works

### **Mode 1: Variety Pack Upsell**

**Triggers when:**
- User adds a product that's part of a variety pack
- Example: Adding "Lay's Sea Salt Chips" (part of "Classic Favorites Mix")

**Shows:**
- Confirmation of added product
- Variety pack details (image, description, tags)
- Item count and savings
- Original vs. discounted price
- "Upgrade to Pack" button

**Products in Variety Packs:**
- Product ID "1" (Lay's) → Classic Favorites Mix, Sweet & Savory, Party Starter
- Product ID "2" (Doritos) → Classic Favorites, Spicy Adventure, Party Starter
- Product ID "3" (Smartfood Chocolate) → Sweet & Savory, Gourmet Selection
- Product ID "4" (Simply Trail Mix) → Protein Power, Gourmet Selection
- Product ID "5" (Chester's Jerky) → Spicy Adventure, Protein Power
- Product ID "6" (Cheetos) → Classic Favorites, Party Starter
- Product ID "8" (Smartfood Popcorn) → Sweet & Savory, Party Starter, Gourmet

---

### **Mode 2: Smart Pairing Bundle**

**Triggers when:**
- User adds a product NOT in any variety pack
- Example: Adding "Tostitos Energy Bites" (ID: 7)

**Shows:**
- Confirmation of added product
- 2 complementary products based on:
  - Same brand (highest priority)
  - Same category (variety)
  - Complementary categories
  - Similar price range
- Selectable products (click to toggle)
- Dynamic discount calculation
- Tiered discounts: 10% for 1 item, 15% for 2 items

**Pairing Rules:**
```
chips → chips, popcorn, jerky
chocolate → trail-mix, popcorn, energy
jerky → chips, trail-mix, energy
popcorn → chocolate, chips
trail-mix → jerky, chocolate, energy
energy → trail-mix, jerky
```

---

## Testing Scenarios

### **Test 1: Variety Pack Upsell (Lay's Chips)**

1. **Go to Products page** (`/products`)
2. **Find "Classic Sea Salt Chips" (Lay's)**
3. **Click "Add to Cart"**
4. **Wait 500ms** (toast appears first)
5. **Dialog appears** with:
   - ✅ Title: "Upgrade to Variety Pack!"
   - ✅ Green confirmation box showing Lay's added
   - ✅ "Classic Favorites Mix" pack details
   - ✅ Shows 18 items, Save $5.00
   - ✅ Price: $24.99 (was $29.99)
   - ✅ "Upgrade to Pack" button

6. **Click "Upgrade to Pack"**
7. **Expected Result:**
   - Dialog closes
   - All pack products added to cart (except Lay's already added)
   - Products have discount applied
   - All grouped with same `comboId`

8. **Try adding Lay's again**
9. **Expected Result:**
   - Dialog does NOT appear (session tracking)
   - Only toast shows

---

### **Test 2: Smart Pairing (Tostitos Energy)**

1. **Clear localStorage** (or use incognito)
2. **Go to Products page**
3. **Find "Matcha Energy Bites" (Tostitos)**
4. **Click "Add to Cart"**
5. **Dialog appears** with:
   - ✅ Title: "Complete Your Snack Box!"
   - ✅ Green confirmation showing Energy Bites added
   - ✅ 2 complementary products (likely Trail Mix + Jerky)
   - ✅ Products are clickable/selectable
   - ✅ No discount shown yet (nothing selected)

6. **Click on first product** (e.g., Trail Mix)
7. **Expected Result:**
   - Product highlights with primary border
   - Check icon appears
   - Discount box appears showing:
     - "Bundle Discount (10% off)"
     - Savings amount
     - Original vs. discounted total

8. **Click on second product** (e.g., Jerky)
9. **Expected Result:**
   - Both products highlighted
   - Discount updates to 15% off
   - Total savings increases
   - Button text: "Add 2 items & Save 15%"

10. **Click "Add 2 items & Save 15%"**
11. **Expected Result:**
    - Dialog closes
    - Both products added to cart with 15% discount
    - Grouped with same `comboId`
    - Original prices shown in cart with strikethrough

---

### **Test 3: Multiple Products - Different Modes**

1. **Add Lay's Chips** → Variety Pack Upsell appears
2. **Close dialog** (No thanks)
3. **Add Doritos** → Variety Pack Upsell appears (different pack)
4. **Close dialog**
5. **Add Tostitos Energy** → Smart Pairing appears
6. **Close dialog**
7. **Try adding Lay's again** → No dialog (session tracking)

---

### **Test 4: Bundle Products in Cart**

1. **Add Lay's Chips**
2. **In dialog, select Doritos + Cheetos**
3. **Click "Add 2 items & Save 15%"**
4. **Go to Cart page** (`/cart`)
5. **Expected Result:**
   - All 3 products show in cart
   - Doritos and Cheetos show:
     - Original price (strikethrough)
     - Discounted price (bold, primary color)
     - "15% OFF" badge
   - Lay's shows regular price (was added first)

---

### **Test 5: Session Tracking**

1. **Add Lay's Chips** → Dialog appears
2. **Close dialog**
3. **Add Lay's again** → No dialog
4. **Refresh page**
5. **Add Lay's again** → Dialog appears (session reset)

---

### **Test 6: Respects Other Nudges**

1. **Be logged in**
2. **Go idle for 5 seconds** → IdleNudgeDialog appears
3. **While idle dialog is open, add product to cart**
4. **Expected Result:**
   - Bundle dialog does NOT appear (respects activeNudge)
   - Only one nudge at a time

---

## Product Pairing Examples

Based on current inventory, here's what you'll see:

| Product Added | Mode | Suggested Products |
|---------------|------|-------------------|
| Lay's Chips (1) | Variety Pack | Classic Favorites Mix ($24.99, save $5) |
| Doritos (2) | Variety Pack | Classic Favorites Mix or Spicy Adventure |
| Smartfood Chocolate (3) | Variety Pack | Sweet & Savory Collection ($34.99, save $7) |
| Simply Trail Mix (4) | Variety Pack | Protein Power Box ($39.99, save $6) |
| Chester's Jerky (5) | Variety Pack | Spicy Adventure or Protein Power |
| Cheetos (6) | Variety Pack | Classic Favorites Mix |
| Tostitos Energy (7) | Smart Pairing | Trail Mix + Jerky (15% off) |
| Smartfood Popcorn (8) | Variety Pack | Sweet & Savory or Party Starter |

---

## Discount Calculation Examples

### Smart Pairing:

**Scenario 1: Add 1 item**
```
Base: Tostitos Energy ($8.49)
Add: Simply Trail Mix ($7.99)

Discount: 10% off
Savings: $1.65
Total: $14.83 (was $16.48)
```

**Scenario 2: Add 2 items**
```
Base: Tostitos Energy ($8.49)
Add: Simply Trail Mix ($7.99) + Chester's Jerky ($9.99)

Discount: 15% off
Savings: $3.97
Total: $22.50 (was $26.47)
```

### Variety Pack:

**Example: Classic Favorites Mix**
```
Individual prices:
- Lay's: $4.99
- Doritos: $5.49
- Cheetos: $3.99
Total: $14.47

Pack price: $24.99 (18 items)
Savings: $5.00
```

---

## UI/UX Features

### Variety Pack Mode:
- ✅ Large pack image
- ✅ Pack name and description
- ✅ Tags (bestseller, family-size, etc.)
- ✅ Item count display
- ✅ Savings highlighted in red
- ✅ Original price strikethrough
- ✅ Single "Upgrade" button

### Smart Pairing Mode:
- ✅ Added product confirmation (green box)
- ✅ Clickable product cards
- ✅ Visual selection feedback (border + check)
- ✅ Real-time discount calculation
- ✅ Discount breakdown box
- ✅ Dynamic button text
- ✅ Disabled state when nothing selected

### Both Modes:
- ✅ Smooth animations
- ✅ Mobile responsive
- ✅ Keyboard accessible
- ✅ "No thanks" option
- ✅ Auto-close on action
- ✅ Respects NudgeContext

---

## Common Issues & Solutions

### ❌ **Dialog Not Appearing**

**Possible Causes:**
1. **Already seen for this product**
   - Solution: Clear localStorage or refresh page
   - Check: `localStorage.getItem('upsellSeen')`

2. **Product added as part of bundle**
   - Solution: This is expected - won't show for bundle items
   - Check: Look for `comboId` in addToCart call

3. **Another nudge is active**
   - Solution: Close other nudges first
   - Check: Only one nudge can be active at a time

4. **Too fast clicking**
   - Solution: Wait for 500ms delay after toast

### ❌ **Wrong Products Suggested**

**Possible Causes:**
1. **Pairing logic needs adjustment**
   - Check: `src/lib/productPairing.ts` scoring rules
   - Modify: Category pairings or brand boost

2. **Out of stock products**
   - Check: Only in-stock products are suggested
   - Verify: `product.inStock === true`

### ❌ **Discount Not Applied**

**Possible Causes:**
1. **ComboId not set**
   - Check: Cart items should have `comboId` field
   - Verify: All bundle items share same `comboId`

2. **Calculation error**
   - Check: `calculateBundleDiscount` function
   - Verify: Discount percent matches selection count

---

## Performance Notes

### Session Tracking:
- Uses localStorage (persistent across tabs)
- Resets on browser close/refresh
- Gracefully handles localStorage errors

### Pairing Algorithm:
- O(n) complexity (linear scan)
- Scores all products once
- Sorts and returns top 2
- Fast even with 100+ products

### Dialog Rendering:
- Lazy evaluation (only when open)
- Conditional mode detection
- Minimal re-renders
- Smooth animations

---

## Accessibility

✅ **Keyboard Navigation:**
- Tab through products
- Enter/Space to select
- Esc to close dialog

✅ **Screen Readers:**
- Proper ARIA labels
- Semantic HTML
- Focus management

✅ **Visual:**
- High contrast borders
- Clear selection states
- Readable font sizes
- Color-blind friendly

---

## Analytics Tracking (Future)

Consider tracking:
- Dialog appearance rate
- Conversion rate (accept vs. dismiss)
- Mode distribution (variety vs. pairing)
- Average bundle size
- Revenue impact (AOV increase)
- Most popular pairings

---

## Next Steps

1. ✅ **Test all scenarios** above
2. 📊 **Monitor conversion rates**
3. 🔧 **Adjust pairing rules** based on data
4. 💰 **Experiment with discount tiers**
5. 🎨 **A/B test UI variations**
6. 📈 **Track AOV impact**

---

## Summary

The Bundle/Upsell Nudge is now fully implemented with:

✅ **Hybrid approach** - Variety Pack OR Smart Pairing  
✅ **Smart pairing logic** - Category + brand based  
✅ **Tiered discounts** - 10% for 1, 15% for 2  
✅ **Session tracking** - No spam, shows once  
✅ **Cart integration** - Automatic trigger  
✅ **Nudge coordination** - Respects other nudges  
✅ **Mobile responsive** - Works on all devices  
✅ **Accessible** - Keyboard + screen reader support  

Ready to test and optimize! 🚀
