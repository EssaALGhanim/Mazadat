import { api } from './apiClient';

const INTEGRATION_PENDING_CODE = 'ADMIN_INTEGRATION_PENDING';

function normalizePayload(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.users)) return payload.users;
    if (Array.isArray(payload?.auctions)) return payload.auctions;
    return [];
}

function createIntegrationPendingError(message, cause) {
    const error = new Error(message);
    error.code = INTEGRATION_PENDING_CODE;
    error.integrationPending = true;
    error.cause = cause;
    return error;
}

function maybeWrapIntegrationPending(error, message) {
    const rawMessage = String(error?.message || '').toLowerCase();
    const looksLikeMissingEndpoint =
        !rawMessage
        || rawMessage.includes('request failed')
        || rawMessage.includes('not found')
        || rawMessage.includes('no static resource')
        || rawMessage.includes('method not allowed')
        || rawMessage.includes('cannot');

    if (looksLikeMissingEndpoint) {
        throw createIntegrationPendingError(message, error);
    }

    throw error;
}

function isEndedAuction(auction) {
    if (!auction) return false;
    const status = String(auction.status || '').toUpperCase();
    if (['COMPLETED', 'ENDED', 'FAILED_BELOW_RESERVE'].includes(status)) {
        return true;
    }

    if (!auction.endDate) return false;
    return new Date(auction.endDate) <= new Date();
}

function isActiveAuction(auction) {
    if (!auction) return false;
    const now = new Date();
    const startDate = auction.startDate ? new Date(auction.startDate) : null;
    const hasStarted = !startDate || startDate <= now;
    return hasStarted && !isEndedAuction(auction);
}

export function isAdminIntegrationPendingError(error) {
    return Boolean(error?.integrationPending || error?.code === INTEGRATION_PENDING_CODE);
}

export async function getAdminUsers() {
    const payload = await api.get('/user/get/all');
    return normalizePayload(payload);
}

export async function getAdminAuctions() {
    const payload = await api.get('/auction/get/all');
    return normalizePayload(payload);
}

export async function getAdminAuctionById(auctionId) {
    const payload = await api.get(`/auction/${auctionId}`);
    return payload?.data || payload;
}

export async function getAdminUserById(userId) {
    try {
        const payload = await api.get(`/admin/users/${userId}`);
        return payload?.data || payload;
    } catch (error) {
        maybeWrapIntegrationPending(error, 'Admin user details endpoint is waiting for backend integration.');
    }
}

export async function deleteAdminUser(userId) {
    try {
        return await api.delete(`/admin/users/${userId}`);
    } catch (error) {
        maybeWrapIntegrationPending(error, 'Admin user deletion endpoint is waiting for backend integration.');
    }
}

export async function deleteAdminAuction(auctionId) {
    try {
        return await api.delete(`/admin/auctions/${auctionId}`);
    } catch (error) {
        maybeWrapIntegrationPending(error, 'Admin auction deletion endpoint is waiting for backend integration.');
    }
}

export async function getAdminDashboardStats() {
    const [users, auctions] = await Promise.all([getAdminUsers(), getAdminAuctions()]);

    return {
        totalUsers: users.length,
        buyersCount: users.filter((user) => String(user?.role || '').toUpperCase() === 'BUYER').length,
        sellersCount: users.filter((user) => String(user?.role || '').toUpperCase() === 'SELLER').length,
        adminsCount: users.filter((user) => String(user?.role || '').toUpperCase() === 'ADMIN').length,
        totalAuctions: auctions.length,
        activeAuctions: auctions.filter(isActiveAuction).length,
        endedAuctions: auctions.filter(isEndedAuction).length,
        totalBids: auctions.reduce((sum, auction) => sum + Number(auction?.bidCount || 0), 0),
    };
}
