import { api } from './apiClient';

// Flag to determine if we're using mock data or real API
const USE_MOCK = true; // Set to false when backend is ready

// Mock storage key
const WATCHLIST_STORAGE_KEY = 'mazadat_watchlist';

// ============================================
// Mock Implementation (localStorage-based)
// ============================================

const getMockWatchlist = () => {
  try {
    const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveMockWatchlist = (watchlist) => {
  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
  } catch (error) {
    console.error('Failed to save watchlist:', error);
  }
};

const mockGetWatchlist = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return getMockWatchlist();
};

const mockAddToWatchlist = async (auctionId) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));

  const watchlist = getMockWatchlist();

  // Check if already exists
  if (watchlist.some(item => item.auctionId === auctionId)) {
    throw new Error('Auction already in watchlist');
  }

  const newItem = {
    id: Date.now(), // Mock ID
    auctionId,
    userId: 1, // Mock user ID - will be replaced by backend
    createdAt: new Date().toISOString(),
  };

  const updated = [...watchlist, newItem];
  saveMockWatchlist(updated);

  return newItem;
};

const mockRemoveFromWatchlist = async (auctionId) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));

  const watchlist = getMockWatchlist();
  const updated = watchlist.filter(item => item.auctionId !== auctionId);
  saveMockWatchlist(updated);

  return { success: true };
};

const mockIsInWatchlist = async (auctionId) => {
  const watchlist = getMockWatchlist();
  return watchlist.some(item => item.auctionId === auctionId);
};

// ============================================
// Real API Implementation
// ============================================

const apiGetWatchlist = () => api.get('/watchlist');

const apiAddToWatchlist = (auctionId) =>
  api.post('/watchlist', { auctionId });

const apiRemoveFromWatchlist = (auctionId) =>
  api.delete(`/watchlist/${auctionId}`);

const apiIsInWatchlist = async (auctionId) => {
  try {
    const watchlist = await api.get('/watchlist');
    const items = Array.isArray(watchlist) ? watchlist : watchlist?.data || [];
    return items.some(item => item.auctionId === auctionId);
  } catch {
    return false;
  }
};

// ============================================
// Exported Service (switches between mock and real)
// ============================================

export const getWatchlist = USE_MOCK ? mockGetWatchlist : apiGetWatchlist;

export const addToWatchlist = USE_MOCK ? mockAddToWatchlist : apiAddToWatchlist;

export const removeFromWatchlist = USE_MOCK ? mockRemoveFromWatchlist : apiRemoveFromWatchlist;

export const isInWatchlist = USE_MOCK ? mockIsInWatchlist : apiIsInWatchlist;

export const toggleWatchlist = async (auctionId) => {
  const inWatchlist = await isInWatchlist(auctionId);

  if (inWatchlist) {
    return await removeFromWatchlist(auctionId);
  } else {
    return await addToWatchlist(auctionId);
  }
};
