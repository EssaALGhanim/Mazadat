import { api } from './apiClient';

export const updateSellerProfile = (sellerId, data) =>
    api.put(`/seller/update/${sellerId}`, data);

export const updateBuyerProfile = (buyerId, data) =>
    api.put(`/buyer/update/${buyerId}`, data);