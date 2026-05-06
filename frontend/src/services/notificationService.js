import { api } from './apiClient';

export const getNotifications = () => api.get('/notifications');

export const getUnreadCount = async () => {
    const res = await api.get('/notifications/unread-count');
    return res?.data?.count ?? 0;
};

export const markAsRead = (id) => api.put(`/notifications/${id}/read`);

export const markAllAsRead = () => api.put('/notifications/read-all');

export const sendOtp = (identifier) =>
    api.post('/auth/otp/send', { identifier });

export const verifyOtp = (identifier, code) =>
    api.post('/auth/otp/verify', { identifier, code });

export const startRegistrationOtp = ({ username, email, password, phoneNumber, role }) =>
    api.post('/auth/otp/register/start', { username, email, password, phoneNumber, role });
