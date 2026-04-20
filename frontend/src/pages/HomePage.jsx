import { useEffect, useState } from 'react';
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
import { getAllAuctions } from '@/services/auctionService';
import { getSellerAuctionHouse } from '@/services/auctionHouseService';

export default function HomePage() {
  const { i18n } = useTranslation('common');
  const isAr = i18n.language === 'ar';
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
  const [filters, setFilters] = useState({
    auctionHouse: '',
    priceRange: [0, 1],
    sortBy: 'newest',
    category: '',
    status: 'all',
    searchKeyword: '',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      setCurrentUser(stored ? JSON.parse(stored) : null);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    fetchAuctions();
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'SELLER') {
      checkSellerAuctionHouse();
    }
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [auctions, filters]);

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

  const fetchAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAuctions();
      const auctionsList = Array.isArray(data) ? data : data?.data || data?.auctions || [];
      const dynamicMax = Math.max(1, ...auctionsList.map((a) => Number(a?.currentPrice) || Number(a?.startingPrice) || 0));
      setAuctions(auctionsList);
      setFilters((prev) => ({
        ...prev,
        priceRange: [Math.max(0, Math.min(prev.priceRange[0], dynamicMax)), dynamicMax],
      }));
    } catch {
      setError(isAr ? 'فشل تحميل المزادات' : 'Failed to load auctions');
      setAuctions([]);
      setFilteredAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const now = new Date();
    const isEndedAuction = (auction) => {
      const endedByStatus = auction?.status === 'COMPLETED' || auction?.status === 'ENDED';
      const endedByTime = auction?.endDate ? new Date(auction.endDate) <= now : false;
      return endedByStatus || endedByTime;
    };
    const isLiveAuction = (auction) => {
      const liveStatus = auction?.status === 'ACTIVE' || auction?.status === 'PENDING';
      return liveStatus && !isEndedAuction(auction);
    };

    let filtered = [...auctions];

    // Search keyword filter
    if (filters.searchKeyword) {
      const keyword = filters.searchKeyword.toLowerCase().trim();
      filtered = filtered.filter((a) => {
        const title = (a.title || '').toLowerCase();
        const description = (a.description || '').toLowerCase();
        const sellerName = (a.sellerName || '').toLowerCase();
        const auctionHouseName = (a.auctionHouseName || '').toLowerCase();
        return title.includes(keyword) ||
               description.includes(keyword) ||
               sellerName.includes(keyword) ||
               auctionHouseName.includes(keyword);
      });
    }

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

    if (filters.status === 'live') {
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
  };

  const handleActionComplete = () => fetchAuctions();

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
  const maxFilterPrice = Math.max(1, ...auctions.map((a) => Number(a?.currentPrice) || Number(a?.startingPrice) || 0));

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
          maxPrice={maxFilterPrice}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
                {filteredAuctions.map((auction) => (
                  <div key={auction.id} onClick={() => navigate(`/auction/${auction.id}`)} className="cursor-pointer">
                    <AuctionCard auction={auction} currentUser={currentUser} onActionComplete={handleActionComplete} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateAuctionModal open={isModalOpen} onOpenChange={setIsModalOpen} onSuccess={fetchAuctions} />
      <AuctionHouseCreationModal open={isAuctionHouseModalOpen} onOpenChange={setIsAuctionHouseModalOpen} onSuccess={checkSellerAuctionHouse} />
    </div>
  );
}
