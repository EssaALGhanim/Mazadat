import { api } from './apiClient';

export const submitAuctionHouseRating = (data) => api.post('/api/v1/auctionhouse/rate', data);

export const checkAuctionHouseRating = (auctionId) => api.get(`/api/v1/auctionhouse/rate/check/${auctionId}`);
