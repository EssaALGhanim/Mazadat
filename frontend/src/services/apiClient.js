const BASE_URL = 'http://localhost:8080';

function getAuthHeader() {
    try {
        const user = localStorage.getItem('user');
        const parsed = user ? JSON.parse(user) : null;
        const token = parsed?.token;
        return token ? { Authorization: `Basic ${token}` } : {};
    } catch {
        return {};
    }
}

async function request(method, path, body = null) {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
    };

    const options = {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
    };

    const response = await fetch(`${BASE_URL}${path}`, options);

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Request failed');
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

export const api = {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    delete: (path) => request('DELETE', path),
};