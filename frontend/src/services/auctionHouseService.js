import { api } from './apiClient';

export const getAllAuctionHouses = () => api.get('/auctionHouse/all');