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

export async function uploadImages(auctionId, images) {
    const formData = new FormData();
    images.forEach((img) => {
        formData.append('files', img.file);
    });

    const response = await fetch(`${BASE_URL}/image/upload/${auctionId}`, {
        method: 'POST',
        headers: {
            ...getAuthHeader(),
        },
        body: formData,
    });

    if (!response.ok) throw new Error('Failed to upload images');
    return response;
}