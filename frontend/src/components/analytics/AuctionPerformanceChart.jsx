import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AuctionPerformanceChart({ auctions, isAr }) {
  const chartData = auctions.map((auction) => ({
    name: auction.title?.length > 18 ? `${auction.title.slice(0, 18)}...` : auction.title,
    views: auction.viewCount ?? 0,
    bids: auction.totalBids ?? 0,
    watchlist: auction.watchlistCount ?? 0,
  }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#C5E0DC] dark:border-slate-700 p-4 sm:p-6 shadow-sm">
      <h3 className="text-lg font-bold text-[#1A2E2C] dark:text-slate-100 mb-4">
        {isAr ? 'مقارنة الأداء لكل مزاد' : 'Auction Performance Comparison'}
      </h3>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d7e8e5" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={56} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="views" name={isAr ? 'المشاهدات' : 'Views'} fill="#2A9D8F" radius={[4, 4, 0, 0]} />
            <Bar dataKey="bids" name={isAr ? 'المزايدات' : 'Bids'} fill="#1A7A6E" radius={[4, 4, 0, 0]} />
            <Bar dataKey="watchlist" name={isAr ? 'الحفظ' : 'Watchlist'} fill="#6B9E99" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
