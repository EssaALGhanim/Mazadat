import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2 } from 'lucide-react';

const mockAuctionHouses = [
  { id: '1', name: 'دار المزادات الملكية', location: 'الرياض' },
  { id: '2', name: 'مزادات الخليج', location: 'جدة' },
  { id: '3', name: 'بيت المزادات الدولي', location: 'الدمام' }
];

export default function ReviewPublishStep({ formData, onBack, onPublish, setStep }) {
  const { t, i18n } = useTranslation('createAuction');
  const [descExpanded, setDescExpanded] = useState(false);

  const house = mockAuctionHouses.find(h => h.id === formData.auctionHouseId);
  const houseDisplay = house ? `${house.name} - ${house.location}` : '—';

  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(d);
  };

  const SectionHeader = ({ title, stepIndex }) => (
    <div className="flex justify-between items-center mb-3">
      <h3 className="font-bold text-[#1A2E2C] text-lg">{title}</h3>
      <button 
        onClick={() => setStep(stepIndex)}
        className="text-[#2A9D8F] flex items-center gap-1 text-sm font-semibold hover:text-[#1A7A6E] transition-colors"
      >
        <span>{t('edit')}</span>
        <Edit2 className="w-4 h-4 ml-1 rtl:mr-1 rtl:ml-0" />
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Review Content */}
      <div className="bg-white rounded-xl shadow-sm border border-[#C5E0DC] p-6 space-y-8">
        
        {/* Step 1 Review */}
        <div>
          <SectionHeader title={t('step1Title')} stepIndex={1} />
          <div className="space-y-4 text-sm text-[#1A2E2C]">
            <div>
              <span className="text-[#6B9E99] block mb-1">{t('titleLabel')}</span>
              <p className="font-medium">{formData.title}</p>
            </div>
            <div>
              <span className="text-[#6B9E99] block mb-1">{t('descriptionLabel')}</span>
              <div className="bg-[#F4FAFA] p-3 rounded-lg">
                <p className={`whitespace-pre-wrap ${!descExpanded && 'line-clamp-3'}`}>
                  {formData.description}
                </p>
                {formData.description.length > 150 && (
                  <button 
                    onClick={() => setDescExpanded(!descExpanded)}
                    className="text-[#2A9D8F] text-xs font-bold mt-2"
                  >
                    {descExpanded ? (i18n.language === 'ar' ? 'عرض أقل' : 'Show less') : (i18n.language === 'ar' ? 'قراءة المزيد' : 'Read more')}
                  </button>
                )}
              </div>
            </div>
            <div>
              <span className="text-[#6B9E99] block mb-1">{t('auctionHouseLabel')}</span>
              <p className="font-medium">{houseDisplay}</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#C5E0DC] w-full" />

        {/* Step 2 Review */}
        <div>
          <SectionHeader title={t('step2Title')} stepIndex={2} />
          {formData.images.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#C5E0DC]">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-[#C5E0DC]">
                  <img src={img.preview} alt={`preview ${idx}`} className="w-full h-full object-cover" />
                  {idx === 0 && <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center p-0.5">{t('cover')}</div>}
                </div>
              ))}
            </div>
          ) : (
             <p className="text-[#6B9E99] text-sm">{i18n.language === 'ar' ? 'لم يتم إضافة صور' : 'No images added'}</p>
          )}
        </div>

        <div className="h-px bg-[#C5E0DC] w-full" />

        {/* Step 3 Review */}
        <div>
          <SectionHeader title={t('step3Title')} stepIndex={3} />
          <div className="grid grid-cols-2 gap-4 text-sm text-[#1A2E2C]">
            <div>
              <span className="text-[#6B9E99] block mb-1">{t('startingPriceLabel')}</span>
              <p className="font-bold text-[#2A9D8F] dir-ltr inline-block" dir="ltr">
                {formData.startingPrice} <span className="text-gray-500">﷼</span>
              </p>
            </div>
            <div>
              <span className="text-[#6B9E99] block mb-1">{t('reservePriceLabel')}</span>
              <p className="font-bold text-[#2A9D8F] dir-ltr inline-block" dir="ltr">
                {formData.reservePrice ? <>{formData.reservePrice} <span className="text-gray-500">﷼</span></> : '—'}
              </p>
            </div>
            <div>
              <span className="text-[#6B9E99] block mb-1">{t('startDateLabel')}</span>
              <p className="font-medium" dir="ltr">{formatDateTime(formData.startDate)}</p>
            </div>
            <div>
              <span className="text-[#6B9E99] block mb-1">{t('endDateLabel')}</span>
              <p className="font-medium" dir="ltr">{formatDateTime(formData.endDate)}</p>
            </div>
          </div>
        </div>

      </div>

      <div className="pt-2 flex flex-col md:flex-row justify-between gap-3">
        <button
          onClick={onBack}
          className="w-full md:w-auto bg-white border border-[#C5E0DC] text-[#1A2E2C] hover:bg-[#F4FAFA] px-8 py-3 rounded-lg font-bold transition-colors"
        >
          {t('previousStep')}
        </button>
        <button
          onClick={onPublish}
          className="w-full md:w-auto bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-lg"
        >
          {t('submitListing')}
        </button>
      </div>

    </div>
  );
}
