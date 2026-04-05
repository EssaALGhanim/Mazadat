import { api } from './apiClient';

export const getAllAuctions = () =>
    api.get('/auction/all');

export const createAuction = (sellerId, data) =>
    api.post(`/auction/add/${sellerId}`, data);

export const deleteAuction = (auctionId, sellerId) =>
    api.delete(`/auction/delete/${auctionId}/${sellerId}`);