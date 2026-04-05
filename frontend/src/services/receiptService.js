import { api } from './apiClient';

export const generateReceipt = (auctionId, buyerId) =>
    api.post(`/receipt/generate/${auctionId}/${buyerId}`);