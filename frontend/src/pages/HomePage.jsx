import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, User } from 'lucide-react';
import CreateAuctionModal from '../components/createAuction/CreateAuctionModal';

export default function HomePage() {
  const { t, i18n } = useTranslation('common');
  const [userRoles, setUserRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const roles = user?.roles || (user?.role ? [user.role] : []);
      setUserRoles(roles);
    } catch (e) {
      setUserRoles([]);
    }
  }, []);

  const isSeller = userRoles.includes('Seller');
  const isAr = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-[#F0F2F5]"> {/* Facebook-like background gray */}
      <header className="bg-white border-b border-[#C5E0DC] px-6 h-16 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <img src="/logos/mazadat_green_logo.png" alt="Mazadat" className="h-8" />
        
        <button
          onClick={() => i18n.changeLanguage(isAr ? 'en' : 'ar')}
          className="bg-[#F4FAFA] hover:bg-[#E2F1EF] text-[#2A9D8F] px-4 py-2 rounded-lg font-bold transition-colors text-sm"
        >
          {isAr ? 'English' : 'العربية'}
        </button>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Create Post / Add Listing Block */}
          {isSeller && (
            <div className="bg-white rounded-xl shadow-sm border border-[#C5E0DC] p-4 mb-6">
               <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                     <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 bg-[#F4FAFA] hover:bg-[#E2F1EF] text-right rtl:text-right ltr:text-left text-[#6B9E99] px-4 py-2.5 rounded-full font-medium transition-colors border border-[#C5E0DC] focus:outline-none"
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

          {/* Feed style listings */}
          <div className="space-y-6">
             {[...Array(6)].map((_, i) => (
                 <div key={i} className="bg-white border border-[#C5E0DC] rounded-xl overflow-hidden shadow-sm">
                     {/* Header */}
                     <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                            <span className="font-bold text-gray-500">{i+1}</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-[#1A2E2C]">
                                {isAr ? 'بائع مجهول' : 'Anonymous Seller'} {i + 1}
                            </h3>
                            <p className="text-xs text-[#6B9E99]">{isAr ? 'منذ ساعتين' : '2 hours ago'}</p>
                        </div>
                     </div>

                     {/* Content */}
                     <div className="px-4 pb-3">
                         <h4 className="font-bold text-lg mb-1">{isAr ? 'عنوان المزاد هنا' : 'Auction Title Here'}</h4>
                         <p className="text-[#1A2E2C] text-sm leading-relaxed mb-3">
                           {isAr 
                             ? 'هذا وصف مبدئي للمزاد لعرض التصميم بشكل عام ضمن بطاقات العرض. سيكون هذا النص بديلاً للوصف التفصيلي للمنتج المعروض.' 
                             : 'This is a placeholder description to demonstrate the layout of auction cards. It will contain details about the item being auctioned.'}
                         </p>
                     </div>

                     {/* Main Image */}
                     <div className="w-full h-80 bg-gray-100 border-y border-gray-100 flex items-center justify-center relative">
                        <span className="text-6xl text-[#C5E0DC]/50 font-bold">PHOTO</span>
                     </div>
                     
                     {/* Interaction Bar */}
                     <div className="p-4 flex justify-between items-center bg-[#F8F9FA]">
                         <span className="font-bold text-lg text-[#2A9D8F]" dir="ltr">
                             {Math.floor(Math.random() * 5000) + 100} <span className="text-sm">﷼</span>
                         </span>
                         <button className="bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-6 py-2 rounded-lg font-bold transition-colors">
                             {isAr ? 'شارك في المزاد' : 'Place Bid'}
                         </button>
                     </div>
                 </div>
             ))}
          </div>
      </main>

      <CreateAuctionModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
