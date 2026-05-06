# Buyer Rating System - Quick Reference Guide

## 📁 File Structure

```
src/
├── components/
│   └── rating/
│       ├── StarRating.jsx           # Reusable star component
│       ├── BuyerRatingForm.jsx      # Form for submitting ratings
│       ├── BuyerRatingCard.jsx      # Display submitted ratings
│       ├── BuyerRatingsList.jsx     # List of transactions
│       └── index.test.js            # Component tests reference
├── pages/
│   └── BuyerRatingsPage.jsx         # Main page (with mock data)
├── services/
│   └── buyerRatingService.js        # API integration layer
├── i18n/
│   └── locales/
│       ├── ar/
│       │   └── rating.json          # Arabic translations
│       └── en/
│           └── rating.json          # English translations
└── App.jsx                          # Route configuration

frontend/
├── BUYER_RATING_SYSTEM.md           # Full implementation guide
└── TESTING_CHECKLIST.md             # Testing procedures
```

---

## 🚀 Quick Start

### 1. Start Development Server
```bash
cd frontend
npm install  # if needed
npm run dev
```

### 2. Access the Feature
```
URL: http://localhost:5173/seller/buyer-ratings
Or: Click "Buyer Ratings" in SellerDashboard
```

### 3. Test with Mock Data
- Page loads with 4 mock transactions
- Rate unrated transactions
- View already-rated transactions
- See pending transaction warnings

---

## 📋 Component API Reference

### StarRating Component
```jsx
import StarRating from '@/components/rating/StarRating';

<StarRating 
  rating={3}                           // Current rating (0-5)
  onRatingChange={(star) => setRating(star)}  // Callback
  readOnly={false}                    // Display only mode
  size="md"                           // 'sm' | 'md' | 'lg'
  interactive={true}                  // Allow clicking
/>
```

### BuyerRatingForm Component
```jsx
import BuyerRatingForm from '@/components/rating/BuyerRatingForm';

<BuyerRatingForm
  transaction={{
    transactionId: 'txn-123',
    auctionId: 'auc-456',
    auctionTitle: 'Item Name',
    buyerId: 'buyer-789',
    buyerName: 'Buyer Name',
    finalPrice: 1500,
    transactionStatus: 'completed'
  }}
  onSubmitSuccess={(rating) => {
    // Handle successful submission
  }}
  onSubmitError={(error) => {
    // Handle error
  }}
/>
```

### BuyerRatingCard Component
```jsx
import BuyerRatingCard from '@/components/rating/BuyerRatingCard';

<BuyerRatingCard
  rating={{
    rating: 5,
    comment: 'Great buyer!',
    submittedAt: '2026-05-05T10:30:00Z'
  }}
  transaction={{
    // same structure as BuyerRatingForm
  }}
/>
```

### BuyerRatingsList Component
```jsx
import BuyerRatingsList from '@/components/rating/BuyerRatingsList';

<BuyerRatingsList
  transactions={[
    {
      transactionId: 'txn-123',
      auctionTitle: 'Item',
      buyerName: 'Buyer',
      finalPrice: 1500,
      transactionStatus: 'completed',
      hasRating: false,
      // ...
    }
  ]}
/>
```

---

## 🔗 Service Layer Reference

### API Methods

```javascript
import * as buyerRatingService from '@/services/buyerRatingService';

// Get seller's completed transactions
await buyerRatingService.getSellerCompletedTransactions(sellerId);

// Submit a rating
await buyerRatingService.submitBuyerRating(transactionId, {
  rating: 5,
  comment: 'Optional comment'
});

// Get ratings for a buyer
await buyerRatingService.getBuyerRatings(buyerId);

// Check if transaction has a rating
await buyerRatingService.getTransactionRating(transactionId);

// Get all ratings submitted by a seller
await buyerRatingService.getSellerRatings(sellerId);
```

---

## 🌐 i18n Translation Keys

### Page Translation Keys
```javascript
t('rating:page.title')          // "Buyer Ratings" / "تقييمات المشترين"
t('rating:page.description')    // Description text
```

### Form Translation Keys
```javascript
t('rating:form.title')                    // "Rate Buyer"
t('rating:form.ratingLabel')              // "Rating"
t('rating:form.commentLabel')             // "Review (Optional)"
t('rating:form.commentPlaceholder')       // Placeholder text
t('rating:form.submitButton')             // "Submit Rating"
t('rating:form.submitting')               // "Submitting..."
```

### Card Translation Keys
```javascript
t('rating:card.title')                    // "Rating Submitted"
t('rating:card.buyer')                    // "Buyer"
t('rating:card.auction')                  // "Auction"
t('rating:card.finalPrice')               // "Final Price"
t('rating:card.ratingLabel')              // "Your Rating"
t('rating:card.commentLabel')             // "Your Review"
t('rating:card.submittedOn')              // "Submitted on"
```

### Message Translation Keys
```javascript
t('rating:messages.ratingSubmittedSuccess')       // Success toast
t('rating:messages.ratingSubmitFailed')           // Error toast
t('rating:messages.noCompletedTransactions')      // Empty state
t('rating:messages.transactionNotCompleted')      // Pending warning
t('rating:messages.loadingFailed')                // Error message
t('rating:messages.retryLoading')                 // Retry button
```

### Validation Translation Keys
```javascript
t('rating:validationMessages.selectRating')  // "Please select at least one star."
```

---

## 🔧 Backend Integration Steps

### Step 1: Replace Mock Data Loading
In `BuyerRatingsPage.jsx`, replace `generateMockTransactions()`:

```javascript
const loadTransactions = async () => {
  setLoading(true);
  setError(null);
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const data = await getSellerCompletedTransactions(user.id);
    setTransactions(data);
  } catch (err) {
    setError(err.message || t('messages.loadingFailed'));
  } finally {
    setLoading(false);
  }
};
```

### Step 2: Replace Mock Submission
In `BuyerRatingForm.jsx`, replace the mock submission in `handleSubmit()`:

```javascript
try {
  const response = await submitBuyerRating(transaction.transactionId, {
    rating,
    comment: comment.trim() || null
  });
  onSubmitSuccess?.(response);
  toast.success(t('messages.ratingSubmittedSuccess'));
} catch (err) {
  const errorMsg = err.message || t('messages.ratingSubmitFailed');
  setError(errorMsg);
  toast.error(errorMsg);
  onSubmitError?.(err);
}
```

### Step 3: Test with Backend
- Ensure API endpoints are implemented
- Test with real transaction data
- Verify authentication tokens are sent
- Check error handling

---

## 🎨 Styling Reference

### Color Scheme
- **Primary Green:** `#2A9D8F` (hover buttons)
- **Light Green:** `#6B9E99` (text)
- **Background:** `#F4FAFA` (page background)
- **Border:** `#C5E0DC` (card borders)
- **Stars:** Yellow `#FFD700` (filled), Gray `#D1D5DB` (unfilled)

### Tailwind Classes Used
```
- Container: max-w-4xl
- Grid: grid-cols-1 md:grid-cols-3 gap-6
- Card: bg-white border rounded-lg p-6
- Button: px-4 py-2 rounded-lg font-semibold
- RTL: rtl:text-right ltr:text-left
- Responsive: sm:, md:, lg:, xl: prefixes
```

---

## 🧪 Testing Tips

### Manual Testing
```bash
# 1. Start dev server
npm run dev

# 2. Navigate to page
http://localhost:5173/seller/buyer-ratings

# 3. Test features
- Click stars
- Type comment
- Submit form
- See success message
- Check toast notifications
```

### Testing Translations
1. Open browser DevTools
2. Go to Application → Local Storage
3. Find `i18nextLng` key
4. Change to 'ar' for Arabic
5. Refresh page
6. Verify RTL layout

### Testing Mobile
1. Open DevTools (F12)
2. Click device toggle (mobile icon)
3. Select preset (iPhone, iPad, etc.)
4. Test responsive layout

---

## 🐛 Common Issues & Solutions

### Issue: Translations not showing
**Solution:** 
- Check i18n/index.js imports `arRating` and `enRating`
- Verify JSON files exist in correct paths
- Clear browser cache

### Issue: Stars not filling
**Solution:**
- Check `rating` prop is number between 0-5
- Verify `onRatingChange` callback is defined
- Check Star import from lucide-react

### Issue: RTL not working
**Solution:**
- Verify `isAr` is set from `i18n.language === 'ar'`
- Check Tailwind RTL classes: `rtl:` prefix
- Ensure `document.dir` is set to 'rtl' in App.jsx

### Issue: Toast not showing
**Solution:**
- Verify Sonner Toaster in App.jsx
- Check `toast.success()` is called correctly
- Verify import from 'sonner'

### Issue: Form not submitting
**Solution:**
- Check star rating is selected (rating > 0)
- Verify `onSubmitSuccess` callback is passed
- Check browser console for errors
- Verify loading state is not stuck

---

## 📚 Additional Resources

- Full guide: `BUYER_RATING_SYSTEM.md`
- Testing checklist: `TESTING_CHECKLIST.md`
- Component tests: `src/components/rating/index.test.js`
- Service layer: `src/services/buyerRatingService.js`

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review full documentation in BUYER_RATING_SYSTEM.md
3. Check browser console for error messages
4. Verify mock data structure in BuyerRatingsPage.jsx

