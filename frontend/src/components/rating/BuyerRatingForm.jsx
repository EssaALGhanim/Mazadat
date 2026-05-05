import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import StarRating from './StarRating';
import { Button } from '@/components/ui/button';

export default function BuyerRatingForm({
    transaction,
    onSubmitSuccess,
    onSubmitError
}) {
    const { t, i18n } = useTranslation('rating');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isAr = i18n.language === 'ar';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (rating === 0) {
            const errorMsg = t('validationMessages.selectRating');
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setLoading(true);
        try {
            // Mock submission - replace with actual API call
            const submittedRating = {
                transactionId: transaction.transactionId,
                buyerId: transaction.buyerId,
                rating,
                comment: comment.trim() || null,
                submittedAt: new Date().toISOString(),
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            onSubmitSuccess?.(submittedRating);
            toast.success(t('messages.ratingSubmittedSuccess'));
        } catch (err) {
            const errorMsg = err.message || t('messages.ratingSubmitFailed');
            setError(errorMsg);
            toast.error(errorMsg);
            onSubmitError?.(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    {t('form.ratingLabel')}
                </label>
                <StarRating
                    rating={rating}
                    onRatingChange={setRating}
                    size="lg"
                />
                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
            </div>

            <div className="space-y-3">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                    {t('form.commentLabel')}
                </label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t('form.commentPlaceholder')}
                    maxLength={500}
                    rows={4}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${isAr ? 'text-right' : 'text-left'}`}
                />
                <p className="text-xs text-gray-500">
                    {comment.length}/500
                </p>
            </div>

            <Button
                type="submit"
                disabled={loading || rating === 0}
                className="w-full"
            >
                {loading ? t('form.submitting') : t('form.submitButton')}
            </Button>
        </form>
    );
}

