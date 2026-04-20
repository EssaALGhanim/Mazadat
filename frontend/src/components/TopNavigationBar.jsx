import { useTranslation } from 'react-i18next';
import { Plus, User, LogOut, Trophy, BarChart3, Users, Bookmark , BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopNavigationBar({
    isSeller,
    isBuyer,
    onShowMyBids,
    onShowWatchlist,
    onCreateAuction,
    onLogout,
    disableCreateAuction = false
}) {
    const { i18n } = useTranslation('common');
    const navigate = useNavigate();
    const isAr = i18n.language === 'ar';

    return (
        <header className="bg-white border-b border-[#C5E0DC] px-4 md:px-6 h-16 flex items-center justify-between sticky top-0 z-50 shadow-sm">
            {/* Logo and Home */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => isSeller ? navigate('/seller-dashboard') : navigate('/')}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    title={isAr ? 'الرئيسية' : 'Home'}
                >
                    <img src="/logos/mazadat_green_logo.png" alt="Mazadat" className="h-8" />
                </button>
            </div>

            {/* Center Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
                {isSeller && (
                    <button
                        onClick={() => navigate('/seller-dashboard')}
                        className="flex items-center gap-1 text-[#6B9E99] hover:text-[#2A9D8F] text-sm font-semibold transition-colors"
                        title={isAr ? 'لوحة التحكم' : 'Dashboard'}
                    >
                        <BarChart3 className="w-4 h-4" />
                        <span className="hidden lg:inline">{isAr ? 'لوحة التحكم' : 'Dashboard'}</span>
                    </button>
                )}
                {isSeller && (
                    <button
                        onClick={() => navigate('/seller/team')}
                        className="flex items-center gap-1 text-[#6B9E99] hover:text-[#2A9D8F] text-sm font-semibold transition-colors"
                        title={isAr ? 'الفريق' : 'Team'}
                    >
                        <Users className="w-4 h-4" />
                        <span className="hidden lg:inline">{isAr ? 'الفريق' : 'Team'}</span>
                    </button>
                )}
                {isBuyer && (
                    <button
                        onClick={() => onShowMyBids?.()}
                        className="flex items-center gap-1 text-[#6B9E99] hover:text-[#2A9D8F] text-sm font-semibold transition-colors"
                        title={isAr ? 'مزايداتي' : 'My Bids'}
                    >
                        <Trophy className="w-4 h-4" />
                        <span className="hidden lg:inline">{isAr ? 'مزايداتي' : 'My Bids'}</span>
                    </button>
                )}
                {isBuyer && (
                    <button
                        onClick={() => onShowWatchlist?.()}
                        className="flex items-center gap-1 text-[#6B9E99] hover:text-[#2A9D8F] text-sm font-semibold transition-colors"
                        title={isAr ? 'قائمة المتابعة' : 'Watchlist'}
                    >
                        <Bookmark className="w-4 h-4" />
                        <span className="hidden lg:inline">{isAr ? 'قائمة المتابعة' : 'Watchlist'}</span>
                    </button>
                )}

                <button
                    onClick={() => navigate('/policies')}
                    className="text-[#6B9E99] hover:text-[#2A9D8F] text-sm font-semibold transition-colors"
                    title={isAr ? 'الشروط والسياسات' : 'Policies'}
                >
                    <span className="hidden lg:inline">{isAr ? 'الشروط والسياسات' : 'Policies'}</span>
                    <span className="lg:hidden">•••</span>
                </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-3">
                {isSeller && (
                    <button
                        onClick={() => onCreateAuction?.()}
                        disabled={disableCreateAuction}
                        className={`flex items-center gap-1 px-3 md:px-4 py-2 rounded-lg font-bold transition-colors text-sm ${
                            disableCreateAuction
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white'
                        }`}
                        title={isAr ? 'إضافة مزاد جديد' : 'New Auction'}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">{isAr ? 'مزاد' : 'Auction'}</span>
                    </button>
                )}

                <button
                    onClick={() => navigate('/profile/edit')}
                    className="flex items-center gap-1 text-[#6B9E99] hover:text-[#2A9D8F] p-2 rounded-lg hover:bg-[#F4FAFA] transition-all"
                    title={isAr ? 'الملف الشخصي' : 'Profile'}
                >
                    <User className="w-5 h-5" />
                </button>

                <button
                    onClick={() => i18n.changeLanguage(isAr ? 'en' : 'ar')}
                    className="bg-[#F4FAFA] hover:bg-[#E2F1EF] text-[#2A9D8F] px-3 py-2 rounded-lg font-bold transition-colors text-sm"
                    title={isAr ? 'English' : 'العربية'}
                >
                    {isAr ? 'EN' : 'AR'}
                </button>

                <button
                    onClick={() => onLogout?.()}
                    className="flex items-center gap-1 bg-white border border-[#E05252] text-[#E05252] hover:bg-[#E05252] hover:text-white p-2 rounded-lg transition-colors"
                    title={isAr ? 'تسجيل الخروج' : 'Logout'}
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}

