import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sliders, RotateCcw, Save, FolderOpen, Search } from 'lucide-react';
import { getAllAuctionHouses } from '@/services/auctionHouseService';
import { Slider } from '@/components/ui/slider';
import SaveSearchModal from '@/components/savedSearch/SaveSearchModal';
import ManageSavedSearchesModal from '@/components/savedSearch/ManageSavedSearchesModal';

export default function FilterSidebar({ onFiltersChange, onSearchSubmit, isMobileOpen, onMobileClose, priceBounds = [0, 100000] }) {
    const { i18n } = useTranslation('common');
    const isAr = i18n.language === 'ar';
    const [auctionHouses, setAuctionHouses] = useState([]);
    const [loadingHouses, setLoadingHouses] = useState(false);

    // Filter states
    const [selectedHouse, setSelectedHouse] = useState('');
    const [priceRange, setPriceRange] = useState(priceBounds);
    const [sortBy, setSortBy] = useState('newest');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');

    // Saved search states
    const [saveSearchModalOpen, setSaveSearchModalOpen] = useState(false);
    const [manageSearchesModalOpen, setManageSearchesModalOpen] = useState(false);
    const sliderStep = Math.max(1, Math.round((Math.max(1, Number(priceBounds[1]) || 1) / 200)));
    const normalizedMin = Math.min(...priceBounds);
    const normalizedMax = Math.max(...priceBounds);

    const clampRange = (range) => {
        const rawMin = Number(range?.[0]) || normalizedMin;
        const rawMax = Number(range?.[1]) || normalizedMax;
        const nextMin = Math.max(normalizedMin, Math.min(rawMin, normalizedMax));
        const nextMax = Math.max(nextMin, Math.min(rawMax, normalizedMax));
        return [nextMin, nextMax];
    };

    // Sync selected range when available bounds change (e.g., new search query)
    useEffect(() => {
        setPriceRange(clampRange(priceBounds));
    }, [normalizedMin, normalizedMax]);

    // Load auction houses on mount
    useEffect(() => {
        const fetchHouses = async () => {
            setLoadingHouses(true);
            try {
                const houses = await getAllAuctionHouses();
                setAuctionHouses(houses || []);
            } catch (err) {
                console.error('Failed to load auction houses:', err);
            } finally {
                setLoadingHouses(false);
            }
        };
        fetchHouses();
    }, []);


    useEffect(() => {
        onFiltersChange?.({
            auctionHouse: selectedHouse,
            priceRange,
            sortBy,
            category,
            status,
            searchKeyword
        });
    }, [selectedHouse, priceRange, sortBy, category, status, searchKeyword, onFiltersChange]);

    const categories = [
        { value: '', label: isAr ? 'جميع الفئات' : 'All Categories' },
        { value: 'electronics', label: isAr ? 'إلكترونيات' : 'Electronics' },
        { value: 'furniture', label: isAr ? 'أثاث' : 'Furniture' },
        { value: 'jewelry', label: isAr ? 'مجوهرات' : 'Jewelry' },
        { value: 'art', label: isAr ? 'فن' : 'Art' },
        { value: 'collectibles', label: isAr ? 'تحف' : 'Collectibles' },
        { value: 'other', label: isAr ? 'أخرى' : 'Other' }
    ];

    const sortOptions = [
        { value: 'newest', label: isAr ? 'الأحدث' : 'Newest' },
        { value: 'price-high', label: isAr ? 'أعلى سعر' : 'Highest Price' },
        { value: 'price-low', label: isAr ? 'أقل سعر' : 'Lowest Price' },
        { value: 'most-bids', label: isAr ? 'معظم المزايدات' : 'Most Bids' },
        { value: 'ending-soon', label: isAr ? 'ينتهي قريباً' : 'Ending Soon' }
    ];

    const resetFilters = () => {
        setSelectedHouse('');
        setPriceRange([normalizedMin, normalizedMax]);
        setSortBy('newest');
        setCategory('');
        setStatus('all');
        setSearchKeyword('');
        onSearchSubmit?.('');
    };

    const handleSearchSubmit = () => {
        onSearchSubmit?.(searchKeyword.trim());
    };

    const getCurrentFilters = () => ({
        auctionHouse: selectedHouse,
        priceRange,
        sortBy,
        category,
        status,
        searchKeyword,
    });

    const loadFilters = (filters) => {
        setSelectedHouse(filters.auctionHouse || '');
        setPriceRange(clampRange(filters.priceRange || [normalizedMin, normalizedMax]));
        setSortBy(filters.sortBy || 'newest');
        setCategory(filters.category || '');
        setStatus(filters.status || 'all');
        setSearchKeyword(filters.searchKeyword || '');
    };

    const FilterSection = ({ title, children }) => (
        <div className="pb-6 border-b border-[#C5E0DC]">
            <h3 className="text-sm font-bold text-[#1A2E2C] mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#2A9D8F]" />
                {title}
            </h3>
            {children}
        </div>
    );

    return (
        <>
            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:relative
                left-0 top-16 lg:top-auto
                w-72 h-[calc(100vh-4rem)] lg:h-auto
                bg-white border-r border-[#C5E0DC]
                overflow-y-auto
                transition-transform duration-300 ease-in-out
                z-40
                lg:translate-x-0
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between lg:hidden mb-6">
                        <h2 className="text-xl font-bold text-[#1A2E2C] flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-[#2A9D8F]" />
                            {isAr ? 'المرشحات' : 'Filters'}
                        </h2>
                        <button
                            onClick={onMobileClose}
                            className="p-2 hover:bg-[#F4FAFA] rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-[#6B9E99]" />
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="mb-6 pb-6 border-b border-[#C5E0DC]">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B9E99]" />
                                <input
                                    type="text"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearchSubmit();
                                        }
                                    }}
                                    placeholder={isAr ? 'ابحث في المزادات...' : 'Search auctions...'}
                                    className="w-full pl-10 pr-4 py-3 border border-[#C5E0DC] rounded-lg text-sm text-[#1A2E2C] placeholder:text-[#6B9E99] focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] bg-white font-medium hover:border-[#2A9D8F] transition-colors"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleSearchSubmit}
                                className="px-4 py-3 bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white rounded-lg font-semibold transition-colors text-sm"
                            >
                                {isAr ? 'بحث' : 'Search'}
                            </button>
                        </div>
                    </div>

                    {/* Saved Search Actions */}
                    <div className="grid grid-cols-2 gap-2 mb-6 pb-6 border-b border-[#C5E0DC]">
                        <button
                            onClick={() => setSaveSearchModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white rounded-lg font-semibold transition-colors text-xs"
                        >
                            <Save className="w-4 h-4" />
                            {isAr ? 'حفظ البحث' : 'Save Search'}
                        </button>
                        <button
                            onClick={() => setManageSearchesModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-[#C5E0DC] hover:bg-[#F4FAFA] text-[#2A9D8F] rounded-lg font-semibold transition-colors text-xs"
                        >
                            <FolderOpen className="w-4 h-4" />
                            {isAr ? 'عمليات البحث' : 'My Searches'}
                        </button>
                    </div>

                    {/* Sorting Filter - Prominently placed */}
                    <FilterSection title={isAr ? 'ترتيب حسب' : 'Sort By'}>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-4 py-3 border border-[#C5E0DC] rounded-lg text-sm text-[#1A2E2C] focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] bg-white font-medium hover:border-[#2A9D8F] transition-colors"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </FilterSection>

                    {/* Category Filter */}
                    <FilterSection title={isAr ? 'الفئة' : 'Category'}>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 border border-[#C5E0DC] rounded-lg text-sm text-[#1A2E2C] focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] bg-white font-medium hover:border-[#2A9D8F] transition-colors"
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </FilterSection>

                    {/* Status Filter */}
                    <FilterSection title={isAr ? 'حالة المزاد' : 'Auction Status'}>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setStatus('all')}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                    status === 'all' ? 'bg-[#2A9D8F] text-white' : 'bg-[#F4FAFA] text-[#6B9E99] hover:bg-[#E2F1EF]'
                                }`}
                            >
                                {isAr ? 'الكل' : 'All'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus('live')}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                    status === 'live' ? 'bg-[#2A9D8F] text-white' : 'bg-[#F4FAFA] text-[#6B9E99] hover:bg-[#E2F1EF]'
                                }`}
                            >
                                {isAr ? 'مباشر' : 'Live'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus('ended')}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                    status === 'ended' ? 'bg-[#2A9D8F] text-white' : 'bg-[#F4FAFA] text-[#6B9E99] hover:bg-[#E2F1EF]'
                                }`}
                            >
                                {isAr ? 'منتهي' : 'Ended'}
                            </button>
                        </div>
                    </FilterSection>

                    {/* Auction House Filter */}
                    <FilterSection title={isAr ? 'صالة المزاد' : 'Auction House'}>
                        <select
                            value={selectedHouse}
                            onChange={(e) => setSelectedHouse(e.target.value)}
                            disabled={loadingHouses}
                            className="w-full px-4 py-3 border border-[#C5E0DC] rounded-lg text-sm text-[#1A2E2C] focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] bg-white font-medium hover:border-[#2A9D8F] transition-colors disabled:opacity-50"
                        >
                            <option value="">{isAr ? 'جميع الصالات' : 'All Houses'}</option>
                            {loadingHouses ? (
                                <option disabled>{isAr ? 'جاري التحميل...' : 'Loading...'}</option>
                            ) : (
                                auctionHouses.map((house) => (
                                    <option key={house.id} value={house.id}>
                                        {house.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </FilterSection>

                    {/* Price Range Filter */}
                    <FilterSection title={isAr ? 'نطاق السعر' : 'Price Range'}>
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-[#C5E0DC] bg-gradient-to-br from-[#F8FCFC] to-white p-4 shadow-sm">
                                <Slider
                                    value={priceRange}
                                    min={normalizedMin}
                                    max={normalizedMax}
                                    step={sliderStep}
                                    onValueChange={(value) => setPriceRange(clampRange(value))}
                                    className="py-3"
                                />
                                <div className={`mt-4 flex items-center ${isAr ? 'flex-row-reverse' : 'flex-row'} justify-between text-xs font-semibold text-[#6B9E99]`}>
                                    <span>{isAr ? 'الأقصى' : 'Maximum'}</span>
                                    <span>{isAr ? 'الأدنى' : 'Minimum'}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1 rounded-xl border border-[#C5E0DC] bg-white px-3 py-2">
                                    <p className="text-[11px] font-semibold text-[#6B9E99] mb-1">{isAr ? 'الحد الأدنى' : 'Min Price'}</p>
                                    <input
                                        type="number"
                                        value={priceRange[0]}
                                        min={normalizedMin}
                                        max={priceRange[1]}
                                        onChange={(e) => setPriceRange(clampRange([Number(e.target.value) || normalizedMin, priceRange[1]]))}
                                        className="w-full bg-transparent text-sm font-semibold text-[#1A2E2C] focus:outline-none"
                                        placeholder={isAr ? 'الأدنى' : 'Min'}
                                    />
                                </div>
                                <div className="flex-1 rounded-xl border border-[#C5E0DC] bg-white px-3 py-2">
                                    <p className="text-[11px] font-semibold text-[#6B9E99] mb-1">{isAr ? 'الحد الأقصى' : 'Max Price'}</p>
                                    <input
                                        type="number"
                                        value={priceRange[1]}
                                        min={priceRange[0]}
                                        max={normalizedMax}
                                        onChange={(e) => setPriceRange(clampRange([priceRange[0], Number(e.target.value) || 0]))}
                                        className="w-full bg-transparent text-sm font-semibold text-[#1A2E2C] focus:outline-none"
                                        placeholder={isAr ? 'الأقصى' : 'Max'}
                                    />
                                </div>
                            </div>
                            <div className="bg-[#F4FAFA] rounded-xl p-3 text-center border border-[#C5E0DC]">
                                <p className="text-sm font-semibold text-[#2A9D8F]">
                                    {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} ﷼
                                </p>
                            </div>
                        </div>
                    </FilterSection>

                    {/* Reset Filters Button */}
                    <button
                        onClick={resetFilters}
                        className="w-full px-4 py-3 bg-[#F4FAFA] hover:bg-[#E2F1EF] text-[#2A9D8F] rounded-lg font-semibold transition-colors text-sm flex items-center justify-center gap-2 border border-[#C5E0DC]"
                    >
                        <RotateCcw className="w-4 h-4" />
                        {isAr ? 'إعادة تعيين المرشحات' : 'Reset Filters'}
                    </button>
                </div>
            </aside>

            {/* Modals */}
            <SaveSearchModal
                open={saveSearchModalOpen}
                onOpenChange={setSaveSearchModalOpen}
                currentFilters={getCurrentFilters()}
                onSaveSuccess={() => {
                    // Optional: Show success message
                }}
            />

            <ManageSavedSearchesModal
                open={manageSearchesModalOpen}
                onOpenChange={setManageSearchesModalOpen}
                onLoadSearch={loadFilters}
            />
        </>
    );
}

