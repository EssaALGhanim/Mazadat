import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUserDetailsDialog({
    open,
    onOpenChange,
    user,
    loading,
    integrationMessage,
}) {
    const { t, i18n } = useTranslation('common');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-h-[90vh] overflow-y-auto border-[#A8CFC8] bg-gradient-to-br from-[#F1FBF8] via-[#FBFEFD] to-[#EEF6FF] shadow-[0_24px_70px_rgba(26,46,44,0.22)] sm:max-w-2xl"
                dir={i18n.dir()}
            >
                <DialogHeader className="rounded-2xl border border-[#D8ECE8] bg-gradient-to-r from-[#1A7A6E] to-[#4F9EA2] px-5 py-4 text-start shadow-sm">
                    <DialogTitle className="text-white">{t('admin.users.detailsTitle')}</DialogTitle>
                    <DialogDescription className="text-white/80 text-start">
                        {t('admin.users.detailsDescription')}
                    </DialogDescription>
                </DialogHeader>

                {integrationMessage ? (
                    <div className="rounded-xl border border-[#F0D9A7] bg-[#FFF8E8] px-4 py-3 text-sm text-[#8A6A21]">
                        {integrationMessage}
                    </div>
                ) : null}

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(6)].map((_, index) => (
                            <Skeleton key={index} className="h-16 w-full bg-[#EAF3F1]" />
                        ))}
                    </div>
                ) : user ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        <DetailCard label={t('admin.users.columns.id')} value={`#${user.id ?? user.Id ?? '—'}`} />
                        <DetailCard label={t('username')} value={user.username || '—'} />
                        <DetailCard label={t('email')} value={user.email || '—'} />
                        <DetailCard label={t('phoneNumber')} value={user.phoneNumber || '—'} />
                        <DetailCard
                            label={t('admin.users.columns.role')}
                            value={<Badge className="bg-[#E6F4F1] text-[#1A7A6E]">{t(`admin.roles.${String(user.role || '').toLowerCase()}`, user.role || '—')}</Badge>}
                        />
                        <DetailCard label={t('admin.users.columns.created')} value={formatDate(user.createdAt, i18n.language)} />
                        <DetailCard label={t('admin.users.columns.updated')} value={formatDate(user.updatedAt, i18n.language)} />
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-[#C5E0DC] bg-[#F8FCFB] px-6 py-10 text-center text-sm text-[#6B9E99]">
                        {t('admin.users.detailsUnavailable')}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function DetailCard({ label, value }) {
    return (
        <div className="rounded-xl border border-[#D7E8E5] bg-[#F8FCFB] p-4 shadow-sm">
            <p className="text-sm font-medium text-[#6B9E99]">{label}</p>
            <div className="mt-2 break-words text-base font-semibold text-[#1A2E2C]">{value}</div>
        </div>
    );
}

function formatDate(value, locale) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}
