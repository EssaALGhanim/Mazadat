import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, User, LogOut } from 'lucide-react';
import CreateAuctionModal from '../components/createAuction/CreateAuctionModal';
import AuctionCard from '../components/auction/AuctionCard';
import { getAllAuctions } from '@/services/auctionService';

export default function HomePage() {
    const { t, i18n } = useTranslation('common');
    const [currentUser, setCurrentUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isAr = i18n.language === 'ar';

    useEffect(() => {
        try {
            const stored = localStorage.getItem('user');
            const parsed = stored ? JSON.parse(stored) : null;
            setCurrentUser(parsed);
        } catch {
            setCurrentUser(null);
        }
    }, []);

    useEffect(() => {
        fetchAuctions();
    }, []);

    const fetchAuctions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllAuctions();
            setAuctions(data || []);
        } catch {
            setError(isAr ? 'فشل تحميل المزادات' : 'Failed to load auctions');
        } finally {
            setLoading(false);
        }
    };

    const handleActionComplete = (type) => {
        if (type === 'cancel') {
            alert(t('cancelSuccess'));
        } else if (type === 'sold') {
            alert(t('markAsSoldSuccess'));
        }
        fetchAuctions();
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/auth';
    };

    const isSeller = currentUser?.role === 'SELLER';

    return (
        <div className="min-h-screen bg-[#F0F2F5]">

            {/* Header */}
            <header className="bg-white border-b border-[#C5E0DC] px-6 h-16 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                <img src="/logos/mazadat_green_logo.png" alt="Mazadat" className="h-8" />

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.location.href = '/policies'}
                        className="text-[#6B9E99] hover:text-[#2A9D8F] text-sm font-semibold transition-colors"
                    >
                        {isAr ? 'الشروط والسياسات' : 'Policies'}
                    </button>

                    <button
                        onClick={() => window.location.href = '/profile/edit'}
                        className="flex items-center gap-1 text-[#6B9E99] hover:text-[#2A9D8F] text-sm font-semibold transition-colors"
                    >
                        <User className="w-4 h-4" />
                        {isAr ? 'الملف الشخصي' : 'Profile'}
                    </button>

                    <button
                        onClick={() => i18n.changeLanguage(isAr ? 'en' : 'ar')}
                        className="bg-[#F4FAFA] hover:bg-[#E2F1EF] text-[#2A9D8F] px-4 py-2 rounded-lg font-bold transition-colors text-sm"
                    >
                        {isAr ? 'English' : 'العربية'}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1 bg-white border border-[#E05252] text-[#E05252] hover:bg-[#E05252] hover:text-white px-4 py-2 rounded-lg font-bold transition-colors text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        {isAr ? 'تسجيل الخروج' : 'Logout'}
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-2xl">

                {/* Create Auction Block */}
                {isSeller && (
                    <div className="bg-white rounded-xl shadow-sm border border-[#C5E0DC] p-4 mb-6">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#EAF7F5] flex items-center justify-center shrink-0">
                                <User className="w-6 h-6 text-[#2A9D8F]" />
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex-1 bg-[#F4FAFA] hover:bg-[#E2F1EF] text-[#6B9E99] px-4 py-2.5 rounded-full font-medium transition-colors border border-[#C5E0DC] focus:outline-none"
                                style={{ textAlign: isAr ? 'right' : 'left' }}
                            >
                                {isAr ? 'ما الذي تريد بيعه اليوم في المزاد؟' : 'What would you like to auction today?'}
                            </button>
                        </div>
                        <div className="h-px bg-gray-100 my-3"></div>
                        <div className="flex justify-around">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 text-[#6B9E99] hover:bg-[#F4FAFA] px-4 py-2 rounded-lg transition-colors font-semibold flex-1 justify-center"
                            >
                                <Plus className="w-5 h-5 text-[#2A9D8F]" />
                                <span>{isAr ? 'إضافة مزاد جديد' : 'Add New Listing'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-[#C5E0DC] border-t-[#2A9D8F] rounded-full animate-spin" />
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="bg-white rounded-xl border border-[#E05252] p-6 text-center">
                        <p className="text-[#E05252] font-semibold mb-4">{error}</p>
                        <button
                            onClick={fetchAuctions}
                            className="bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-6 py-2 rounded-lg font-bold transition-colors"
                        >
                            {isAr ? 'إعادة المحاولة' : 'Try Again'}
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && auctions.length === 0 && (
                    <div className="bg-white rounded-xl border border-[#C5E0DC] p-12 text-center">
                        <p className="text-[#6B9E99] font-semibold text-lg">
                            {isAr ? 'لا توجد مزادات حالياً' : 'No auctions available'}
                        </p>
                    </div>
                )}

                {/* Auction Feed */}
                {!loading && !error && auctions.length > 0 && (
                    <div className="space-y-6">
                        {auctions.map((auction) => (
                            <AuctionCard
                                key={auction.id}
                                auction={auction}
                                currentUser={currentUser}
                                onActionComplete={handleActionComplete}
                            />
                        ))}
                    </div>
                )}

            </main>

            <CreateAuctionModal open={isModalOpen} onOpenChange={setIsModalOpen} />
        </div>
    );
}