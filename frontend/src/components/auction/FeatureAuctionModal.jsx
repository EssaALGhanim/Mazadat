import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Zap } from 'lucide-react';

export default function FeatureAuctionModal({
    open,
    onOpenChange,
    auctionTitle,
    auctionEndDate,
    onFeature,
    loading = false,
}) {
    const { t, i18n } = useTranslation('common');
    const isAr = i18n.language === 'ar';
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [error, setError] = useState('');

    const formatDateInput = (date) => {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatTimeInput = (date) => {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const auctionEnd = auctionEndDate ? new Date(auctionEndDate) : null;
    const auctionEndDateValue = formatDateInput(auctionEnd);
    const auctionEndTimeValue = formatTimeInput(auctionEnd);

    const handleFeature = async () => {
        setError('');

        if (!selectedDate || !selectedTime) {
            setError(t('featureDateTimeRequired'));
            return;
        }

        const featuredEndDate = new Date(`${selectedDate}T${selectedTime}`);
        const now = new Date();

        if (featuredEndDate <= now) {
            setError(t('featureEndDateFuture'));
            return;
        }

        if (auctionEnd && featuredEndDate > auctionEnd) {
            setError(t('featureEndAfterAuctionEnd'));
            return;
        }

        try {
            await onFeature(featuredEndDate);
            setSelectedDate('');
            setSelectedTime('');
            onOpenChange(false);
        } catch (err) {
            setError(err.message || t('featureFailed'));
        }
    };

    const calculateCostAndDuration = () => {
        if (!selectedDate || !selectedTime) return { hours: 0, cost: 0 };

        const featuredEndDate = new Date(`${selectedDate}T${selectedTime}`);
        const now = new Date();
        const diffMs = featuredEndDate - now;
        const diffHours = diffMs / (1000 * 60 * 60);
        const hours = Math.ceil(diffHours);
        const cost = hours * 50; // 50 SAR per hour

        return { hours: Math.max(0, hours), cost };
    };

    const { hours, cost } = calculateCostAndDuration();

    // Set minimum date to today
    const currentDate = new Date();
    const today = formatDateInput(currentDate);
    const currentTime = formatTimeInput(currentDate);
    const minTime = selectedDate === today ? currentTime : undefined;
    const maxTime = auctionEndDateValue && selectedDate === auctionEndDateValue ? auctionEndTimeValue : undefined;

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#2A9D8F]" />
                        <h2 className="text-xl font-bold text-[#1A2E2C]">
                            {t('featureThisAuction')}
                        </h2>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="p-1 hover:bg-[#F4FAFA] rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-[#6B9E99]" />
                    </button>
                </div>

                {/* Product Title */}
                <div className="mb-6 p-3 bg-[#F4FAFA] rounded-lg">
                    <p className="text-xs text-[#6B9E99] mb-1">{isAr ? 'المنتج' : 'Product'}</p>
                    <p className="font-semibold text-[#1A2E2C] line-clamp-2">{auctionTitle}</p>
                </div>

                {/* Date Input */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#1A2E2C] mb-2">
                        {isAr ? 'تاريخ الانتهاء' : 'End Date'}
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={today}
                        max={auctionEndDateValue || undefined}
                        className="w-full px-3 py-2 border border-[#C5E0DC] rounded-lg focus:outline-none focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/20 text-[#1A2E2C]"
                    />
                </div>

                {/* Time Input */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-[#1A2E2C] mb-2">
                        {isAr ? 'الوقت' : 'Time'}
                    </label>
                    <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        min={minTime}
                        max={maxTime}
                        className="w-full px-3 py-2 border border-[#C5E0DC] rounded-lg focus:outline-none focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/20 text-[#1A2E2C]"
                    />
                </div>

                {/* Cost Summary */}
                {hours > 0 && (
                    <div className="mb-6 p-4 bg-[#EAF7F5] border border-[#2A9D8F]/20 rounded-lg">
                        <div className="grid grid-cols-3 gap-2 mb-2">
                            <div>
                                <p className="text-xs text-[#6B9E99]">{isAr ? 'الساعات' : 'Hours'}</p>
                                <p className="font-bold text-[#1A2E2C]">{hours}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#6B9E99]">{isAr ? 'السعر/الساعة' : 'Price/Hour'}</p>
                                <p className="font-bold text-[#1A2E2C]">50 ﷼</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#6B9E99]">{isAr ? 'الإجمالي' : 'Total'}</p>
                                <p className="font-bold text-[#2A9D8F]">{cost} ﷼</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-3 bg-[#E05252]/10 border border-[#E05252]/30 rounded-lg">
                        <p className="text-sm text-[#E05252] font-semibold">{error}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="flex-1 px-4 py-2 bg-[#F4FAFA] hover:bg-[#E2F1EF] text-[#2A9D8F] rounded-lg font-semibold transition-colors"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleFeature}
                        disabled={loading || !selectedDate || !selectedTime}
                        className="flex-1 px-4 py-2 bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            t('featureNow')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

