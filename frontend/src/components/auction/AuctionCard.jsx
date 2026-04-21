import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Trophy } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import PlaceBidModal from './PlaceBidModal';
import { placeBid, generateReceipt } from '@/services/bidService';
import { deleteAuction } from '@/services/auctionService';
import { resolveImageUrl } from '@/services/imageService';
import { resolveTextAlignmentClass, resolveTextDirection } from '@/lib/textDirection';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import WatchlistButton from '@/components/watchlist/WatchlistButton';
import { useNow } from '@/hooks/useNow';

export default function AuctionCard({ auction, currentUser, onActionComplete, isFeatured = false }) {
    const { t, i18n } = useTranslation('common');
    const [loading, setLoading] = useState(false);
    const [bidModalOpen, setBidModalOpen] = useState(false);
    const [bidSubmitError, setBidSubmitError] = useState(null);
    const isAr = i18n.language === 'ar';
    const now = useNow();
    const nowDate = new Date(now);

    const isBuyer = currentUser?.role === 'BUYER';
    const isSeller = currentUser?.role === 'SELLER';
    const startDate = auction?.startDate ? new Date(auction.startDate) : null;
    const endDate = auction?.endDate ? new Date(auction.endDate) : null;
    const hasStarted = !startDate || startDate <= nowDate;
    const isEnded = auction?.status === 'COMPLETED' || auction?.status === 'ENDED';
    const isFailedBelowReserve = auction?.status === 'FAILED_BELOW_RESERVE';

    // Check if auction time has passed
    const hasEndTimePasssed = endDate && endDate < nowDate;
    const auctionEnded = isEnded || isFailedBelowReserve || hasEndTimePasssed;
    const isPendingAuction = auction?.status === 'PENDING' && !hasStarted && !auctionEnded;
    const isLiveAuction = !auctionEnded && hasStarted && (auction?.status === 'ACTIVE' || auction?.status === 'PENDING');

    const canBid = isBuyer && isLiveAuction;
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
    const canCancel = isSeller && (isLiveAuction || isPendingAuction) && !hasBids;

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
    const displayPrice = auction?.currentPrice || auction?.startingPrice || 0;

    const statusBanner = auctionEnded
        ? (isWinner
            ? {
                tone: 'winner',
                title: isAr ? '🎉 أنت الفائز!' : '🎉 You Won!',
                subtitle: isAr ? 'تم إغلاق المزاد بنجاح' : 'Auction completed successfully',
            }
            : isFailedBelowReserve
                ? {
                    tone: 'failed',
                    title: isAr ? 'انتهى المزاد - أقل من الحد الأدنى للبيع' : 'Ended - Below Reserve',
                    subtitle: isAr ? 'لم يصل السعر إلى الحد الأدنى للبيع' : 'The auction did not reach the reserve price',
                }
                : {
                    tone: 'ended',
                    title: isAr ? 'انتهى المزاد' : 'Auction Ended',
                    subtitle: isAr ? 'يمكنك استعراض النتائج النهائية' : 'You can review the final result',
                })
        : isPendingAuction
            ? {
                tone: 'pending',
                title: isAr ? 'قيد الانتظار' : 'Pending',
                subtitle: isAr ? 'سيبدأ المزاد قريباً' : 'The auction will start soon',
            }
            : null;

    return (
        <div className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
            auctionEnded
                ? (isWinner
                    ? 'border-[#2A9D8F]/30 bg-gradient-to-br from-[#F3FBF9] via-white to-[#FFFFFF] ring-1 ring-[#2A9D8F]/15'
                    : isFailedBelowReserve
                        ? 'border-[#E05252]/30 bg-gradient-to-br from-[#FFF6F6] via-white to-[#FFFFFF]'
                        : 'border-slate-200 bg-gradient-to-br from-slate-50 via-white to-white')
                : isFeatured
                    ? 'border-[#FFD700]/50 bg-white ring-1 ring-[#FFD700]/15'
                    : 'border-[#C5E0DC] bg-white'
        }`}>

            {/* Top overlays */}
            <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2 pointer-events-none">
                <div className="pointer-events-auto">
                    {isBuyer && (
                        <div onClick={(e) => e.stopPropagation()} className="rounded-full bg-white/95 shadow-md ring-1 ring-black/5 backdrop-blur-sm">
                            <WatchlistButton auctionId={auction.id} variant="icon" />
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                    {isFeatured && (
                        <div className="rounded-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                            <span className="flex items-center gap-1.5">
                                <Star className="w-3 h-3 fill-current" />
                                {isAr ? 'مميز' : 'Featured'}
                            </span>
                        </div>
                    )}
                    {!auctionEnded && isLiveAuction && (
                        <div className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                            <span className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-100" />
                                </span>
                                {isAr ? 'مزاد مباشر' : 'Live Auction'}
                            </span>
                        </div>
                    )}
                    {statusBanner?.tone === 'pending' && (
                        <div className="rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                            {statusBanner.title}
                        </div>
                    )}
                </div>
            </div>

            {/* Header */}
            <div className="px-4 pt-14 pb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B9E99]">
                        {auction?.auctionHouseName || (isAr ? 'مزاد' : 'Auction House')}
                    </p>
                    <h3 className="mt-1 truncate text-sm font-bold text-[#1A2E2C]">
                        {auction?.sellerName || (isAr ? 'بائع' : 'Seller')}
                    </h3>
                </div>
            </div>

            {/* Image */}
            {auction?.images?.length > 0 ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F4FAFA] border-y border-[#E7EEF0]">
                    <ImageWithRetry
                        src={resolveImageUrl(auction.images[0].url, auction.images[0].createdAt || auction.images[0].id)}
                        alt={auction.title}
                        className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-transparent" />
                </div>
            ) : (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[#F4FAFA] to-[#EAF7F5] border-y border-[#E7EEF0] flex items-center justify-center">
                    <span className="text-[#C5E0DC] font-bold text-lg">
                        {isAr ? 'لا توجد صورة' : 'No Image'}
                    </span>
                </div>
            )}

            {/* Content */}
            <div className="flex flex-1 flex-col px-4 py-4 gap-3 min-h-0">
                <div className="space-y-1.5 min-h-0">
                    <h4 dir={titleDir} className={`line-clamp-2 text-base font-bold text-[#1A2E2C] leading-snug ${resolveTextAlignmentClass(auction?.title || '')}`}>{auction?.title}</h4>
                    <p dir={descriptionDir} className={`line-clamp-2 text-xs leading-relaxed text-[#4F5D5B] ${resolveTextAlignmentClass(auction?.description || '')}`}>
                        {auction?.description}
                    </p>
                </div>

                {isPendingAuction && auction?.startDate && (
                    <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-amber-700">
                        <span className="text-xs font-semibold whitespace-nowrap">{isAr ? 'يبدأ بعد' : 'Starts In'}:</span>
                        <div className="min-w-0 flex-1">
                            <CountdownTimer targetDate={auction.startDate} mode="start" />
                        </div>
                    </div>
                )}

                {isLiveAuction && auction?.endDate && !auctionEnded && (
                    <div className="flex items-center gap-2 rounded-xl bg-[#F4FAFA] px-3 py-2">
                        <span className="text-[#6B9E99] text-xs font-semibold whitespace-nowrap">{t('timeLeft')}:</span>
                        <div className="min-w-0 flex-1">
                            <CountdownTimer targetDate={auction.endDate} mode="end" />
                        </div>
                    </div>
                )}

                {statusBanner && (
                    <div className={`rounded-xl px-3 py-3 ${
                        statusBanner.tone === 'winner'
                            ? 'bg-gradient-to-r from-[#2A9D8F] to-[#1A7A6E] text-white shadow-md'
                            : statusBanner.tone === 'failed'
                                ? 'bg-gradient-to-r from-[#E05252]/15 to-[#E05252]/5 border border-[#E05252]/30 text-[#E05252]'
                                : statusBanner.tone === 'pending'
                                    ? 'bg-gradient-to-r from-[#FFF7E6] to-[#FFF1D6] border border-[#F5D08A]/70 text-[#9B6B00]'
                                    : 'bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 text-slate-700'
                    }`}>
                        <div className="flex items-start gap-2">
                            {statusBanner.tone === 'winner' && <Trophy className="mt-0.5 h-4 w-4 shrink-0" />}
                            <div className="min-w-0">
                                <p className="text-sm font-bold leading-tight">{statusBanner.title}</p>
                                <p className="mt-0.5 text-[11px] leading-snug opacity-90">{statusBanner.subtitle}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Price Section */}
            <div className={`mt-auto flex items-center justify-between border-t px-4 py-3 ${auctionEnded ? 'bg-white/80' : 'bg-[#F8F9FA]'}`}>
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-[#6B9E99]">
                        {auctionEnded ? (isAr ? 'السعر النهائي' : 'Final Price') : t('currentBid')}
                    </span>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-base font-bold ${auctionEnded ? 'text-[#1A2E2C]' : 'text-[#2A9D8F]'}`} dir="ltr">
                            {displayPrice || <span className="text-xs text-[#6B9E99]">{t('noBids')}</span>}
                        </span>
                        {displayPrice && <span className="text-xs font-semibold text-[#6B9E99]">﷼</span>}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-[#6B9E99]">{isAr ? 'المزايدات' : 'Bids'}</p>
                    <p className={`text-base font-bold ${auctionEnded ? 'text-[#1A2E2C]' : 'text-[#2A9D8F]'}`}>{auction?.bidCount || 0}</p>
                </div>
            </div>

            {/* Interaction Bar - Bottom */}
            <div className="border-t border-[#C5E0DC] bg-white p-3">
                {isBuyer && isPendingAuction && (
                    <p className="text-xs font-semibold text-[#6B9E99]">
                        {isAr ? 'قيد الانتظار حتى يبدأ المزاد' : 'Auction is pending until it starts'}
                    </p>
                )}
                <div className="mt-3 flex gap-2">
                    {canCancel && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCancelAuction();
                            }}
                            disabled={loading}
                            className="flex-1 rounded-xl border border-[#E05252] bg-white px-3 py-2.5 text-xs font-bold text-[#E05252] transition-colors hover:bg-[#E05252] hover:text-white disabled:opacity-50"
                        >
                            {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                    )}
                    {canBid && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setBidModalOpen(true);
                            }}
                            disabled={loading}
                            className="flex-1 rounded-xl bg-[#2A9D8F] px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#1A7A6E] disabled:opacity-50"
                        >
                            {isAr ? 'مزايدة' : 'Bid'}
                        </button>
                    )}
                    {isWinner && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateReceipt();
                            }}
                            disabled={loading}
                            className="flex-1 rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#1A7A6E] px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:from-[#1A7A6E] hover:to-[#0D5A52] disabled:opacity-50"
                        >
                            {isAr ? 'إيصال' : 'Receipt'}
                        </button>
                    )}
                    {auctionEnded && !isWinner && !isFailedBelowReserve && (
                        <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center text-xs font-semibold text-slate-600">
                            {isAr ? 'انتهى' : 'Ended'}
                        </div>
                    )}
                    {auctionEnded && isFailedBelowReserve && !isWinner && (
                        <div className="flex-1 rounded-xl border border-[#E05252]/30 bg-[#FFF5F5] px-3 py-2.5 text-center text-xs font-semibold text-[#E05252]">
                            {isAr ? 'فشل البيع' : 'Sale Failed'}
                        </div>
                    )}
                </div>
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