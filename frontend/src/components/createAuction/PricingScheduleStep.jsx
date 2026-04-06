import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function PricingScheduleStep({ formData, setFormData, onNext, onBack }) {
  const { t, i18n } = useTranslation('createAuction');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNext = () => {
    const newErrors = {};
    const sp = parseFloat(formData.startingPrice);
    if (!formData.startingPrice || isNaN(sp) || sp <= 0) {
      newErrors.startingPrice = t('priceError');
    }

    if (formData.reservePrice) {
      const rp = parseFloat(formData.reservePrice);
      if (isNaN(rp) || rp < sp) {
        newErrors.reservePrice = t('priceError');
      }
    }
    
    if (!formData.startDate) {
      newErrors.startDate = t('requiredField');
    }

    if (!formData.endDate) {
      newErrors.endDate = t('requiredField');
    } else if (formData.startDate) {
      const start = new Date(formData.startDate).getTime();
      const end = new Date(formData.endDate).getTime();
      if (end < start + 3600000) { // 1 hour
        newErrors.endDate = t('endDateError');
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return null;
    const start = new Date(formData.startDate).getTime();
    const end = new Date(formData.endDate).getTime();
    if (end <= start) return null;

    const diffMs = end - start;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return { days: diffDays, hours: diffHours };
  };

  const duration = calculateDuration();
  
  const minStartDate = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 font-semibold text-[#1A2E2C]">
            {t('startingPriceLabel')} <span className="text-[#E05252]">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              name="startingPrice"
              value={formData.startingPrice}
              onChange={handleChange}
              min="1"
              className={`w-full rounded-lg border bg-white px-4 py-3 focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none transition-shadow ${
                i18n.language === 'ar' ? 'pl-8' : 'pr-8'
              } ${errors.startingPrice ? 'border-[#E05252] focus:ring-[#E05252]' : 'border-[#C5E0DC]'}`}
              style={{ direction: 'ltr', textAlign: i18n.language === 'ar' ? 'right' : 'left' }}
            />
            <span className={`absolute top-1/2 -translate-y-1/2 text-gray-500 font-bold ${
              i18n.language === 'ar' ? 'left-3' : 'right-3'
            }`}>
              ﷼
            </span>
          </div>
          {errors.startingPrice && <p className="text-[#E05252] text-sm mt-1">{errors.startingPrice}</p>}
        </div>

        <div>
          <label className="block mb-2 font-semibold text-[#1A2E2C]">
            {t('reservePriceLabel')}
          </label>
          <div className="relative">
            <input
              type="number"
              name="reservePrice"
              value={formData.reservePrice}
              onChange={handleChange}
              min="1"
              className={`w-full rounded-lg border bg-white px-4 py-3 focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none transition-shadow ${
                i18n.language === 'ar' ? 'pl-8' : 'pr-8'
              } ${errors.reservePrice ? 'border-[#E05252] focus:ring-[#E05252]' : 'border-[#C5E0DC]'}`}
              style={{ direction: 'ltr', textAlign: i18n.language === 'ar' ? 'right' : 'left' }}
            />
            <span className={`absolute top-1/2 -translate-y-1/2 text-gray-500 font-bold ${
              i18n.language === 'ar' ? 'left-3' : 'right-3'
            }`}>
              ﷼
            </span>
          </div>
          {errors.reservePrice && <p className="text-[#E05252] text-sm mt-1">{errors.reservePrice}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 font-semibold text-[#1A2E2C]">
            {t('startDateLabel')} <span className="text-[#E05252]">*</span>
          </label>
          <input
            type="datetime-local"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            min={minStartDate}
            className={`w-full rounded-lg border bg-white px-4 py-3 focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none transition-shadow ${
              errors.startDate ? 'border-[#E05252] focus:ring-[#E05252]' : 'border-[#C5E0DC]'
            }`}
             style={{ direction: 'ltr', textAlign: i18n.language === 'ar' ? 'right' : 'left' }}
          />
          {errors.startDate && <p className="text-[#E05252] text-sm mt-1">{errors.startDate}</p>}
        </div>

        <div>
          <label className="block mb-2 font-semibold text-[#1A2E2C]">
            {t('endDateLabel')} <span className="text-[#E05252]">*</span>
          </label>
          <input
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={`w-full rounded-lg border bg-white px-4 py-3 focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none transition-shadow ${
              errors.endDate ? 'border-[#E05252] focus:ring-[#E05252]' : 'border-[#C5E0DC]'
            }`}
             style={{ direction: 'ltr', textAlign: i18n.language === 'ar' ? 'right' : 'left' }}
          />
          {errors.endDate && <p className="text-[#E05252] text-sm mt-1">{errors.endDate}</p>}
        </div>
      </div>

      {duration && !errors.endDate && (
         <div className="bg-[#F4FAFA] border border-[#C5E0DC] rounded-lg p-4 text-[#1A2E2C] font-semibold flex items-center justify-center gap-1">
           {t('auctionDuration')}: <span className="mx-1 text-[#2A9D8F] dir-ltr">{duration.days}</span> {t('days')} 
           {i18n.language === 'ar' ? <span className="mx-1 font-normal text-sm">و</span> : <span className="mx-1 font-normal text-sm">and</span>}
           <span className="mx-1 text-[#2A9D8F] dir-ltr">{duration.hours}</span> {t('hours')}
         </div>
      )}

      <div className="pt-6 flex flex-col md:flex-row justify-between gap-3">
        <button
          onClick={onBack}
          className="w-full md:w-auto bg-white border border-[#C5E0DC] text-[#1A2E2C] hover:bg-[#F4FAFA] px-8 py-3 rounded-lg font-bold transition-colors"
        >
          {t('previousStep')}
        </button>
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
