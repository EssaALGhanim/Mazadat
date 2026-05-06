import { api } from './apiClient';

export const updateSellerProfile = (data) =>
    api.put('/seller/update', data);

export const getCurrentSellerProfile = () => api.get('/seller/current');

export const getCurrentUserProfile = () => api.get('/user/current');

export const deleteSellerById = (sellerId) => api.delete(`/seller/delete/${sellerId}`);

export const updateBuyerProfile = (data) => api.put('/buyer/update', data);

export const sendPhoneVerifyOtp = () => api.post('/user/phone/verify/send', {});

export const confirmPhoneOtp = (otp) => api.post('/user/phone/verify/confirm', { otp });
