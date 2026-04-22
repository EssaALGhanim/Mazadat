export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '');

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

async function request(method, path, body = null, config = {}) {
    const { responseType = 'json' } = config;
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    const headers = {
        ...getAuthHeader(),
        ...(config.headers || {}),
    };

    if (body && !isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const options = {
        method,
        headers,
        ...(body ? { body: isFormData ? body : JSON.stringify(body) } : {}),
    };

    const response = await fetch(`${API_BASE_URL}${path}`, options);

    if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
            const errorText = await response.text();
            if (errorText) {
                try {
                    const parsed = JSON.parse(errorText);
                    errorMessage = parsed?.message || errorText;
                } catch {
                    errorMessage = errorText;
                }
            }
        } catch {
            // Keep fallback message
        }
        throw new Error(errorMessage);
    }

    if (responseType === 'blob') {
        return response.blob();
    }
    if (responseType === 'arrayBuffer') {
        return response.arrayBuffer();
    }
    if (responseType === 'text') {
        return response.text();
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
    get: (path, config) => request('GET', path, null, config),
    post: (path, body, config) => request('POST', path, body, config),
    put: (path, body, config) => request('PUT', path, body, config),
    delete: (path, config) => request('DELETE', path, null, config),
};