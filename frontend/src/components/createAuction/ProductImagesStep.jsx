import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ProductImagesStep({ formData, setFormData, onNext, onBack }) {
  const { t, i18n } = useTranslation('createAuction');
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.images.length + files.length > 5) {
      setError(t('imageLimitError'));
      return;
    }
    
    setError(null);
    
    const newImages = files.map((file, idx) => ({
      file,
      preview: URL.createObjectURL(file), // createObjectURL needs cleanup ideally, but fine for now
      displayOrder: formData.images.length + idx + 1
    }));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages].map((img, i) => ({...img, displayOrder: i + 1}))
    }));
    
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => {
      const filtered = prev.images.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: filtered.map((img, i) => ({ ...img, displayOrder: i + 1 }))
      };
    });
    setError(null);
  };

  const moveImage = (index, direction) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      const targetIndex = index + direction;
      
      if (targetIndex < 0 || targetIndex >= newImages.length) return prev;
      
      const temp = newImages[index];
      newImages[index] = newImages[targetIndex];
      newImages[targetIndex] = temp;
      
      return {
        ...prev,
        images: newImages.map((img, i) => ({ ...img, displayOrder: i + 1 }))
      };
    });
  };

  const isRtl = i18n.language === 'ar';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center p-8 border-2 border-dashed border-[#C5E0DC] rounded-xl bg-white transition-colors hover:border-[#2A9D8F]">
        <div className="flex justify-center mb-4 text-[#2A9D8F]">
          <Upload className="w-12 h-12" />
        </div>
        <h3 className="text-lg font-bold text-[#1A2E2C] mb-2">{t('imagesLabel')}</h3>
        <p className="text-[#6B9E99] mb-6 text-sm">{t('imagesHelper')}</p>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg, image/png, image/webp"
          multiple
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={formData.images.length >= 5}
          className={`px-6 py-2 rounded-lg font-bold transition-colors ${
            formData.images.length >= 5
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-[#F4FAFA] text-[#2A9D8F] border border-[#2A9D8F] hover:bg-[#2A9D8F] hover:text-white'
          }`}
        >
          {t('uploadButton')}
        </button>
        {error && <p className="text-[#E05252] text-sm mt-3">{error}</p>}
      </div>

      {formData.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {formData.images.map((img, index) => (
            <div key={img.preview} className="relative group rounded-xl overflow-hidden border border-[#C5E0DC] aspect-square bg-white shadow-sm flex flex-col justify-between">
              
              <div className="absolute top-2 right-2 flex gap-2 z-10 w-[calc(100%-16px)] justify-between pointer-events-none">
                 <div className="bg-[#2A9D8F] text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full pointer-events-auto shadow-sm">
                   {img.displayOrder}
                 </div>
                 <button
                  onClick={() => removeImage(index)}
                  className="bg-white text-[#E05252] w-6 h-6 flex items-center justify-center rounded-full shadow-sm hover:bg-[#E05252] hover:text-white transition-colors pointer-events-auto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {index === 0 && (
                <div className="absolute bottom-10 left-2 right-2 bg-black/60 text-white text-xs font-bold py-1 px-2 rounded backdrop-blur-sm text-center z-10">
                  {t('cover')}
                </div>
              )}

              <img src={img.preview} alt={`preview ${index}`} className="w-full h-full object-cover" />

              <div className="absolute bottom-0 left-0 right-0 h-10 bg-white/90 backdrop-blur-sm border-t border-[#C5E0DC] flex items-center justify-between px-2">
                 <button
                   onClick={(e) => { e.preventDefault(); moveImage(index, isRtl ? 1 : -1); }}
                   disabled={index === 0}
                   className="p-1 rounded hover:bg-[#F4FAFA] disabled:opacity-30 disabled:hover:bg-transparent text-[#1A2E2C]"
                 >
                   {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                 </button>
                 <button
                   onClick={(e) => { e.preventDefault(); moveImage(index, isRtl ? -1 : 1); }}
                   disabled={index === formData.images.length - 1}
                   className="p-1 rounded hover:bg-[#F4FAFA] disabled:opacity-30 disabled:hover:bg-transparent text-[#1A2E2C]"
                 >
                   {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                 </button>
              </div>

            </div>
          ))}
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
          onClick={onNext}
          className="w-full md:w-auto bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-8 py-3 rounded-lg font-bold transition-colors"
        >
          {t('nextStep')}
        </button>
      </div>
    </div>
  );
}
