import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateAuctionModal from '../components/createAuction/CreateAuctionModal';
import AuctionHouseCreationModal from '../components/createAuction/AuctionHouseCreationModal';
import AuctionCard from '../components/auction/AuctionCard';
import TopNavigationBar from '../components/TopNavigationBar';
import FilterSidebar from '../components/FilterSidebar';
import MyBidsPage from './MyBidsPage';
import WatchlistPage from './WatchlistPage';
import { getAllAuctions, searchAuctions } from '@/services/auctionService';
import { getSellerAuctionHouse } from '@/services/auctionHouseService';
import { getFeaturedAuctions } from '@/services/featuredService';
import { useNow } from '@/hooks/useNow';

export default function HomePage() {
  const { t, i18n } = useTranslation('common');
  const isAr = i18n.language === 'ar';
  const now = useNow();
  const nowDate = new Date(now);
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuctionHouseModalOpen, setIsAuctionHouseModalOpen] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAuctionHouse, setHasAuctionHouse] = useState(false);
  const [checkingAuctionHouse, setCheckingAuctionHouse] = useState(false);
  const [showMyBids, setShowMyBids] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [featuredAuctionIds, setFeaturedAuctionIds] = useState([]);
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [priceBounds, setPriceBounds] = useState([0, 100000]);
  const [filters, setFilters] = useState({
    auctionHouse: '',
    priceRange: [0, 100000],
    sortBy: 'newest',
    category: '',
    status: 'all',
  });

  // Calculate actual price range from current auctions
  const calculatePriceRange = (auctionsList) => {
    if (auctionsList.length === 0) return [0, 100000];
    const prices = auctionsList.map((a) => Number(a?.currentPrice) || Number(a?.startingPrice) || 0).filter((p) => p > 0);
    if (prices.length === 0) return [0, 100000];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return [minPrice, maxPrice];
  };

  // Define applyFilters early so it's available for useEffect dependencies
  const applyFilters = useCallback(() => {
    const currentDate = nowDate;
    const isEndedAuction = (auction) => {
      const endedByStatus = auction?.status === 'COMPLETED' || auction?.status === 'ENDED' || auction?.status === 'FAILED_BELOW_RESERVE';
      const endedByTime = auction?.endDate ? new Date(auction.endDate) <= currentDate : false;
      return endedByStatus || endedByTime;
    };
    const isPendingAuction = (auction) => {
      if (isEndedAuction(auction)) return false;
      if (auction?.status === 'PENDING') {
        const startDate = auction?.startDate ? new Date(auction.startDate) : null;
        return !startDate || startDate > currentDate;
      }
      return false;
    };
    const isLiveAuction = (auction) => {
      const startDate = auction?.startDate ? new Date(auction.startDate) : null;
      const hasStarted = !startDate || startDate <= currentDate;
      const liveStatus = hasStarted && (auction?.status === 'ACTIVE' || auction?.status === 'PENDING');
      return liveStatus && !isEndedAuction(auction);
    };

    let filtered = [...auctions];

    if (filters.auctionHouse) {
      filtered = filtered.filter((a) => String(a.auctionHouseId) === String(filters.auctionHouse));
    }

    filtered = filtered.filter((a) => {
      const price = Number(a.currentPrice) || Number(a.startingPrice) || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    if (filters.category) {
      filtered = filtered.filter((a) => a.category === filters.category);
    }

    if (filters.status === 'pending') {
      filtered = filtered.filter((a) => isPendingAuction(a));
    } else if (filters.status === 'active' || filters.status === 'live') {
      filtered = filtered.filter((a) => isLiveAuction(a));
    } else if (filters.status === 'ended') {
      filtered = filtered.filter((a) => isEndedAuction(a));
    }

    if (filters.sortBy === 'price-high') {
      filtered.sort((a, b) => (Number(b.currentPrice) || Number(b.startingPrice) || 0) - (Number(a.currentPrice) || Number(a.startingPrice) || 0));
    } else if (filters.sortBy === 'price-low') {
      filtered.sort((a, b) => (Number(a.currentPrice) || Number(a.startingPrice) || 0) - (Number(b.currentPrice) || Number(b.startingPrice) || 0));
    } else if (filters.sortBy === 'most-bids') {
      filtered.sort((a, b) => (b.bidCount || 0) - (a.bidCount || 0));
    } else if (filters.sortBy === 'ending-soon') {
      filtered.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredAuctions(filtered);
  }, [auctions, filters, nowDate]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      setCurrentUser(stored ? JSON.parse(stored) : null);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchAuctions();
      fetchFeaturedAuctions();
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'SELLER') {
      checkSellerAuctionHouse();
    }
  }, [currentUser]);

  useEffect(() => {
    if (auctions.length > 0) {
      applyFilters();
    }
  }, [auctions, filters, applyFilters]);

  const checkSellerAuctionHouse = async () => {
    setCheckingAuctionHouse(true);
    try {
      const auctionHouse = await getSellerAuctionHouse();
      setHasAuctionHouse(!!auctionHouse);
    } catch {
      setHasAuctionHouse(false);
    } finally {
      setCheckingAuctionHouse(false);
    }
  };

  const fetchAuctions = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = query ? await searchAuctions(query) : await getAllAuctions();
      const auctionsList = Array.isArray(data) ? data : data?.data || data?.auctions || [];

      // Calculate actual price range from fetched auctions
      const [minPrice, maxPrice] = calculatePriceRange(auctionsList);

      setAuctions(auctionsList);
      setPriceBounds([minPrice, maxPrice]);
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError(isAr ? 'فشل تحميل المزادات' : 'Failed to load auctions');
      setAuctions([]);
      setFilteredAuctions([]);
      setPriceBounds([0, 100000]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedAuctions = async () => {
    try {
      const response = await getFeaturedAuctions();
      const featured = Array.isArray(response) ? response : response?.data || [];
      setFeaturedAuctionIds(featured.map((item) => item.id || item.auctionId));
    } catch (err) {
      console.error('Error fetching featured auctions:', err);
      setFeaturedAuctionIds([]);
    }
   };

   const handleActionComplete = () => {
    fetchAuctions(activeSearchQuery);
    fetchFeaturedAuctions();
  };

  const handleSearchSubmit = async (keyword) => {
    const normalizedKeyword = (keyword || '').trim();
    setActiveSearchQuery(normalizedKeyword);
    await fetchAuctions(normalizedKeyword);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  const handleCreateAuctionClick = () => {
    if (!hasAuctionHouse) {
      setIsAuctionHouseModalOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

  const isSeller = currentUser?.role === 'SELLER';
  const isBuyer = currentUser?.role === 'BUYER';

  useEffect(() => {
    if (isSeller) {
      navigate('/seller-dashboard', { replace: true });
    }
  }, [isSeller, navigate]);

  if (showMyBids && isBuyer) {
    return (
      <MyBidsPage
        currentUser={currentUser}
        onBack={() => setShowMyBids(false)}
        onShowWatchlist={() => {
          setShowMyBids(false);
          setShowWatchlist(true);
        }}
      />
    );
  }

  if (showWatchlist && isBuyer) {
    return (
      <WatchlistPage
        currentUser={currentUser}
        onBack={() => setShowWatchlist(false)}
        onShowMyBids={() => {
          setShowWatchlist(false);
          setShowMyBids(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E8EAF0] flex flex-col">
      <TopNavigationBar
        currentUser={currentUser}
        isSeller={isSeller}
        isBuyer={isBuyer}
        onShowMyBids={() => setShowMyBids(true)}
        onShowWatchlist={() => setShowWatchlist(true)}
        onCreateAuction={handleCreateAuctionClick}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        <FilterSidebar
          onFiltersChange={setFilters}
          onSearchSubmit={handleSearchSubmit}
          priceBounds={priceBounds}
          isMobileOpen={mobileFilterOpen}
          onMobileClose={() => setMobileFilterOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 text-[#6B9E99] bg-white border border-[#C5E0DC] px-4 py-3 rounded-lg font-semibold mb-6"
            >
              <Menu className="w-4 h-4" />
              {isAr ? 'المرشحات' : 'Filters'} ({filteredAuctions.length})
            </button>

            {!loading && !error && filteredAuctions.length === 0 && (
              <div className="bg-white rounded-xl border border-[#C5E0DC] p-10 text-center">
                <p className="text-[#6B9E99] font-semibold">{isAr ? 'لا توجد مزادات تطابق الفلاتر' : 'No auctions match filters'}</p>
              </div>
            )}

            {loading && <p className="text-[#6B9E99]">{isAr ? 'جاري التحميل...' : 'Loading...'}</p>}

            {error && (
              <div className="bg-red-50 border border-[#E05252] rounded-lg p-4 text-[#E05252] font-semibold">
                {error}
              </div>
            )}

            {!loading && !error && filteredAuctions.length > 0 && (
              <>
                {/* Featured Auctions Section */}
                {featuredAuctionIds.length > 0 && filteredAuctions.some((a) => featuredAuctionIds.includes(a.id)) && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-[#1A2E2C] mb-4 flex items-center gap-2">
                      <span className="text-[#FFD700]">⭐</span>
                      {t('featuredAuctions')}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredAuctions
                        .filter((auction) => featuredAuctionIds.includes(auction.id))
                        .map((auction) => (
                          <div key={auction.id} onClick={() => navigate(`/auction/${auction.id}`)} className="cursor-pointer">
                            <AuctionCard auction={auction} currentUser={currentUser} onActionComplete={handleActionComplete} isFeatured={true} />
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* All Auctions Section */}
                <div className="pb-8">
                  {featuredAuctionIds.length > 0 && filteredAuctions.some((a) => featuredAuctionIds.includes(a.id)) && (
                    <h2 className="text-xl font-bold text-[#1A2E2C] mb-4">
                      {isAr ? 'جميع المزادات' : 'All Auctions'}
                    </h2>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAuctions.map((auction) => (
                      <div key={auction.id} onClick={() => navigate(`/auction/${auction.id}`)} className="cursor-pointer">
                        <AuctionCard
                          auction={auction}
                          currentUser={currentUser}
                          onActionComplete={handleActionComplete}
                          isFeatured={featuredAuctionIds.includes(auction.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <CreateAuctionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => fetchAuctions(activeSearchQuery)}
      />
      <AuctionHouseCreationModal open={isAuctionHouseModalOpen} onOpenChange={setIsAuctionHouseModalOpen} onSuccess={checkSellerAuctionHouse} />
    </div>
  );
}
