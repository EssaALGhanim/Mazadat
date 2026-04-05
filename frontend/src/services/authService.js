import { api } from './apiClient';

export const registerBuyer = (data) => api.post('/buyer/register', data);
export const registerSeller = (data) => api.post('/seller/register', data);

export const login = async (username, password) => {
    const token = btoa(`${username}:${password}`);

    // Store token temporarily so apiClient can use it for the next call
    const tempUser = { token };
    localStorage.setItem('user', JSON.stringify(tempUser));

    try {
        // Fetch all users and find the matching one to get id and role
        const users = await api.get('/user/all');
        const match = users?.find(u => u.username === username);

        if (!match) throw new Error('User not found');

        const user = {
            id: match.id,
            username: match.username,
            role: match.role,
            token,
        };

        localStorage.setItem('user', JSON.stringify(user));
        return user;
    } catch {
        localStorage.removeItem('user');
        throw new Error('Login failed');
    }
};