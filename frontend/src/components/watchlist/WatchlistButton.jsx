import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { cn } from '@/lib/utils';

export default function WatchlistButton({ auctionId, variant = 'icon', className = '' }) {
  const { i18n } = useTranslation('common');
  const isAr = i18n.language === 'ar';
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [loading, setLoading] = useState(false);

  const inWatchlist = isInWatchlist(auctionId);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      const result = await toggleWatchlist(auctionId);
      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (err) {
      alert(err.message || (isAr ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          'p-2 rounded-full transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed',
          inWatchlist
            ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] hover:bg-[#2A9D8F]/20'
            : 'bg-white text-gray-400 hover:bg-gray-50 hover:text-[#2A9D8F]',
          className
        )}
        aria-label={
          inWatchlist
            ? isAr
              ? 'إزالة من المفضلة'
              : 'Remove from watchlist'
            : isAr
            ? 'إضافة للمفضلة'
            : 'Add to watchlist'
        }
      >
        <Bookmark
          className={cn('w-5 h-5 transition-all', inWatchlist && 'fill-current')}
          strokeWidth={2}
        />
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50',
          inWatchlist
            ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] hover:bg-[#2A9D8F]/20 border border-[#2A9D8F]/30'
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200',
          className
        )}
      >
        <Bookmark className={cn('w-4 h-4', inWatchlist && 'fill-current')} />
        <span>{inWatchlist ? (isAr ? 'في المفضلة' : 'Saved') : isAr ? 'حفظ' : 'Save'}</span>
      </button>
    );
  }

  // Full button variant
  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50',
        inWatchlist
          ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] hover:bg-[#2A9D8F]/20 border border-[#2A9D8F]/30'
          : 'bg-white text-[#2A9D8F] hover:bg-[#EAF7F5] border border-[#C5E0DC]',
        className
      )}
    >
      <Bookmark className={cn('w-5 h-5', inWatchlist && 'fill-current')} />
      <span>
        {inWatchlist
          ? isAr
            ? 'إزالة من المفضلة'
            : 'Remove from Watchlist'
          : isAr
          ? 'إضافة للمفضلة'
          : 'Add to Watchlist'}
      </span>
    </button>
  );
}
