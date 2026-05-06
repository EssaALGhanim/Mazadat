import { api } from './apiClient';

export const submitBuyerRating = (data) => api.post('/buyer/rate', data);

export const checkBuyerRating = (auctionId) => api.get(`/buyer/rate/check/${auctionId}`);

