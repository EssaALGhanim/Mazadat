import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { placeBid } from '@/services/bidService';
import { deleteAuction } from '@/services/auctionService';
import { resolveImageUrl } from '@/services/imageService';

export default function AuctionCard({ auction, currentUser, onActionComplete }) {
    const { t, i18n } = useTranslation('common');
    const [loading, setLoading] = useState(false);
    const isAr = i18n.language === 'ar';

    const isBuyer = currentUser?.role === 'BUYER';
    const isSeller = currentUser?.role === 'SELLER';
    const isActive = auction?.status === 'ACTIVE';
    const isPending = auction?.status === 'PENDING';
    const canBid = isBuyer && isActive;
    const currentPrice = Number(auction?.currentPrice);
    const startingPrice = Number(auction?.startingPrice);
    const hasBids = Number.isFinite(auction?.bidCount)
        ? auction.bidCount > 0
        : (Number.isFinite(currentPrice) && Number.isFinite(startingPrice)
            ? currentPrice > startingPrice
            : !!currentPrice);
    const canCancel = isSeller && (isActive || isPending) && !hasBids;

    const handlePlaceBid = async () => {
        const bidValue = window.prompt(isAr ? 'أدخل قيمة المزايدة' : 'Enter your bid amount');
        if (!bidValue) return;

        const amount = Number(bidValue);
        if (!Number.isFinite(amount) || amount <= 0) {
            alert(isAr ? 'قيمة غير صحيحة' : 'Invalid bid amount');
            return;
        }

        if (auction?.currentPrice && amount <= auction.currentPrice) {
            alert(isAr ? 'يجب أن تكون المزايدة أعلى من السعر الحالي' : 'Bid must be higher than current price');
            return;
        }

        setLoading(true);
        try {
            await placeBid(auction.id, amount);
            onActionComplete?.('bid');
        } catch {
            alert(t('actionFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAuction = async () => {
        const confirmText = t('cancelAuctionConfirm');
        if (!window.confirm(confirmText)) return;

        setLoading(true);
        try {
            await deleteAuction(auction.id);
            onActionComplete?.('cancel');
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
                        {isAr ? 'مزاد' : 'Auction'}
                    </p>
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
                    src={resolveImageUrl(auction.images[0].url)}
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
                    {canCancel && (
                        <button
                            onClick={handleCancelAuction}
                            disabled={loading}
                            className="bg-white border border-[#E05252] text-[#E05252] hover:bg-[#E05252] hover:text-white px-6 py-2 rounded-lg font-bold transition-colors text-sm disabled:opacity-50"
                        >
                            {t('cancelAuction')}
                        </button>
                    )}
                    {canBid && (
                        <button
                            onClick={handlePlaceBid}
                            disabled={loading}
                            className="bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-6 py-2 rounded-lg font-bold transition-colors text-sm disabled:opacity-50"
                        >
                            {t('placeBid')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}