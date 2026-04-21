import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, ArrowLeft } from 'lucide-react';
import { getBuyerBids, getWonBids } from '@/services/bidService';
import { generateReceipt } from '@/services/bidService';
import { toast } from 'sonner';
import { resolveTextAlignmentClass, resolveTextDirection } from '@/lib/textDirection';
import TopNavigationBar from '../components/TopNavigationBar';

export default function MyBidsPage({ onBack, currentUser, onShowWatchlist }) {
    const { i18n } = useTranslation('common');
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'won'
    const [bids, setBids] = useState([]);
    const [wonBids, setWonBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [generatingReceipt, setGeneratingReceipt] = useState(null);
    const [generatedReceipts, setGeneratedReceipts] = useState(new Set());
    const isAr = i18n.language === 'ar';

    useEffect(() => {
        fetchBids();
    }, []);

    const normalizeBids = (items, endedOnly = false) => {
        const map = new Map();
        for (const bid of items || []) {
            const auctionKey = bid.auctionId ?? bid.id;
            if (!auctionKey) continue;

            if (endedOnly) {
                const byDate = bid.auctionEndDate && new Date(bid.auctionEndDate) <= new Date();
                const status = (bid.auctionStatus || '').toUpperCase();
                const byStatus = status === 'ENDED' || status === 'COMPLETED';
                if (!byDate && !byStatus) {
                    continue;
                }
            }

            const current = map.get(auctionKey);
            const currentAmount = Number(current?.amount || 0);
            const candidateAmount = Number(bid?.amount || 0);
            const currentPlacedAt = new Date(current?.placedAt || 0).getTime();
            const candidatePlacedAt = new Date(bid?.placedAt || 0).getTime();

            if (!current || candidateAmount > currentAmount || (candidateAmount === currentAmount && candidatePlacedAt > currentPlacedAt)) {
                map.set(auctionKey, bid);
            }
        }

        return Array.from(map.values()).sort((left, right) => new Date(right.placedAt || 0) - new Date(left.placedAt || 0));
    };

    const fetchBids = async () => {
        setLoading(true);
        setError(null);
        try {
            const [allBidsResponse, wonBidsResponse] = await Promise.all([
                getBuyerBids(),
                getWonBids()
            ]);
            setBids(normalizeBids(allBidsResponse || []));
            setWonBids(normalizeBids(wonBidsResponse || [], true));
        } catch (err) {
            setError(err.message || 'Failed to load bids');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReceipt = async (auctionId, auctionEndDate) => {
        // Check if auction has ended
        const now = new Date();
        const endDate = new Date(auctionEndDate);

        if (now < endDate) {
            toast.error(isAr ? 'لا يمكن تحميل الإيصال قبل انتهاء المزاد' : 'Receipt can only be downloaded after the auction ends');
            return;
        }

        setGeneratingReceipt(auctionId);
        try {
            await generateReceipt(auctionId);
            setGeneratedReceipts(prev => new Set([...prev, auctionId]));
            toast.success(isAr ? 'تم تحميل الإيصال بنجاح' : 'Receipt downloaded successfully!');
        } catch (err) {
            toast.error(err.message || (isAr ? 'فشل تحميل الإيصال' : 'Failed to generate receipt'));
        } finally {
            setGeneratingReceipt(null);
        }
    };

    const displayBids = activeTab === 'won' ? wonBids : bids;

    const isSeller = currentUser?.role === 'SELLER';
    const isBuyer = currentUser?.role === 'BUYER';

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/auth';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E8EAF0] flex flex-col">
            <TopNavigationBar
                currentUser={currentUser}
                isSeller={isSeller}
                isBuyer={isBuyer}
                onShowMyBids={() => {}}
                onShowWatchlist={onShowWatchlist}
                onCreateAuction={() => {}}
                onLogout={handleLogout}
            />

            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="p-2 rounded-lg bg-white border border-[#C5E0DC] text-[#2A9D8F] hover:bg-[#EAF7F5] transition-colors"
                                    aria-label={isAr ? 'رجوع' : 'Go back'}
                                >
                                    <ArrowLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                                </button>
                            )}
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-[#2A9D8F]/10">
                                    <Trophy className="w-6 h-6 text-[#2A9D8F]" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-[#1A2E2C]">
                                        {isAr ? 'مزايداتي' : 'My Bids'}
                                    </h1>
                                    <p className="text-sm text-[#6B9E99]">
                                        {isAr ? 'جميع مزايداتك في مكان واحد' : 'All your bids in one place'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6 border-b border-[#C5E0DC] pb-2">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2.5 rounded-lg font-bold transition-colors ${activeTab === 'all'
                                ? 'bg-[#EAF7F5] text-[#2A9D8F]'
                                : 'text-[#6B9E99] hover:text-[#2A9D8F] hover:bg-[#F4FAFA]'
                            }`}
                    >
                        {isAr ? 'جميع المزايدات' : 'All Bids'} ({bids.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('won')}
                        className={`px-4 py-2.5 rounded-lg font-bold transition-colors flex items-center gap-2 ${activeTab === 'won'
                                ? 'bg-[#EAF7F5] text-[#2A9D8F]'
                                : 'text-[#6B9E99] hover:text-[#2A9D8F] hover:bg-[#F4FAFA]'
                            }`}
                    >
                        <Trophy className="w-5 h-5" />
                        {isAr ? 'المزايدات الفائزة' : 'Won Bids'} ({wonBids.length})
                    </button>
                </div>

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
                            onClick={fetchBids}
                            className="bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-6 py-2 rounded-lg font-bold transition-colors"
                        >
                            {isAr ? 'إعادة المحاولة' : 'Retry'}
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && displayBids.length === 0 && (
                    <div className="bg-white rounded-xl border border-[#C5E0DC] p-12 text-center">
                        <Trophy className="w-16 h-16 text-[#C5E0DC] mx-auto mb-4" />
                        <p className="text-[#6B9E99] font-semibold text-lg">
                            {activeTab === 'won'
                                ? (isAr ? 'لا توجد مزايدات فائزة' : 'No won bids yet')
                                : (isAr ? 'لم تضع أي مزايدات بعد' : 'No bids placed yet')}
                        </p>
                    </div>
                )}

                {/* Bids List */}
                {!loading && !error && displayBids.length > 0 && (
                    <div className="space-y-4">
                        {displayBids.map((bid) => (
                            <div
                                key={bid.auctionId ?? bid.id}
                                className={`bg-white rounded-xl border p-4 md:p-5 shadow-sm transition-all overflow-hidden ${activeTab === 'won'
                                        ? 'border-[#2A9D8F] bg-gradient-to-r from-[#2A9D8F]/5 to-transparent'
                                        : 'border-[#C5E0DC]'
                                    }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 min-w-0">
                                    <div className="flex-1 min-w-0">
                                        <h3
                                            dir={resolveTextDirection(bid.auctionTitle || '')}
                                            className={`font-bold text-base md:text-lg text-[#1A2E2C] mb-1 line-clamp-2 ${resolveTextAlignmentClass(bid.auctionTitle || '')}`}
                                        >
                                            {bid.auctionTitle}
                                        </h3>
                                        <p className="text-sm text-[#6B9E99]">
                                            {isAr ? 'الأعلى' : 'Highest Bid'}:{' '}
                                            <span className="font-bold text-[#2A9D8F]" dir="ltr">
                                                {bid.amount} ﷼
                                            </span>
                                        </p>
                                    </div>
                                    {activeTab === 'won' && (
                                        <div className="flex items-center gap-2 bg-[#2A9D8F] text-white px-3 py-1 rounded-full">
                                            <Trophy className="w-4 h-4" />
                                            <span className="text-xs font-bold">
                                                {isAr ? 'فائز' : 'Winner'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                                    <div>
                                        <p className="text-[#6B9E99] text-xs mb-1">
                                            {isAr ? 'السعر الابتدائي' : 'Starting Price'}
                                        </p>
                                        <p className="font-bold text-[#1A2E2C]" dir="ltr">
                                            {bid.startingPrice} ﷼
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[#6B9E99] text-xs mb-1">
                                            {isAr ? 'تاريخ المزايدة' : 'Bid Date'}
                                        </p>
                                        <p className="font-bold text-[#1A2E2C]">
                                            {new Date(bid.placedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2">
                                    {activeTab === 'won' && (
                                        <>
                                            {new Date() < new Date(bid.auctionEndDate) ? (
                                                <button
                                                    disabled={true}
                                                    className="w-full sm:w-auto sm:flex-1 px-4 py-2 rounded-lg font-bold transition-colors bg-[#C5E0DC] text-[#6B9E99] cursor-not-allowed"
                                                    title={isAr ? 'الإيصال متاح بعد انتهاء المزاد' : 'Receipt available after auction ends'}
                                                >
                                                    {isAr ? 'في انتظار انتهاء المزاد' : 'Auction in progress'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleGenerateReceipt(bid.auctionId, bid.auctionEndDate)}
                                                    disabled={generatingReceipt === bid.auctionId}
                                                    className={`w-full sm:w-auto sm:flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${generatedReceipts.has(bid.auctionId)
                                                            ? 'bg-[#EAF7F5] border border-[#2A9D8F] text-[#2A9D8F]'
                                                            : 'bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white'
                                                        } disabled:opacity-50`}
                                                >
                                                    {generatingReceipt === bid.auctionId
                                                        ? '...'
                                                        : generatedReceipts.has(bid.auctionId)
                                                            ? '✓ ' + (isAr ? 'تم التحميل' : 'Downloaded')
                                                            : (isAr ? 'تحميل الإيصال' : 'Download Receipt')}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                </div>
            </main>
        </div>
    );
}
