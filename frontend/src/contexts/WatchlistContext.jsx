import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '@/services/watchlistService';

const WatchlistContext = createContext(null);

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within WatchlistProvider');
  }
  return context;
};

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWatchlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWatchlist();
      const items = Array.isArray(data) ? data : data?.data || [];
      setWatchlist(items);
    } catch (err) {
      setError(err.message || 'Failed to load watchlist');
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const isInWatchlist = useCallback(
    (auctionId) => {
      return watchlist.some((item) => item.auctionId === auctionId);
    },
    [watchlist]
  );

  const addToWatchlistHandler = useCallback(
    async (auctionId) => {
      try {
        const newItem = await addToWatchlist(auctionId);
        setWatchlist((prev) => [...prev, newItem]);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message || 'Failed to add to watchlist' };
      }
    },
    []
  );

  const removeFromWatchlistHandler = useCallback(
    async (auctionId) => {
      try {
        await removeFromWatchlist(auctionId);
        setWatchlist((prev) => prev.filter((item) => item.auctionId !== auctionId));
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message || 'Failed to remove from watchlist' };
      }
    },
    []
  );

  const toggleWatchlistHandler = useCallback(
    async (auctionId) => {
      if (isInWatchlist(auctionId)) {
        return await removeFromWatchlistHandler(auctionId);
      } else {
        return await addToWatchlistHandler(auctionId);
      }
    },
    [isInWatchlist, addToWatchlistHandler, removeFromWatchlistHandler]
  );

  const value = {
    watchlist,
    loading,
    error,
    isInWatchlist,
    addToWatchlist: addToWatchlistHandler,
    removeFromWatchlist: removeFromWatchlistHandler,
    toggleWatchlist: toggleWatchlistHandler,
    refetchWatchlist: fetchWatchlist,
  };

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
};
