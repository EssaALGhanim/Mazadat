import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { X, Zap, Pause, Play, Trash2 } from 'lucide-react';

export default function AutoBidModal({
  open,
  onOpenChange,
  currentPrice,
  minBid,
  existingAutoBid = null,
  onCreateAutoBid,
  onUpdateAutoBid,
  onDeleteAutoBid,
  loading = false,
}) {
  const { i18n } = useTranslation('common');
  const isAr = i18n.language === 'ar';
  const [maxAmount, setMaxAmount] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (existingAutoBid) {
      setMaxAmount(existingAutoBid.maxAmount.toString());
    } else {
      setMaxAmount('');
    }
  }, [existingAutoBid, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const amount = parseFloat(maxAmount);

    if (!maxAmount || isNaN(amount) || amount <= 0) {
      setError(isAr ? 'الرجاء إدخال مبلغ صالح' : 'Please enter a valid amount');
      return;
    }

    if (!Number.isInteger(amount)) {
      setError(isAr ? 'الرجاء إدخال رقم صحيح بدون كسور' : 'Please enter a whole number only');
      return;
    }

    if (amount < minBid) {
      setError(isAr ? `يجب أن يكون المبلغ ${minBid} على الأقل` : `Amount must be at least ${minBid}`);
      return;
    }

    if (existingAutoBid) {
      onUpdateAutoBid?.(existingAutoBid.id, { maxAmount: amount });
    } else {
      onCreateAutoBid?.(amount);
    }
  };

  const handleToggleActive = () => {
    if (existingAutoBid) {
      onUpdateAutoBid?.(existingAutoBid.id, { isActive: !existingAutoBid.isActive });
    }
  };

  const handleDelete = () => {
    if (existingAutoBid) {
      const confirmText = isAr
        ? 'هل أنت متأكد من حذف المزايدة التلقائية؟'
        : 'Are you sure you want to delete auto-bidding?';
      if (window.confirm(confirmText)) {
        onDeleteAutoBid?.(existingAutoBid.id);
      }
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setMaxAmount('');
      setError(null);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-bold text-[#1A2E2C] flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#FFA500]" />
              {isAr ? 'المزايدة التلقائية' : 'Auto-Bidding'}
            </Dialog.Title>
            <Dialog.Close className="text-[#6B9E99] hover:text-[#2A9D8F] transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Info Section */}
          <div className="bg-[#FFF8E1] border border-[#FFA500]/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-[#1A2E2C] leading-relaxed">
              {isAr
                ? 'سيقوم النظام بالمزايدة تلقائيًا نيابة عنك حتى يصل السعر إلى الحد الأقصى المحدد.'
                : 'The system will automatically bid on your behalf until the price reaches your maximum limit.'}
            </p>
          </div>

          {/* Existing Auto-Bid Status */}
          {existingAutoBid && (
            <div
              className={`rounded-lg p-4 mb-4 ${
                existingAutoBid.isActive
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#1A2E2C]">
                  {isAr ? 'الحالة:' : 'Status:'}
                </span>
                <span
                  className={`text-sm font-bold ${
                    existingAutoBid.isActive ? 'text-green-600' : 'text-gray-600'
                  }`}
                >
                  {existingAutoBid.isActive
                    ? (isAr ? '🟢 نشط' : '🟢 Active')
                    : (isAr ? '⏸️ متوقف' : '⏸️ Paused')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1A2E2C]">
                  {isAr ? 'الحد الأقصى الحالي:' : 'Current Max:'}
                </span>
                <span className="text-lg font-bold text-[#2A9D8F]" dir="ltr">
                  {existingAutoBid.maxAmount} ﷼
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Price Display */}
            <div className="bg-[#F4FAFA] border border-[#C5E0DC] rounded-lg p-4">
              <p className="text-sm text-[#6B9E99] mb-1">
                {isAr ? 'السعر الحالي' : 'Current Price'}
              </p>
              <p className="text-2xl font-bold text-[#2A9D8F]" dir="ltr">
                {currentPrice} <span className="text-sm">﷼</span>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-[#E05252] text-[#E05252] rounded-lg px-4 py-3 text-sm font-semibold">
                {error}
              </div>
            )}

            {/* Max Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-[#1A2E2C] mb-2">
                {isAr ? 'الحد الأقصى للمزايدة' : 'Maximum Bid Amount'}{' '}
                <span className="text-[#E05252]">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => {
                    setMaxAmount(e.target.value);
                    setError(null);
                  }}
                  placeholder={`${minBid} ${isAr ? 'أو أكثر' : 'or more'}`}
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
              <p className="text-xs text-[#6B9E99] mt-2">
                {isAr
                  ? 'سيتم تطبيق نفس قاعدة 5% للمزايدة التلقائية'
                  : 'The same 5% increment rule applies to auto-bidding'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4">
              {/* Save/Update Button */}
              <button
                type="submit"
                disabled={loading || !maxAmount}
                className="w-full px-4 py-3 rounded-lg bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                {loading
                  ? '...'
                  : existingAutoBid
                  ? (isAr ? 'تحديث المزايدة التلقائية' : 'Update Auto-Bid')
                  : (isAr ? 'تفعيل المزايدة التلقائية' : 'Enable Auto-Bid')}
              </button>

              {/* Toggle Active/Pause Button */}
              {existingAutoBid && (
                <button
                  type="button"
                  onClick={handleToggleActive}
                  disabled={loading}
                  className={`w-full px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                    existingAutoBid.isActive
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {existingAutoBid.isActive ? (
                    <>
                      <Pause className="w-4 h-4" />
                      {isAr ? 'إيقاف مؤقت' : 'Pause'}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      {isAr ? 'استئناف' : 'Resume'}
                    </>
                  )}
                </button>
              )}

              {/* Delete Button */}
              {existingAutoBid && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-[#E05252] text-[#E05252] hover:bg-[#E05252] hover:text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {isAr ? 'حذف المزايدة التلقائية' : 'Delete Auto-Bid'}
                </button>
              )}

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border border-[#C5E0DC] text-[#6B9E99] hover:bg-[#F4FAFA] font-bold transition-colors disabled:opacity-50"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
