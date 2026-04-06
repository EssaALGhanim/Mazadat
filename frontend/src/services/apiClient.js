const BASE_URL = 'http://localhost:8080/api/v1';

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
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    const headers = {
        ...getAuthHeader(),
    };

    if (body && !isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const options = {
        method,
        headers,
        ...(body
            ? { body: isFormData ? body : JSON.stringify(body) }
            : {}),
    };

    const response = await fetch(`${BASE_URL}${path}`, options);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Request failed');
    }

    const text = await response.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

export const api = {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    delete: (path) => request('DELETE', path),
};