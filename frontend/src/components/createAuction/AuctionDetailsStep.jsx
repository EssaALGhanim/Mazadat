import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

const mockAuctionHouses = [
  { id: '1', name: 'دار المزادات الملكية', location: 'الرياض' },
  { id: '2', name: 'مزادات الخليج', location: 'جدة' },
  { id: '3', name: 'بيت المزادات الدولي', location: 'الدمام' }
];

export default function AuctionDetailsStep({ formData, setFormData, onNext }) {
  const { t } = useTranslation('createAuction');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleNext = () => {
    const newErrors = {};
    if (!formData.title || formData.title.trim().length === 0) {
      newErrors.title = t('requiredField');
    }
    if (!formData.description || formData.description.trim().length === 0) {
      newErrors.description = t('requiredField'); 
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onNext();
  };

  const displayCount = (curr, max) => {
    return `${curr}/${max}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <label className="block mb-2 font-semibold text-[#1A2E2C]">
          {t('titleLabel')} <span className="text-[#E05252]">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          maxLength={100}
          placeholder={t('titlePlaceholder')}
          className={`w-full rounded-lg border bg-white px-4 py-3 focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none transition-shadow ${
            errors.title ? 'border-[#E05252] focus:ring-[#E05252]' : 'border-[#C5E0DC]'
          }`}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-[#E05252] min-h-[20px]">{errors.title}</span>
          <span className="text-xs text-[#6B9E99]" dir="ltr">
            {displayCount(formData.title.length, 100)}
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block mb-2 font-semibold text-[#1A2E2C]">
          {t('descriptionLabel')} <span className="text-[#E05252]">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          maxLength={1000}
          rows={5}
          placeholder={t('descriptionPlaceholder')}
          className={`w-full rounded-lg border bg-white px-4 py-3 focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none transition-shadow resize-y min-h-[120px] ${
            errors.description ? 'border-[#E05252] focus:ring-[#E05252]' : 'border-[#C5E0DC]'
          }`}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-[#E05252] min-h-[20px]">{errors.description}</span>
          <span className="text-xs text-[#6B9E99]" dir="ltr">
            {displayCount(formData.description.length, 1000)}
          </span>
        </div>
      </div>

      {/* Auction House */}
      <div className="relative">
        <label className="block mb-2 font-semibold text-[#1A2E2C]">
          {t('auctionHouseLabel')}
        </label>
        <div className="relative">
            <select
            name="auctionHouseId"
            value={formData.auctionHouseId || ''}
            onChange={handleChange}
            className="w-full appearance-none rounded-lg border border-[#C5E0DC] bg-white px-4 py-3 pr-10 rtl:pr-4 rtl:pl-10 focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none transition-shadow"
            >
            <option value="">{t('auctionHouseNone')}</option>
            {mockAuctionHouses.map((house) => (
                <option key={house.id} value={house.id}>
                {house.name} - {house.location}
                </option>
            ))}
            </select>
            <ChevronDown className="absolute top-1/2 -translate-y-1/2 rtl:left-3 ltr:right-3 w-5 h-5 text-[#6B9E99] pointer-events-none" />
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button
          onClick={handleNext}
          className="w-full md:w-auto bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-8 py-3 rounded-lg font-bold transition-colors"
        >
          {t('nextStep')}
        </button>
      </div>
    </div>
  );
}
