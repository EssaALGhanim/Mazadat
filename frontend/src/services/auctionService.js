import { api } from './apiClient';

export const getAllAuctions = () =>
    api.get('/auction/get/all');

export const createAuction = (data) =>
    api.post('/auction/add', data);

export const deleteAuction = (auctionId) =>
    api.delete(`/auction/delete/${auctionId}`);