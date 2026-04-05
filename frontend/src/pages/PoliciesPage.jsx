import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

const sections = [
    { titleKey: 'section1Title', contentKey: 'section1Content' },
    { titleKey: 'section2Title', contentKey: 'section2Content' },
    { titleKey: 'section3Title', contentKey: 'section3Content' },
    { titleKey: 'section4Title', contentKey: 'section4Content' },
    { titleKey: 'section5Title', contentKey: 'section5Content' },
];

export default function PoliciesPage() {
    const { t, i18n } = useTranslation('policies');
    const navigate = useNavigate();
    const isAr = i18n.language === 'ar';

    return (
        <div className="min-h-screen bg-[#F4FAFA] px-4 py-10">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="bg-[#1A7A6E] rounded-xl p-8 mb-8 flex flex-col items-center text-center">
                    <ShieldCheck className="w-14 h-14 text-white mb-4" />
                    <h1 className="text-3xl font-bold text-white mb-2">{t('pageTitle')}</h1>
                    <p className="text-white/80 font-light text-sm">{t('pageSubtitle')}</p>
                </div>

                {/* Sections */}
                <div className="space-y-4">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl border border-[#C5E0DC] p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-[#EAF7F5] flex items-center justify-center shrink-0">
                                    <span className="text-[#2A9D8F] font-bold text-sm">{index + 1}</span>
                                </div>
                                <h2 className="text-lg font-bold text-[#1A2E2C]">{t(section.titleKey)}</h2>
                            </div>
                            <p className="text-[#1A2E2C] font-normal text-sm leading-relaxed pe-4">
                                {t(section.contentKey)}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Back Button */}
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-8 py-3 rounded-lg font-bold transition-colors"
                    >
                        {isAr ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                        {t('backHome')}
                    </button>
                </div>

            </div>
        </div>
    );
}