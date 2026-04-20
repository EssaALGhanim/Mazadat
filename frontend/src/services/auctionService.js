import { api } from './apiClient';

export const getAllAuctions = () =>
    api.get('/auction/get/all');

export const searchAuctions = (query) => {
    const trimmedQuery = (query || '').trim();
    if (!trimmedQuery) {
        return getAllAuctions();
    }

    const params = new URLSearchParams({ query: trimmedQuery });
    return api.get(`/auction/search?${params.toString()}`);
};

export const getAuctionById = (auctionId) =>
    api.get(`/auction/${auctionId}`);

export const createAuction = (data) =>
    api.post('/auction/add', data);

export const deleteAuction = (auctionId) =>
    api.delete(`/auction/delete/${auctionId}`);