import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import TopNavigationBar from '@/components/TopNavigationBar';
import BuyerRatingsList from '@/components/rating/BuyerRatingsList';

// Mock data generator
const generateMockTransactions = () => {
    return [
        {
            transactionId: 'txn-001',
            auctionId: 'auc-001',
            auctionTitle: 'Vintage Camera',
            buyerId: 'buyer-001',
            buyerName: 'Ahmed Al-Mazaudi',
            finalPrice: 1500,
            transactionStatus: 'completed',
            hasRating: false,
        },
        {
            transactionId: 'txn-002',
            auctionId: 'auc-002',
            auctionTitle: 'Antique Watch',
            buyerId: 'buyer-002',
            buyerName: 'Fatima Al-Mansouri',
            finalPrice: 2500,
            transactionStatus: 'completed',
            hasRating: true,
            rating: {
                rating: 5,
                comment: 'Excellent buyer, quick payment and very responsive.',
                submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            },
        },
        {
            transactionId: 'txn-003',
            auctionId: 'auc-003',
            auctionTitle: 'Smartphone',
            buyerId: 'buyer-003',
            buyerName: 'Mohammed Al-Khalidi',
            finalPrice: 800,
            transactionStatus: 'completed',
            hasRating: false,
        },
        {
            transactionId: 'txn-004',
            auctionId: 'auc-004',
            auctionTitle: 'Designer Bag',
            buyerId: 'buyer-004',
            buyerName: 'Sara Al-Dosari',
            finalPrice: 1200,
            transactionStatus: 'pending',
            hasRating: false,
        },
    ];
};

export default function BuyerRatingsPage() {
    const { t, i18n } = useTranslation('rating');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isAr = i18n.language === 'ar';

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 600));
            const mockData = generateMockTransactions();
            setTransactions(mockData);
        } catch (err) {
            setError(err.message || t('messages.loadingFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <TopNavigationBar />

            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className={`mb-8 ${isAr ? 'text-right' : 'text-left'}`}>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {t('page.title')}
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {t('page.description')}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-800">{error}</p>
                        <button
                            onClick={loadTransactions}
                            className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 underline"
                        >
                            {t('messages.retryLoading')}
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="size-8 animate-spin text-green-600" />
                    </div>
                ) : (
                    <BuyerRatingsList transactions={transactions} />
                )}
            </main>
        </div>
    );
}

