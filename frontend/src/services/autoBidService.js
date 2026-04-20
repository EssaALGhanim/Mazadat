import { api } from './apiClient';

const USE_MOCK = true; // Set to false when backend is ready

// LocalStorage key
const STORAGE_KEY = 'mazadat_auto_bids';

// ========== Mock Implementation (uses localStorage) ==========

const mockGetAutoBids = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const autoBids = stored ? JSON.parse(stored) : [];
    return Promise.resolve({ data: autoBids });
  } catch (error) {
    console.error('Error loading auto-bids from localStorage:', error);
    return Promise.resolve({ data: [] });
  }
};

const mockCreateAutoBid = (data) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const autoBids = stored ? JSON.parse(stored) : [];

    // Get current user
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) {
      return Promise.reject(new Error('User not authenticated'));
    }

    // Check if auto-bid already exists for this auction
    const existingIndex = autoBids.findIndex(
      (ab) => ab.auctionId === data.auctionId && ab.userId === user.id
    );

    if (existingIndex !== -1) {
      return Promise.reject(new Error('Auto-bid already exists for this auction'));
    }

    // Create new auto-bid
    const newAutoBid = {
      id: Date.now(),
      auctionId: data.auctionId,
      userId: user.id,
      maxAmount: data.maxAmount,
      currentAmount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    autoBids.push(newAutoBid);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(autoBids));

    return Promise.resolve({ data: newAutoBid });
  } catch (error) {
    return Promise.reject(new Error('Failed to create auto-bid'));
  }
};

const mockUpdateAutoBid = (autoBidId, data) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const autoBids = stored ? JSON.parse(stored) : [];

    const index = autoBids.findIndex((ab) => ab.id === autoBidId);
    if (index === -1) {
      return Promise.reject(new Error('Auto-bid not found'));
    }

    // Update auto-bid
    autoBids[index] = {
      ...autoBids[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(autoBids));

    return Promise.resolve({ data: autoBids[index] });
  } catch (error) {
    return Promise.reject(new Error('Failed to update auto-bid'));
  }
};

const mockDeleteAutoBid = (autoBidId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const autoBids = stored ? JSON.parse(stored) : [];

    const updatedAutoBids = autoBids.filter((ab) => ab.id !== autoBidId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAutoBids));

    return Promise.resolve({ message: 'Auto-bid deleted successfully' });
  } catch (error) {
    return Promise.reject(new Error('Failed to delete auto-bid'));
  }
};

const mockGetAutoBidByAuctionId = (auctionId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const autoBids = stored ? JSON.parse(stored) : [];

    // Get current user
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) {
      return Promise.resolve({ data: null });
    }

    const autoBid = autoBids.find(
      (ab) => ab.auctionId === auctionId && ab.userId === user.id
    );

    return Promise.resolve({ data: autoBid || null });
  } catch (error) {
    console.error('Error loading auto-bid:', error);
    return Promise.resolve({ data: null });
  }
};

// ========== API Implementation (connects to backend) ==========

const apiGetAutoBids = () => {
  return api.get('/auto-bids');
};

const apiCreateAutoBid = (data) => {
  return api.post('/auto-bids', data);
};

const apiUpdateAutoBid = (autoBidId, data) => {
  return api.put(`/auto-bids/${autoBidId}`, data);
};

const apiDeleteAutoBid = (autoBidId) => {
  return api.delete(`/auto-bids/${autoBidId}`);
};

const apiGetAutoBidByAuctionId = (auctionId) => {
  return api.get(`/auto-bids/auction/${auctionId}`);
};

// ========== Export the appropriate implementation ==========

export const getAutoBids = USE_MOCK ? mockGetAutoBids : apiGetAutoBids;
export const createAutoBid = USE_MOCK ? mockCreateAutoBid : apiCreateAutoBid;
export const updateAutoBid = USE_MOCK ? mockUpdateAutoBid : apiUpdateAutoBid;
export const deleteAutoBid = USE_MOCK ? mockDeleteAutoBid : apiDeleteAutoBid;
export const getAutoBidByAuctionId = USE_MOCK ? mockGetAutoBidByAuctionId : apiGetAutoBidByAuctionId;
