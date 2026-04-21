import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, ShieldCheck, UserPlus, UserMinus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopNavigationBar from '../components/TopNavigationBar';
import {
    getAuctionHouseTeam,
    getSellerAuctionHouse,
    addSellerToAuctionHouse,
    removeSellerFromAuctionHouse,
    promoteSellerToAdmin,
    removeAuctionHouseAdminByEmail,
    getPendingTeamInvitations,
    getSentTeamInvitations,
    acceptTeamInvitation,
    rejectTeamInvitation,
    cancelTeamInvitation,
    leaveAuctionHouse,
} from '@/services/auctionHouseService';
import { deleteSellerById, getCurrentSellerProfile } from '@/services/userService';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

export default function SellerTeamPage() {
    const { i18n } = useTranslation('common');
    const isAr = i18n.language === 'ar';
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [currentSeller, setCurrentSeller] = useState(null);
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [pendingInvitations, setPendingInvitations] = useState([]);
    const [hasAuctionHouse, setHasAuctionHouse] = useState(false);
    const [sentInvitations, setSentInvitations] = useState([]);
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: '',
        description: '',
        confirmText: '',
        onConfirm: null,
    });

    useEffect(() => {
        try {
            const stored = localStorage.getItem('user');
            setCurrentUser(stored ? JSON.parse(stored) : null);
        } catch {
            setCurrentUser(null);
        }
    }, []);

    const loadTeam = async () => {
        setLoading(true);
        setError(null);
        try {
            const seller = await getCurrentSellerProfile();
            setCurrentSeller(seller);

            const auctionHouse = await getSellerAuctionHouse().catch(() => null);
            setHasAuctionHouse(Boolean(auctionHouse));

            const invitations = await getPendingTeamInvitations().catch(() => []);
            setPendingInvitations(invitations || []);

            const outgoingInvites = await getSentTeamInvitations().catch(() => []);
            setSentInvitations(outgoingInvites || []);

            if (auctionHouse?.id) {
                const teamData = await getAuctionHouseTeam();
                setTeam(teamData || []);
            } else {
                setTeam([]);
            }
        } catch (err) {
            setError(err.message || (isAr ? 'فشل تحميل الفريق' : 'Failed to load team'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.role === 'SELLER') {
            loadTeam();
        }
    }, [currentUser]);

    const isAdmin = Boolean(currentSeller?.isAdmin);

    const handleAddSeller = async (e) => {
        e.preventDefault();
        if (!isAdmin || !inviteEmail.trim()) return;
        setSubmitting(true);
        try {
            await addSellerToAuctionHouse(inviteEmail.trim());
            setInviteEmail('');
            await loadTeam();
            toast.success(isAr ? 'تمت إضافة البائع' : 'Seller added successfully');
        } catch (err) {
            toast.error(err.message || (isAr ? 'فشل إضافة البائع للفريق' : 'Failed to add seller to team'));
        } finally {
            setSubmitting(false);
        }
    };

    const handlePromote = async (email) => {
        if (!isAdmin) return;
        try {
            await promoteSellerToAdmin(email);
            await loadTeam();
            toast.success(isAr ? 'تمت ترقية البائع' : 'Seller promoted successfully');
        } catch (err) {
            toast.error(err.message || (isAr ? 'فشل ترقية البائع' : 'Failed to promote seller'));
        }
    };

    const handleAcceptInvitation = async () => {
        try {
            await acceptTeamInvitation();
            await loadTeam();
            toast.success(isAr ? 'تم قبول الدعوة' : 'Invitation accepted');
        } catch (err) {
            toast.error(err.message || (isAr ? 'فشل قبول الدعوة' : 'Failed to accept invitation'));
        }
    };

    const handleRejectInvitation = async () => {
        try {
            await rejectTeamInvitation();
            await loadTeam();
            toast.success(isAr ? 'تم رفض الدعوة' : 'Invitation rejected');
        } catch (err) {
            toast.error(err.message || (isAr ? 'فشل رفض الدعوة' : 'Failed to reject invitation'));
        }
    };

    const handleRemove = async (email) => {
        if (!isAdmin) return;
        setConfirmDialog({
            open: true,
            title: isAr ? 'إزالة المستخدم' : 'Remove User',
            description: isAr ? 'هل أنت متأكد من إزالة هذا المستخدم من الفريق؟' : 'Are you sure you want to remove this user from team?',
            confirmText: isAr ? 'إزالة' : 'Remove',
            onConfirm: async () => {
                try {
                    await removeSellerFromAuctionHouse(email);
                    await loadTeam();
                    toast.success(isAr ? 'تمت إزالة المستخدم' : 'User removed successfully');
                } catch (err) {
                    toast.error(err.message || (isAr ? 'فشل إزالة المستخدم' : 'Failed to remove user'));
                }
            },
        });
    };

    const handleDeleteSeller = async (sellerId) => {
        if (!isAdmin) return;
        setConfirmDialog({
            open: true,
            title: isAr ? 'حذف البائع' : 'Delete Seller',
            description: isAr ? 'سيتم حذف حساب البائع نهائياً. هل تريد المتابعة؟' : 'This will permanently delete the seller account. Continue?',
            confirmText: isAr ? 'حذف' : 'Delete',
            onConfirm: async () => {
                try {
                    await deleteSellerById(sellerId);
                    await loadTeam();
                    toast.success(isAr ? 'تم حذف البائع' : 'Seller deleted successfully');
                } catch (err) {
                    toast.error(err.message || (isAr ? 'فشل حذف البائع' : 'Failed to delete seller'));
                }
            },
        });
    };

    const handleDemote = async (email) => {
        if (!isAdmin) return;
        try {
            await removeAuctionHouseAdminByEmail(email);
            await loadTeam();
            toast.success(isAr ? 'تمت إزالة صلاحية المسؤول' : 'Admin role removed');
        } catch (err) {
            toast.error(err.message || (isAr ? 'فشل إرجاع المسؤول إلى بائع' : 'Failed to demote admin'));
        }
    };

    const handleCancelInvite = async (email) => {
        if (!isAdmin) return;
        try {
            await cancelTeamInvitation(email);
            await loadTeam();
            toast.success(isAr ? 'تم إلغاء الدعوة' : 'Invitation cancelled');
        } catch (err) {
            toast.error(err.message || (isAr ? 'فشل إلغاء الدعوة' : 'Failed to cancel invitation'));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/auth';
    };

    const handleLeaveAuctionHouse = async () => {
        if (!hasAuctionHouse) return;
        setConfirmDialog({
            open: true,
            title: isAr ? 'مغادرة صالة المزاد' : 'Leave Auction House',
            description: isAr ? 'هل أنت متأكد من مغادرة صالة المزاد؟' : 'Are you sure you want to leave this Auction House?',
            confirmText: isAr ? 'مغادرة' : 'Leave',
            onConfirm: async () => {
                try {
                    await leaveAuctionHouse();
                    await loadTeam();
                    toast.success(isAr ? 'تمت مغادرة صالة المزاد' : 'Left auction house successfully');
                    navigate('/seller-dashboard');
                } catch (err) {
                    toast.error(err.message || (isAr ? 'فشل مغادرة صالة المزاد' : 'Failed to leave auction house'));
                }
            },
        });
    };

    if (currentUser?.role !== 'SELLER') {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
            <TopNavigationBar
                currentUser={currentUser}
                isSeller={true}
                isBuyer={false}
                onCreateAuction={() => navigate('/seller-dashboard')}
                onLogout={handleLogout}
            />
            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => !open && setConfirmDialog({ open: false, title: '', description: '', confirmText: '', onConfirm: null })}
                title={confirmDialog.title}
                description={confirmDialog.description}
                confirmText={confirmDialog.confirmText}
                cancelText={isAr ? 'إلغاء' : 'Cancel'}
                onConfirm={async () => {
                    const action = confirmDialog.onConfirm;
                    setConfirmDialog({ open: false, title: '', description: '', confirmText: '', onConfirm: null });
                    await action?.();
                }}
            />

            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <button
                        onClick={() => navigate('/seller-dashboard')}
                        className="flex items-center gap-2 text-[#2A9D8F] hover:text-[#1A7A6E] font-semibold mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {isAr ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
                    </button>

                    <div className="bg-white border border-[#C5E0DC] rounded-xl p-6 mb-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-6 h-6 text-[#2A9D8F]" />
                            <h1 className="text-2xl font-bold text-[#1A2E2C]">{isAr ? 'الفريق' : 'Team'}</h1>
                        </div>
                        <p className="text-[#6B9E99] text-sm">
                            {isAr ? 'إدارة أعضاء صالة المزاد وصلاحياتهم' : 'Manage auction house members and permissions'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">{error}</div>
                    )}

                    {!hasAuctionHouse && !loading && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-5 mb-6">
                            <p className="font-semibold mb-2">{isAr ? 'أنت غير منضم إلى أي صالة مزاد حالياً' : 'You are not part of any Auction House yet'}</p>
                            <p className="text-sm">{isAr ? 'يمكنك انتظار دعوة والانضمام بعد قبولها، أو إنشاء صالة مزاد جديدة من لوحة التحكم.' : 'You can wait for an invitation and accept it, or create a new Auction House from your dashboard.'}</p>
                        </div>
                    )}

                    {pendingInvitations.length > 0 && (
                        <div className="bg-[#EAF7F5] border border-[#2A9D8F] rounded-xl p-5 mb-6">
                            <p className="font-semibold text-[#1A2E2C] mb-1 rtl:text-right ltr:text-left">
                                {isAr ? 'لديك دعوة للانضمام إلى صالة مزاد' : 'You have an invitation to join an Auction House'}
                            </p>
                            <p className="text-sm text-[#2A9D8F] mb-4">
                                {(pendingInvitations[0]?.auctionHouseName || '-')}
                            </p>
                            <div className="flex gap-3">
                                <button onClick={handleAcceptInvitation} className="px-4 py-2 rounded-lg bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white text-sm font-semibold">
                                    {isAr ? 'قبول الدعوة' : 'Accept'}
                                </button>
                                <button onClick={handleRejectInvitation} className="px-4 py-2 rounded-lg bg-white border border-[#C5E0DC] text-[#6B9E99] hover:bg-[#F4FAFA] text-sm font-semibold">
                                    {isAr ? 'رفض' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    )}

                    {isAdmin && sentInvitations.length > 0 && (
                        <div className="bg-white border border-[#C5E0DC] rounded-xl p-5 mb-6 shadow-sm">
                            <p className="font-semibold text-[#1A2E2C] mb-3 rtl:text-right ltr:text-left">
                                {isAr ? 'الدعوات المرسلة المعلّقة' : 'Pending Sent Invitations'}
                            </p>
                            <div className="space-y-2">
                                {sentInvitations.map((invite) => (
                                    <div key={invite.email} className="flex items-center justify-between rounded-lg border border-[#E3ECEA] px-3 py-2">
                                        <div>
                                            <p className="text-sm font-semibold text-[#1A2E2C] rtl:text-right ltr:text-left">{invite.username || '-'}</p>
                                            <p className="text-xs text-[#6B9E99]">{invite.email}</p>
                                        </div>
                                        <button
                                            onClick={() => handleCancelInvite(invite.email)}
                                            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                                        >
                                            {isAr ? 'إلغاء الدعوة' : 'Cancel Invitation'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {hasAuctionHouse && (
                        <div className="mb-6">
                            <button
                                onClick={handleLeaveAuctionHouse}
                                className="px-4 py-2 rounded-lg bg-white border border-red-300 text-red-600 hover:bg-red-50 text-sm font-semibold"
                            >
                                {isAr ? 'مغادرة صالة المزاد' : 'Leave Auction House'}
                            </button>
                        </div>
                    )}

                    {isAdmin && hasAuctionHouse && (
                        <form onSubmit={handleAddSeller} className="bg-white border border-[#C5E0DC] rounded-xl p-6 mb-6 shadow-sm">
                            <h2 className="font-bold text-[#1A2E2C] mb-3">{isAr ? 'إضافة بائع غير مسؤول' : 'Add Non-Admin Seller'}</h2>
                            <div className="flex gap-3">
                                <input
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder={isAr ? 'البريد الإلكتروني للبائع' : 'Seller email'}
                                    type="email"
                                    className="flex-1 border border-[#C5E0DC] rounded-lg px-3 py-2 text-sm"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        {submitting ? '...' : (isAr ? 'إضافة' : 'Add')}
                                    </span>
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="bg-white border border-[#C5E0DC] rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#F4FAFA] border-b border-[#C5E0DC]">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#1A2E2C]">{isAr ? 'المستخدم' : 'User'}</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#1A2E2C]">{isAr ? 'البريد' : 'Email'}</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#1A2E2C]">{isAr ? 'الدور' : 'Role'}</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#1A2E2C]">{isAr ? 'إجراءات' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td className="px-4 py-6 text-sm text-[#6B9E99]" colSpan={4}>{isAr ? 'جاري التحميل...' : 'Loading...'}</td>
                                        </tr>
                                    ) : team.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-sm text-[#6B9E99]" colSpan={4}>{isAr ? 'لا يوجد أعضاء في الفريق' : 'No team members found'}</td>
                                        </tr>
                                    ) : (
                                        team.map((member) => (
                                            <tr key={member.sellerId} className="border-b border-[#C5E0DC] last:border-0">
                                                        <td className="px-4 py-3 text-sm font-semibold text-[#1A2E2C] rtl:text-right ltr:text-left">{member.username}</td>
                                                <td className="px-4 py-3 text-sm text-[#6B9E99]">{member.email || '-'}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    {member.isAdmin ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#EAF7F5] text-[#2A9D8F] font-semibold">
                                                            <ShieldCheck className="w-3.5 h-3.5" />
                                                            {isAr ? 'مسؤول' : 'Admin'}
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-semibold">{isAr ? 'بائع' : 'Seller'}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                     {isAdmin && member.username !== currentUser?.username && (
                                                        <div className="flex gap-2">
                                                             {!member.isAdmin && (
                                                                 <button
                                                                      onClick={() => handlePromote(member.email)}
                                                                     className="px-3 py-1 rounded-lg bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white text-xs font-semibold"
                                                                 >
                                                                     {isAr ? 'ترقية لمسؤول' : 'Promote'}
                                                                 </button>
                                                             )}
                                                            <button
                                                                onClick={() => handleRemove(member.email)}
                                                                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                                                            >
                                                                <span className="inline-flex items-center gap-1"><UserMinus className="w-3 h-3" />{isAr ? 'إزالة' : 'Remove'}</span>
                                                            </button>
                                                             <button
                                                                 onClick={() => handleDeleteSeller(member.sellerId)}
                                                                 className="px-3 py-1 rounded-lg bg-[#1A2E2C] hover:bg-black text-white text-xs font-semibold"
                                                             >
                                                                 {isAr ? 'حذف الحساب' : 'Delete Account'}
                                                             </button>
                                                              {member.isAdmin && (
                                                                  <button
                                                                      onClick={() => handleDemote(member.email)}
                                                                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                                                                  >
                                                                      {isAr ? 'إرجاع كبائع' : 'Demote'}
                                                                  </button>
                                                              )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

