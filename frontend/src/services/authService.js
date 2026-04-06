import { api } from './apiClient';

export const registerBuyer = (data) => api.post('/buyer/add', data);
export const registerSeller = (data) => api.post('/seller/add', data);

const BASE_URL = 'http://localhost:8080/api/v1';

async function verifyCredentials(token) {
    const response = await fetch(`${BASE_URL}/auth/ping`, {
        method: 'GET',
        headers: {
            Authorization: `Basic ${token}`,
        },
    });

    if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid credentials');
    }
}

export const login = async (username, password, role = 'BUYER') => {
    const token = btoa(`${username}:${password}`);

    await verifyCredentials(token);

    const user = {
        username,
        role,
        token,
    };

    localStorage.setItem('user', JSON.stringify(user));
    return user;
};