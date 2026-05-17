import { Bookmark, Eye, Gavel, TrendingUp } from 'lucide-react';
import AnalyticsSummaryCard from './AnalyticsSummaryCard';
import AuctionAnalyticsTable from './AuctionAnalyticsTable';
import AuctionPerformanceChart from './AuctionPerformanceChart';

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `${amount.toLocaleString()} \ufdfc`;
}

export default function SellerAnalyticsDashboard({ analytics, loading, error, onRetry, isAr }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-[#C5E0DC] border-t-[#2A9D8F] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-semibold mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
        >
          {isAr ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      </div>
    );
  }

  const auctions = analytics?.perAuction || [];
  if (!auctions.length) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#C5E0DC] dark:border-slate-700 p-10 text-center">
        <p className="text-[#6B9E99] dark:text-slate-300 font-semibold">
          {isAr ? 'لا توجد مزادات لعرض التحليلات' : 'No auctions yet to show analytics'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AnalyticsSummaryCard title={isAr ? 'إجمالي المشاهدات' : 'Total Views'} value={analytics.totalViews ?? 0} icon={Eye} />
        <AnalyticsSummaryCard title={isAr ? 'إجمالي المزايدات' : 'Total Bids'} value={analytics.totalBidsReceived ?? 0} icon={Gavel} />
        <AnalyticsSummaryCard
          title={isAr ? 'أعلى مزايدة حالية' : 'Highest Current Bid'}
          value={formatCurrency(analytics.highestCurrentBid)}
          icon={TrendingUp}
          valueClassName="text-[#2A9D8F]"
        />
        <AnalyticsSummaryCard title={isAr ? 'إجمالي الحفظ' : 'Total Watchlist Saves'} value={analytics.totalWatchlistSaves ?? 0} icon={Bookmark} />
      </div>

      <AuctionPerformanceChart auctions={auctions} isAr={isAr} />
      <AuctionAnalyticsTable auctions={auctions} isAr={isAr} />
    </div>
  );
}
