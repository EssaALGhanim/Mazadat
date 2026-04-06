import { api } from './apiClient';

export const generateReceipt = (auctionId) =>
    api.post(`/receipt/generate/${auctionId}`);