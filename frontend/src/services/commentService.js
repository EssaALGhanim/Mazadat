import { api } from './apiClient';

export async function getComments(auctionId) {
    return api.get(`/auction/${auctionId}/comments`);
}

export async function addComment(auctionId, content) {
    return api.post(`/auction/${auctionId}/comments`, { content });
}

export async function editComment(auctionId, commentId, content) {
    return api.put(`/auction/${auctionId}/comments/${commentId}`, { content });
}

export async function deleteComment(auctionId, commentId) {
    return api.delete(`/auction/${auctionId}/comments/${commentId}`);
}
