# Buyer Rating System - Testing Checklist

## Pre-Testing Setup
- [ ] Ensure npm dependencies are installed
- [ ] Start the frontend dev server: `npm run dev`
- [ ] Verify API_BASE_URL is correctly configured in `src/services/apiClient.js`
- [ ] Open browser to http://localhost:5173 (or your dev server URL)
- [ ] Have browser DevTools open (F12) for debugging

---

## Section 1: Component Creation Verification

### StarRating.jsx
- [ ] File exists at: `src/components/rating/StarRating.jsx`
- [ ] Imports: `Star` from lucide-react
- [ ] Exports default function `StarRating`
- [ ] Props: rating, onRatingChange, readOnly, size, interactive
- [ ] Renders 5 stars correctly
- [ ] Star hover effects work (scale up)

### BuyerRatingForm.jsx
- [ ] File exists at: `src/components/rating/BuyerRatingForm.jsx`
- [ ] Imports: useState, useTranslation, toast, StarRating, Button
- [ ] Exports default function `BuyerRatingForm`
- [ ] Props: transaction, onSubmitSuccess, onSubmitError
- [ ] Form has star rating input
- [ ] Form has comment textarea (max 500 chars)
- [ ] Character counter displays correctly
- [ ] Submit button exists and shows loading state

### BuyerRatingCard.jsx
- [ ] File exists at: `src/components/rating/BuyerRatingCard.jsx`
- [ ] Imports: useTranslation, format, date-fns, Card, StarRating
- [ ] Exports default function `BuyerRatingCard`
- [ ] Props: rating, transaction
- [ ] Shows buyer information
- [ ] Shows read-only stars
- [ ] Shows comment if available
- [ ] Shows formatted submission date

### BuyerRatingsList.jsx
- [ ] File exists at: `src/components/rating/BuyerRatingsList.jsx`
- [ ] Imports: useState, useTranslation, BuyerRatingForm, BuyerRatingCard
- [ ] Exports default function `BuyerRatingsList`
- [ ] Props: transactions (array)
- [ ] Maps through transactions
- [ ] Shows forms for unrated transactions
- [ ] Shows cards for rated transactions
- [ ] Shows warnings for pending transactions

### BuyerRatingsPage.jsx
- [ ] File exists at: `src/pages/BuyerRatingsPage.jsx`
- [ ] Imports: useState, useEffect, useTranslation, TopNavigationBar, BuyerRatingsList
- [ ] Exports default function `BuyerRatingsPage`
- [ ] Mock data generator function exists
- [ ] useEffect loads mock data on mount
- [ ] Shows loading spinner
- [ ] Shows error state with retry

---

## Section 2: Service Layer Verification

### buyerRatingService.js
- [ ] File exists at: `src/services/buyerRatingService.js`
- [ ] Imports: api from apiClient
- [ ] Exports function: `getSellerCompletedTransactions(sellerId)`
- [ ] Exports function: `submitBuyerRating(transactionId, data)`
- [ ] Exports function: `getBuyerRatings(buyerId)`
- [ ] Exports function: `getTransactionRating(transactionId)`
- [ ] Exports function: `getSellerRatings(sellerId)`
- [ ] All functions use correct API paths

---

## Section 3: Routing & Navigation Verification

### App.jsx
- [ ] Imports: BuyerRatingsPage component
- [ ] Route exists: `/seller/buyer-ratings`
- [ ] Route is protected with: `<ProtectedRoute requiredRole="SELLER">`
- [ ] Route renders: `<BuyerRatingsPage />`

### SellerDashboard.jsx
- [ ] "Buyer Ratings" card exists in quick access section
- [ ] Button navigates to: `/seller/buyer-ratings`
- [ ] Button text shows in both English and Arabic
- [ ] Card layout updated to 3-column grid (md:grid-cols-3)
- [ ] New card styling matches existing cards

---

## Section 4: Internationalization Verification

### en/rating.json
- [ ] File exists at: `src/i18n/locales/en/rating.json`
- [ ] Contains `page.title` and `page.description`
- [ ] Contains `form.*` keys for form labels
- [ ] Contains `card.*` keys for card display
- [ ] Contains `validationMessages.*` keys
- [ ] Contains `messages.*` keys for toasts

### ar/rating.json
- [ ] File exists at: `src/i18n/locales/ar/rating.json`
- [ ] Contains all same keys as English version
- [ ] Arabic text is properly translated
- [ ] RTL text directions are considered

### i18n/index.js
- [ ] Imports: `arRating` from ar/rating.json
- [ ] Imports: `enRating` from en/rating.json
- [ ] Resources include: `rating: arRating` for Arabic
- [ ] Resources include: `rating: enRating` for English

---

## Section 5: Mock Data Verification

### Mock Transactions Structure
- [ ] Transaction 1: Unrated, completed
  - [ ] Has: transactionId, auctionId, auctionTitle
  - [ ] Has: buyerId, buyerName, finalPrice
  - [ ] Status: "completed"
  - [ ] hasRating: false

- [ ] Transaction 2: Already rated, completed
  - [ ] Has all fields from Transaction 1
  - [ ] hasRating: true
  - [ ] Has rating object with: rating, comment, submittedAt

- [ ] Transaction 3: Unrated, completed
  - [ ] Same as Transaction 1

- [ ] Transaction 4: Pending, not ratable
  - [ ] Status: "pending"
  - [ ] Should show warning message

---

## Section 6: Feature Testing

### Test 1: Component Rendering
1. [ ] Navigate to `/seller/buyer-ratings`
2. [ ] Page loads without errors
3. [ ] Page title displays correctly
4. [ ] Mock transactions display
5. [ ] No console errors

### Test 2: Star Rating Selection
1. [ ] Hover over stars - they scale up
2. [ ] Click star 1 - only 1 star fills
3. [ ] Click star 3 - 3 stars fill
4. [ ] Click star 5 - all 5 stars fill
5. [ ] Previously selected rating resets when clicking different star

### Test 3: Form Validation
1. [ ] Submit button is disabled by default (no stars selected)
2. [ ] Click "Submit Rating" without selecting stars
3. [ ] Error message appears: "Please select at least one star."
4. [ ] Error toast shows
5. [ ] After selecting a star, submit button becomes enabled

### Test 4: Comment Field
1. [ ] Type in comment field
2. [ ] Character counter updates in real-time
3. [ ] Max 500 characters enforced
4. [ ] Can submit form with empty comment
5. [ ] Comment appears in submitted rating card if provided

### Test 5: Form Submission
1. [ ] Select 5 stars
2. [ ] Add a test comment: "Great buyer!"
3. [ ] Click "Submit Rating"
4. [ ] Loading state shows (button text changes)
5. [ ] Success toast appears
6. [ ] Form converts to read-only card
7. [ ] Stars display as filled
8. [ ] Comment displays in card
9. [ ] Submission date displays

### Test 6: Already Rated Transactions
1. [ ] Find transaction 2 (already rated)
2. [ ] Verify card displays instead of form
3. [ ] Card shows rating stars filled correctly
4. [ ] Card shows previous comment
5. [ ] Card shows submission date

### Test 7: Pending Transactions
1. [ ] Find transaction 4 (pending status)
2. [ ] Verify warning message shows
3. [ ] Verify form is not available
4. [ ] Message says: "This transaction is still pending..."

### Test 8: Empty State
1. [ ] Clear mock data from BuyerRatingsPage
2. [ ] Empty state should show
3. [ ] Message: "No completed transactions to rate yet."
4. [ ] Alert icon displays

### Test 9: Error Handling
1. [ ] Modify API URL to invalid address
2. [ ] Refresh page
3. [ ] Error state shows
4. [ ] "Try Again" button appears
5. [ ] Click "Try Again" button
6. [ ] Retries loading

### Test 10: Language Switching
1. [ ] Navigate to `/seller/buyer-ratings`
2. [ ] Click language switcher (top navigation)
3. [ ] All text translates to Arabic
4. [ ] Page switches to RTL layout
5. [ ] All text aligns correctly (right-to-left)
6. [ ] Stars remain clickable and functional
7. [ ] Switch back to English
8. [ ] Page switches back to LTR layout

### Test 11: Mobile Responsiveness
1. [ ] Open DevTools (F12)
2. [ ] Set viewport to mobile (375px width)
3. [ ] Page title readable
4. [ ] Transactions stack vertically
5. [ ] Form inputs readable
6. [ ] Star buttons accessible (touch-friendly)
7. [ ] Submit button full width on mobile
8. [ ] Text area resizes properly
9. [ ] Test tablet viewport (768px)
10. [ ] Test desktop viewport (1440px)

### Test 12: Navigation
1. [ ] From SellerDashboard, click "Buyer Ratings" button
2. [ ] Navigate to `/seller/buyer-ratings`
3. [ ] TopNavigationBar displays correctly
4. [ ] Can navigate back to dashboard

### Test 13: State Persistence
1. [ ] Rate a transaction with 4 stars
2. [ ] Refresh the page (F5)
3. [ ] Mock data reloads
4. [ ] Previously rated transaction shows card (if real API, would persist)

---

## Section 7: Code Quality Checks

### Component Structure
- [ ] Each component is focused and single-responsibility
- [ ] Components are reusable
- [ ] Props are properly defined and used
- [ ] No hardcoded strings (all using i18n)

### Styling
- [ ] Tailwind CSS classes used consistently
- [ ] Color scheme matches Mazadat design (#2A9D8F green)
- [ ] Responsive design using Tailwind breakpoints
- [ ] RTL classes used: `rtl:text-right ltr:text-left`

### Imports
- [ ] All imports are used
- [ ] No circular dependencies
- [ ] Relative paths used correctly (@/ alias for src/)

### Error Handling
- [ ] Try-catch blocks where needed
- [ ] Error messages displayed to user
- [ ] Loading states prevent multiple submissions
- [ ] Validation errors show before API calls

### i18n Implementation
- [ ] useTranslation('rating') used in components
- [ ] t() function called for all user-facing text
- [ ] Namespace 'rating' properly registered

---

## Section 8: Backend Integration Readiness

### Service Functions
- [ ] All functions ready to replace mock with API calls
- [ ] Correct API paths defined
- [ ] Parameter names match expected format

### Data Structure
- [ ] Mock data structure matches backend format
- [ ] Transaction object has all needed fields
- [ ] Rating object structure is consistent

### Error Scenarios
- [ ] Error handling in place for API failures
- [ ] User-friendly error messages prepared
- [ ] Retry mechanism ready

---

## Section 9: Browser Compatibility

### Chrome/Edge
- [ ] All features work correctly
- [ ] No console errors
- [ ] Styling renders correctly

### Firefox
- [ ] All features work correctly
- [ ] No console errors
- [ ] Styling renders correctly

### Safari
- [ ] All features work correctly
- [ ] No console errors
- [ ] Styling renders correctly

---

## Section 10: Accessibility Checks

### Keyboard Navigation
- [ ] Can tab through form elements
- [ ] Can submit form with keyboard
- [ ] Star buttons keyboard accessible
- [ ] Links keyboard accessible

### Screen Reader
- [ ] aria-label on star buttons
- [ ] Form labels properly associated
- [ ] Error messages announced

### Color Contrast
- [ ] Text readable on backgrounds
- [ ] Yellow stars visible against white
- [ ] Error messages in contrasting color

---

## Final Sign-Off

- [ ] All sections completed
- [ ] No critical issues found
- [ ] Feature ready for backend integration
- [ ] Documentation complete
- [ ] Code follows project standards

**Date Completed:** _______________
**Tester Name:** _______________
**Notes:** _______________

