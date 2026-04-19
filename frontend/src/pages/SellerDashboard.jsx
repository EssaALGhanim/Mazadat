import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Eye, TrendingUp, Package, DollarSign, Clock, ShieldPlus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopNavigationBar from '../components/TopNavigationBar';
import CreateAuctionModal from '../components/createAuction/CreateAuctionModal';
import AuctionHouseCreationModal from '../components/createAuction/AuctionHouseCreationModal';
import { getSellerAuctionHouse } from '@/services/auctionHouseService';
import { deleteAuction } from '@/services/auctionService';
import { resolveImageUrl } from '@/services/imageService';
import { getCurrentSellerProfile } from '@/services/userService';
import ImageWithRetry from '@/components/ui/ImageWithRetry';

export default function SellerDashboard() {
    const { i18n } = useTranslation('common');
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [auctionHouse, setAuctionHouse] = useState(null);
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAuctionHouseModalOpen, setIsAuctionHouseModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, completed
    const [searchQuery, setSearchQuery] = useState('');
    const [currentSeller, setCurrentSeller] = useState(null);
    const isAr = i18n.language === 'ar';

    useEffect(() => {
        try {
            const stored = localStorage.getItem('user');
            const parsed = stored ? JSON.parse(stored) : null;
            setCurrentUser(parsed);
        } catch {
            setCurrentUser(null);
        }
    }, []);

    useEffect(() => {
        if (currentUser?.role === 'SELLER') {
            fetchSellerData();
        }
    }, [currentUser]);

    const fetchSellerData = async () => {
        setLoading(true);
        setError(null);
        try {
            const sellerProfile = await getCurrentSellerProfile();
            const house = await getSellerAuctionHouse().catch((err) => {
                if ((err?.message || '').toLowerCase().includes('not part of any auction house')) {
                    return null;
                }
                throw err;
            });
            setAuctionHouse(house);
            setCurrentSeller(sellerProfile);
            if (house?.auctions) {
                setAuctions(house.auctions);
            } else {
                setAuctions([]);
            }
        } catch (err) {
            setError(isAr ? 'فشل تحميل البيانات' : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const isSellerAdmin = Boolean(currentSeller?.isAdmin);

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/auth';
    };

    const handleCreateAuction = () => {
        setIsModalOpen(true);
    };

    const handleAuctionCreated = () => {
        setIsModalOpen(false);
        fetchSellerData();
    };

    const handleAuctionHouseCreated = () => {
        setIsAuctionHouseModalOpen(false);
        fetchSellerData();
    };

    const handleDeleteAuction = async (auctionId) => {
        setDeleteError(null);
        if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذا المزاد؟' : 'Are you sure you want to delete this auction?')) {
            return;
        }

        setDeleteLoading(auctionId);
        try {
            await deleteAuction(auctionId);
            setAuctions(auctions.filter(a => a.id !== auctionId));
        } catch (err) {
            setDeleteError(err?.message || (isAr ? 'فشل حذف المزاد' : 'Failed to delete auction'));
        } finally {
            setDeleteLoading(null);
        }
    };


    const isAuctionEnded = (auction) => {
        const endedByStatus = auction?.status === 'COMPLETED' || auction?.status === 'ENDED' || auction?.status === 'FAILED_BELOW_RESERVE';
        const endedByTime = auction?.endDate ? new Date(auction.endDate) <= new Date() : false;
        return endedByStatus || endedByTime;
    };

    const filteredAuctions = auctions.filter(auction => {
        if (filterStatus === 'active' && isAuctionEnded(auction)) return false;
        if (filterStatus === 'completed' && !isAuctionEnded(auction)) return false;
        
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            const matchesTitle = auction.title?.toLowerCase().includes(lowerQuery);
            const matchesId = auction.id?.toString().includes(lowerQuery);
            return matchesTitle || matchesId;
        }

        return true;
    });

    const stats = {
        total: auctions.length,
        active: auctions.filter((a) => !isAuctionEnded(a)).length,
        completed: auctions.filter((a) => isAuctionEnded(a)).length,
        totalBids: auctions.reduce((sum, a) => sum + (a.bidCount || 0), 0)
    };

    const getAuctionStatus = (auction) => {
        const now = new Date();
        const endDate = new Date(auction.endDate);
        if (auction.status === 'FAILED_BELOW_RESERVE') {
            return { label: isAr ? 'فشل - أقل من الحد الأدنى للبيع' : 'Failed - Below Reserve', color: 'text-red-700', bg: 'bg-red-100' };
        }
        if (endDate < now) {
            return { label: isAr ? 'منتهي' : 'Ended', color: 'text-red-600', bg: 'bg-red-50' };
        }
        if (auction.status === 'PENDING') {
            return { label: isAr ? 'قيد الانتظار' : 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-50' };
        }
        return { label: isAr ? 'نشط' : 'Active', color: 'text-green-600', bg: 'bg-green-50' };
    };

    if (currentUser?.role !== 'SELLER') {
        return (
            <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 text-center">
                    <p className="text-gray-600 mb-4">{isAr ? 'هذه الصفحة خاصة بالبائعين فقط' : 'This page is for sellers only'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-[#2A9D8F] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1A7A6E] transition-colors"
                    >
                        {isAr ? 'العودة للرئيسية' : 'Go Home'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
            <TopNavigationBar
                currentUser={currentUser}
                isSeller={true}
                isBuyer={false}
                onCreateAuction={handleCreateAuction}
                onLogout={handleLogout}
                disableCreateAuction={false}
            />

            <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#1A2E2C] mb-2">
                            {isAr ? 'لوحة التحكم - البائع' : 'Seller Dashboard'}
                        </h1>
                        {auctionHouse && (
                            <p className="text-[#6B9E99] text-lg">{auctionHouse.name}</p>
                        )}
                    </div>

                    {/* No Auction House Alert */}
                    {!auctionHouse && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-sm">
                            <p className="text-blue-800 font-semibold mb-4">
                                {isAr ? 'أنت غير منضم إلى أي صالة مزاد حالياً' : 'You are not part of any Auction House yet'}
                            </p>
                            <p className="text-sm text-blue-700 mb-4">
                                {isAr ? 'للبدء، قم بإنشاء صالة مزاد أو انتظر دعوة من مسؤول صالة مزاد.' : 'To continue, create your Auction House or wait for an invitation from an Auction House admin.'}
                            </p>
                            <button
                                onClick={() => setIsAuctionHouseModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                            >
                                {isAr ? 'إنشاء صالة مزاد' : 'Create Auction House'}
                            </button>
                        </div>
                    )}

                    {/* Stats Section */}
                    {auctionHouse && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            {/* Total Auctions */}
                            <div className="bg-white rounded-lg p-6 border border-[#C5E0DC] shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[#6B9E99] text-sm font-semibold mb-1">
                                            {isAr ? 'إجمالي المزادات' : 'Total Auctions'}
                                        </p>
                                        <p className="text-3xl font-bold text-[#2A9D8F]">{stats.total}</p>
                                    </div>
                                    <Package className="w-10 h-10 text-[#2A9D8F] opacity-20" />
                                </div>
                            </div>

                            {/* Active Auctions */}
                            <div className="bg-white rounded-lg p-6 border border-[#C5E0DC] shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[#6B9E99] text-sm font-semibold mb-1">
                                            {isAr ? 'مزادات نشطة' : 'Active Auctions'}
                                        </p>
                                        <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                                    </div>
                                    <TrendingUp className="w-10 h-10 text-green-600 opacity-20" />
                                </div>
                            </div>

                            {/* Completed Auctions */}
                            <div className="bg-white rounded-lg p-6 border border-[#C5E0DC] shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[#6B9E99] text-sm font-semibold mb-1">
                                            {isAr ? 'مزادات منتهية' : 'Completed'}
                                        </p>
                                        <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
                                    </div>
                                    <Package className="w-10 h-10 text-blue-600 opacity-20" />
                                </div>
                            </div>

                            {/* Total Bids */}
                            <div className="bg-white rounded-lg p-6 border border-[#C5E0DC] shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[#6B9E99] text-sm font-semibold mb-1">
                                            {isAr ? 'إجمالي المزايدات' : 'Total Bids'}
                                        </p>
                                        <p className="text-3xl font-bold text-[#2A9D8F]">{stats.totalBids}</p>
                                    </div>
                                    <DollarSign className="w-10 h-10 text-[#2A9D8F] opacity-20" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Team & Settings moved to dedicated Team page */}
                    {auctionHouse && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="bg-white rounded-lg border border-[#C5E0DC] p-5 shadow-sm flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <ShieldPlus className="w-5 h-5 text-[#2A9D8F]" />
                                    <div>
                                        <p className="font-semibold text-[#1A2E2C]">{isAr ? 'إدارة الفريق والصلاحيات' : 'Team & Permissions'}</p>
                                        <p className="text-xs text-[#6B9E99]">{isAr ? 'إضافة أعضاء، إزالة أعضاء، وترقية مسؤولين' : 'Add members, remove members, and promote admins'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/seller/team')}
                                    className="bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-4 py-2 rounded-lg text-sm font-semibold"
                                >
                                    {isAr ? 'فتح صفحة الفريق' : 'Open Team Page'}
                                </button>
                            </div>

                            {isSellerAdmin && (
                                <div className="bg-white rounded-lg border border-[#C5E0DC] p-5 shadow-sm flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-[#1A2E2C]">{isAr ? 'إعدادات صالة المزاد' : 'Auction House Settings'}</p>
                                        <p className="text-xs text-[#6B9E99]">{isAr ? 'تحديث IBAN وبيانات وإعدادات الصالة' : 'Update IBAN, profile data, and settings'}</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/seller/settings')}
                                        className="bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-4 py-2 rounded-lg text-sm font-semibold"
                                    >
                                        {isAr ? 'فتح الإعدادات' : 'Open Settings'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-center">
                            <p className="text-red-600 font-semibold mb-4">{error}</p>
                            <button
                                onClick={fetchSellerData}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                            >
                                {isAr ? 'إعادة المحاولة' : 'Try Again'}
                            </button>
                        </div>
                    )}

                    {deleteError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-700 font-semibold text-sm">{deleteError}</p>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center py-20">
                            <div className="w-10 h-10 border-4 border-[#C5E0DC] border-t-[#2A9D8F] rounded-full animate-spin" />
                        </div>
                    )}

                    {/* Auctions Section */}
                    {auctionHouse && !loading && (
                        <div>
                            {/* Filters, Search, and Create Button */}
                            <div className="flex flex-col xl:flex-row gap-4 mb-6 items-start xl:items-center justify-between">
                                {/* Filters */}
                                <div className="flex gap-2 shrink-0">
                                    {['all', 'active', 'completed'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setFilterStatus(status)}
                                            className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                                                filterStatus === status
                                                    ? 'bg-[#2A9D8F] text-white'
                                                    : 'bg-white text-[#6B9E99] border-2 border-[#C5E0DC] hover:bg-[#F4FAFA]'
                                            }`}
                                        >
                                            {status === 'all' && (isAr ? 'جميع' : 'All')}
                                            {status === 'active' && (isAr ? 'نشطة' : 'Active')}
                                            {status === 'completed' && (isAr ? 'منتهية' : 'Completed')}
                                        </button>
                                    ))}
                                </div>

                                {/* Search Bar */}
                                <div className="relative w-full flex-1 xl:mx-4 max-w-2xl">
                                    <Search className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 text-[#6B9E99] ${isAr ? 'right-4' : 'left-4'}`} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={isAr ? "البحث في المزادات بالاسم أو رقم المعرف..." : "Search auctions by name or ID..."}
                                        className={`w-full ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-white border-2 border-[#C5E0DC] rounded-xl focus:outline-none focus:border-[#2A9D8F] focus:ring-0 text-[#1A2E2C] placeholder-[#6B9E99] shadow-sm text-base font-medium transition-all hover:border-[#6B9E99]`}
                                    />
                                </div>

                                {/* Create Button */}
                                <button
                                    onClick={handleCreateAuction}
                                    className="flex items-center justify-center w-full xl:w-auto gap-2 bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-6 py-3 rounded-xl font-semibold transition-colors shrink-0"
                                >
                                    <Plus className="w-5 h-5" />
                                    {isAr ? 'مزاد جديد' : 'New Auction'}
                                </button>
                            </div>

                            {/* Auctions Table/Grid */}
                            {filteredAuctions.length === 0 ? (
                                <div className="bg-white rounded-lg border border-[#C5E0DC] p-12 text-center">
                                    <p className="text-[#6B9E99] font-semibold text-lg">
                                        {filterStatus === 'all' && (isAr ? 'لا توجد مزادات' : 'No auctions yet')}
                                        {filterStatus === 'active' && (isAr ? 'لا توجد مزادات نشطة' : 'No active auctions')}
                                        {filterStatus === 'completed' && (isAr ? 'لا توجد مزادات منتهية' : 'No completed auctions')}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg border border-[#C5E0DC] overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-[#F4FAFA] border-b border-[#C5E0DC]">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A2E2C]">
                                                        {isAr ? 'المزاد' : 'Auction'}
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A2E2C]">
                                                        {isAr ? 'الحالة' : 'Status'}
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A2E2C]">
                                                        {isAr ? 'السعر الحالي' : 'Current Price'}
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A2E2C]">
                                                        {isAr ? 'المزايدات' : 'Bids'}
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A2E2C]">
                                                        {isAr ? 'انتهاء' : 'Ends'}
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A2E2C]">
                                                        {isAr ? 'الإجراءات' : 'Actions'}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredAuctions.map((auction) => {
                                                    const status = getAuctionStatus(auction);
                                                    const endDate = new Date(auction.endDate);
                                                    const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
                                                    return (
                                                        <tr key={auction.id} className="border-b border-[#C5E0DC] hover:bg-[#F4FAFA] transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    {auction.images?.[0] && (
                                                                        <ImageWithRetry
                                                                            src={resolveImageUrl(auction.images[0].url, auction.images[0].createdAt || auction.images[0].id)}
                                                                            alt={auction.title}
                                                                            className="w-10 h-10 rounded object-cover"
                                                                        />
                                                                    )}
                                                                    <div>
                                                                        <p className="font-semibold text-[#1A2E2C] line-clamp-1">
                                                                            {auction.title}
                                                                        </p>
                                                                        <p className="text-xs text-[#6B9E99]">ID: {auction.id}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                                                                    {status.label}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="font-semibold text-[#2A9D8F]">
                                                                    {auction.currentPrice || auction.startingPrice || 0} ﷼
                                                                </p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="font-semibold text-[#1A2E2C]">{auction.bidCount || 0}</p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="w-4 h-4 text-[#6B9E99]" />
                                                                    <p className="text-sm text-[#6B9E99]">
                                                                        {daysLeft > 0 ? `${daysLeft}d` : 'Ended'}
                                                                    </p>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => navigate(`/auction/${auction.id}`)}
                                                                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                                                                        title={isAr ? 'عرض' : 'View'}
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteAuction(auction.id)}
                                                                        disabled={deleteLoading === auction.id}
                                                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 disabled:opacity-50"
                                                                        title={isAr ? 'حذف' : 'Delete'}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <CreateAuctionModal open={isModalOpen} onOpenChange={setIsModalOpen} onSuccess={handleAuctionCreated} />
            <AuctionHouseCreationModal
                open={isAuctionHouseModalOpen}
                onOpenChange={setIsAuctionHouseModalOpen}
                onSuccess={handleAuctionHouseCreated}
            />
        </div>
    );
}

