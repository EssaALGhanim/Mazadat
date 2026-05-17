import ImageWithRetry from '@/components/ui/ImageWithRetry';
import { resolveImageUrl } from '@/services/imageService';

const STATUS_LABELS = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  ENDED: 'Ended',
  FAILED_BELOW_RESERVE: 'Failed',
  COMPLETED: 'Completed',
};

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `${amount.toLocaleString()} \ufdfc`;
}

export default function AuctionAnalyticsTable({ auctions, isAr }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#C5E0DC] dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-[#F4FAFA] dark:bg-slate-800 border-b border-[#C5E0DC] dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-[#1A2E2C] dark:text-slate-100 text-left">{isAr ? 'المزاد' : 'Auction'}</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#1A2E2C] dark:text-slate-100 text-left">{isAr ? 'المشاهدات' : 'Views'}</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#1A2E2C] dark:text-slate-100 text-left">{isAr ? 'المزايدات' : 'Bids'}</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#1A2E2C] dark:text-slate-100 text-left">{isAr ? 'أعلى مزايدة' : 'Highest Bid'}</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#1A2E2C] dark:text-slate-100 text-left">{isAr ? 'الحفظ' : 'Watchlist'}</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#1A2E2C] dark:text-slate-100 text-left">{isAr ? 'الحالة' : 'Status'}</th>
            </tr>
          </thead>
          <tbody>
            {auctions.map((auction) => (
              <tr key={auction.auctionId} className="border-b border-[#C5E0DC] dark:border-slate-700 last:border-b-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-[#F4FAFA] dark:bg-slate-800 shrink-0">
                      {auction.image ? (
                        <ImageWithRetry
                          src={resolveImageUrl(auction.image, auction.auctionId)}
                          alt={auction.title}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <p className="font-semibold text-[#1A2E2C] dark:text-slate-100 line-clamp-1">{auction.title}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-[#1A2E2C] dark:text-slate-100">{auction.viewCount ?? 0}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#1A2E2C] dark:text-slate-100">{auction.totalBids ?? 0}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#2A9D8F]">{formatCurrency(auction.currentHighestBid)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#1A2E2C] dark:text-slate-100">{auction.watchlistCount ?? 0}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2.5 py-1 rounded-full bg-[#EAF7F5] dark:bg-slate-800 text-[#2A9D8F] dark:text-emerald-300 font-semibold">
                    {STATUS_LABELS[auction.status] || auction.status || '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
