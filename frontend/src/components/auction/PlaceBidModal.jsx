import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

export default function PlaceBidModal({
  open,
  onOpenChange,
  currentPrice,
  minBid,
  hasPreviousBid = true,
  onBidSubmit,
  loading = false,
  submitError = null,
  onClearSubmitError,
}) {
  const { t } = useTranslation('common');
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    onClearSubmitError?.();

    const amount = parseFloat(bidAmount);

    if (!bidAmount || isNaN(amount) || amount <= 0) {
      setError(t('invalidBidAmount') || 'Please enter a valid bid amount');
      return;
    }

    if (!Number.isInteger(amount)) {
      setError('Please enter a whole number only / الرجاء إدخال رقم صحيح بدون كسور');
      return;
    }

    if (amount < minBid) {
      setError(t('bidTooLow') || `Bid must be at least ${minBid}`);
      return;
    }

    const success = await onBidSubmit?.(amount);
    if (success !== false) {
      setBidAmount('');
      setError(null);
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setBidAmount('');
      setError(null);
      onClearSubmitError?.();
    }
    onOpenChange?.(newOpen);
  };

  const activeError = error || submitError;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-bold text-[#1A2E2C]">
              {t('placeBid') || 'Place a Bid'}
            </Dialog.Title>
            <Dialog.Close className="text-[#6B9E99] hover:text-[#2A9D8F] transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Price Display */}
            <div className="bg-[#F4FAFA] border border-[#C5E0DC] rounded-lg p-4">
              <p className="text-sm text-[#6B9E99] mb-1">{t('currentBid') || 'Current Bid'}</p>
              <p className="text-2xl font-bold text-[#2A9D8F]" dir="ltr">
                {currentPrice} <span className="text-sm">﷼</span>
              </p>
            </div>

            <div className="text-sm text-[#6B9E99]">
              Bids must be at least 5% higher than the previous bid / يجب أن تكون المزايدة أعلى بنسبة 5% على الأقل من المزايدة السابقة
            </div>

            {/* Error Message */}
            {activeError && (
              <div className="bg-red-50 border border-[#E05252] text-[#E05252] rounded-lg px-4 py-3 text-sm font-semibold">
                {activeError}
              </div>
            )}

            {/* Bid Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-[#1A2E2C] mb-2">
                {t('bidAmount') || 'Bid Amount'} <span className="text-[#E05252]">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => {
                    setBidAmount(e.target.value);
                    setError(null);
                    onClearSubmitError?.();
                  }}
                  placeholder={`${minBid} or more`}
                  min={minBid}
                  step="1"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg border border-[#C5E0DC] bg-white text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-2 focus-visible:ring-[#2A9D8F]/30 outline-none disabled:opacity-50"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B9E99] font-bold">
                  ﷼
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg border border-[#C5E0DC] text-[#6B9E99] hover:bg-[#F4FAFA] font-bold transition-colors disabled:opacity-50"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading || !bidAmount}
                className="flex-1 px-4 py-3 rounded-lg bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '...' : (t('placeBid') || 'Place Bid')}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

