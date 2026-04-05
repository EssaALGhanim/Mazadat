import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Trash2, CheckSquare } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { deleteAuction } from '@/services/auctionService';
import { generateReceipt } from '@/services/receiptService';

export default function AuctionCard({ auction, currentUser, onActionComplete }) {
    const { t, i18n } = useTranslation('common');
    const [loading, setLoading] = useState(false);
    const isAr = i18n.language === 'ar';

    const isSeller = currentUser?.role === 'SELLER';
    const isOwner = isSeller && auction?.sellerId === currentUser?.id;
    const hasNoBids = !auction?.bids || auction.bids.length === 0;
    const isActive = auction?.status === 'ACTIVE';
    const isPending = auction?.status === 'PENDING';
    const isEnded = auction?.status === 'ENDED';

    const handleCancel = async () => {
        if (!window.confirm(t('cancelAuctionConfirm'))) return;
        setLoading(true);
        try {
            await deleteAuction(auction.id, currentUser.id);
            onActionComplete?.('cancel');
        } catch {
            alert(t('actionFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsSold = async () => {
        if (!window.confirm(t('markAsSoldConfirm'))) return;
        setLoading(true);
        try {
            await generateReceipt(auction.id, currentUser.id);
            onActionComplete?.('sold');
        } catch {
            alert(t('actionFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-[#C5E0DC] rounded-xl overflow-hidden shadow-sm">

            {/* Card Header */}
            <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EAF7F5] flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-[#2A9D8F]" />
                </div>
                <div>
                    <h3 className="font-bold text-[#1A2E2C]">
                        {auction?.sellerName || (isAr ? 'بائع' : 'Seller')}
                    </h3>
                    <p className="text-xs text-[#6B9E99]">
                        {auction?.auctionHouseName || (isAr ? 'مزاد مستقل' : 'Independent Auction')}
                    </p>
                </div>

                {/* Status Badge */}
                <div className="mr-auto rtl:mr-auto ltr:ml-auto">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              isActive ? 'bg-[#EAF7F5] text-[#2A9D8F]' :
                  isPending ? 'bg-yellow-50 text-yellow-600' :
                      isEnded ? 'bg-gray-100 text-gray-500' :
                          'bg-gray-100 text-gray-500'
          }`}>
            {isActive ? (isAr ? 'نشط' : 'Active') :
                isPending ? (isAr ? 'قادم' : 'Pending') :
                    isEnded ? (isAr ? 'منتهي' : 'Ended') :
                        auction?.status}
          </span>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
                <h4 className="font-bold text-lg text-[#1A2E2C] mb-1">{auction?.title}</h4>
                <p className="text-[#1A2E2C] text-sm leading-relaxed mb-3 line-clamp-2">
                    {auction?.description}
                </p>
            </div>

            {/* Image */}
            {auction?.images?.length > 0 ? (
                <img
                    src={auction.images[0].url}
                    alt={auction.title}
                    className="w-full h-72 object-cover border-y border-gray-100"
                />
            ) : (
                <div className="w-full h-72 bg-[#F4FAFA] border-y border-[#C5E0DC] flex items-center justify-center">
          <span className="text-[#C5E0DC] font-bold text-4xl">
            {isAr ? 'لا توجد صورة' : 'No Image'}
          </span>
                </div>
            )}

            {/* Countdown Timer */}
            {(isActive || isPending) && auction?.endDate && (
                <div className="px-4 pt-4 flex items-center gap-2">
                    <span className="text-[#6B9E99] text-sm font-semibold">{t('timeLeft')}:</span>
                    <CountdownTimer endDate={auction.endDate} />
                </div>
            )}

            {/* Interaction Bar */}
            <div className="p-4 flex justify-between items-center bg-[#F8F9FA] mt-2">
                <div className="flex flex-col">
                    <span className="text-xs text-[#6B9E99]">{t('currentBid')}</span>
                    <span className="font-bold text-lg text-[#2A9D8F]" dir="ltr">
            {auction?.currentPrice
                ? <>{auction.currentPrice} <span className="text-sm">﷼</span></>
                : <span className="text-sm text-[#6B9E99]">{t('noBids')}</span>
            }
          </span>
                </div>

                <div className="flex gap-2">
                    {/* Cancel button — owner, no bids, active or pending */}
                    {isOwner && hasNoBids && (isActive || isPending) && (
                        <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="flex items-center gap-1 bg-white border border-[#E05252] text-[#E05252] hover:bg-[#E05252] hover:text-white px-4 py-2 rounded-lg font-bold transition-colors text-sm disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            {t('cancelAuction')}
                        </button>
                    )}

                    {/* Mark as Sold — owner, auction ended, has bids */}
                    {isOwner && isEnded && !hasNoBids && (
                        <button
                            onClick={handleMarkAsSold}
                            disabled={loading}
                            className="flex items-center gap-1 bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-4 py-2 rounded-lg font-bold transition-colors text-sm disabled:opacity-50"
                        >
                            <CheckSquare className="w-4 h-4" />
                            {t('markAsSold')}
                        </button>
                    )}

                    {/* Place Bid — buyers only, active auction */}
                    {!isSeller && isActive && (
                        <button className="bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-6 py-2 rounded-lg font-bold transition-colors text-sm">
                            {t('placeBid')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}