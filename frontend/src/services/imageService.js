import { API_BASE_URL } from './apiClient';

const runtimeConfig = typeof window !== 'undefined' ? window.__MAZADAT_CONFIG__ : null;
const IMAGE_BASE_URL = (runtimeConfig?.IMAGE_BASE_URL || import.meta.env.VITE_IMAGE_BASE_URL || API_BASE_URL.replace(/\/api\/v1$/, '')).replace(/\/$/, '');
const IMAGE_PROXY_URL = `${API_BASE_URL}/media/image`;
let imageVersion = Date.now();

const BACKEND_ORIGIN = (() => {
    try {
        return new URL(API_BASE_URL).origin;
    } catch {
        return '';
    }
})();

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

export async function uploadImages(auctionId, images) {
    const formData = new FormData();
    images.forEach((img) => {
        formData.append('files', img.file);
    });

    const response = await fetch(`${API_BASE_URL}/auction/${auctionId}/images`, {
        method: 'POST',
        headers: {
            ...getAuthHeader(),
        },
        body: formData,
    });

    if (!response.ok) {
        let message = 'Failed to upload images';
        try {
            const errorText = await response.text();
            if (errorText) {
                try {
                    const parsed = JSON.parse(errorText);
                    message = parsed?.message || errorText;
                } catch {
                    message = errorText;
                }
            }
        } catch {
            // Keep fallback.
        }
        throw new Error(message);
    }

    imageVersion = Date.now();

    const payload = await response.text();
    if (!payload) return null;

    try {
        return JSON.parse(payload);
    } catch {
        return payload;
    }
}

function buildProxyImageUrl(imageUrl, cacheKey) {
    const separator = IMAGE_PROXY_URL.includes('?') ? '&' : '?';
    const version = encodeURIComponent(String(cacheKey ?? imageVersion));
    return `${IMAGE_PROXY_URL}?url=${encodeURIComponent(imageUrl)}${separator}v=${version}`;
}

export function resolveImageUrl(imageUrl, cacheKey) {
    if (!imageUrl) return '';

    if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
        return imageUrl;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        try {
            const parsed = new URL(imageUrl);
            if (BACKEND_ORIGIN && parsed.origin !== BACKEND_ORIGIN) {
                return buildProxyImageUrl(imageUrl, cacheKey);
            }
        } catch {
            return buildProxyImageUrl(imageUrl, cacheKey);
        }
        return imageUrl;
    }

    const separator = imageUrl.includes('?') ? '&' : '?';
    const version = encodeURIComponent(String(cacheKey ?? imageVersion));
    return `${IMAGE_BASE_URL}${imageUrl}${separator}v=${version}`;
}