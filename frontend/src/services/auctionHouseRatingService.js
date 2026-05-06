import { api } from './apiClient';

export const submitAuctionHouseRating = (data) => api.post('/auctionhouse/rate', data);

export const checkAuctionHouseRating = (auctionId) => api.get(`/auctionhouse/rate/check/${auctionId}`);

export const getAuctionHouseRatings = (auctionHouseId) => api.get(`/auctionhouse/${auctionHouseId}/ratings`);
