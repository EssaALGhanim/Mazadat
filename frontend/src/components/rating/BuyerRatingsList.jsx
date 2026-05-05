import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import BuyerRatingForm from './BuyerRatingForm';
import BuyerRatingCard from './BuyerRatingCard';

export default function BuyerRatingsList({ transactions = [] }) {
    const { t, i18n } = useTranslation('rating');
    const [ratings, setRatings] = useState({});
    const isAr = i18n.language === 'ar';

    const handleRatingSubmit = (transactionId, submittedRating) => {
        setRatings(prev => ({
            ...prev,
            [transactionId]: submittedRating
        }));
    };

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <AlertCircle className="size-10 text-gray-400" />
                <p className="text-gray-600">{t('messages.noCompletedTransactions')}</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            {transactions.map(transaction => {
                const hasRating = ratings[transaction.transactionId] || transaction.hasRating;
                const isCompleted = transaction.transactionStatus === 'completed';

                return (
                    <div key={transaction.transactionId} className="space-y-4">
                        {!isCompleted ? (
                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                <p className="text-sm text-yellow-800">
                                    {t('messages.transactionNotCompleted')}
                                </p>
                            </div>
                        ) : hasRating ? (
                            <BuyerRatingCard
                                rating={ratings[transaction.transactionId] || transaction.rating}
                                transaction={transaction}
                            />
                        ) : (
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h3 className={`mb-4 font-semibold text-gray-900 ${isAr ? 'text-right' : 'text-left'}`}>
                                    {t('form.title')} - {transaction.buyerName}
                                </h3>
                                <BuyerRatingForm
                                    transaction={transaction}
                                    onSubmitSuccess={(rating) => handleRatingSubmit(transaction.transactionId, rating)}
                                    onSubmitError={(error) => console.error('Rating submission error:', error)}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

