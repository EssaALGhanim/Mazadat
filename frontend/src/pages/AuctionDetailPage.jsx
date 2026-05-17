import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, Trophy, Download, Home, X, Zap, Star, Flag } from 'lucide-react';
import ReportAuctionModal from '@/components/report/ReportAuctionModal';
import CountdownTimer from '@/components/auction/CountdownTimer';
import PlaceBidModal from '@/components/auction/PlaceBidModal';
import AutoBidModal from '@/components/auction/AutoBidModal';
import FeatureAuctionModal from '@/components/auction/FeatureAuctionModal';
import { useAutoBid } from '@/hooks/useAutoBid';
import { placeBid } from '@/services/bidService';
import { generateReceipt } from '@/services/receiptService';
import { getAuctionById } from '@/services/auctionService';
import { resolveImageUrl } from '@/services/imageService';
import { featureAuction } from '@/services/featuredService';
import { resolveTextAlignmentClass, resolveTextDirection } from '@/lib/textDirection';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import { useNow } from '@/hooks/useNow';
import { toast } from 'sonner';
import WinnerBuyerRating from '@/components/rating/WinnerBuyerRating';
import AuctionHouseRating from '@/components/rating/AuctionHouseRating';
import { getAuctionHouseRatings } from '@/services/auctionHouseRatingService';

export default function AuctionDetailPage({ currentUser }) {
    const { t, i18n } = useTranslation('common');
    const navigate = useNavigate();
    const { auctionId } = useParams();
    const isAr = i18n.language === 'ar';

    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [bidModalOpen, setBidModalOpen] = useState(false);
    const [bidLoading, setBidLoading] = useState(false);
    const [autoBidModalOpen, setAutoBidModalOpen] = useState(false);
    const [bidSubmitError, setBidSubmitError] = useState(null);
    const [isFeatured, setIsFeatured] = useState(false);
    const [featureLoading, setFeatureLoading] = useState(false);
    const [featureModalOpen, setFeatureModalOpen] = useState(false);
    const [houseRatings, setHouseRatings] = useState(null);
    const [ratingsModalOpen, setRatingsModalOpen] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const now = useNow();
    const nowDate = new Date(now);

    const { autoBid, cancelAutoBid, setAutoBid, isLoading: autoBidLoading } = useAutoBid(auctionId);

    // Fetch auction from API
    useEffect(() => {
        const fetchAuction = async () => {
            setLoading(true);
            try {
                const response = await getAuctionById(auctionId);
                console.log('Auction loaded:', response);
                setAuction(response);
                setIsFeatured(response?.isActivelyFeatured || false);
                setError(null);
            } catch (err) {
                console.error('Error loading auction:', err);
                setError(isAr ? 'فشل تحميل المزاد' : 'Failed to load auction');
            } finally {
                setLoading(false);
            }
        };

        if (auctionId) {
            fetchAuction();
        }
    }, [auctionId, isAr]);

    useEffect(() => {
        const fetchHouseRatings = async () => {
            if (!auction?.auctionHouseId) return;
            try {
                const res = await getAuctionHouseRatings(auction.auctionHouseId);
                setHouseRatings(res);
            } catch {
                // silently ignore
            }
        };
        fetchHouseRatings();
    }, [auction?.auctionHouseId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#C5E0DC] border-t-[#2A9D8F] rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !auction) {
        const isSeller = currentUser?.role === 'SELLER';
        return (
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#E05252] p-6 text-center max-w-md">
                    <p className="text-[#E05252] font-semibold mb-4">{error || (isAr ? 'المزاد غير متاح' : 'Auction not available')}</p>
                    <button
                        onClick={() => isSeller ? navigate('/seller-dashboard') : navigate('/')}
                        className="flex items-center gap-2 justify-center w-full bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-6 py-2 rounded-lg font-bold transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        {isAr ? 'العودة للرئيسية' : 'Return to Home'}
                    </button>
                </div>
            </div>
        );
    }

    const isBuyer = currentUser?.role === 'BUYER';
    const isSeller = currentUser?.role === 'SELLER';
    const startDate = auction?.startDate ? new Date(auction.startDate) : null;
    const endDate = auction?.endDate ? new Date(auction.endDate) : null;
    const hasStarted = !startDate || startDate <= nowDate;
    const isEnded = auction?.status === 'COMPLETED' || auction?.status === 'ENDED';
    const isFailedBelowReserve = auction?.status === 'FAILED_BELOW_RESERVE';
    const hasEndTimePassed = endDate && endDate < nowDate;
    const auctionEnded = isEnded || isFailedBelowReserve || hasEndTimePassed;
    const isPendingAuction = auction?.status === 'PENDING' && !hasStarted && !auctionEnded;
    const isLiveAuction = !auctionEnded && hasStarted && (auction?.status === 'ACTIVE' || auction?.status === 'PENDING');

    const canBid = isBuyer && isLiveAuction;
    const currentPrice = Number(auction?.currentPrice);
    const startingPrice = Number(auction?.startingPrice);
    const hasBids = Number.isFinite(auction?.bidCount) ? auction.bidCount > 0 : (Number.isFinite(currentPrice) && Number.isFinite(startingPrice) ? currentPrice > startingPrice : !!currentPrice);
    const baseBid = currentPrice > 0 ? currentPrice : startingPrice;
    const minRequiredBid = hasBids
        ? Math.ceil(baseBid * 1.05)
        : Math.floor(startingPrice > 0 ? startingPrice : 0) + 1;
    const isWinner = isBuyer && auctionEnded && hasBids && auction?.highestBidder === currentUser?.username;

    const images = auction?.images || [];
    const currentImage = images[currentImageIndex];

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handlePlaceBid = async (amount) => {
        setBidLoading(true);
        try {
            await placeBid(auction.id, amount);
            setBidModalOpen(false);
            // Refresh auction data - in real scenario you'd fetch updated data
            toast.success(isAr ? 'تم تسجيل المزايدة بنجاح' : 'Bid placed successfully!');
        } catch (error) {
            toast.error(error.message || t('actionFailed'));
        } finally {
            setBidLoading(false);
        }
    };

    const handleGenerateReceipt = async () => {
        const now = new Date();
        const endDate = new Date(auction.endDate);
        if (now < endDate) {
            toast.error(isAr ? 'لا يمكن تحميل الإيصال قبل انتهاء المزاد' : 'Receipt can only be downloaded after the auction ends');
            return;
        }

        setBidLoading(true);
        try {
            await generateReceipt(auction.id, i18n.language);
            toast.success(isAr ? 'تم تحميل الإيصال بنجاح' : 'Receipt downloaded successfully!');
        } catch (err) {
            toast.error(err.message || (isAr ? 'فشل تحميل الإيصال' : 'Failed to generate receipt'));
        } finally {
            setBidLoading(false);
        }
    };

    const handleFeatureAuction = async (featuredEndDate) => {
        setFeatureLoading(true);
        try {
            await featureAuction(auction.id, featuredEndDate);
            setIsFeatured(true);
            toast.success(isAr ? 'تم عرض المنتج بنجاح' : 'Product featured successfully!');
        } catch (error) {
            toast.error(error.message || (isAr ? 'فشل عرض المنتج' : 'Failed to feature product'));
            throw error;
        } finally {
            setFeatureLoading(false);
        }
    };

    const titleDir = resolveTextDirection(auction?.title || '');
    const descriptionDir = resolveTextDirection(auction?.description || '');

    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 py-8" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Back Button */}
                <button
                    onClick={() => isSeller ? navigate('/seller-dashboard') : navigate('/')}
                    className="flex items-center gap-2 text-[#2A9D8F] hover:text-[#1A7A6E] font-semibold mb-6 transition-colors"
                >
                    {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    {isAr ? 'العودة للرئيسية' : 'Back to Home'}
                </button>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Image Gallery - Left Side */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#C5E0DC] dark:border-slate-700 overflow-hidden shadow-sm">
                            {/* Main Image */}
                            {images.length > 0 ? (
                                <div className="relative bg-[#F4FAFA] dark:bg-slate-800 aspect-video flex items-center justify-center">
                                    <ImageWithRetry
                                        src={resolveImageUrl(currentImage.url, currentImage.createdAt || currentImage.id)}
                                        alt={`${auction.title} ${currentImageIndex + 1}`}
                                        className="w-full h-full object-contain"
                                    />

                                    {/* Navigation Arrows */}
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={handlePrevImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 p-2 rounded-full transition-all shadow-md"
                                                aria-label="Previous image"
                                            >
                                                {isAr ? <ChevronRight className="w-6 h-6 text-[#2A9D8F]" /> : <ChevronLeft className="w-6 h-6 text-[#2A9D8F]" />}
                                            </button>
                                            <button
                                                onClick={handleNextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 p-2 rounded-full transition-all shadow-md"
                                                aria-label="Next image"
                                            >
                                                {isAr ? <ChevronLeft className="w-6 h-6 text-[#2A9D8F]" /> : <ChevronRight className="w-6 h-6 text-[#2A9D8F]" />}
                                            </button>
                                        </>
                                    )}

                                    {/* Image Counter */}
                                    {images.length > 1 && (
                                        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            {currentImageIndex + 1} / {images.length}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-[#F4FAFA] dark:bg-slate-800 aspect-video flex items-center justify-center">
                                    <span className="text-[#C5E0DC] dark:text-slate-500 font-bold text-4xl">
                                        {isAr ? 'لا توجد صورة' : 'No Image'}
                                    </span>
                                </div>
                            )}

                            {/* Thumbnail Gallery */}
                            {images.length > 1 && (
                                <div className="p-4 bg-white dark:bg-slate-900 border-t border-[#C5E0DC] dark:border-slate-700 grid grid-cols-4 gap-2">
                                    {images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                                                    ? 'border-[#2A9D8F] ring-2 ring-[#2A9D8F]/30'
                                                    : 'border-[#C5E0DC] dark:border-slate-700 hover:border-[#2A9D8F]'
                                                }`}
                                        >
                                            <ImageWithRetry
                                                src={resolveImageUrl(image.url, image.createdAt || image.id)}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description Section */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#C5E0DC] dark:border-slate-700 p-6 mt-6 shadow-sm">
                            <h2 className="text-lg font-bold text-[#1A2E2C] dark:text-slate-100 mb-4">
                                {isAr ? 'الوصف الكامل' : 'Full Description'}
                            </h2>
                            <p
                                dir={descriptionDir}
                                className={`text-[#1A2E2C] dark:text-slate-200 text-sm leading-relaxed ${resolveTextAlignmentClass(auction?.description || '')}`}
                            >
                                {auction?.description}
                            </p>
                        </div>
                    </div>

                    {/* Auction Details - Right Side */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Seller Info */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#C5E0DC] dark:border-slate-700 p-4 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-[#EAF7F5] flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5 text-[#2A9D8F]" />
                                </div>
                                <div>
                                    <p className="text-xs text-[#6B9E99] dark:text-slate-400">{isAr ? 'البائع' : 'Seller'}</p>
                                    <h3 className="font-bold text-[#1A2E2C] dark:text-slate-100">
                                        {auction?.sellerName || (isAr ? 'بائع' : 'Seller')}
                                    </h3>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-[#C5E0DC] dark:border-slate-700">
                                <p className="text-xs text-[#6B9E99] dark:text-slate-400 mb-1">{isAr ? 'صالة المزاد' : 'Auction House'}</p>
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-[#1A2E2C] dark:text-slate-100">{auction?.auctionHouseName}</p>
                                        {houseRatings && houseRatings.totalRatings > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3.5 h-3.5 text-[#F4A736] fill-[#F4A736]" />
                                                <span className="text-sm font-bold text-[#1A2E2C] dark:text-slate-100">
                                                    {houseRatings.averageRating.toFixed(1)}
                                                </span>
                                                <span className="text-xs text-[#6B9E99] dark:text-slate-400">
                                                    ({houseRatings.totalRatings} {isAr ? 'تقييم' : 'ratings'})
                                                </span>
                                            </div>
                                        )}
                                        {houseRatings && houseRatings.totalRatings === 0 && (
                                            <span className="text-xs text-[#6B9E99] dark:text-slate-400">
                                                {isAr ? 'لا يوجد تقييم' : 'No ratings yet'}
                                            </span>
                                        )}
                                    </div>
                                    {houseRatings && houseRatings.totalRatings > 0 && (
                                        <button
                                            onClick={() => setRatingsModalOpen(true)}
                                            className="text-xs text-[#2A9D8F] hover:text-[#1A7A6E] font-semibold underline underline-offset-2 transition-colors"
                                        >
                                            {isAr ? 'عرض التعليقات' : 'Show Comments'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#C5E0DC] dark:border-slate-700 p-4 shadow-sm">
                            <h1
                                dir={titleDir}
                                className={`font-bold text-2xl text-[#1A2E2C] dark:text-slate-100 ${resolveTextAlignmentClass(auction?.title || '')}`}
                            >
                                {auction?.title}
                            </h1>
                        </div>

                        {/* Price Section */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#C5E0DC] dark:border-slate-700 p-6 shadow-sm">
                            <div className="mb-4">
                                <p className="text-xs text-[#6B9E99] dark:text-slate-400 mb-1">
                                    {isAr ? 'السعر الحالي' : 'Current Price'}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-[#2A9D8F] pulse-animation" dir="ltr">
                                        {currentPrice}
                                    </span>
                                    <span className="text-lg font-semibold text-[#6B9E99] dark:text-slate-400">﷼</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#C5E0DC] dark:border-slate-700">
                                <div>
                                    <p className="text-xs text-[#6B9E99] dark:text-slate-400">{isAr ? 'السعر الأولي' : 'Starting Price'}</p>
                                    <p className="font-semibold text-[#1A2E2C] dark:text-slate-100" dir={isAr ? 'rtl' : 'ltr'}>{startingPrice} ﷼</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#6B9E99] dark:text-slate-400">{isAr ? 'عدد المزايدات' : 'Bids'}</p>
                                    <p className="font-semibold text-[#1A2E2C] dark:text-slate-100">{auction?.bidCount || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Countdown or Status */}
                        {isPendingAuction && auction?.startDate && (
                            <div className="bg-[#FFF9E6] border border-[#FFD54D]/50 rounded-xl py-4 px-4 shadow-sm">
                                <p className="text-sm font-semibold text-[#B8860B] mb-2">
                                    {isAr ? 'قيد الانتظار' : 'Pending'}
                                </p>
                                <p className="text-xs font-semibold text-[#B8860B] mb-2">
                                    {isAr ? 'يبدأ بعد' : 'Starts In'}
                                </p>
                                <CountdownTimer targetDate={auction.startDate} mode="start" />
                            </div>
                        )}

                        {isLiveAuction && !auctionEnded && (
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#C5E0DC] dark:border-slate-700 p-4 shadow-sm">
                                <p className="text-sm font-semibold text-[#6B9E99] dark:text-slate-300 mb-2">
                                    {isAr ? 'الوقت المتبقي' : 'Time Left'}
                                </p>
                                <CountdownTimer targetDate={auction.endDate} mode="end" />
                            </div>
                        )}


                        {/* Auction Status */}
                        {auctionEnded && (
                            <div className="bg-gradient-to-r from-[#E05252]/10 to-[#E05252]/5 border border-[#E05252]/30 rounded-xl py-4 px-4 shadow-sm">
                                <p className="text-sm font-semibold text-[#E05252]">
                                    {isFailedBelowReserve
                                        ? (isAr ? '❌ فشل - أقل من الحد الأدنى للبيع' : '❌ Failed - Below Reserve Price')
                                        : (isAr ? '❌ انتهى المزاد' : '❌ Auction Ended')}
                                </p>
                            </div>
                        )}

                        {/* Winner Badge */}
                        {isWinner && (
                            <div className="bg-gradient-to-r from-[#2A9D8F] to-[#1A7A6E] rounded-xl py-4 px-4 text-white shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Trophy className="w-5 h-5" />
                                    <p className="font-bold">{isAr ? '🎉 أنت الفائز!' : '🎉 You Won!'}</p>
                                </div>
                                {(auction?.auctionHouseId || auction?.auctionHouseName) && (
                                    <AuctionHouseRating
                                        auctionId={auctionId}
                                        auctionHouseId={auction.auctionHouseId}
                                        auctionHouseName={auction.auctionHouseName}
                                        buyerUsername={currentUser?.username}
                                        isAr={isAr}
                                    />
                                )}
                            </div>
                        )}

                        {/* Auto-Bid Indicator */}
                        {canBid && autoBid && (
                            <div className="bg-[#EAF7F5] dark:bg-emerald-950/30 border border-[#2A9D8F] dark:border-emerald-700 rounded-xl p-3 shadow-sm flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs text-[#2A9D8F] font-bold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-[#2A9D8F] rounded-full animate-pulse"></span>
                                        {t('autoBid.active')}
                                    </p>
                                    <p className="text-sm text-[#1A2E2C] dark:text-slate-100 font-semibold mt-0.5">
                                        {t('autoBid.activeMax')}: {autoBid.maxAmount} ر.س
                                    </p>
                                </div>
                                <button
                                    onClick={() => cancelAutoBid()}
                                    disabled={autoBidLoading}
                                    className="p-1.5 bg-white dark:bg-slate-900 text-[#E05252] hover:bg-[#E05252] hover:text-white rounded-lg transition-colors border border-[#E05252]/20 dark:border-rose-700/40"
                                    title={t('autoBid.cancel')}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#C5E0DC] dark:border-slate-700 p-4 shadow-sm space-y-2">
                            {canBid && (
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setBidModalOpen(true)}
                                        disabled={bidLoading}
                                        className="w-full bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 text-sm"
                                    >
                                        {isAr ? 'مزايدة الآن' : 'Place Bid Now'}
                                    </button>
                                    <button
                                        onClick={() => setAutoBidModalOpen(true)}
                                        disabled={bidLoading || autoBidLoading}
                                        className="w-full bg-[#EAF7F5] dark:bg-emerald-950/30 hover:bg-[#D5EFEC] dark:hover:bg-emerald-900/40 text-[#2A9D8F] dark:text-emerald-300 border border-[#2A9D8F] dark:border-emerald-700 px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 text-sm"
                                    >
                                        {isAr ? 'مزايدة تلقائية' : 'Auto-Bid'}
                                    </button>
                                </div>
                            )}

                            {isWinner && (
                                <button
                                    onClick={handleGenerateReceipt}
                                    disabled={bidLoading}
                                    className="w-full bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    {isAr ? 'تحميل الإيصال' : 'Download Receipt'}
                                </button>
                            )}

                            {isSeller && isLiveAuction && !isFeatured && (
                                <button
                                    onClick={() => setFeatureModalOpen(true)}
                                    disabled={featureLoading}
                                    className="w-full bg-gradient-to-r from-[#2A9D8F] to-[#1A7A6E] hover:from-[#1A7A6E] hover:to-[#0D5A52] text-white px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                >
                                    <Zap className="w-4 h-4" />
                                    {t('featureThisAuction')}
                                </button>
                            )}

                            {isSeller && isFeatured && (
                                <div className="w-full bg-[#EAF7F5] dark:bg-emerald-950/30 border border-[#2A9D8F] dark:border-emerald-700 text-[#2A9D8F] dark:text-emerald-300 px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-sm">
                                    <Zap className="w-4 h-4" />
                                    {t('featuredActive')}
                                </div>
                            )}

                            {isBuyer && (
                                <button
                                    onClick={() => setReportModalOpen(true)}
                                    className="w-full flex items-center justify-center gap-2 bg-transparent border border-[#E05252]/40 hover:bg-[#FFF5F5] text-[#E05252] px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm"
                                >
                                    <Flag className="w-4 h-4" />
                                    {isAr ? 'الإبلاغ عن هذا المزاد' : 'Report this listing'}
                                </button>
                            )}

                            <button
                                onClick={() => isSeller ? navigate('/seller-dashboard') : navigate('/')}
                                className="w-full bg-[#F4FAFA] dark:bg-slate-800 hover:bg-[#E2F1EF] dark:hover:bg-slate-700 text-[#2A9D8F] dark:text-slate-100 px-4 py-3 rounded-lg font-bold transition-colors text-sm"
                            >
                                {isAr ? '← العودة' : 'Back →'}
                            </button>
                        </div>

                        {/* Winner Information - For Seller */}
                        {auctionEnded && isSeller && hasBids && auction?.highestBidder && (
                            <div className="bg-[#EAF7F5] dark:bg-emerald-950/30 border border-[#2A9D8F] dark:border-emerald-700 rounded-xl py-4 px-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Trophy className="w-5 h-5 text-[#2A9D8F]" />
                                    <p className="font-semibold text-[#2A9D8F]">
                                        {isAr ? 'الفائز' : 'Winner'}
                                    </p>
                                </div>
                                <div className={`flex items-center gap-2 mb-2 flex-wrap ${isAr ? 'flex-row-reverse justify-end' : ''}`}>
                                    <p className="text-[#1A2E2C] dark:text-slate-100 font-bold">{auction.highestBidder}</p>
                                    <WinnerBuyerRating
                                        auctionId={auctionId}
                                        buyerUsername={auction.highestBidder}
                                        isAr={isAr}
                                    />
                                </div>
                                {auction.highestBidderEmail && (
                                    <p className="text-xs text-[#6B9E99] dark:text-slate-400" dir="ltr">
                                        {isAr ? 'البريد الإلكتروني' : 'Email'}: {auction.highestBidderEmail}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bid Modal */}
            <PlaceBidModal
                open={bidModalOpen}
                onOpenChange={setBidModalOpen}
                currentPrice={currentPrice}
                minBid={minRequiredBid}
                hasPreviousBid={hasBids}
                onBidSubmit={handlePlaceBid}
                loading={bidLoading}
            />

            {/* Auto Bid Modal */}
            <AutoBidModal
                open={autoBidModalOpen}
                onOpenChange={setAutoBidModalOpen}
                currentPrice={currentPrice}
                minBid={minRequiredBid}
                autoBid={autoBid}
                apiLoading={autoBidLoading}
                setAutoBid={setAutoBid}
                cancelAutoBid={cancelAutoBid}
            />

            {/* Feature Auction Modal */}
            <FeatureAuctionModal
                open={featureModalOpen}
                onOpenChange={setFeatureModalOpen}
                auctionTitle={auction?.title}
                auctionEndDate={auction?.endDate}
                onFeature={handleFeatureAuction}
                loading={featureLoading}
            />

            {/* Report Auction Modal */}
            <ReportAuctionModal
                open={reportModalOpen}
                onOpenChange={setReportModalOpen}
                auction={auction}
            />

            {/* Auction House Ratings Modal */}
            {ratingsModalOpen && houseRatings && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setRatingsModalOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
                        dir={isAr ? 'rtl' : 'ltr'}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-[#C5E0DC] dark:border-slate-700">
                            <div>
                                <h2 className="font-bold text-[#1A2E2C] dark:text-slate-100 text-lg">
                                    {isAr ? 'تقييمات صالة المزاد' : 'Auction House Reviews'}
                                </h2>
                                <p className="text-sm text-[#6B9E99] dark:text-slate-400 mt-0.5">
                                    {auction?.auctionHouseName}
                                </p>
                            </div>
                            <button
                                onClick={() => setRatingsModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-[#F0F2F5] dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-[#6B9E99] dark:text-slate-400" />
                            </button>
                        </div>

                        {/* Average Summary */}
                        <div className="flex items-center gap-3 px-5 py-4 bg-[#F4FAFA] dark:bg-slate-800 border-b border-[#C5E0DC] dark:border-slate-700">
                            <div className="text-4xl font-bold text-[#2A9D8F]">
                                {houseRatings.averageRating.toFixed(1)}
                            </div>
                            <div>
                                <div className="flex items-center gap-0.5 mb-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-4 h-4 ${star <= Math.round(houseRatings.averageRating) ? 'text-[#F4A736] fill-[#F4A736]' : 'text-[#C5E0DC] fill-[#C5E0DC]'}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-[#6B9E99] dark:text-slate-400">
                                    {houseRatings.totalRatings} {isAr ? 'تقييم' : 'ratings'}
                                </p>
                            </div>
                        </div>

                        {/* Ratings List */}
                        <div className="overflow-y-auto flex-1 divide-y divide-[#C5E0DC] dark:divide-slate-700">
                            {houseRatings.ratings.map((r, idx) => (
                                <div key={idx} className="px-5 py-4">
                                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-[#EAF7F5] dark:bg-emerald-950/40 flex items-center justify-center">
                                                <User className="w-4 h-4 text-[#2A9D8F]" />
                                            </div>
                                            <span className="font-semibold text-sm text-[#1A2E2C] dark:text-slate-100">{r.buyerUsername}</span>
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-3.5 h-3.5 ${star <= r.rating ? 'text-[#F4A736] fill-[#F4A736]' : 'text-[#C5E0DC] fill-[#C5E0DC]'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    {r.comment && (
                                        <p className="text-sm text-[#1A2E2C] dark:text-slate-200 leading-relaxed">
                                            {r.comment}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

