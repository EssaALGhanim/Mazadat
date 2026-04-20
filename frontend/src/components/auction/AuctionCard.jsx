import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Star } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import PlaceBidModal from './PlaceBidModal';
import { placeBid, generateReceipt } from '@/services/bidService';
import { deleteAuction } from '@/services/auctionService';
import { resolveImageUrl } from '@/services/imageService';
import { resolveTextAlignmentClass, resolveTextDirection } from '@/lib/textDirection';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import WatchlistButton from '@/components/watchlist/WatchlistButton';

export default function AuctionCard({ auction, currentUser, onActionComplete, isFeatured = false }) {
    const { t, i18n } = useTranslation('common');
    const [loading, setLoading] = useState(false);
    const [bidModalOpen, setBidModalOpen] = useState(false);
    const [bidSubmitError, setBidSubmitError] = useState(null);
    const isAr = i18n.language === 'ar';

    const isBuyer = currentUser?.role === 'BUYER';
    const isSeller = currentUser?.role === 'SELLER';
    const isActive = auction?.status === 'ACTIVE';
    const isPending = auction?.status === 'PENDING';
    const isEnded = auction?.status === 'COMPLETED' || auction?.status === 'ENDED';
    const isFailedBelowReserve = auction?.status === 'FAILED_BELOW_RESERVE';
    const hasStarted = !auction?.startDate || new Date(auction.startDate) <= new Date();

    // Check if auction time has passed
    const hasEndTimePasssed = auction?.endDate && new Date(auction.endDate) < new Date();
    const auctionEnded = isEnded || isFailedBelowReserve || hasEndTimePasssed;

    const canBid = isBuyer && (isActive || isPending) && hasStarted && !auctionEnded;
    const currentPrice = Number(auction?.currentPrice);
    const startingPrice = Number(auction?.startingPrice);
    const hasBids = Number.isFinite(auction?.bidCount)
        ? auction.bidCount > 0
        : (Number.isFinite(currentPrice) && Number.isFinite(startingPrice)
            ? currentPrice > startingPrice
            : !!currentPrice);
    const baseBid = currentPrice > 0 ? currentPrice : startingPrice;
    const minRequiredBid = hasBids
        ? Math.ceil(baseBid * 1.05)
        : Math.floor(startingPrice > 0 ? startingPrice : 0) + 1;
    const canCancel = isSeller && (isActive || isPending) && !hasBids;

    // Determine if current user won the auction
    const isWinner = isBuyer && auctionEnded && hasBids && auction?.highestBidder === currentUser?.username;

    const handlePlaceBid = async (amount) => {
        setLoading(true);
        setBidSubmitError(null);
        try {
            await placeBid(auction.id, amount);
            setBidModalOpen(false);
            setBidSubmitError(null);
            onActionComplete?.('bid');
            return true;
        } catch (error) {
            setBidSubmitError(error.message || t('actionFailed'));
            return false;
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

    const handleGenerateReceipt = async () => {
        // Check if auction has ended
        const now = new Date();
        const endDate = new Date(auction.endDate);

        if (now < endDate) {
            alert(isAr ? 'لا يمكن تحميل الإيصال قبل انتهاء المزاد' : 'Receipt can only be downloaded after the auction ends');
            return;
        }

        setLoading(true);
        try {
            await generateReceipt(auction.id);
            alert(isAr ? 'تم تحميل الإيصال بنجاح' : 'Receipt downloaded successfully!');
        } catch (err) {
            alert(err.message || (isAr ? 'فشل تحميل الإيصال' : 'Failed to generate receipt'));
        } finally {
            setLoading(false);
        }
    };

    const titleDir = resolveTextDirection(auction?.title || '');
    const descriptionDir = resolveTextDirection(auction?.description || '');

    return (
        <div className={`relative bg-white border ${isFeatured ? 'border-[#FFD700] ring-2 ring-[#FFD700]/30' : 'border-[#C5E0DC]'} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col`}>

            {/* Featured Badge */}
            {isFeatured && (
                <div className="absolute top-2 end-2 z-20 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white rounded-full px-2.5 py-1 text-[10px] font-bold flex items-center gap-1.5 shadow-md">
                    <Star className="w-3 h-3 fill-current" />
                    {isAr ? 'مميز' : 'Featured'}
                </div>
            )}

            {/* Live Auction Corner Badge */}
            {!auctionEnded && !isFeatured && (
                <div className="absolute top-2 end-2 z-10 bg-red-600 text-white rounded-full px-2.5 py-1 text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-100" />
                    </span>
                    {isAr ? 'مزاد مباشر' : 'Live Auction'}
                </div>
            )}

            {/* Watchlist Button - Only show for buyers */}
            {isBuyer && (
                <div className="absolute top-2 start-2 z-10">
                    <WatchlistButton auctionId={auction.id} variant="icon" />
                </div>
            )}

            {/* Card Header */}
            <div className="p-3 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#EAF7F5] flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-[#2A9D8F]" />
                </div>
                <div>
                    <h3 className="font-bold text-[#1A2E2C] text-xs truncate">
                        {auction?.sellerName || (isAr ? 'بائع' : 'Seller')}
                    </h3>
                    <p className="text-[11px] text-[#6B9E99]">
                        {auction?.auctionHouseName || (isAr ? 'مزاد' : 'Auction')}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="px-3 pb-2">
                <h4 dir={titleDir} className={`font-bold text-sm text-[#1A2E2C] mb-1 line-clamp-2 ${resolveTextAlignmentClass(auction?.title || '')}`}>{auction?.title}</h4>
                <p dir={descriptionDir} className={`text-[#1A2E2C] text-[11px] leading-relaxed mb-1 line-clamp-2 ${resolveTextAlignmentClass(auction?.description || '')}`}>
                    {auction?.description}
                </p>
            </div>

            {/* Image */}
            {auction?.images?.length > 0 ? (
                <div className="relative w-full h-36 overflow-hidden border-y border-gray-100">
                    <ImageWithRetry
                        src={resolveImageUrl(auction.images[0].url, auction.images[0].createdAt || auction.images[0].id)}
                        alt={auction.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="w-full h-36 bg-[#F4FAFA] border-y border-[#C5E0DC] flex items-center justify-center">
          <span className="text-[#C5E0DC] font-bold text-lg">
            {isAr ? 'لا توجد صورة' : 'No Image'}
          </span>
                </div>
            )}

            {/* Countdown Timer */}
            {(isActive || isPending) && auction?.endDate && !auctionEnded && (
                <div className="px-3 pt-2.5 flex items-center gap-2 flex-wrap">
                    <span className="text-[#6B9E99] text-xs font-semibold">{t('timeLeft')}:</span>
                    <div className="flex-1">
                        <CountdownTimer endDate={auction.endDate} />
                    </div>
                </div>
            )}

            {/* Auction Ended Badge */}
            {auctionEnded && (
                <div className="mx-3 mt-2.5 bg-gradient-to-r from-[#E05252]/10 to-[#E05252]/5 border border-[#E05252]/30 rounded-lg py-1.5 px-2.5">
                    <p className="text-xs font-semibold text-[#E05252]">
                        {isFailedBelowReserve
                            ? (isAr ? 'فشل - أقل من الحد الأدنى للبيع' : 'Failed - Below Reserve Price')
                            : (isAr ? 'انتهى المزاد' : 'Auction Ended')}
                    </p>
                </div>
            )}

            {/* Winner Badge - Show to buyer who won */}
            {auctionEnded && isWinner && (
                <div className="mx-3 mt-2.5 bg-gradient-to-r from-[#2A9D8F] to-[#1A7A6E] rounded-lg py-1.5 px-2.5 text-white">
                    <p className="font-bold text-xs">
                        {isAr ? '🎉 أنت الفائز!' : '🎉 You Won!'}
                    </p>
                </div>
            )}

            {/* Price Section - Flex grow to push buttons down */}
            <div className="px-3 py-2.5 bg-[#F8F9FA] border-t border-[#C5E0DC] flex-grow flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-[#6B9E99] font-medium">{t('currentBid')}</span>
                    <div className="flex items-baseline gap-1">
                        {auction?.currentPrice && !auctionEnded ? (
                            <span className="font-bold text-base text-green-500 animate-pulse" dir="ltr">
                                {auction.currentPrice}
                            </span>
                        ) : (
                            <span className={`font-bold text-base ${auctionEnded ? 'text-[#2A9D8F]' : 'text-[#2A9D8F]'}`} dir="ltr">
                                {auction?.currentPrice
                                    ? auction.currentPrice
                                    : <span className="text-xs text-[#6B9E99]">{t('noBids')}</span>
                                }
                            </span>
                        )}
                        {auction?.currentPrice && <span className="text-xs font-semibold text-[#6B9E99]">﷼</span>}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-[#6B9E99]">{isAr ? 'المزايدات' : 'Bids'}</p>
                    <p className="font-bold text-base text-[#2A9D8F]">{auction?.bidCount || 0}</p>
                </div>
            </div>

            {/* Interaction Bar - Bottom */}
            <div className="p-2.5 flex gap-2 bg-white border-t border-[#C5E0DC]">
                {isBuyer && !hasStarted && !auctionEnded && (
                    <p className="flex-1 text-xs font-semibold text-[#6B9E99] self-center">
                        {isAr ? 'المزاد لم يبدأ بعد' : 'Auction has not started yet'}
                    </p>
                )}
                {canCancel && (
                    <button
                        onClick={handleCancelAuction}
                        disabled={loading}
                        className="flex-1 bg-white border border-[#E05252] text-[#E05252] hover:bg-[#E05252] hover:text-white px-3 py-2 rounded-lg font-bold transition-colors text-xs disabled:opacity-50"
                    >
                        {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                )}
                {canBid && (
                    <button
                        onClick={() => setBidModalOpen(true)}
                        disabled={loading}
                        className="flex-1 bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-3 py-2 rounded-lg font-bold transition-colors text-xs disabled:opacity-50"
                    >
                        {isAr ? 'مزايدة' : 'Bid'}
                    </button>
                )}
                {isWinner && (
                    <button
                        onClick={handleGenerateReceipt}
                        disabled={loading}
                        className="flex-1 bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-3 py-2 rounded-lg font-bold transition-colors text-xs disabled:opacity-50"
                    >
                        {isAr ? 'إيصال' : 'Receipt'}
                    </button>
                )}
            </div>

            <PlaceBidModal
                open={bidModalOpen}
                onOpenChange={(isOpen) => {
                    setBidModalOpen(isOpen);
                    if (!isOpen) {
                        setBidSubmitError(null);
                    }
                }}
                currentPrice={currentPrice}
                minBid={minRequiredBid}
                hasPreviousBid={hasBids}
                onBidSubmit={handlePlaceBid}
                loading={loading}
                submitError={bidSubmitError}
                onClearSubmitError={() => setBidSubmitError(null)}
            />
        </div>
    );
}