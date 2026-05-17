import { api } from './apiClient';

export const getSellerAnalytics = () => api.get('/seller/analytics');
