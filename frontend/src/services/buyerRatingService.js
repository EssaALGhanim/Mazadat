import { api } from './apiClient';

// Get seller's completed transactions
export const getSellerCompletedTransactions = (sellerId) =>
    api.get(`/transactions/completed/seller/${sellerId}`);

// Submit a buyer rating
export const submitBuyerRating = (transactionId, data) =>
    api.post(`/transactions/${transactionId}/buyer-rating`, data);

// Get buyer's ratings
export const getBuyerRatings = (buyerId) =>
    api.get(`/buyers/${buyerId}/ratings`);

// Check if a transaction already has a rating
export const getTransactionRating = (transactionId) =>
    api.get(`/transactions/${transactionId}/buyer-rating`);

// Get all ratings submitted by a seller
export const getSellerRatings = (sellerId) =>
    api.get(`/ratings/seller/${sellerId}`);

