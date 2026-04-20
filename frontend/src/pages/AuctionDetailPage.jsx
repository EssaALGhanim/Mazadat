import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, Trophy, Download, Home } from 'lucide-react';
import CountdownTimer from '@/components/auction/CountdownTimer';
import PlaceBidModal from '@/components/auction/PlaceBidModal';
import { placeBid, generateReceipt } from '@/services/bidService';
import { getAuctionById } from '@/services/auctionService';
import { resolveImageUrl } from '@/services/imageService';
import { resolveTextAlignmentClass, resolveTextDirection } from '@/lib/textDirection';
import ImageWithRetry from '@/components/ui/ImageWithRetry';

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
    const [bidSubmitError, setBidSubmitError] = useState(null);
    const [isFeatured, setIsFeatured] = useState(false);
    const [featureLoading, setFeatureLoading] = useState(false);

    // Fetch auction from API
    useEffect(() => {
        const fetchAuction = async () => {
            setLoading(true);
            try {
                const response = await getAuctionById(auctionId);
                console.log('Auction loaded:', response);
                setAuction(response);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#C5E0DC] border-t-[#2A9D8F] rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !auction) {
        const isSeller = currentUser?.role === 'SELLER';
        return (
            <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl border border-[#E05252] p-6 text-center max-w-md">
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
    const isActive = auction?.status === 'ACTIVE';
    const isPending = auction?.status === 'PENDING';
    const isEnded = auction?.status === 'COMPLETED' || auction?.status === 'ENDED';
    const isFailedBelowReserve = auction?.status === 'FAILED_BELOW_RESERVE';
    const hasEndTimePassed = auction?.endDate && new Date(auction.endDate) < new Date();
    const auctionEnded = isEnded || isFailedBelowReserve || hasEndTimePassed;

    const canBid = isBuyer && (isActive || isPending) && !auctionEnded;
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
            alert(isAr ? 'تم تسجيل المزايدة بنجاح' : 'Bid placed successfully!');
        } catch (error) {
            alert(error.message || t('actionFailed'));
        } finally {
            setBidLoading(false);
        }
    };

    const handleGenerateReceipt = async () => {
        const now = new Date();
        const endDate = new Date(auction.endDate);
        if (now < endDate) {
            alert(isAr ? 'لا يمكن تحميل الإيصال قبل انتهاء المزاد' : 'Receipt can only be downloaded after the auction ends');
            return;
        }

        setBidLoading(true);
        try {
            await generateReceipt(auction.id);
            alert(isAr ? 'تم تحميل الإيصال بنجاح' : 'Receipt downloaded successfully!');
        } catch (err) {
            alert(err.message || (isAr ? 'فشل تحميل الإيصال' : 'Failed to generate receipt'));
        } finally {
            setBidLoading(false);
        }
    };

    const titleDir = resolveTextDirection(auction?.title || '');
    const descriptionDir = resolveTextDirection(auction?.description || '');

    return (
        <div className="min-h-screen bg-[#F0F2F5] py-8">
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
                        <div className="bg-white rounded-xl border border-[#C5E0DC] overflow-hidden shadow-sm">
                            {/* Main Image */}
                            {images.length > 0 ? (
                                <div className="relative bg-[#F4FAFA] aspect-video flex items-center justify-center">
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
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all shadow-md"
                                                aria-label="Previous image"
                                            >
                                                {isAr ? <ChevronRight className="w-6 h-6 text-[#2A9D8F]" /> : <ChevronLeft className="w-6 h-6 text-[#2A9D8F]" />}
                                            </button>
                                            <button
                                                onClick={handleNextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all shadow-md"
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
                                <div className="bg-[#F4FAFA] aspect-video flex items-center justify-center">
                                    <span className="text-[#C5E0DC] font-bold text-4xl">
                                        {isAr ? 'لا توجد صورة' : 'No Image'}
                                    </span>
                                </div>
                            )}

                            {/* Thumbnail Gallery */}
                            {images.length > 1 && (
                                <div className="p-4 bg-white border-t border-[#C5E0DC] grid grid-cols-4 gap-2">
                                    {images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                                index === currentImageIndex
                                                    ? 'border-[#2A9D8F] ring-2 ring-[#2A9D8F]/30'
                                                    : 'border-[#C5E0DC] hover:border-[#2A9D8F]'
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
                        <div className="bg-white rounded-xl border border-[#C5E0DC] p-6 mt-6 shadow-sm">
                            <h2 className="text-lg font-bold text-[#1A2E2C] mb-4">
                                {isAr ? 'الوصف الكامل' : 'Full Description'}
                            </h2>
                            <p
                                dir={descriptionDir}
                                className={`text-[#1A2E2C] text-sm leading-relaxed ${resolveTextAlignmentClass(auction?.description || '')}`}
                            >
                                {auction?.description}
                            </p>
                        </div>
                    </div>

                    {/* Auction Details - Right Side */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Seller Info */}
                        <div className="bg-white rounded-xl border border-[#C5E0DC] p-4 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-[#EAF7F5] flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5 text-[#2A9D8F]" />
                                </div>
                                <div>
                                    <p className="text-xs text-[#6B9E99]">{isAr ? 'البائع' : 'Seller'}</p>
                                    <h3 className="font-bold text-[#1A2E2C]">
                                        {auction?.sellerName || (isAr ? 'بائع' : 'Seller')}
                                    </h3>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-[#C5E0DC]">
                                <p className="text-xs text-[#6B9E99]">{isAr ? 'صالة المزاد' : 'Auction House'}</p>
                                <p className="font-semibold text-[#1A2E2C]">{auction?.auctionHouseName}</p>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="bg-white rounded-xl border border-[#C5E0DC] p-4 shadow-sm">
                            <h1
                                dir={titleDir}
                                className={`font-bold text-2xl text-[#1A2E2C] ${resolveTextAlignmentClass(auction?.title || '')}`}
                            >
                                {auction?.title}
                            </h1>
                        </div>

                        {/* Price Section */}
                        <div className="bg-white rounded-xl border border-[#C5E0DC] p-6 shadow-sm">
                            <div className="mb-4">
                                <p className="text-xs text-[#6B9E99] mb-1">
                                    {isAr ? 'السعر الحالي' : 'Current Price'}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-[#2A9D8F] pulse-animation" dir="ltr">
                                        {currentPrice}
                                    </span>
                                    <span className="text-lg font-semibold text-[#6B9E99]">﷼</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#C5E0DC]">
                                <div>
                                    <p className="text-xs text-[#6B9E99]">{isAr ? 'السعر الأولي' : 'Starting Price'}</p>
                                    <p className="font-semibold text-[#1A2E2C]" dir="ltr">{startingPrice} ﷼</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#6B9E99]">{isAr ? 'عدد المزايدات' : 'Bids'}</p>
                                    <p className="font-semibold text-[#1A2E2C]">{auction?.bidCount || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Countdown or Status */}
                        {(isActive || isPending) && !auctionEnded && (
                            <div className="bg-white rounded-xl border border-[#C5E0DC] p-4 shadow-sm">
                                <p className="text-sm font-semibold text-[#6B9E99] mb-2">
                                    {isAr ? 'الوقت المتبقي' : 'Time Left'}
                                </p>
                                <CountdownTimer endDate={auction.endDate} />
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
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="bg-white rounded-xl border border-[#C5E0DC] p-4 shadow-sm space-y-2">
                            {canBid && (
                                <button
                                    onClick={() => setBidModalOpen(true)}
                                    disabled={bidLoading}
                                    className="w-full bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 text-sm"
                                >
                                    {isAr ? '💰 مزايدة الآن' : '💰 Place Bid Now'}
                                </button>
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

                            <button
                                onClick={() => isSeller ? navigate('/seller-dashboard') : navigate('/')}
                                className="w-full bg-[#F4FAFA] hover:bg-[#E2F1EF] text-[#2A9D8F] px-4 py-3 rounded-lg font-bold transition-colors text-sm"
                            >
                                {isAr ? '← العودة' : 'Back →'}
                            </button>
                        </div>

                        {/* Winner Information - For Seller */}
                        {auctionEnded && isSeller && hasBids && auction?.highestBidder && (
                            <div className="bg-[#EAF7F5] border border-[#2A9D8F] rounded-xl py-4 px-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Trophy className="w-5 h-5 text-[#2A9D8F]" />
                                    <p className="font-semibold text-[#2A9D8F]">
                                        {isAr ? 'الفائز' : 'Winner'}
                                    </p>
                                </div>
                                <p className="text-[#1A2E2C] font-bold mb-2">{auction.highestBidder}</p>
                                {auction.highestBidderEmail && (
                                    <p className="text-xs text-[#6B9E99]" dir="ltr">
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
        </div>
    );
}

