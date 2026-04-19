import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { createAuctionHouse } from '@/services/auctionHouseService';

export default function AuctionHouseCreationModal({ open, onOpenChange, onSuccess }) {
  const { t, i18n } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError(t('auctionHouseNameRequired') || 'Auction house name is required');
      return;
    }

    setLoading(true);
    try {
      await createAuctionHouse({
        name: formData.name,
        description: formData.description || '',
        category: formData.category || '',
      });

      // Reset form
      setFormData({ name: '', description: '', category: '' });
      setError(null);

      // Close modal and trigger success callback
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      let errorMessage = err.message;
      if (errorMessage && errorMessage.includes('size must be between 3 and 255')) {
        errorMessage = t('sizeBetween3And255') || errorMessage;
      }
      setError(errorMessage || t('auctionHouseCreationFailed') || 'Failed to create auction house');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} dir={i18n.dir()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl text-start">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-bold text-[#1A2E2C]">
              {t('createAuctionHouse') || 'Create Auction House'}
            </Dialog.Title>
            <Dialog.Close className="text-[#6B9E99] hover:text-[#2A9D8F] transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <p className="text-sm text-[#6B9E99] mb-6">
            {t('auctionHouseDescription') ||
              'Create your auction house to start listing items for sale'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-[#E05252] text-[#E05252] rounded-lg px-4 py-3 text-sm font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#1A2E2C] mb-2">
                {t('auctionHouseName') || 'Auction House Name'}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('auctionHouseNamePlaceholder') || 'e.g., My Store'}
                className="w-full px-4 py-2 rounded-lg border border-[#C5E0DC] bg-white text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-2 focus-visible:ring-[#2A9D8F]/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A2E2C] mb-2">
                {t('description') || 'Description'}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('auctionHouseDescriptionPlaceholder') || 'Tell us about your auction house...'}
                rows="4"
                className="w-full px-4 py-2 rounded-lg border border-[#C5E0DC] bg-white text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-2 focus-visible:ring-[#2A9D8F]/30 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A2E2C] mb-2">
                {t('category') || 'Category'}
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-[#C5E0DC] bg-white text-[#1A2E2C] focus-visible:border-[#2A9D8F] focus-visible:ring-2 focus-visible:ring-[#2A9D8F]/30 outline-none"
              >
                <option value="">{t('selectCategory') || 'Select a category'}</option>
                <option value="general">{t('general') || 'General'}</option>
                <option value="antiques">{t('antiques') || 'Antiques'}</option>
                <option value="art">{t('art') || 'Art'}</option>
                <option value="jewelry">{t('jewelry') || 'Jewelry'}</option>
                <option value="electronics">{t('electronics') || 'Electronics'}</option>
                <option value="furniture">{t('furniture') || 'Furniture'}</option>
                <option value="collectibles">{t('collectibles') || 'Collectibles'}</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-[#C5E0DC] text-[#6B9E99] hover:bg-[#F4FAFA] font-semibold transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '...' : t('create') || 'Create'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
