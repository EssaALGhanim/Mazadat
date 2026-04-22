import { API_BASE_URL } from './apiClient';

const IMAGE_BASE_URL = (import.meta.env.VITE_IMAGE_BASE_URL || API_BASE_URL.replace(/\/api\/v1$/, '')).replace(/\/$/, '');
let imageVersion = Date.now();

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

export function resolveImageUrl(imageUrl, cacheKey) {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    const separator = imageUrl.includes('?') ? '&' : '?';
    const version = encodeURIComponent(String(cacheKey ?? imageVersion));
    return `${IMAGE_BASE_URL}${imageUrl}${separator}v=${version}`;
}