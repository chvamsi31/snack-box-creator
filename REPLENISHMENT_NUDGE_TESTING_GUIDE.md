# Replenishment Nudge Testing Guide

## Overview
The Replenishment Nudge uses a Hybrid approach to predict when users need to reorder consumable products, combining time-based estimates with learned purchase frequency patterns.

---

## Implementation Complete ✅

### What Was Built:

1. **Replenishment Logic Utility** (`replenishmentLogic.ts`)
   - Hybrid prediction algorithm
   - Category-based consumption periods
   - Personal frequency calculation
   - Urgency level determination
   - Session tracking (24-hour cooldown)

2. **ReplenishmentNudgeDialog Component**
   - Shows up to 3 products needing replenishment
   - Color-coded urgency indicators
   - One-click reorder functionality
   - "Add All to Cart" option
   - "Remind Me Later" (24h snooze)

3. **Auth Integration**
   - Triggers on login
   - Fetches order history
   - Analyzes replenishment needs
   - 3-second delay for smooth UX

4. **Nudge Coordination**
   - Added "replenishment" to NudgeContext
   - Respects other active nudges
   - Only one nudge at a time

---

## How It Works

### **Hybrid Prediction Algorithm:**

```
For each product in catalog:
  1. Get user's order history for this product
  2. If no orders → Skip (no replenishment needed)
  3. If 1 order → Use category-based period
  4. If 2+ orders → Calculate personal frequency
     - Use MIN(personal frequency, category period)
     - More conservative approach
  5. Calculate days since last purchase
  6. If days >= (period * 0.8) → Needs replenishment
  7. Calculate urgency level
  8. Generate contextual message
```

### **Consumption Periods:**

| Category | Days | Reasoning |
|----------|------|-----------|
| chips | 7 | Daily snacking |
| popcorn | 10 | Moderate consumption |
| chocolate | 14 | Occasional treat |
| jerky | 14 | High protein, slower |
| trail-mix | 21 | Healthy snacking |
| energy | 21 | Occasional boost |

### **Urgency Levels:**

- 🔴 **High (Red):** ≥100% consumed (past expected period)
- 🟡 **Medium (Yellow):** 80-99% consumed
- 🟢 **Low (Green):** <80% consumed (shouldn't show, but included for completeness)

### **Trigger Threshold:**

Products show when **80% consumed**:
- Chips (7 days) → Show at 5.6 days
- Chocolate (14 days) → Show at 11.2 days
- Trail Mix (21 days) → Show at 16.8 days

---

## Testing Scenarios

### **Prerequisites:**

You need a user account with order history. Use the backend API to:
1. Create a user account
2. Create orders with different dates
3. Login to see replenishment nudge

**Note:** If you don't have a backend, you can modify the code temporarily to use mock order data for testing.

---

### **Test 1: New User (No Orders)**

**Setup:**
- Login with a new user account
- No order history

**Expected Result:**
- ❌ No replenishment nudge appears
- ✅ Other nudges still work (idle, bundle, etc.)

**Why:**
- No purchase history = nothing to replenish
- System gracefully handles empty order history

---

### **Test 2: Single Purchase - Time-Based Prediction**

**Setup:**
- User purchased "Lay's Chips" 6 days ago
- No other purchases of Lay's

**Expected Result:**
- ✅ Nudge appears 3 seconds after login
- ✅ Shows Lay's Chips
- ✅ Message: "Last ordered: 6 days ago"
- ✅ Urgency: 🟡 Medium (6/7 = 85% consumed)
- ✅ Message: "Getting low"
- ❌ No "You usually reorder every X days" (only 1 purchase)

**Calculation:**
```
Category: chips → 7 days
Trigger: 7 * 0.8 = 5.6 days
Days since: 6 days
Result: 6 >= 5.6 → SHOW ✓
```

---

### **Test 3: Multiple Purchases - Frequency-Based Prediction**

**Setup:**
- User purchased "Lay's Chips":
  - Jan 1, 2025
  - Jan 8, 2025 (7 days later)
  - Jan 15, 2025 (7 days later)
- Today: Jan 21, 2025 (6 days since last)

**Expected Result:**
- ✅ Nudge appears
- ✅ Shows Lay's Chips
- ✅ Message: "Last ordered: 6 days ago"
- ✅ Additional message: "You usually reorder every 7 days"
- ✅ Urgency: 🟡 Medium
- ✅ Message: "Time for your usual reorder"

**Calculation:**
```
Personal frequency: (7 + 7) / 2 = 7 days
Category: 7 days
Use: MIN(7, 7) = 7 days
Trigger: 7 * 0.8 = 5.6 days
Days since: 6 days
Result: 6 >= 5.6 → SHOW ✓
```

---

### **Test 4: Irregular Purchase Pattern**

**Setup:**
- User purchased "Doritos":
  - Jan 1, 2025
  - Jan 20, 2025 (19 days later)
- Today: Jan 26, 2025 (6 days since last)

**Expected Result:**
- ✅ Nudge appears
- ✅ Shows Doritos
- ✅ Uses category period (7 days) not personal (19 days)
- ✅ Urgency: 🟡 Medium

**Calculation:**
```
Personal frequency: 19 days
Category: 7 days (chips)
Use: MIN(19, 7) = 7 days (more conservative)
Trigger: 7 * 0.8 = 5.6 days
Days since: 6 days
Result: 6 >= 5.6 → SHOW ✓
```

**Why conservative?**
- User might have bought in bulk
- Better to remind early than late
- Avoids annoying users with late reminders

---

### **Test 5: Multiple Products - Priority Sorting**

**Setup:**
- Lay's: Last ordered 6 days ago (medium urgency)
- Doritos: Last ordered 8 days ago (high urgency)
- Trail Mix: Last ordered 20 days ago (medium urgency)

**Expected Result:**
- ✅ Nudge shows all 3 products
- ✅ Order: Doritos (high) → Trail Mix (20 days) → Lay's (6 days)
- ✅ Doritos has red badge 🔴
- ✅ Others have yellow badge 🟡

**Sorting Logic:**
```
1. Sort by urgency (high > medium > low)
2. Within same urgency, sort by days (descending)
```

---

### **Test 6: High Urgency (Past Expected Period)**

**Setup:**
- User purchased "Lay's Chips" 10 days ago
- Category period: 7 days

**Expected Result:**
- ✅ Nudge appears
- ✅ Urgency: 🔴 High (10/7 = 142% consumed)
- ✅ Message: "Running low!"
- ✅ Red badge and icon

**Calculation:**
```
Days since: 10 days
Period: 7 days
Percent: 10/7 = 1.42 (142%)
Result: >= 1.0 → HIGH urgency
```

---

### **Test 7: Very Old Purchase**

**Setup:**
- User purchased "Chester's Jerky" 90 days ago
- Category period: 14 days

**Expected Result:**
- ✅ Nudge appears
- ✅ Urgency: 🔴 High
- ✅ Special message: "Been a while - miss it?"
- ✅ Gentle re-engagement tone

**Why special message?**
- 90 days > 60 days threshold
- User might have stopped buying
- Friendly reminder, not pushy

---

### **Test 8: 24-Hour Cooldown**

**Setup:**
1. Login → Nudge appears with Lay's
2. Click "Remind Me Later"
3. Logout and login again immediately

**Expected Result:**
- ❌ Nudge does NOT appear
- ✅ Lay's is filtered out (cooldown active)
- ✅ Other products (if any) still show

**Wait 24 hours:**
- ✅ Login again → Nudge appears with Lay's

**Cooldown Logic:**
```
localStorage: {
  "replenishmentNudgeSeen": {
    "1": 1738368000000  // timestamp
  }
}

Check: (now - timestamp) / (1000 * 60 * 60) < 24
```

---

### **Test 9: Reorder Functionality**

**Setup:**
- Nudge appears with Lay's Chips

**Actions:**
1. Click "Reorder Now" on Lay's
2. Check cart

**Expected Result:**
- ✅ Lay's added to cart
- ✅ Button changes to "Added to Cart" (disabled)
- ✅ Toast: "Added Lay's Chips to cart"
- ✅ Other products still have "Reorder Now" button

---

### **Test 10: Add All to Cart**

**Setup:**
- Nudge shows 3 products: Lay's, Doritos, Trail Mix

**Actions:**
1. Click "Add All to Cart"

**Expected Result:**
- ✅ All 3 products added to cart
- ✅ Dialog closes
- ✅ All products marked as seen (24h cooldown)
- ✅ Toast notifications for each product

---

### **Test 11: Respects Other Nudges**

**Setup:**
1. Login (replenishment check starts)
2. Immediately add product to cart (bundle nudge triggers)

**Expected Result:**
- ✅ Bundle nudge appears first (immediate trigger)
- ✅ Replenishment nudge waits (respects activeNudge)
- ✅ After closing bundle nudge, replenishment appears

**Or:**
1. Be idle for 5 seconds (idle nudge appears)
2. Login in another tab

**Expected Result:**
- ✅ Only one nudge active at a time
- ✅ Replenishment waits for idle nudge to close

---

### **Test 12: Out of Stock Products**

**Setup:**
- User needs to replenish "Smartfood Popcorn"
- Product is out of stock (`inStock: false`)

**Expected Result:**
- ❌ Popcorn does NOT appear in nudge
- ✅ Only in-stock products show
- ✅ System filters out unavailable products

---

### **Test 13: Mobile Responsiveness**

**Setup:**
- Open on mobile device or resize browser

**Expected Result:**
- ✅ Dialog fits screen width
- ✅ Product cards stack vertically
- ✅ Images scale appropriately
- ✅ Buttons are touch-friendly (min 44px)
- ✅ Text is readable (min 14px)
- ✅ Scrollable if content exceeds viewport

---

## Mock Data for Testing (If No Backend)

If you don't have a backend with order history, you can temporarily modify `AuthContext.tsx` to use mock data:

```typescript
// Temporary mock orders for testing
const mockOrders: OrderResponse[] = [
  {
    orderId: 1,
    userEmail: "test@example.com",
    productName: "Classic Sea Salt Chips",
    quantity: 1,
    price: 4.99,
    totalPrice: 4.99,
    status: "delivered",
    orderDate: "2025-01-15", // 6 days ago if today is Jan 21
  },
  {
    orderId: 2,
    userEmail: "test@example.com",
    productName: "Classic Sea Salt Chips",
    quantity: 1,
    price: 4.99,
    totalPrice: 4.99,
    status: "delivered",
    orderDate: "2025-01-08", // 13 days ago
  },
  {
    orderId: 3,
    userEmail: "test@example.com",
    productName: "Spicy Jalapeño Poppers",
    quantity: 1,
    price: 5.49,
    totalPrice: 5.49,
    status: "delivered",
    orderDate: "2025-01-13", // 8 days ago
  },
];

// In checkReplenishment function, replace API call:
const orders = mockOrders; // Instead of: await api.getOrdersByEmail(...)
```

---

## Debugging Tips

### **Check Console Logs:**

The system logs helpful information:
```
"No orders found or error checking replenishment"
→ User has no order history or API error

"Replenishment check complete: X items found"
→ System found X products needing replenishment
```

### **Check localStorage:**

```javascript
// View cooldown tracking
localStorage.getItem('replenishmentNudgeSeen')
// Returns: {"1": 1738368000000, "2": 1738368000000}

// Clear cooldown (for testing)
localStorage.removeItem('replenishmentNudgeSeen')
```

### **Verify Order Dates:**

Make sure order dates are in the past:
```javascript
const daysSince = getDaysSinceLastPurchase("2025-01-15");
console.log(daysSince); // Should be positive number
```

### **Check Product Matching:**

Order `productName` must match Product `name` exactly:
```
Order: "Classic Sea Salt Chips"
Product: "Classic Sea Salt Chips"
✓ Match

Order: "Lays Chips"
Product: "Classic Sea Salt Chips"
✗ No match
```

---

## Common Issues & Solutions

### ❌ **Nudge Not Appearing**

**Possible Causes:**

1. **No order history**
   - Solution: Create orders via backend API
   - Check: `api.getOrdersByEmail(email)`

2. **Orders too recent**
   - Solution: Use older order dates
   - Check: Days since purchase >= (period * 0.8)

3. **Product names don't match**
   - Solution: Ensure exact name match
   - Check: Order productName === Product name

4. **Cooldown active**
   - Solution: Clear localStorage or wait 24h
   - Check: `localStorage.getItem('replenishmentNudgeSeen')`

5. **Another nudge is active**
   - Solution: Close other nudges first
   - Check: Only one nudge at a time

### ❌ **Wrong Urgency Level**

**Possible Causes:**

1. **Calculation error**
   - Check: daysSince / consumptionPeriod
   - Verify: >= 1.0 = high, >= 0.8 = medium

2. **Wrong consumption period**
   - Check: Product category matches CONSUMPTION_PERIODS
   - Verify: Default is 14 days if not found

### ❌ **Personal Frequency Not Showing**

**Possible Causes:**

1. **Only 1 purchase**
   - Expected: Need 2+ purchases for frequency
   - Check: Order history count

2. **Calculation error**
   - Check: calculatePurchaseFrequency() logic
   - Verify: Returns average days between purchases

---

## Performance Notes

### **Efficiency:**

- ✅ Checks on login only (not every page)
- ✅ Filters out-of-stock products early
- ✅ Limits to top 3 products (sorted by urgency)
- ✅ Uses localStorage for cooldown (no API calls)
- ✅ Async order fetching (non-blocking)

### **API Calls:**

- Login: 1 call to `getOrdersByEmail()`
- No additional calls for replenishment logic
- All calculations done client-side

---

## Success Metrics to Track

### **Key Performance Indicators:**

1. **Nudge Appearance Rate:**
   - % of logins that trigger nudge
   - Target: 30-40% (users with eligible products)

2. **Conversion Rate:**
   - % of nudges that result in reorder
   - Target: 20-30%

3. **Reorder Speed:**
   - Days between purchases (before vs after)
   - Target: -10-15% (faster repurchase)

4. **Multi-Product Adoption:**
   - % using "Add All" vs individual reorders
   - Target: 40-50% use "Add All"

5. **Cooldown Effectiveness:**
   - % of users who reorder after "Remind Me Later"
   - Target: 15-20% conversion after 24h

---

## Next Steps

1. ✅ **Test all scenarios** above
2. 📊 **Monitor conversion rates**
3. 🔧 **Adjust consumption periods** based on data
4. 💰 **Measure repeat purchase impact**
5. 🎨 **A/B test messaging** variations
6. 📈 **Track customer lifetime value** increase

---

## Summary

The Replenishment Nudge is now fully implemented with:

✅ **Hybrid prediction** - Time + frequency based  
✅ **Smart urgency levels** - Color-coded indicators  
✅ **One-click reorder** - Instant add to cart  
✅ **Multi-product support** - Up to 3 items  
✅ **24-hour cooldown** - Prevents spam  
✅ **Nudge coordination** - Respects other nudges  
✅ **Mobile responsive** - Works on all devices  
✅ **Graceful degradation** - Handles all edge cases  

Ready to test and see increased repeat purchases! 🚀
