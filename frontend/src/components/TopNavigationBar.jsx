import { useTranslation } from 'react-i18next';
import { User, LogOut, Trophy, BarChart3, Users, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopNavigationBar({
    isSeller,
    isBuyer,
    onShowMyBids,
    onLogout
}) {
    const { i18n } = useTranslation('common');
    const navigate = useNavigate();
    const isAr = i18n.language === 'ar';

    return (
        <header className="bg-white border-b border-[#C5E0DC] sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto w-full h-20 px-4 md:px-6 flex items-center justify-between">
                
                {/* Logo */}
                <div className="flex items-center">
                    <button
                        onClick={() => isSeller ? navigate('/seller-dashboard') : navigate('/')}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        title={isAr ? 'الرئيسية' : 'Home'}
                    >
                        <img src="/logos/mazadat_green_logo.png" alt="Mazadat" className="h-10" />
                    </button>
                </div>

                {/* Center Navigation Links (Categories) */}
                <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    {isSeller && (
                        <button
                            onClick={() => navigate('/seller-dashboard')}
                            className="flex items-center gap-2 text-[#6B9E99] hover:text-[#2A9D8F] text-base font-bold transition-all hover:scale-105"
                            title={isAr ? 'لوحة التحكم' : 'Dashboard'}
                        >
                            <BarChart3 className="w-5 h-5" />
                            <span className="hidden lg:inline">{isAr ? 'لوحة التحكم' : 'Dashboard'}</span>
                        </button>
                    )}
                    {isSeller && (
                        <button
                            onClick={() => navigate('/seller/team')}
                            className="flex items-center gap-2 text-[#6B9E99] hover:text-[#2A9D8F] text-base font-bold transition-all hover:scale-105"
                            title={isAr ? 'الفريق' : 'Team'}
                        >
                            <Users className="w-5 h-5" />
                            <span className="hidden lg:inline">{isAr ? 'الفريق' : 'Team'}</span>
                        </button>
                    )}
                    {isBuyer && (
                        <button
                            onClick={() => onShowMyBids?.(true)}
                            className="flex items-center gap-2 text-[#6B9E99] hover:text-[#2A9D8F] text-base font-bold transition-all hover:scale-105"
                            title={isAr ? 'مزايداتي' : 'My Bids'}
                        >
                            <Trophy className="w-5 h-5" />
                            <span className="hidden lg:inline">{isAr ? 'مزايداتي' : 'My Bids'}</span>
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/policies')}
                        className="flex items-center gap-2 text-[#6B9E99] hover:text-[#2A9D8F] text-base font-bold transition-all hover:scale-105"
                        title={isAr ? 'الشروط والسياسات' : 'Policies'}
                    >
                        <BookOpen className="w-5 h-5 hidden lg:block" />
                        <span className="hidden lg:inline">{isAr ? 'الشروط والسياسات' : 'Policies'}</span>
                        <span className="lg:hidden font-extrabold text-xl tracking-widest leading-none mt-[-8px]">...</span>
                    </button>
                </div>

                {/* Right Actions: Profile, Language, Logout */}
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <button
                        onClick={() => navigate('/profile/edit')}
                        className="flex items-center gap-2 text-[#6B9E99] hover:text-[#2A9D8F] bg-[#F4FAFA] hover:bg-[#EAF7F5] px-4 py-2.5 rounded-xl font-bold transition-all border border-transparent hover:border-[#C5E0DC]"
                        title={isAr ? 'الملف الشخصي' : 'Profile'}
                    >
                        <User className="w-5 h-5 flex-shrink-0" />
                        <span className="hidden sm:inline">{isAr ? 'حسابي' : 'My Account'}</span>
                    </button>

                    <button
                        onClick={() => i18n.changeLanguage(isAr ? 'en' : 'ar')}
                        className="bg-[#F4FAFA] hover:bg-[#EAF7F5] text-[#2A9D8F] px-4 py-2.5 rounded-xl font-bold transition-colors border border-transparent hover:border-[#C5E0DC]"
                        title={isAr ? 'English' : 'العربية'}
                    >
                        {isAr ? 'EN' : 'AR'}
                    </button>

                    <button
                        onClick={() => onLogout?.()}
                        className="flex items-center gap-2 bg-white border-2 border-[#E05252] text-[#E05252] hover:bg-[#E05252] hover:text-white px-4 py-2.5 rounded-xl font-bold transition-all"
                        title={isAr ? 'تسجيل الخروج' : 'Logout'}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span className="hidden md:inline">{isAr ? 'خروج' : 'Logout'}</span>
                    </button>
                </div>
            </div>
        </header>
    );
}

