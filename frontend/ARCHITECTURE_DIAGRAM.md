# Buyer Rating System - Component Architecture

## Component Hierarchy Diagram

```
App.jsx
└── BrowserRouter
    └── Routes
        └── Route: /seller/buyer-ratings (ProtectedRoute)
            └── BuyerRatingsPage
                ├── TopNavigationBar
                └── BuyerRatingsList
                    ├── (for each transaction)
                    ├── [if completed & rated]
                    │   └── BuyerRatingCard
                    │       └── StarRating (readOnly)
                    ├── [if completed & not rated]
                    │   └── BuyerRatingForm
                    │       └── StarRating (interactive)
                    └── [if pending]
                        └── Warning Message
```

## Data Flow

```
BuyerRatingsPage (state: transactions, loading, error)
    ↓
    useEffect → loadTransactions()
    ↓
    generateMockTransactions() [Mock]
    ├─ or getSellerCompletedTransactions() [Backend]
    ↓
    setTransactions(data)
    ↓
    BuyerRatingsList receives: transactions
    ↓
    Maps through transactions
    ├─ If completed & rated → BuyerRatingCard
    ├─ If completed & unrated → BuyerRatingForm
    └─ If pending → Warning
```

## User Interaction Flow

```
User Action                     Component                   Result
─────────────────────────────────────────────────────────────────
Navigate to page        →   BuyerRatingsPage       →   Shows mock data
                            loading spinner
                            ↓
Click on star (1-5)     →   StarRating              →   rating state updates
                            (onRatingChange)         → Submit button enabled
                            ↓
Click Submit            →   BuyerRatingForm         →   Validation check
                            (validation)             → Loading state
                            ↓
Success                 →   submitBuyerRating()     →   Toast success
                            onSubmitSuccess()        → Form → Card conversion
                            ↓
Error                   →   submitBuyerRating()     →   Toast error
                            (error handling)         → Form stays visible
                            ↓
View submitted          →   BuyerRatingCard         →   Displays read-only
                            (readOnly mode)          stars + comment + date
```

## State Management

```
BuyerRatingsPage
├── transactions: [array]           ← Mock or API data
├── loading: boolean                ← Loading state
├── error: string | null            ← Error message
└── (passes to BuyerRatingsList)
    └── ratings: {}                 ← Local state for submitted ratings
        └── transactionId → rating object
```

## Service Layer Architecture

```
BuyerRatingForm (or any component)
    ↓
submitBuyerRating(transactionId, { rating, comment })
    ↓
buyerRatingService.js
    ↓
api.post('/transactions/{transactionId}/buyer-rating', data)
    ↓
apiClient.js
    ↓
fetch() with auth header
    ↓
Backend API
```

## Translation System Flow

```
BuyerRatingForm
    ↓
useTranslation('rating')
    ↓
i18n resources
├── rating: arRating (ar/rating.json)
└── rating: enRating (en/rating.json)
    ↓
t('rating:form.submitButton')
    ↓
Returns translated string
└── EN: "Submit Rating"
└── AR: "إرسال التقييم"
```

## Responsive Breakpoints

```
Mobile (< 640px)
├── StarRating
│   └── gap-1 (smaller spacing)
├── Form
│   └── Full width (100%)
└── Grid
    └── grid-cols-1 (1 column)

Tablet (640px - 1024px)
├── StarRating
│   └── gap-2 (medium spacing)
├── Form
│   └── Max-width 600px
└── Grid
    └── md:grid-cols-2 (2 columns)

Desktop (> 1024px)
├── StarRating
│   └── gap-2 (standard spacing)
├── Form
│   └── Max-width 800px
└── Grid
    └── md:grid-cols-3 (3 columns)
```

## Error Handling Flow

```
User Action
    ↓
Try Block
├── Validation
│   ├── rating === 0?
│   │   └── Show error & return
│   └── Proceed
├── API Call
│   ├── Success
│   │   └── Toast.success()
│   │   └── onSubmitSuccess()
│   └── Error
│       └── Catch Block
└── Finally
    └── setLoading(false)
    ↓
Catch Block
├── Prepare error message
├── Toast.error()
└── onSubmitError(err)
```

## Styling Layers

```
Global Styles (index.css)
├── Cairo font family
├── Color scheme (#2A9D8F, #F4FAFA)
└── RTL support

Tailwind CSS (Utility classes)
├── Spacing: p-4, m-2, gap-4
├── Colors: bg-white, text-gray-600
├── Responsive: sm:, md:, lg:
├── RTL: rtl:text-right, ltr:text-left
└── State: hover:, focus:, disabled:

Component-specific CSS
├── Button variants (Radix UI)
├── Card components (Radix UI)
└── Custom classes (minimal)
```

## Component Props Interface

```
StarRating
├── rating: number (0-5)
├── onRatingChange: (star: number) => void
├── readOnly: boolean
├── size: 'sm' | 'md' | 'lg'
└── interactive: boolean

BuyerRatingForm
├── transaction: Transaction
├── onSubmitSuccess: (rating: Rating) => void
└── onSubmitError: (error: Error) => void

BuyerRatingCard
├── rating: Rating
└── transaction: Transaction

BuyerRatingsList
└── transactions: Transaction[]

BuyerRatingsPage
└── (no props - uses hooks)
```

## File Dependencies

```
App.jsx
├── BuyerRatingsPage
│   ├── TopNavigationBar
│   ├── BuyerRatingsList
│   │   ├── BuyerRatingForm
│   │   │   ├── StarRating
│   │   │   ├── Button
│   │   │   └── useTranslation
│   │   ├── BuyerRatingCard
│   │   │   ├── StarRating
│   │   │   ├── Card components
│   │   │   └── useTranslation
│   │   └── useTranslation
│   ├── useTranslation
│   └── buyerRatingService (for API)
└── i18n/index.js
    ├── ar/rating.json
    └── en/rating.json
```

## State Update Sequence

```
Initial State
├── transactions: []
├── loading: true
└── error: null
    ↓
After Load
├── transactions: [mock data or API data]
├── loading: false
└── error: null
    ↓
After User Submits Rating
├── ratings: {
│   'txn-123': {
│       rating: 5,
│       comment: "Great!",
│       submittedAt: "2026-05-05T..."
│   }
│ }
├── Form converts to Card
└── Success toast shown
```

## Internationalization Structure

```
i18n/index.js (configured)
    ↓
en/rating.json (English)
├── page.*
├── form.*
├── card.*
├── messages.*
└── validationMessages.*

ar/rating.json (Arabic)
├── page.*
├── form.*
├── card.*
├── messages.*
└── validationMessages.*
    ↓
useTranslation('rating')
    ↓
t('page.title')
t('form.ratingLabel')
etc.
```

## API Integration Points

```
Backend Needed:

GET /transactions/completed/seller/{sellerId}
    → getSellerCompletedTransactions()
    → Used by BuyerRatingsPage

POST /transactions/{transactionId}/buyer-rating
    → submitBuyerRating()
    → Used by BuyerRatingForm

GET /buyers/{buyerId}/ratings
    → getBuyerRatings()
    → Future feature (view buyer ratings)

GET /transactions/{transactionId}/buyer-rating
    → getTransactionRating()
    → Check if already rated

GET /ratings/seller/{sellerId}
    → getSellerRatings()
    → Future feature (seller's ratings)
```

## Mock Data to Backend Migration

```
Current (Mock):
BuyerRatingsPage
    ↓
generateMockTransactions()
    ↓
setTransactions(mockData)

Future (Backend):
BuyerRatingsPage
    ↓
getSellerCompletedTransactions(sellerId)
    ↓
api.get('/transactions/completed/seller/{sellerId}')
    ↓
setTransactions(apiData)
```

## Component Lifecycle

```
BuyerRatingsPage
├── Mount
│   ├── useState (initialize state)
│   ├── useEffect (load data)
│   └── useTranslation (get i18n)
├── Update
│   ├── User interacts
│   ├── Component state changes
│   ├── Child components re-render
│   └── UI updates
└── Unmount
    └── Cleanup (if needed)
```

## Key Features Location

```
Feature                         Component(s)
─────────────────────────────────────────────────
Star Selection              →   StarRating
Form Validation             →   BuyerRatingForm
Comment Field               →   BuyerRatingForm
Character Counter           →   BuyerRatingForm
Toast Messages              →   BuyerRatingForm
Loading State               →   BuyerRatingForm, BuyerRatingsPage
Error Handling              →   BuyerRatingForm, BuyerRatingsPage
Mock Data                   →   BuyerRatingsPage
Responsive Layout           →   All components (Tailwind)
RTL Support                 →   All components (i18n + Tailwind)
Duplicate Prevention        →   BuyerRatingsList
Transaction Status Check    →   BuyerRatingsList
Read-only Display           →   BuyerRatingCard
Translations                →   i18n system
```

---

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Reusable components
- ✅ Easy testing
- ✅ Scalable design
- ✅ Easy backend integration
- ✅ Maintainable code

