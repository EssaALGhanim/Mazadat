# Buyer Rating System - Implementation Guide

## Overview
The Buyer Rating System allows sellers to rate buyers after completed transactions, helping maintain a reliable buyer community and identify serious bidders.

## Files Created

### Components
1. **StarRating.jsx** (`src/components/rating/StarRating.jsx`)
   - Reusable 1-5 star rating component
   - Props: `rating`, `onRatingChange`, `readOnly`, `size`, `interactive`
   - Supports hover effects and disabled state

2. **BuyerRatingForm.jsx** (`src/components/rating/BuyerRatingForm.jsx`)
   - Form component for rating a buyer
   - Features:
     - Star rating selection (required)
     - Optional comment field (max 500 characters)
     - Form validation
     - Loading states
     - Success/error handling with Sonner toast
   - Props: `transaction`, `onSubmitSuccess`, `onSubmitError`

3. **BuyerRatingCard.jsx** (`src/components/rating/BuyerRatingCard.jsx`)
   - Displays submitted rating in read-only card format
   - Shows: buyer name, auction title, final price, rating stars, comment, submission date
   - Supports RTL for Arabic
   - Props: `rating`, `transaction`

4. **BuyerRatingsList.jsx** (`src/components/rating/BuyerRatingsList.jsx`)
   - Lists multiple transactions with their rating forms or submitted ratings
   - Handles state for multiple ratings
   - Shows empty state and pending transaction warnings
   - Props: `transactions`

5. **BuyerRatingsPage.jsx** (`src/pages/BuyerRatingsPage.jsx`)
   - Main page for managing buyer ratings
   - Features:
     - Mock data loading (simulates API call)
     - Error handling with retry functionality
     - Responsive layout
     - Loading spinner
   - Uses mock data by default (easily replaceable with real API)

### Services
**buyerRatingService.js** (`src/services/buyerRatingService.js`)
- API integration layer with methods for:
  - `getSellerCompletedTransactions(sellerId)` - GET /transactions/completed/seller/{sellerId}
  - `submitBuyerRating(transactionId, data)` - POST /transactions/{transactionId}/buyer-rating
  - `getBuyerRatings(buyerId)` - GET /buyers/{buyerId}/ratings
  - `getTransactionRating(transactionId)` - GET /transactions/{transactionId}/buyer-rating
  - `getSellerRatings(sellerId)` - GET /ratings/seller/{sellerId}

### Translations
1. **en/rating.json** (`src/i18n/locales/en/rating.json`)
   - English translations for all UI text

2. **ar/rating.json** (`src/i18n/locales/ar/rating.json`)
   - Arabic translations for all UI text
   - Supports RTL layout

### Files Modified
1. **App.jsx**
   - Added import for `BuyerRatingsPage`
   - Added route: `/seller/buyer-ratings` (protected for SELLER role)

2. **SellerDashboard.jsx**
   - Added "Buyer Ratings" card in the quick access section
   - Links to `/seller/buyer-ratings` page
   - Grid changed from 2 columns to 3 columns to accommodate new link

3. **src/i18n/index.js**
   - Added imports for rating translations (ar/en)
   - Added `rating: arRating` and `rating: enRating` to resources

## Features Implemented

✅ **1-5 Star Rating System**
- Interactive star selection with hover effects
- Read-only display of submitted ratings
- Yellow (#FFD700) filled stars for selected ratings

✅ **Optional Comment Field**
- Max 500 character limit
- Character counter displayed
- Optional submission (not required)

✅ **Validation**
- At least 1 star required before submission
- Error message displayed if validation fails
- Submit button disabled until rating is selected

✅ **Transaction Status Checks**
- Form only shows for "completed" transactions
- Pending transactions show warning message
- Already rated transactions show read-only card

✅ **Duplicate Rating Prevention**
- System tracks if buyer has been rated for transaction
- UI shows submitted rating instead of form
- Mock logic ready for backend integration

✅ **Success/Error Messages**
- Using Sonner toast library (already in project)
- Success message after rating submission
- Error message on submission failure
- Error messages for validation

✅ **Responsive Design**
- Mobile-first approach
- Grid layout adjusts for smaller screens
- Touch-friendly star buttons
- Textarea responsive on all devices

✅ **RTL Support (Arabic)**
- All components support `isAr` language check
- Text alignment: `rtl:text-right ltr:text-left`
- Direction attributes on text elements
- Full Arabic translation included

✅ **State Management**
- Uses React hooks (useState)
- Local state for ratings, loading, error
- Mock data handling ready for API integration

✅ **Mock Data**
- Default mock transactions included in BuyerRatingsPage
- Shows 4 sample transactions:
  - 1 unrated completed transaction
  - 1 already rated completed transaction
  - 1 unrated completed transaction
  - 1 pending transaction (disabled for rating)
- Easily replaceable with real API calls

## Testing the Feature

### 1. Access the Feature
```
1. Login as a Seller
2. Go to Seller Dashboard
3. Click "Buyer Ratings" button in the quick access section
4. Or navigate to: /seller/buyer-ratings
```

### 2. Test Completed Transactions
```
- You should see a list of mock transactions
- Try rating each transaction with:
  - Different star ratings (1-5)
  - Optional comments
  - No comment
```

### 3. Test Validation
```
- Try clicking "Submit Rating" without selecting stars
- Should see error: "Please select at least one star."
- Submit button should be disabled
```

### 4. Test Success Messages
```
- Select a star rating
- Click "Submit Rating"
- Should see success toast: "Buyer rating submitted successfully!"
- Form should change to read-only card display
```

### 5. Test Duplicate Prevention
```
- After rating a buyer, form converts to read-only card
- Card displays:
  - Buyer name
  - Auction title
  - Final price
  - Your rating (stars)
  - Your comment (if added)
  - Submission date
```

### 6. Test Pending Transactions
```
- One mock transaction has status "pending"
- Should show warning: "This transaction is still pending..."
- Rating form should not be available
```

### 7. Test Language Switching
```
- Click language switcher (top navigation)
- All text should translate to Arabic
- RTL layout should activate
- Star ratings should remain functional
```

### 8. Test Mobile Responsiveness
```
- Resize browser to mobile viewport
- All elements should stack vertically
- Star buttons should remain touch-friendly
- Form inputs should be readable
```

## Integration with Backend

### API Endpoints to Implement

1. **GET /transactions/completed/seller/{sellerId}**
   - Purpose: Get seller's completed transactions
   - Response:
   ```json
   [
     {
       "transactionId": "txn-001",
       "auctionId": "auc-001",
       "auctionTitle": "Item Name",
       "buyerId": "buyer-001",
       "buyerName": "Buyer Name",
       "finalPrice": 1500,
       "transactionStatus": "completed",
       "hasRating": false
     }
   ]
   ```

2. **POST /transactions/{transactionId}/buyer-rating**
   - Purpose: Submit buyer rating
   - Request Body:
   ```json
   {
     "rating": 5,
     "comment": "Optional review text"
   }
   ```
   - Response:
   ```json
   {
     "transactionId": "txn-001",
     "rating": 5,
     "comment": "Optional review text",
     "submittedAt": "2026-05-05T10:30:00Z"
   }
   ```

3. **GET /buyers/{buyerId}/ratings**
   - Purpose: Get all ratings for a buyer
   - Response: Array of ratings from different sellers

4. **GET /transactions/{transactionId}/buyer-rating**
   - Purpose: Check if transaction already has a rating
   - Response: Rating object or null

5. **GET /ratings/seller/{sellerId}**
   - Purpose: Get all ratings submitted by a seller
   - Response: Array of ratings with buyer details

### Backend Integration Steps

1. **Update BuyerRatingsPage.jsx:**
   ```javascript
   // Replace mock data loading with:
   const loadTransactions = async () => {
     setLoading(true);
     try {
       const currentUser = JSON.parse(localStorage.getItem('user'));
       const data = await getSellerCompletedTransactions(currentUser.id);
       setTransactions(data);
     } catch (err) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };
   ```

2. **Update BuyerRatingForm.jsx:**
   ```javascript
   // Replace mock submission with:
   const handleSubmit = async (e) => {
     e.preventDefault();
     setError(null);
     
     if (rating === 0) {
       // validation error...
       return;
     }
     
     setLoading(true);
     try {
       const response = await submitBuyerRating(transaction.transactionId, {
         rating,
         comment: comment.trim() || null
       });
       onSubmitSuccess?.(response);
       toast.success(t('messages.ratingSubmittedSuccess'));
     } catch (err) {
       // error handling...
     } finally {
       setLoading(false);
     }
   };
   ```

3. **Testing with Backend:**
   - Update API_BASE_URL if needed in apiClient.js
   - Ensure authentication token is included in requests
   - Test with real transaction data

## Code Quality Notes

- ✅ Follows existing Mazadat codebase patterns
- ✅ Uses existing UI component library (Radix UI)
- ✅ Consistent styling with Tailwind CSS
- ✅ Proper i18n integration (AR/EN support)
- ✅ RTL support for Arabic
- ✅ Clean React component structure
- ✅ Reusable components (StarRating)
- ✅ Proper state management
- ✅ Error handling and loading states
- ✅ No hardcoded strings (all translatable)
- ✅ Responsive design
- ✅ Mock data ready for backend integration

## Future Enhancements

1. **View Buyer Profile with Ratings**
   - Link to seller profile showing all their received ratings
   - Average rating display
   - Rating distribution chart

2. **Edit/Delete Ratings**
   - Allow sellers to modify ratings they've submitted
   - Confirmation dialog for deletion
   - Audit trail of rating changes

3. **Rating Filter/Sort**
   - Sort by rating, date, or buyer name
   - Filter by rating (high-rated, low-rated)
   - Search by buyer name

4. **Analytics Dashboard**
   - Average buyer rating for seller
   - Rating distribution chart
   - Seller reputation score

5. **Buyer Feedback System**
   - Buyers can see ratings and respond
   - Reply/dispute mechanism
   - Rating appeals system

6. **Automated Flags**
   - Flag suspicious patterns in ratings
   - Detect potential abuse
   - Manual review queue

## Troubleshooting

### Ratings not submitting?
- Check browser console for errors
- Verify API endpoints are correct
- Ensure authentication token is valid

### Translations not showing?
- Check i18n/index.js has rating translations imported
- Verify JSON files have correct language keys
- Clear browser cache and reload

### RTL not working?
- Check `isAr` variable is set correctly
- Verify `i18n.language` is 'ar' for Arabic
- Check Tailwind RTL classes: `rtl:text-right ltr:text-left`

### Component not responsive?
- Check Tailwind breakpoints are used: sm, md, lg, xl
- Test with browser dev tools mobile view
- Verify grid/flex layouts adjust for smaller screens

## Support

For questions or issues with the Buyer Rating System implementation:
1. Check this README file
2. Review component JSDoc comments
3. Check existing Mazadat patterns
4. Review mock data structure in BuyerRatingsPage.jsx

