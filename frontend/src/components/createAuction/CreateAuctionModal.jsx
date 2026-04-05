import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { CheckCircle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StepIndicator from './StepIndicator';
import AuctionDetailsStep from './AuctionDetailsStep';
import ProductImagesStep from './ProductImagesStep';
import PricingScheduleStep from './PricingScheduleStep';
import ReviewPublishStep from './ReviewPublishStep';
import { createAuction } from '@/services/auctionService';
import { uploadImages } from '@/services/imageService';

export default function CreateAuctionModal({ open, onOpenChange }) {
  const { t } = useTranslation('createAuction');
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    auctionHouseId: null,
    images: [],
    startingPrice: '',
    reservePrice: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (open && !isPublished) {
      setCurrentStep(1);
      setFormData({
        title: '',
        description: '',
        auctionHouseId: null,
        images: [],
        startingPrice: '',
        reservePrice: '',
        startDate: '',
        endDate: ''
      });
      setIsPublished(false);
      setError(null);
    }
  }, [open]);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const handleSetStep = (stepIndex) => setCurrentStep(stepIndex);

  const handlePublish = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const sellerId = user?.id;

      if (!sellerId) throw new Error('User not found');

      const auctionPayload = {
        title: formData.title,
        description: formData.description,
        startingPrice: parseFloat(formData.startingPrice),
        reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : null,
        startDate: formData.startDate,
        endDate: formData.endDate,
        auctionHouseId: formData.auctionHouseId || null,
      };

      const createdAuction = await createAuction(sellerId, auctionPayload);

      if (formData.images.length > 0 && createdAuction?.id) {
        await uploadImages(createdAuction.id, formData.images);
      }

      setIsPublished(true);
    } catch {
      setError(t('publishFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
      <Dialog.Root open={open} onOpenChange={(val) => {
        if (!val && !isPublished && (formData.title || formData.images.length > 0)) {
          const confirmClose = window.confirm(t('pageTitle') + '?');
          if (!confirmClose) return;
        }
        onOpenChange(val);
      }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-4xl max-h-[90vh] bg-[#F4FAFA] rounded-xl shadow-xl z-50 overflow-hidden flex flex-col focus:outline-none animate-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="bg-white border-b border-[#C5E0DC] px-6 h-16 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <img src="/logos/mazadat_green_logo.png" alt="Mazadat" className="h-8" />
                <Dialog.Title className="font-bold text-[#1A2E2C] text-lg hidden sm:block">
                  {t('pageTitle')}
                </Dialog.Title>
              </div>
              {!isPublished && (
                  <Dialog.Close asChild>
                    <button className="text-[#6B9E99] hover:text-[#1A2E2C] transition-colors p-1 rounded-full hover:bg-gray-100">
                      <X className="w-6 h-6" />
                    </button>
                  </Dialog.Close>
              )}
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-4 md:p-8 flex-1">
              {isPublished ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-[#C5E0DC] max-w-md w-full animate-in fade-in zoom-in duration-500">
                      <div className="flex justify-center mb-6">
                        <CheckCircle className="w-20 h-20 text-[#2A9D8F]" strokeWidth={1.5} />
                      </div>
                      <h2 className="text-2xl font-bold text-[#1A2E2C] mb-8">{t('publishSuccess')}</h2>
                      <div className="space-y-3">
                        <button
                            onClick={handleClose}
                            className="block w-full bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-6 py-3 rounded-lg font-bold transition-colors"
                        >
                          {t('backToDashboard')}
                        </button>
                      </div>
                    </div>
                  </div>
              ) : (
                  <div className="container mx-auto max-w-3xl pb-8">
                    <StepIndicator currentStep={currentStep} />

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-[#E05252] text-[#E05252] rounded-lg px-4 py-3 text-sm font-semibold">
                          {error}
                        </div>
                    )}

                    <div className="mt-6 transition-all duration-300">
                      {currentStep === 1 && (
                          <AuctionDetailsStep
                              formData={formData}
                              setFormData={setFormData}
                              onNext={handleNext}
                          />
                      )}
                      {currentStep === 2 && (
                          <ProductImagesStep
                              formData={formData}
                              setFormData={setFormData}
                              onNext={handleNext}
                              onBack={handleBack}
                          />
                      )}
                      {currentStep === 3 && (
                          <PricingScheduleStep
                              formData={formData}
                              setFormData={setFormData}
                              onNext={handleNext}
                              onBack={handleBack}
                          />
                      )}
                      {currentStep === 4 && (
                          <ReviewPublishStep
                              formData={formData}
                              onBack={handleBack}
                              onPublish={handlePublish}
                              setStep={handleSetStep}
                              loading={loading}
                          />
                      )}
                    </div>
                  </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
  );
}