import { api, API_BASE_URL } from './apiClient';

export const registerBuyer = (data) => api.post('/buyer/add', data);
export const registerSeller = (data) => api.post('/seller/add', data);

async function verifyCredentials(token) {
    const response = await fetch(`${API_BASE_URL}/auth/ping`, {
        method: 'GET',
        headers: {
            Authorization: `Basic ${token}`,
            'Content-Type': 'application/json',
        },
    });

    console.log('[Auth] Ping response status:', response.status);

    if (!response.ok) {
        const errorMessage = response.status === 401 || response.status === 403
            ? 'Invalid credentials'
            : `Authentication failed with status ${response.status}`;
        throw new Error(errorMessage);
    }

    return response.json();
}

export const login = async (username, password) => {
    if (!username || !password) {
        return Promise.reject(new Error('Username and password are required'));
    }

    console.log('[Auth] Attempting login for user:', username);

    const token = btoa(`${username}:${password}`);

    const authData = await verifyCredentials(token);

    const user = {
        username,
        role: authData.data?.role || authData.role,
        token,
    };

    localStorage.setItem('user', JSON.stringify(user));
    console.log('[Auth] Login successful for user:', username, 'with role:', user.role);
    return user;
};

