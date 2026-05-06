import { api } from './apiClient';

const INTEGRATION_PENDING_CODE = 'ADMIN_INTEGRATION_PENDING';
const ADMIN_PREVIEW_KEY = 'adminPreview';

const mockUsers = [
    {
        id: 9001,
        username: 'platform.admin',
        email: 'admin-preview@mazadat.local',
        phoneNumber: '+966500000001',
        role: 'ADMIN',
        createdAt: '2026-01-10T08:00:00',
        updatedAt: '2026-05-01T09:30:00',
    },
    {
        id: 9002,
        username: 'preview.buyer',
        email: 'buyer-preview@mazadat.local',
        phoneNumber: '+966500000002',
        role: 'BUYER',
        createdAt: '2026-02-12T10:15:00',
        updatedAt: '2026-04-21T11:45:00',
    },
    {
        id: 9003,
        username: 'preview.seller',
        email: 'seller-preview@mazadat.local',
        phoneNumber: '+966500000003',
        role: 'SELLER',
        createdAt: '2026-03-05T14:20:00',
        updatedAt: '2026-05-03T13:00:00',
    },
    {
        id: 9004,
        username: 'heritage.curator',
        email: 'curator@mazadat.local',
        phoneNumber: '+966500000004',
        role: 'SELLER',
        createdAt: '2026-01-18T12:10:00',
        updatedAt: '2026-05-05T08:25:00',
    },
    {
        id: 9005,
        username: 'auction.guard',
        email: 'guard@mazadat.local',
        phoneNumber: '+966500000005',
        role: 'ADMIN',
        createdAt: '2026-02-02T09:05:00',
        updatedAt: '2026-05-04T15:10:00',
    },
    {
        id: 9006,
        username: 'serious.bidder',
        email: 'bidder@mazadat.local',
        phoneNumber: '+966500000006',
        role: 'BUYER',
        createdAt: '2026-03-14T11:35:00',
        updatedAt: '2026-05-02T18:20:00',
    },
];

const mockAuctions = [
    {
        id: 3101,
        title: 'Vintage Saudi Coffee Set',
        description: 'Handcrafted brass coffee set with tray and dallah, curated for the admin dashboard preview.',
        startingPrice: 1800,
        currentPrice: 3250,
        status: 'ACTIVE',
        startDate: '2026-05-04T10:00:00',
        endDate: '2026-05-10T21:00:00',
        highestBidder: 'serious.bidder',
        highestBidderEmail: 'bidder@mazadat.local',
        createdAt: '2026-05-01T09:30:00',
        sellerName: 'preview.seller',
        auctionHouseName: 'Najd Heritage House',
        auctionHouseId: 71,
        bidCount: 14,
        isFeatured: true,
        isActivelyFeatured: true,
        featuredEndDate: '2026-05-08T21:00:00',
        images: [],
    },
    {
        id: 3102,
        title: 'Abstract Desert Canvas',
        description: 'Large-format original canvas with textured acrylic layers and certificate of authenticity.',
        startingPrice: 4200,
        currentPrice: 4200,
        status: 'PENDING',
        startDate: '2026-05-08T12:00:00',
        endDate: '2026-05-12T22:30:00',
        highestBidder: null,
        highestBidderEmail: null,
        createdAt: '2026-05-02T13:45:00',
        sellerName: 'heritage.curator',
        auctionHouseName: 'Rimal Contemporary',
        auctionHouseId: 72,
        bidCount: 0,
        isFeatured: false,
        isActivelyFeatured: false,
        featuredEndDate: null,
        images: [],
    },
    {
        id: 3103,
        title: 'Falconry Leather Glove Set',
        description: 'Collector-grade falconry glove with matching hood and stand.',
        startingPrice: 950,
        currentPrice: 1900,
        status: 'ENDED',
        startDate: '2026-04-20T10:00:00',
        endDate: '2026-04-28T20:00:00',
        highestBidder: 'preview.buyer',
        highestBidderEmail: 'buyer-preview@mazadat.local',
        createdAt: '2026-04-15T16:00:00',
        sellerName: 'preview.seller',
        auctionHouseName: 'Najd Heritage House',
        auctionHouseId: 71,
        bidCount: 9,
        isFeatured: false,
        isActivelyFeatured: false,
        featuredEndDate: null,
        images: [],
    },
    {
        id: 3104,
        title: 'Rare Numismatic Collection',
        description: 'Limited collection of Gulf region commemorative coins, preserved in archival holders.',
        startingPrice: 12000,
        currentPrice: 14800,
        status: 'FAILED_BELOW_RESERVE',
        startDate: '2026-04-10T09:00:00',
        endDate: '2026-04-17T19:00:00',
        highestBidder: null,
        highestBidderEmail: null,
        createdAt: '2026-04-06T10:25:00',
        sellerName: 'heritage.curator',
        auctionHouseName: 'Capital Vault Auctions',
        auctionHouseId: 73,
        bidCount: 6,
        isFeatured: false,
        isActivelyFeatured: false,
        featuredEndDate: null,
        images: [],
    },
    {
        id: 3105,
        title: 'Sadu Woven Wall Hanging',
        description: 'Traditional Sadu textile wall hanging with restored edges and documentation.',
        startingPrice: 2600,
        currentPrice: 6100,
        status: 'ACTIVE',
        startDate: '2026-05-03T11:00:00',
        endDate: '2026-05-09T22:00:00',
        highestBidder: 'serious.bidder',
        highestBidderEmail: 'bidder@mazadat.local',
        createdAt: '2026-05-01T14:00:00',
        sellerName: 'heritage.curator',
        auctionHouseName: 'Rimal Contemporary',
        auctionHouseId: 72,
        bidCount: 18,
        isFeatured: true,
        isActivelyFeatured: true,
        featuredEndDate: '2026-05-07T22:00:00',
        images: [],
    },
];

function isAdminPreviewEnabled() {
    try {
        return localStorage.getItem(ADMIN_PREVIEW_KEY) === 'true';
    } catch {
        return false;
    }
}

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
    if (isAdminPreviewEnabled()) {
        return mockUsers;
    }

    const payload = await api.get('/user/get/all');
    return normalizePayload(payload);
}

export async function getAdminAuctions() {
    if (isAdminPreviewEnabled()) {
        return mockAuctions;
    }

    const payload = await api.get('/auction/get/all');
    return normalizePayload(payload);
}

export async function getAdminAuctionById(auctionId) {
    if (isAdminPreviewEnabled()) {
        return mockAuctions.find((auction) => String(auction.id) === String(auctionId)) || null;
    }

    const payload = await api.get(`/auction/${auctionId}`);
    return payload?.data || payload;
}

export async function getAdminUserById(userId) {
    if (isAdminPreviewEnabled()) {
        return mockUsers.find((user) => String(user.id) === String(userId)) || null;
    }

    const payload = await api.get(`/admin/users/${userId}`);
    return payload?.data || payload;
}

export async function checkUserDeletionWarning(userId) {
    if (isAdminPreviewEnabled()) {
        return { hasWarning: false };
    }

    const payload = await api.get(`/admin/users/${userId}/deletion-warning`);
    return payload?.data || payload;
}

export async function deleteAdminUser(userId) {
    if (isAdminPreviewEnabled()) {
        return { success: true, userId };
    }

    return await api.delete(`/admin/users/${userId}`);
}

export async function deleteAdminAuction(auctionId) {
    if (isAdminPreviewEnabled()) {
        return { success: true, auctionId };
    }

    return await api.delete(`/admin/auctions/${auctionId}`);
}

export function getAdminPreviewEnabled() {
    return isAdminPreviewEnabled();
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
