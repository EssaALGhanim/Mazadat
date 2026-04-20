import { api } from './apiClient';

const USE_MOCK = true; // Set to false when backend is ready

// LocalStorage key
const STORAGE_KEY = 'mazadat_featured_auctions';

// ========== Mock Implementation (uses localStorage) ==========

const mockGetFeaturedAuctions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const featuredAuctions = stored ? JSON.parse(stored) : [];
    return Promise.resolve({ data: featuredAuctions });
  } catch (error) {
    console.error('Error loading featured auctions from localStorage:', error);
    return Promise.resolve({ data: [] });
  }
};

const mockFeatureAuction = (auctionId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const featuredAuctions = stored ? JSON.parse(stored) : [];

    // Check if already featured
    const alreadyFeatured = featuredAuctions.some((item) => item.auctionId === auctionId);
    if (alreadyFeatured) {
      return Promise.resolve({ message: 'Already featured' });
    }

    // Add to featured
    const newFeatured = {
      id: Date.now(),
      auctionId,
      createdAt: new Date().toISOString(),
    };

    featuredAuctions.push(newFeatured);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(featuredAuctions));

    return Promise.resolve({ data: newFeatured });
  } catch (error) {
    return Promise.reject(new Error('Failed to feature auction'));
  }
};

const mockUnfeatureAuction = (auctionId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const featuredAuctions = stored ? JSON.parse(stored) : [];

    // Remove from featured
    const updatedFeatured = featuredAuctions.filter((item) => item.auctionId !== auctionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFeatured));

    return Promise.resolve({ message: 'Unfeatured successfully' });
  } catch (error) {
    return Promise.reject(new Error('Failed to unfeature auction'));
  }
};

// ========== API Implementation (connects to backend) ==========

const apiFetchFeaturedAuctions = () => {
  return api.get('/auctions/featured');
};

const apiFeatureAuction = (auctionId) => {
  return api.post(`/auctions/${auctionId}/feature`);
};

const apiUnfeatureAuction = (auctionId) => {
  return api.delete(`/auctions/${auctionId}/feature`);
};

// ========== Export the appropriate implementation ==========

export const getFeaturedAuctions = USE_MOCK ? mockGetFeaturedAuctions : apiFetchFeaturedAuctions;
export const featureAuction = USE_MOCK ? mockFeatureAuction : apiFeatureAuction;
export const unfeatureAuction = USE_MOCK ? mockUnfeatureAuction : apiUnfeatureAuction;
