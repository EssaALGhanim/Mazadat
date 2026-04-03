import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const stepsKey = [
  'step1Title',
  'step2Title',
  'step3Title',
  'step4Title'
];

export default function StepIndicator({ currentStep }) {
  const { t } = useTranslation('createAuction');

  return (
    <div className="w-full py-6 mb-8">
      {/* Desktop view */}
      <div className="hidden md:flex items-center justify-center max-w-3xl mx-auto">
        {stepsKey.map((key, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <React.Fragment key={key}>
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                    isCompleted
                      ? 'bg-[#2A9D8F] border-[#2A9D8F] text-white'
                      : isCurrent
                      ? 'border-[#2A9D8F] text-[#2A9D8F] bg-white'
                      : 'border-[#6B9E99] text-[#6B9E99] bg-white'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                </div>
                <span
                  className={`absolute top-12 text-sm whitespace-nowrap font-medium ${
                    isCompleted || isCurrent ? 'text-[#1A2E2C]' : 'text-[#6B9E99]'
                  }`}
                >
                  {t(key)}
                </span>
              </div>
              
              {index < stepsKey.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-colors ${
                    isCompleted ? 'bg-[#2A9D8F]' : 'bg-[#C5E0DC]'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile view */}
      <div className="flex md:hidden flex-col items-center">
        <div className="flex items-center justify-center space-x-2 space-x-reverse mb-3">
          {stepsKey.map((key, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <React.Fragment key={key}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    isCompleted
                      ? 'bg-[#2A9D8F] border-[#2A9D8F] text-white'
                      : isCurrent
                      ? 'border-[#2A9D8F] text-[#2A9D8F] bg-white'
                      : 'border-[#6B9E99] text-[#6B9E99] bg-white'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                {index < stepsKey.length - 1 && (
                  <div
                    className={`w-4 h-0.5 transition-colors ${
                      isCompleted ? 'bg-[#2A9D8F]' : 'bg-[#C5E0DC]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="text-[#1A2E2C] font-semibold text-sm">
          {t('step' + currentStep + 'Title')}
        </div>
      </div>
    </div>
  );
}
