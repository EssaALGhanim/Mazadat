import { api } from './apiClient';

export const submitBuyerRating = (data) => api.post('/api/v1/buyer/rate', data);

export const checkBuyerRating = (auctionId) => api.get(`/api/v1/buyer/rate/check/${auctionId}`);

