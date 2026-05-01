# WhatsApp Order Submission Numbers Fix

## Overview
Updated the checkout flow to allow users to choose between two official Rich Tym Luxe WhatsApp numbers for order submission after successful Paystack payment.

## Business WhatsApp Numbers
- **0597705175** (international: 233597705175)
- **0503390421** (international: 233503390421)

Both numbers are now available for order submission.

---

## Files Modified

### 1. checkout.html
**Changes:**
- Added WhatsApp number selector radio group (lines 660-673)
- Appears after payment verification, before "Submit Order via WhatsApp" button
- Radio buttons:
  - `value="233503390421"` → displays 0503390421 (checked by default)
  - `value="233597705175"` → displays 0597705175
- Container ID: `whatsappNumberSelector`
- Initially hidden (`display: none`), shown after payment success

**HTML Structure:**
```html
<div class="whatsapp-number-selector" id="whatsappNumberSelector" style="display: none; margin-bottom: 12px;">
  <label>Submit order to:</label>
  <div class="radio-group" style="display: flex; gap: 16px;">
    <label>
      <input type="radio" name="whatsappNumber" value="233503390421" checked>
      <span>0503390421</span>
    </label>
    <label>
      <input type="radio" name="whatsappNumber" value="233597705175">
      <span>0597705175</span>
    </label>
  </div>
</div>
```

### 2. assets/js/main.js
**Changes:**

#### In `checkPaymentCallback()` function (lines 1240-1256):
- Added `whatsappNumberSelector` element reference
- Added code to show selector when payment is verified:
  ```javascript
  if (whatsappNumberSelector) whatsappNumberSelector.style.display = 'block';
  ```

#### In `submitWhatsAppOrder()` function (lines 1188-1193):
- Replaced hardcoded phone number with dynamic selection:
  ```javascript
  // Get selected WhatsApp number from checkout form
  const selectedNumberRadio = document.querySelector('input[name="whatsappNumber"]:checked');
  const whatsappNumber = selectedNumberRadio ? selectedNumberRadio.value : '233503390421';
  
  // Open WhatsApp with selected number
  window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  ```

**Previous code:**
```javascript
const whatsappNumbers = ['233503390421', '233597705175'];
const primaryNumber = whatsappNumbers[0];
window.open(`https://wa.me/${primaryNumber}?text=${encodedMessage}`, '_blank');
```

---

## Flow After Changes

1. User fills checkout form and clicks "Pay with Paystack"
2. Payment processed via Paystack
3. Paystack redirects back to checkout.html with success status
4. `checkPaymentCallback()` verifies payment and shows:
   - Success message
   - WhatsApp number selector (both 0597705175 and 0503390421)
   - "Submit Order via WhatsApp" button
   - Hides "Back to Cart" button
5. User selects desired WhatsApp number (radio button)
6. User clicks "Submit Order via WhatsApp"
7. `submitWhatsAppOrder()` reads selected number and opens WhatsApp with order message
8. Success message displayed, button hidden, "Back to Cart" shown
9. Cart cleared after 2 seconds

---

## Verification

### Testing Checklist
- ✅ After verified Paystack payment, WhatsApp number selector appears
- ✅ Both numbers (0597705175 and 0503390421) are selectable
- ✅ Default selection is 0503390421 (first option)
- ✅ Selecting either number and clicking submit opens WhatsApp with correct number
- ✅ WhatsApp message format remains unchanged
- ✅ Payment verification still required before WhatsApp submission
- ✅ No WhatsApp submission happens before payment verification
- ✅ Cart clears only after successful WhatsApp order generation (after button click)
- ✅ No console errors

### Existing WhatsApp Access
- **Floating WhatsApp buttons** on mobile-phones.html already link to both numbers directly (for general inquiries)
- **Checkout flow** now allows selection between both numbers for paid orders

---

## Notes

- The `sendToWhatsApp()` function in `assets/js/main.js` (lines 481-516) remains unchanged but is not currently used in any HTML. It's a legacy function.
- The `addToCartAndWhatsApp()` function in `mobile-phones.html` (line 849) is defined but not used. It also uses a hardcoded number but is not part of the checkout flow.
- The WhatsApp number selector only appears after successful payment verification, ensuring orders are paid before submission.
- The message format is identical regardless of which number is selected.
- Both numbers are in international format (233...) for WhatsApp API compatibility.

---

## Business Impact

Customers can now submit paid orders to either of the two official Rich Tym Luxe WhatsApp numbers, providing flexibility and ensuring orders reach the correct department/store.
