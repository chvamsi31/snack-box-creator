# ExitIntentDialog Testing Guide

## Overview
The ExitIntentDialog has been implemented on both **Product Detail pages** and the **Cart page** to prevent users from leaving during critical moments in the purchase journey.

---

## What Was Fixed & Improved

### 1. **Enhanced Detection Sensitivity**
- Changed threshold from `clientY <= 0` to `clientY <= 10` for more reliable triggering
- Added console logs for debugging
- Improved event listener setup

### 2. **Made Component Reusable**
- Added `pageType` prop ("product" or "cart")
- Made `product` prop optional
- Falls back to first cart item if no product provided

### 3. **Added to Cart Page**
- Now protects the checkout flow
- Shows cart-specific messaging

### 4. **Better Reset Logic**
- Dialog can trigger again after 5 seconds of closing
- Prevents spam but allows re-triggering if user tries to exit multiple times

---

## How to Test ExitIntentDialog

### **Test 1: Product Detail Page - Mouse Exit Intent**

1. **Navigate to a product page:**
   - Go to http://localhost:5173/products
   - Click on any product to open its detail page

2. **Trigger exit intent:**
   - Move your mouse cursor **slowly upward** toward the browser tabs/address bar
   - Move it **all the way to the top edge** of the browser window
   - The cursor should leave the viewport area

3. **Expected Result:**
   - Console should log: "Exit intent triggered - mouse left top"
   - Dialog appears with:
     - Title: "Don't Go Yet!"
     - Product-specific message
     - Product image and details
     - "Add to Cart & Stay" button (if cart empty)
     - "Go to Cart" button (if cart has items)

4. **Troubleshooting if not working:**
   - Open browser DevTools (F12) → Console tab
   - Look for "ExitIntentDialog mounted and listening" message
   - Try moving cursor more slowly to the very top
   - Make sure you're moving to the TOP of the window (not sides or bottom)
   - Try refreshing the page and testing again

---

### **Test 2: Product Detail Page - Back Button**

1. **Navigate to a product page:**
   - Go to Products page
   - Click on a product
   - You should now be on `/products/{id}`

2. **Trigger back button:**
   - Click the browser's **Back button** (or press Alt+Left Arrow / Cmd+Left Arrow)

3. **Expected Result:**
   - Console should log: "Exit intent triggered - back button"
   - Dialog appears immediately
   - You stay on the product page (navigation is prevented)

4. **Troubleshooting:**
   - Check console for the log message
   - Make sure you're using browser back button, not the "Back to Products" link on the page
   - Try refreshing and testing again

---

### **Test 3: Cart Page - Mouse Exit Intent**

1. **Add items to cart:**
   - Browse products and add 1-2 items to cart
   - Navigate to Cart page (click cart icon or go to /cart)

2. **Trigger exit intent:**
   - Move your mouse cursor **slowly to the top** of the browser window
   - Exit through the top edge

3. **Expected Result:**
   - Console should log: "Exit intent triggered - mouse left top"
   - Dialog appears with:
     - Title: "Complete Your Order!"
     - Message: "Your cart is almost ready — want to checkout with 1-click?"
     - First cart item displayed
     - "Complete Checkout" button

---

### **Test 4: Cart Page - Back Button**

1. **Be on Cart page with items**

2. **Click browser Back button**

3. **Expected Result:**
   - Dialog appears
   - You stay on cart page
   - Console logs the trigger

---

### **Test 5: Multiple Triggers**

1. **Trigger the dialog** (any method)
2. **Close it** by clicking "No thanks, I'll leave"
3. **Wait 5 seconds**
4. **Try to trigger again** (mouse exit or back button)

**Expected Result:**
- Dialog should appear again after the 5-second cooldown

---

## Common Issues & Solutions

### ❌ **Dialog Not Appearing**

**Possible Causes:**
1. **Mouse not reaching top edge**
   - Solution: Move cursor more slowly and deliberately to the very top
   - The threshold is `clientY <= 10` pixels from top

2. **Another nudge is active**
   - Solution: Close any other dialogs (Idle, Hesitation) first
   - Only one nudge can be active at a time

3. **Already triggered once**
   - Solution: Wait 5 seconds after closing, or refresh the page

4. **Console errors**
   - Solution: Check browser console for errors
   - Make sure all dependencies are installed

### ❌ **Back Button Not Working**

**Possible Causes:**
1. **History state not set up**
   - Solution: Refresh the page to reinitialize
   
2. **Using in-page navigation**
   - Solution: Use browser's back button, not page links

### ❌ **Dialog Shows Wrong Content**

**Possible Causes:**
1. **No product passed on Product Detail page**
   - Solution: Check that product exists and is passed as prop

2. **Empty cart on Cart page**
   - Solution: Add items to cart first

---

## Debug Mode

To see detailed logs, open **Browser DevTools → Console** and look for:

```
ExitIntentDialog mounted and listening
Exit intent triggered - mouse left top
Exit intent triggered - back button
```

These logs will help you understand if the component is:
- ✅ Mounted correctly
- ✅ Detecting events
- ✅ Triggering the dialog

---

## Technical Details

### Mouse Exit Detection
- Listens to `document.mouseleave` event
- Triggers when `e.clientY <= 10` (within 10px of top)
- Only triggers from TOP exit (not sides/bottom)

### Back Button Detection
- Uses `popstate` event
- Pushes history state to intercept navigation
- Prevents actual navigation when dialog shows

### Cooldown System
- 5-second cooldown after closing
- Prevents spam but allows re-triggering
- Resets on page refresh

### Nudge Coordination
- Uses `NudgeContext` to prevent multiple nudges
- Checks `activeNudge === null` before showing
- Sets `activeNudge = "exit"` when shown

---

## Expected Behavior Summary

| Page Type | Trigger | Dialog Title | Primary Action |
|-----------|---------|--------------|----------------|
| Product Detail | Mouse Exit | "Don't Go Yet!" | Add to Cart & Stay |
| Product Detail | Back Button | "Don't Go Yet!" | Add to Cart & Stay |
| Product Detail (with cart items) | Any | "Don't Go Yet!" | Go to Cart |
| Cart | Mouse Exit | "Complete Your Order!" | Complete Checkout |
| Cart | Back Button | "Complete Your Order!" | Complete Checkout |

---

## Next Steps

If the dialog still doesn't appear after following this guide:

1. **Check browser console** for errors
2. **Verify component is mounted** (look for console log)
3. **Try different browsers** (Chrome, Firefox, Edge)
4. **Clear browser cache** and refresh
5. **Check that NudgeProvider** is wrapping the app in App.tsx

The implementation is complete and should work as expected. The key is moving your mouse slowly and deliberately to the very top edge of the browser window!
