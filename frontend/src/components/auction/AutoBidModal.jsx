import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2 } from 'lucide-react';

export default function AutoBidModal({ 
    open, 
    onOpenChange, 
    currentPrice, 
    minBid,
    autoBid,
    apiLoading,
    setAutoBid,
    cancelAutoBid 
}) {
    const { t, i18n } = useTranslation('common');
    const isAr = i18n.language === 'ar';

    const [maxAmount, setMaxAmount] = useState('');
    const [enabled, setEnabled] = useState(false);
    const [localError, setLocalError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            setMaxAmount('');
            setLocalError('');
            setEnabled(false);
        } else if (autoBid) {
            setMaxAmount(autoBid.maxAmount.toString());
            setEnabled(true);
        }
    }, [open, autoBid]);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (enabled) {
            const amount = Number(maxAmount);
            if (isNaN(amount) || amount <= currentPrice) {
                setLocalError(t('autoBid.errorMinAmount'));
                return;
            }
            
            setSubmitting(true);
            try {
                await setAutoBid(amount);
                onOpenChange(false);
            } catch (err) {
                setLocalError(err.message || t('autoBid.errorGeneric'));
            } finally {
                setSubmitting(false);
            }
        } else {
            // If they toggled off and it was previously enabled
            if (autoBid) {
                setSubmitting(true);
                try {
                    await cancelAutoBid();
                    onOpenChange(false);
                } catch (err) {
                    setLocalError(err.message || t('autoBid.errorGeneric'));
                } finally {
                    setSubmitting(false);
                }
            } else {
                onOpenChange(false);
            }
        }
    };

    const handleCancelActive = async () => {
        if (!autoBid) return;
        setSubmitting(true);
        try {
            await cancelAutoBid();
            onOpenChange(false);
        } catch (err) {
            setLocalError(err.message || t('autoBid.errorGeneric'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#C5E0DC]">
                    <h2 className="text-xl font-bold text-[#1A2E2C]">
                        {t('autoBid.title')}
                    </h2>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="p-2 hover:bg-[#F4FAFA] rounded-full transition-colors"
                        disabled={submitting}
                    >
                        <X className="w-5 h-5 text-[#6B9E99]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {apiLoading && !submitting ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 text-[#2A9D8F] animate-spin" />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <p className="text-[#6B9E99] text-sm">
                                {t('autoBid.description')}
                            </p>

                            {/* Active Badge */}
                            {autoBid && (
                                <div className="bg-[#2A9D8F] text-white p-3 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        <span className="font-semibold">{t('autoBid.active')}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm bg-white/20 px-2 py-1 rounded">
                                            {t('autoBid.activeMax')}: {autoBid.maxAmount} ر.س
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCancelActive}
                                            disabled={submitting}
                                            className="text-white/80 hover:text-white transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Current & Min Bid Info */}
                            <div className="bg-[#F4FAFA] p-4 rounded-xl border border-[#C5E0DC] grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-[#6B9E99]">{t('currentBid')}</p>
                                    <p className="font-bold text-[#1A2E2C]" dir="ltr">{currentPrice} ﷼</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#6B9E99]">{isAr ? 'الحد الأدنى التالي' : 'Min Next Bid'}</p>
                                    <p className="font-bold text-[#1A2E2C]" dir="ltr">{minBid} ﷼</p>
                                </div>
                            </div>

                            {/* Toggle */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={(e) => setEnabled(e.target.checked)}
                                    className="w-5 h-5 rounded border-[#C5E0DC] text-[#2A9D8F] focus:ring-[#2A9D8F]"
                                />
                                <span className="font-semibold text-[#1A2E2C]">
                                    {t('autoBid.enable')}
                                </span>
                            </label>

                            {/* Input Field */}
                            {enabled && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                    <label className="block text-sm font-semibold text-[#1A2E2C]">
                                        {t('autoBid.maxAmount')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={maxAmount}
                                            onChange={(e) => setMaxAmount(e.target.value)}
                                            placeholder={t('autoBid.placeholder')}
                                            className={`w-full bg-white border ${localError ? 'border-[#E05252]' : 'border-[#C5E0DC]'} rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#2A9D8F] transition-all font-cairo ${isAr ? 'pl-14' : 'pr-14'}`}
                                            min={minBid}
                                            required
                                            dir="ltr"
                                        />
                                        <span className={`absolute top-1/2 -translate-y-1/2 text-[#6B9E99] font-semibold ${isAr ? 'left-4' : 'right-4'}`}>
                                            ر.س
                                        </span>
                                    </div>
                                    {localError && (
                                        <p className="text-[#E05252] text-sm mt-1">
                                            {localError}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Footer Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => onOpenChange(false)}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 bg-[#F4FAFA] text-[#2A9D8F] hover:bg-[#E2F1EF] rounded-xl font-bold transition-colors"
                                >
                                    {t('autoBid.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || (enabled && !maxAmount)}
                                    className="flex-1 px-4 py-3 bg-[#2A9D8F] text-white hover:bg-[#1A7A6E] rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (enabled ? t('autoBid.enable') : t('saveChanges'))}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
