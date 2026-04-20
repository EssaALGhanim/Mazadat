import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopNavigationBar from '../components/TopNavigationBar';
import AuctionCard from '../components/auction/AuctionCard';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { getAllAuctions } from '@/services/auctionService';

export default function WatchlistPage({ currentUser, onBack, onShowMyBids }) {
  const { t, i18n } = useTranslation('common');
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();

  const { watchlist, loading: watchlistLoading, error: watchlistError, refetchWatchlist } = useWatchlist();
  const [auctions, setAuctions] = useState([]);
  const [auctionsLoading, setAuctionsLoading] = useState(true);
  const [auctionsError, setAuctionsError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    setAuctionsLoading(true);
    setAuctionsError(null);
    try {
      const data = await getAllAuctions();
      const auctionsList = Array.isArray(data) ? data : data?.data || data?.auctions || [];
      setAuctions(auctionsList);
    } catch (err) {
      setAuctionsError(err.message || (isAr ? 'فشل تحميل المزادات' : 'Failed to load auctions'));
      setAuctions([]);
    } finally {
      setAuctionsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAuctions(), refetchWatchlist()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  const isSeller = currentUser?.role === 'SELLER';
  const isBuyer = currentUser?.role === 'BUYER';

  // Filter auctions to only show those in watchlist
  const watchlistAuctionIds = watchlist.map((item) => item.auctionId);
  const watchlistAuctions = auctions.filter((auction) =>
    watchlistAuctionIds.includes(auction.id)
  );

  const loading = watchlistLoading || auctionsLoading;
  const error = watchlistError || auctionsError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E8EAF0] flex flex-col">
      <TopNavigationBar
        currentUser={currentUser}
        isSeller={isSeller}
        isBuyer={isBuyer}
        onShowMyBids={onShowMyBids}
        onShowWatchlist={() => {}}
        onCreateAuction={() => {}}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
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
                  <Bookmark className="w-6 h-6 text-[#2A9D8F] fill-current" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#1A2E2C]">
                    {isAr ? 'قائمة المتابعة' : 'Watchlist'}
                  </h1>
                  <p className="text-sm text-[#6B9E99]">
                    {isAr
                      ? `${watchlistAuctions.length} مزاد محفوظ`
                      : `${watchlistAuctions.length} saved auction${watchlistAuctions.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C5E0DC] text-[#2A9D8F] rounded-lg hover:bg-[#EAF7F5] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isAr ? 'تحديث' : 'Refresh'}</span>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl border border-[#C5E0DC] p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#C5E0DC] border-t-[#2A9D8F]" />
                <p className="text-[#6B9E99] font-medium">
                  {isAr ? 'جاري التحميل...' : 'Loading your watchlist...'}
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-white rounded-xl border border-[#E05252] p-10 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-3 rounded-full bg-red-50">
                  <Bookmark className="w-8 h-8 text-[#E05252]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#E05252] mb-2">
                    {isAr ? 'حدث خطأ' : 'Error'}
                  </h3>
                  <p className="text-[#6B9E99]">{error}</p>
                </div>
                <button
                  onClick={handleRefresh}
                  className="mt-2 px-6 py-2 bg-[#2A9D8F] text-white rounded-lg hover:bg-[#1A7A6E] font-semibold transition-colors"
                >
                  {isAr ? 'إعادة المحاولة' : 'Try Again'}
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && watchlistAuctions.length === 0 && (
            <div className="bg-white rounded-xl border border-[#C5E0DC] p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-[#EAF7F5]">
                  <Bookmark className="w-12 h-12 text-[#6B9E99]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A2E2C] mb-2">
                    {isAr ? 'قائمة المتابعة فارغة' : 'Your Watchlist is Empty'}
                  </h3>
                  <p className="text-[#6B9E99] max-w-md mx-auto">
                    {isAr
                      ? 'ابدأ بإضافة المزادات إلى قائمة المتابعة لتتبعها بسهولة. انقر على أيقونة الإشارة المرجعية في أي مزاد لإضافته هنا.'
                      : 'Start adding auctions to your watchlist to track them easily. Click the bookmark icon on any auction to add it here.'}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="mt-2 px-6 py-3 bg-[#2A9D8F] text-white rounded-lg hover:bg-[#1A7A6E] font-bold transition-colors"
                >
                  {isAr ? 'تصفح المزادات' : 'Browse Auctions'}
                </button>
              </div>
            </div>
          )}

          {/* Watchlist Auctions Grid */}
          {!loading && !error && watchlistAuctions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
              {watchlistAuctions.map((auction) => (
                <div
                  key={auction.id}
                  onClick={() => navigate(`/auction/${auction.id}`)}
                  className="cursor-pointer"
                >
                  <AuctionCard
                    auction={auction}
                    currentUser={currentUser}
                    onActionComplete={handleRefresh}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
