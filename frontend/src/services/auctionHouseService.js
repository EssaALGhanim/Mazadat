import { api } from './apiClient';

export const getAllAuctionHouses = () => api.get('/auctionhouse/get/all');