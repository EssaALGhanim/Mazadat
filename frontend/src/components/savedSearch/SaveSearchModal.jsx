import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save } from 'lucide-react';
import { createSavedSearch } from '@/services/savedSearchService';

export default function SaveSearchModal({ open, onOpenChange, currentFilters, onSaveSuccess }) {
  const { i18n } = useTranslation('common');
  const isAr = i18n.language === 'ar';
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();

    if (!searchName.trim()) {
      setError(isAr ? 'الرجاء إدخال اسم للبحث' : 'Please enter a search name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createSavedSearch({
        name: searchName.trim(),
        filters: currentFilters,
      });

      setSearchName('');
      onSaveSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(err.message || (isAr ? 'فشل حفظ البحث' : 'Failed to save search'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchName('');
    setError('');
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl border border-[#C5E0DC] m-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#C5E0DC]">
            <h2 className="text-xl font-bold text-[#1A2E2C] flex items-center gap-2">
              <Save className="w-5 h-5 text-[#2A9D8F]" />
              {isAr ? 'حفظ تفضيلات البحث' : 'Save Search Preferences'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[#F4FAFA] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#6B9E99]" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A2E2C] mb-2">
                {isAr ? 'اسم البحث' : 'Search Name'}
              </label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setError('');
                }}
                placeholder={isAr ? 'مثال: مزادات إلكترونيات رخيصة' : 'Example: Cheap Electronics Auctions'}
                className="w-full px-4 py-3 border border-[#C5E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] bg-white"
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Current Filters Summary */}
            <div className="bg-[#F4FAFA] rounded-lg p-4 border border-[#C5E0DC]">
              <p className="text-xs font-semibold text-[#6B9E99] mb-2">
                {isAr ? 'الفلاتر الحالية:' : 'Current Filters:'}
              </p>
              <div className="space-y-1 text-xs text-[#1A2E2C]">
                {currentFilters?.category && (
                  <p>• {isAr ? 'الفئة:' : 'Category:'} {currentFilters.category}</p>
                )}
                {currentFilters?.status !== 'all' && (
                  <p>• {isAr ? 'الحالة:' : 'Status:'} {currentFilters.status}</p>
                )}
                {currentFilters?.sortBy !== 'newest' && (
                  <p>• {isAr ? 'الترتيب:' : 'Sort:'} {currentFilters.sortBy}</p>
                )}
                {currentFilters?.priceRange && (
                  <p>• {isAr ? 'السعر:' : 'Price:'} {currentFilters.priceRange[0]} - {currentFilters.priceRange[1]}</p>
                )}
                {currentFilters?.auctionHouse && (
                  <p>• {isAr ? 'صالة المزاد' : 'Auction House'}</p>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-white border border-[#C5E0DC] text-[#6B9E99] rounded-lg font-semibold hover:bg-[#F4FAFA] transition-colors"
                disabled={loading}
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-[#2A9D8F] text-white rounded-lg font-semibold hover:bg-[#1A7A6E] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                {loading ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
