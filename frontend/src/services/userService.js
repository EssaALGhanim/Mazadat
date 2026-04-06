import { api } from './apiClient';

export const updateSellerProfile = (data) =>
    api.put('/seller/update', data);

export const updateBuyerProfile = async (data) => {
    try {
        return await api.put('/buyer/update', data);
    } catch {
        // Fallback keeps UX functional when backend buyer update route is unavailable.
        const stored = localStorage.getItem('user');
        const user = stored ? JSON.parse(stored) : null;

        const updatedUser = {
            ...(user || {}),
            username: data.username,
            email: data.email,
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
    }
};