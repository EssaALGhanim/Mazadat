import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Trash2, Edit2, Check, Search, Bookmark } from 'lucide-react';
import { getSavedSearches, updateSavedSearch, deleteSavedSearch } from '@/services/savedSearchService';

export default function ManageSavedSearchesModal({ open, onOpenChange, onLoadSearch }) {
  const { i18n } = useTranslation('common');
  const isAr = i18n.language === 'ar';
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (open) {
      fetchSearches();
    }
  }, [open]);

  const fetchSearches = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSavedSearches();
      const searchList = Array.isArray(data) ? data : data?.data || [];
      setSearches(searchList);
    } catch (err) {
      setError(err.message || (isAr ? 'فشل تحميل عمليات البحث المحفوظة' : 'Failed to load saved searches'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (search) => {
    setEditingId(search.id);
    setEditName(search.name);
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) {
      return;
    }

    try {
      await updateSavedSearch(id, { name: editName.trim() });
      await fetchSearches();
      setEditingId(null);
      setEditName('');
    } catch (err) {
      alert(err.message || (isAr ? 'فشل تحديث الاسم' : 'Failed to update name'));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      isAr
        ? 'هل أنت متأكد من حذف عملية البحث المحفوظة هذه؟'
        : 'Are you sure you want to delete this saved search?'
    );

    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteSavedSearch(id);
      await fetchSearches();
    } catch (err) {
      alert(err.message || (isAr ? 'فشل حذف البحث' : 'Failed to delete search'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoadSearch = (search) => {
    onLoadSearch?.(search.filters);
    onOpenChange(false);
  };

  const handleClose = () => {
    setEditingId(null);
    setEditName('');
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
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="bg-white rounded-xl shadow-2xl border border-[#C5E0DC] m-4 flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#C5E0DC]">
            <h2 className="text-xl font-bold text-[#1A2E2C] flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-[#2A9D8F]" />
              {isAr ? 'إدارة عمليات البحث المحفوظة' : 'Manage Saved Searches'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[#F4FAFA] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#6B9E99]" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#C5E0DC] border-t-[#2A9D8F] mb-4" />
                <p className="text-[#6B9E99] font-medium">
                  {isAr ? 'جاري التحميل...' : 'Loading...'}
                </p>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <button
                  onClick={fetchSearches}
                  className="px-4 py-2 bg-[#2A9D8F] text-white rounded-lg font-semibold hover:bg-[#1A7A6E] transition-colors"
                >
                  {isAr ? 'إعادة المحاولة' : 'Try Again'}
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && searches.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="p-4 rounded-full bg-[#F4FAFA] mb-4">
                  <Search className="w-12 h-12 text-[#6B9E99]" />
                </div>
                <h3 className="text-lg font-bold text-[#1A2E2C] mb-2">
                  {isAr ? 'لا توجد عمليات بحث محفوظة' : 'No Saved Searches'}
                </h3>
                <p className="text-[#6B9E99] text-center max-w-sm">
                  {isAr
                    ? 'احفظ تفضيلات البحث الخاصة بك للوصول السريع إلى المزادات المفضلة لديك.'
                    : 'Save your search preferences for quick access to your favorite auctions.'}
                </p>
              </div>
            )}

            {/* Searches List */}
            {!loading && !error && searches.length > 0 && (
              <div className="space-y-3">
                {searches.map((search) => (
                  <div
                    key={search.id}
                    className="bg-white border border-[#C5E0DC] rounded-lg p-4 hover:border-[#2A9D8F] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {editingId === search.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 px-3 py-2 border border-[#C5E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEdit(search.id)}
                              className="p-2 bg-[#2A9D8F] text-white rounded-lg hover:bg-[#1A7A6E] transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-bold text-[#1A2E2C] mb-2">{search.name}</h3>
                            <div className="flex flex-wrap gap-2 text-xs">
                              {search.filters.category && (
                                <span className="px-2 py-1 bg-[#F4FAFA] text-[#6B9E99] rounded-md">
                                  {search.filters.category}
                                </span>
                              )}
                              {search.filters.status !== 'all' && (
                                <span className="px-2 py-1 bg-[#F4FAFA] text-[#6B9E99] rounded-md">
                                  {search.filters.status}
                                </span>
                              )}
                              {search.filters.priceRange && (
                                <span className="px-2 py-1 bg-[#F4FAFA] text-[#6B9E99] rounded-md">
                                  {search.filters.priceRange[0]} - {search.filters.priceRange[1]} ﷼
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {editingId !== search.id && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLoadSearch(search)}
                            className="px-3 py-2 bg-[#2A9D8F] text-white rounded-lg text-xs font-semibold hover:bg-[#1A7A6E] transition-colors"
                          >
                            {isAr ? 'تحميل' : 'Load'}
                          </button>
                          <button
                            onClick={() => handleEdit(search)}
                            className="p-2 text-[#6B9E99] hover:bg-[#F4FAFA] rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(search.id)}
                            disabled={deletingId === search.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#C5E0DC]">
            <button
              onClick={handleClose}
              className="w-full px-4 py-3 bg-white border border-[#C5E0DC] text-[#6B9E99] rounded-lg font-semibold hover:bg-[#F4FAFA] transition-colors"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
