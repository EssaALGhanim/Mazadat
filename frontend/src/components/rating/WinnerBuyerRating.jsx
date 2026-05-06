import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { toast } from 'sonner';
import StarRating from './StarRating';
import { checkBuyerRating, submitBuyerRating } from '../../services/buyerRatingService';

const storageKey = (auctionId, buyerUsername) =>
    `buyerRating_${auctionId}_${buyerUsername}`;

export default function WinnerBuyerRating({ auctionId, buyerUsername, isAr }) {
    const [savedRating, setSavedRating] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!auctionId || !buyerUsername) return;
        // Check localStorage first for instant display
        try {
            const stored = localStorage.getItem(storageKey(auctionId, buyerUsername));
            if (stored) {
                setSavedRating(JSON.parse(stored));
                return;
            }
        } catch {
            // ignore parse errors
        }
        // Then check server
        checkBuyerRating(auctionId)
            .then((res) => {
                if (res.data?.rated) {
                    const data = { rating: res.data.rating, comment: res.data.comment };
                    setSavedRating(data);
                    try {
                        localStorage.setItem(storageKey(auctionId, buyerUsername), JSON.stringify(data));
                    } catch { /* ignore */ }
                }
            })
            .catch(() => { /* server check failure is non-critical */ });
    }, [auctionId, buyerUsername]);

    const openModal = () => {
        setRating(0);
        setComment('');
        setError(null);
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError(isAr ? 'يرجى اختيار نجمة واحدة على الأقل' : 'Please select at least one star.');
            return;
        }
        setSubmitting(true);
        try {
            await submitBuyerRating({
                auctionId,
                rating,
                comment: comment.trim() || null,
            });
            const data = {
                rating,
                comment: comment.trim() || null,
                submittedAt: new Date().toISOString(),
            };
            localStorage.setItem(storageKey(auctionId, buyerUsername), JSON.stringify(data));
            setSavedRating(data);
            setModalOpen(false);
            toast.success(isAr ? 'تم إرسال التقييم بنجاح' : 'Rating submitted successfully!');
        } catch (err) {
            const msg = err?.response?.data?.message || (isAr ? 'حدث خطأ. يرجى المحاولة مرة أخرى' : 'An error occurred. Please try again.');
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (savedRating) {
        return (
            <div
                className="flex items-center gap-0.5"
                title={savedRating.comment || (isAr ? 'تم التقييم' : 'Rated')}
            >
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                            s <= savedRating.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    }

    return (
        <>
            <button
                onClick={openModal}
                className="flex items-center gap-1 text-xs text-[#2A9D8F] border border-[#2A9D8F] rounded-full px-2 py-0.5 hover:bg-[#EAF7F5] transition-colors shrink-0"
            >
                <Star className="w-3 h-3" />
                {isAr ? 'قيّم' : 'Rate'}
            </button>

            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm"
                        onClick={(e) => e.stopPropagation()}
                        dir={isAr ? 'rtl' : 'ltr'}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-[#1A2E2C] text-base">
                                {isAr ? 'تقييم المشتري' : 'Rate Buyer'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-[#6B9E99] mb-5 truncate">
                            {buyerUsername}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#1A2E2C] mb-2">
                                    {isAr ? 'التقييم' : 'Rating'}
                                </label>
                                <StarRating
                                    rating={rating}
                                    onRatingChange={(v) => {
                                        setRating(v);
                                        setError(null);
                                    }}
                                    size="md"
                                />
                                {error && (
                                    <p className="text-xs text-red-600 mt-1">{error}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1A2E2C] mb-2">
                                    {isAr ? 'تعليق (اختياري)' : 'Comment (optional)'}
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder={isAr ? 'شارك تجربتك مع هذا المشتري...' : 'Share your experience with this buyer...'}
                                    maxLength={300}
                                    rows={3}
                                    className={`w-full px-3 py-2 text-sm text-[#1A2E2C] bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] resize-none ${isAr ? 'text-right' : 'text-left'}`}
                                />
                                <p className="text-xs text-gray-400 mt-0.5 text-right">
                                    {comment.length}/300
                                </p>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    {isAr ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || rating === 0}
                                    className="flex-1 bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                >
                                    {submitting
                                        ? (isAr ? 'جاري الإرسال...' : 'Submitting...')
                                        : (isAr ? 'إرسال التقييم' : 'Submit Rating')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
