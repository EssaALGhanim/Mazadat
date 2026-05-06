import { useState, useEffect } from 'react';
import { Star, X, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import StarRating from './StarRating';
import { checkAuctionHouseRating, submitAuctionHouseRating } from '../../services/auctionHouseRatingService';

// One rating per buyer per auction (keyed by auctionId + auctionHouseId + buyerUsername).
// Using auctionId in the key means even if a buyer wins in two different auctions from the
// same auction house, each auction gets its own independent rating.
const storageKey = (auctionId, auctionHouseId, buyerUsername) =>
    `auctionHouseRating_${auctionId}_${auctionHouseId}_${buyerUsername}`;

export default function AuctionHouseRating({
    auctionId,
    auctionHouseId,
    auctionHouseName,
    buyerUsername,
    isAr,
}) {
    const [savedRating, setSavedRating] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Stable identifier — prefer the numeric id, fall back to name slug
    const houseKey = auctionHouseId || auctionHouseName || 'unknown';

    useEffect(() => {
        if (!auctionId || !buyerUsername || !houseKey) return;
        // First check localStorage for instant display
        try {
            const stored = localStorage.getItem(storageKey(auctionId, houseKey, buyerUsername));
            if (stored) {
                setSavedRating(JSON.parse(stored));
                return;
            }
        } catch {
            // ignore corrupted localStorage
        }
        // Then check server
        checkAuctionHouseRating(auctionId)
            .then((res) => {
                if (res.data?.rated) {
                    const data = { rating: res.data.rating, comment: res.data.comment };
                    setSavedRating(data);
                    try {
                        localStorage.setItem(
                            storageKey(auctionId, houseKey, buyerUsername),
                            JSON.stringify(data)
                        );
                    } catch { /* ignore */ }
                }
            })
            .catch(() => { /* server check failure is non-critical */ });
    }, [auctionId, houseKey, buyerUsername]);

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
            await submitAuctionHouseRating({
                auctionId,
                auctionHouseId,
                rating,
                comment: comment.trim() || null,
            });
            const data = {
                rating,
                comment: comment.trim() || null,
                auctionHouseName,
                submittedAt: new Date().toISOString(),
            };
            localStorage.setItem(storageKey(auctionId, houseKey, buyerUsername), JSON.stringify(data));
            setSavedRating(data);
            setModalOpen(false);
            toast.success(isAr ? 'تم تقييم صالة المزاد بنجاح' : 'Auction house rated successfully!');
        } catch (err) {
            const msg = err?.response?.data?.message || (isAr ? 'حدث خطأ. يرجى المحاولة مرة أخرى' : 'An error occurred. Please try again.');
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // Already rated — show read-only stars
    if (savedRating) {
        return (
            <div
                className="flex items-center gap-0.5 mt-1"
                title={savedRating.comment || (isAr ? 'تم التقييم' : 'Rated')}
            >
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                            s <= savedRating.rating
                                ? 'fill-yellow-300 text-yellow-300'
                                : 'text-white/40'
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
                className="flex items-center gap-1 mt-2 text-xs text-white/90 border border-white/40 rounded-full px-2.5 py-1 hover:bg-white/20 transition-colors"
            >
                <Star className="w-3 h-3" />
                {isAr ? 'قيّم صالة المزاد' : 'Rate Auction House'}
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
                        {/* Header */}
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#2A9D8F]" />
                                <h3 className="font-bold text-[#1A2E2C] text-base">
                                    {isAr ? 'تقييم صالة المزاد' : 'Rate Auction House'}
                                </h3>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {auctionHouseName && (
                            <p className="text-xs text-[#6B9E99] mb-5 truncate">
                                {auctionHouseName}
                            </p>
                        )}

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
                                    placeholder={
                                        isAr
                                            ? 'شارك تجربتك مع صالة المزاد هذه...'
                                            : 'Share your experience with this auction house...'
                                    }
                                    maxLength={400}
                                    rows={3}
                                    className={`w-full px-3 py-2 text-sm text-[#1A2E2C] bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] resize-none ${isAr ? 'text-right' : 'text-left'}`}
                                />
                                <p className="text-xs text-gray-400 mt-0.5 text-right">
                                    {comment.length}/400
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
