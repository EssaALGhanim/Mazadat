import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Users, Gavel } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import TopNavigationBar from '@/components/TopNavigationBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import AdminOverviewSection from '@/components/admin/AdminOverviewSection';
import AdminUsersSection from '@/components/admin/AdminUsersSection';
import AdminAuctionsSection from '@/components/admin/AdminAuctionsSection';
import AdminUserDetailsDialog from '@/components/admin/AdminUserDetailsDialog';
import AdminAuctionDetailsDialog from '@/components/admin/AdminAuctionDetailsDialog';
import {
    deleteAdminAuction,
    deleteAdminUser,
    getAdminAuctionById,
    getAdminAuctions,
    getAdminDashboardStats,
    getAdminPreviewEnabled,
    getAdminUserById,
    getAdminUsers,
    isAdminIntegrationPendingError,
} from '@/services/adminService';

const initialStats = {
    totalUsers: 0,
    buyersCount: 0,
    sellersCount: 0,
    adminsCount: 0,
    totalAuctions: 0,
    activeAuctions: 0,
    endedAuctions: 0,
    totalBids: 0,
};

export default function AdminDashboardPage() {
    const { t, i18n } = useTranslation('common');
    const [currentUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const [previewMode] = useState(() => getAdminPreviewEnabled());
    const [stats, setStats] = useState(initialStats);
    const [users, setUsers] = useState([]);
    const [auctions, setAuctions] = useState([]);
    const [statsLoading, setStatsLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(true);
    const [auctionsLoading, setAuctionsLoading] = useState(true);
    const [usersError, setUsersError] = useState(null);
    const [auctionsError, setAuctionsError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetailsOpen, setUserDetailsOpen] = useState(false);
    const [userDetailsLoading, setUserDetailsLoading] = useState(false);
    const [userDetailsIntegrationMessage, setUserDetailsIntegrationMessage] = useState('');
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [auctionDetailsOpen, setAuctionDetailsOpen] = useState(false);
    const [auctionDetailsLoading, setAuctionDetailsLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, item: null });
    const [deletingUserId, setDeletingUserId] = useState(null);
    const [deletingAuctionId, setDeletingAuctionId] = useState(null);

    const computeStats = useCallback((usersList, auctionsList) => ({
        totalUsers: usersList.length,
        buyersCount: usersList.filter((user) => String(user?.role || '').toUpperCase() === 'BUYER').length,
        sellersCount: usersList.filter((user) => String(user?.role || '').toUpperCase() === 'SELLER').length,
        adminsCount: usersList.filter((user) => String(user?.role || '').toUpperCase() === 'ADMIN').length,
        totalAuctions: auctionsList.length,
        activeAuctions: auctionsList.filter((auction) => getAuctionStatusMeta(auction).code === 'ACTIVE').length,
        endedAuctions: auctionsList.filter((auction) => ['ENDED', 'FAILED_BELOW_RESERVE'].includes(getAuctionStatusMeta(auction).code)).length,
        totalBids: auctionsList.reduce((sum, auction) => sum + Number(auction?.bidCount || 0), 0),
    }), []);

    const refreshStats = useCallback(async (usersList, auctionsList) => {
        setStatsLoading(true);
        try {
            if (usersList && auctionsList) {
                setStats(computeStats(usersList, auctionsList));
                return;
            }

            const nextStats = await getAdminDashboardStats();
            setStats(nextStats);
        } catch {
            setStats(computeStats(users, auctions));
        } finally {
            setStatsLoading(false);
        }
    }, [auctions, computeStats, users]);

    const loadUsers = useCallback(async () => {
        setUsersLoading(true);
        setUsersError(null);
        try {
            const payload = await getAdminUsers();
            setUsers(payload);
            return payload;
        } catch (error) {
            setUsers([]);
            setUsersError(error?.message || t('admin.errors.usersLoadMessage'));
            return [];
        } finally {
            setUsersLoading(false);
        }
    }, [t]);

    const loadAuctions = useCallback(async () => {
        setAuctionsLoading(true);
        setAuctionsError(null);
        try {
            const payload = await getAdminAuctions();
            setAuctions(payload);
            return payload;
        } catch (error) {
            setAuctions([]);
            setAuctionsError(error?.message || t('admin.errors.auctionsLoadMessage'));
            return [];
        } finally {
            setAuctionsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            const [usersList, auctionsList] = await Promise.all([loadUsers(), loadAuctions()]);
            if (!active) return;
            await refreshStats(usersList, auctionsList);
        };

        loadDashboard();
        return () => {
            active = false;
        };
    }, [loadAuctions, loadUsers, refreshStats]);

    const pageStats = useMemo(() => computeStats(users, auctions), [auctions, computeStats, users]);

    useEffect(() => {
        if (!statsLoading) {
            setStats(pageStats);
        }
    }, [pageStats, statsLoading]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/auth';
    };

    const handleInspectUser = async (user) => {
        const userId = user?.id ?? user?.Id;
        setSelectedUser(user);
        setUserDetailsIntegrationMessage('');
        setUserDetailsOpen(true);
        setUserDetailsLoading(true);

        try {
            const details = await getAdminUserById(userId);
            setSelectedUser((prev) => ({ ...prev, ...(details || {}) }));
        } catch (error) {
            if (isAdminIntegrationPendingError(error)) {
                setUserDetailsIntegrationMessage(t('admin.integration.userDetails'));
            } else {
                toast.error(error?.message || t('admin.errors.userDetailsLoadMessage'));
            }
        } finally {
            setUserDetailsLoading(false);
        }
    };

    const handleInspectAuction = async (auction) => {
        setSelectedAuction(auction);
        setAuctionDetailsOpen(true);
        setAuctionDetailsLoading(true);

        try {
            const details = await getAdminAuctionById(auction.id);
            setSelectedAuction(details || auction);
        } catch (error) {
            toast.error(error?.message || t('admin.errors.auctionDetailsLoadMessage'));
        } finally {
            setAuctionDetailsLoading(false);
        }
    };

    const openDeleteConfirm = (type, item) => {
        setDeleteConfirm({ open: true, type, item });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirm.item || !deleteConfirm.type) return;

        if (deleteConfirm.type === 'user') {
            const userId = deleteConfirm.item?.id ?? deleteConfirm.item?.Id;
            setDeletingUserId(userId);
            try {
                await deleteAdminUser(userId);
                const nextUsers = users.filter((user) => (user.id ?? user.Id) !== userId);
                setUsers(nextUsers);
                setStats(computeStats(nextUsers, auctions));
                toast.success(t('admin.success.userDeleted'));
                if ((selectedUser?.id ?? selectedUser?.Id) === userId) {
                    setUserDetailsOpen(false);
                    setSelectedUser(null);
                }
            } catch (error) {
                if (isAdminIntegrationPendingError(error)) {
                    toast.error(t('admin.integration.userDelete'));
                } else {
                    toast.error(error?.message || t('admin.errors.userDeleteMessage'));
                }
            } finally {
                setDeletingUserId(null);
            }
        }

        if (deleteConfirm.type === 'auction') {
            const auctionId = deleteConfirm.item?.id;
            setDeletingAuctionId(auctionId);
            try {
                await deleteAdminAuction(auctionId);
                const nextAuctions = auctions.filter((auction) => auction.id !== auctionId);
                setAuctions(nextAuctions);
                setStats(computeStats(users, nextAuctions));
                toast.success(t('admin.success.auctionDeleted'));
                if (selectedAuction?.id === auctionId) {
                    setAuctionDetailsOpen(false);
                    setSelectedAuction(null);
                }
            } catch (error) {
                if (isAdminIntegrationPendingError(error)) {
                    toast.error(t('admin.integration.auctionDelete'));
                } else {
                    toast.error(error?.message || t('admin.errors.auctionDeleteMessage'));
                }
            } finally {
                setDeletingAuctionId(null);
            }
        }

        setDeleteConfirm({ open: false, type: null, item: null });
    };

    return (
        <div className="min-h-screen bg-[#F0F5F4]">
            <TopNavigationBar
                isSeller={false}
                isBuyer={false}
                isAdmin={true}
                onLogout={handleLogout}
            />

            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#C5E0DC] bg-white px-3 py-1 text-sm font-semibold text-[#2A9D8F]">
                            <ShieldCheck className="h-4 w-4" />
                            <span>{t('admin.badge')}</span>
                        </div>
                        <h1 className="mt-4 text-3xl font-bold text-[#1A2E2C]">
                            {t('admin.title')}
                        </h1>
                        <p className="mt-2 max-w-3xl text-[#6B9E99]">
                            {t('admin.subtitle')}
                        </p>
                        <div className="mt-4 min-h-[76px]">
                            {previewMode ? (
                                <div className="rounded-xl border border-[#F0D9A7] bg-[#FFF8E8] px-4 py-3 text-sm text-[#8A6A21]">
                                    {t('admin.previewMode')}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <Card className="border-[#D7E8E5] bg-white shadow-sm lg:w-[320px]">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="rounded-2xl bg-[#F4FAFA] p-3 text-[#2A9D8F]">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[#6B9E99]">{t('admin.loggedInAs')}</p>
                                <p className="text-lg font-semibold text-[#1A2E2C]">{currentUser?.username || '—'}</p>
                                <p className="text-sm text-[#6B9E99]">{t('admin.roles.admin')}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="overview" className="gap-6">
                    <TabsList className="grid h-auto grid-cols-3 rounded-2xl border border-[#D7E8E5] bg-white p-1 md:w-fit">
                        <TabsTrigger value="overview" className="rounded-xl px-4 py-2 data-[state=active]:bg-[#F4FAFA] data-[state=active]:text-[#1A2E2C]">
                            <ShieldCheck className="h-4 w-4" />
                            <span>{t('admin.tabs.overview')}</span>
                        </TabsTrigger>
                        <TabsTrigger value="users" className="rounded-xl px-4 py-2 data-[state=active]:bg-[#F4FAFA] data-[state=active]:text-[#1A2E2C]">
                            <Users className="h-4 w-4" />
                            <span>{t('admin.tabs.users')}</span>
                        </TabsTrigger>
                        <TabsTrigger value="auctions" className="rounded-xl px-4 py-2 data-[state=active]:bg-[#F4FAFA] data-[state=active]:text-[#1A2E2C]">
                            <Gavel className="h-4 w-4" />
                            <span>{t('admin.tabs.auctions')}</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <AdminOverviewSection stats={stats} loading={statsLoading} />
                    </TabsContent>

                    <TabsContent value="users">
                        <AdminUsersSection
                            users={users}
                            loading={usersLoading}
                            error={usersError}
                            deletingUserId={deletingUserId}
                            onInspectUser={handleInspectUser}
                            onDeleteUser={(user) => openDeleteConfirm('user', user)}
                        />
                    </TabsContent>

                    <TabsContent value="auctions">
                        <AdminAuctionsSection
                            auctions={auctions}
                            loading={auctionsLoading}
                            error={auctionsError}
                            deletingAuctionId={deletingAuctionId}
                            onInspectAuction={handleInspectAuction}
                            onDeleteAuction={(auction) => openDeleteConfirm('auction', auction)}
                            getAuctionStatusMeta={getAuctionStatusMeta}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            <AdminUserDetailsDialog
                open={userDetailsOpen}
                onOpenChange={setUserDetailsOpen}
                user={selectedUser}
                loading={userDetailsLoading}
                integrationMessage={userDetailsIntegrationMessage}
            />

            <AdminAuctionDetailsDialog
                open={auctionDetailsOpen}
                onOpenChange={setAuctionDetailsOpen}
                auction={selectedAuction}
                loading={auctionDetailsLoading}
                getAuctionStatusMeta={getAuctionStatusMeta}
            />

            <ConfirmDialog
                open={deleteConfirm.open}
                onOpenChange={(open) => setDeleteConfirm((prev) => ({ ...prev, open }))}
                title={deleteConfirm.type === 'user' ? t('admin.confirm.userDeleteTitle') : t('admin.confirm.auctionDeleteTitle')}
                description={
                    deleteConfirm.type === 'user'
                        ? t('admin.confirm.userDeleteDescription', { username: deleteConfirm.item?.username || '—' })
                        : t('admin.confirm.auctionDeleteDescription', { title: deleteConfirm.item?.title || '—' })
                }
                confirmText={t('admin.actions.delete')}
                cancelText={t('cancel')}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}

function getAuctionStatusMeta(auction) {
    const now = new Date();
    const startDate = auction?.startDate ? new Date(auction.startDate) : null;
    const endDate = auction?.endDate ? new Date(auction.endDate) : null;
    const status = String(auction?.status || '').toUpperCase();

    const hasStarted = !startDate || startDate <= now;
    const hasEndedByTime = Boolean(endDate && endDate <= now);

    if (status === 'FAILED_BELOW_RESERVE') {
        return {
            code: 'FAILED_BELOW_RESERVE',
            labelKey: 'admin.status.failedBelowReserve',
            label: i18nLabel('admin.status.failedBelowReserve'),
            bgClass: 'bg-red-100',
            textClass: 'text-red-700',
        };
    }

    if (status === 'ENDED' || status === 'COMPLETED' || hasEndedByTime) {
        return {
            code: 'ENDED',
            labelKey: 'admin.status.ended',
            label: i18nLabel('admin.status.ended'),
            bgClass: 'bg-red-50',
            textClass: 'text-red-700',
        };
    }

    if (status === 'PENDING' && !hasStarted) {
        return {
            code: 'PENDING',
            labelKey: 'admin.status.pending',
            label: i18nLabel('admin.status.pending'),
            bgClass: 'bg-amber-50',
            textClass: 'text-amber-700',
        };
    }

    return {
        code: 'ACTIVE',
        labelKey: 'admin.status.active',
        label: i18nLabel('admin.status.active'),
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-700',
    };
}

function i18nLabel(key) {
    try {
        const language = localStorage.getItem('i18nextLng') || 'ar';
        const labels = {
            ar: {
                'admin.status.pending': 'قيد الانتظار',
                'admin.status.active': 'نشط',
                'admin.status.ended': 'منتهي',
                'admin.status.failedBelowReserve': 'فشل - أقل من الحد الأدنى للبيع',
            },
            en: {
                'admin.status.pending': 'Pending',
                'admin.status.active': 'Active',
                'admin.status.ended': 'Ended',
                'admin.status.failedBelowReserve': 'Failed Below Reserve',
            },
        };
        return labels[language]?.[key] || labels.en[key] || key;
    } catch {
        return key;
    }
}
