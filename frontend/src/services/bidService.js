import { api } from './apiClient';

export const placeBid = (auctionId, amount) =>
    api.post('/bid/add', { auctionId, amount });