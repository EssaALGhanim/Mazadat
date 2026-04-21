import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import TopNavigationBar from '../components/TopNavigationBar';

const sections = [
    { titleKey: 'section1Title', contentKey: 'section1Content' },
    { titleKey: 'section2Title', contentKey: 'section2Content' },
    { titleKey: 'section3Title', contentKey: 'section3Content' },
    { titleKey: 'section4Title', contentKey: 'section4Content' },
    { titleKey: 'section5Title', contentKey: 'section5Content' },
];

export default function PoliciesPage() {
    const { t } = useTranslation('policies');
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('user');
            setCurrentUser(stored ? JSON.parse(stored) : null);
        } catch {
            setCurrentUser(null);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/auth';
    };

    const isSeller = currentUser?.role === 'SELLER';
    const isBuyer = currentUser?.role === 'BUYER';

    return (
        <div className="min-h-screen bg-[#F4FAFA] flex flex-col">
            <TopNavigationBar
                currentUser={currentUser}
                isSeller={isSeller}
                isBuyer={isBuyer}
                onShowMyBids={() => navigate('/')}
                onShowWatchlist={() => navigate('/', { state: { openWatchlist: true } })}
                onCreateAuction={() => navigate('/seller-dashboard')}
                onLogout={handleLogout}
            />

            <div className="flex-1 relative px-4 py-8 sm:py-12">
                <div className="max-w-3xl mx-auto relative z-10">
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
                </div>
            </div>
        </div>
    );
}