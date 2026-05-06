import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flag, Mail, Trash2, X, ExternalLink, AlertCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    emailReporter,
    emailAuctionHouse,
    deleteReportedAuction,
    dismissReport,
} from '@/services/reportService';

const STATUS_STYLES = {
    PENDING:   { bg: 'bg-amber-100',   text: 'text-amber-700',   labelKey: 'admin.reports.status.pending' },
    REVIEWED:  { bg: 'bg-blue-100',    text: 'text-blue-700',    labelKey: 'admin.reports.status.reviewed' },
    DISMISSED: { bg: 'bg-slate-100',   text: 'text-slate-600',   labelKey: 'admin.reports.status.dismissed' },
};

// composing: { reportId, type: 'reporter' | 'auctionHouse', message: '' }
export default function AdminReportsSection({ reports, loading, error, onReportChanged }) {
    const { t, i18n } = useTranslation('common');
    const isAr = i18n.language === 'ar';
    const dir = i18n.dir();

    const [actionLoading, setActionLoading] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, reportId: null, auctionTitle: '' });
    const [composing, setComposing] = useState(null); // { reportId, type, message }

    const withLoading = async (key, fn) => {
        setActionLoading(key);
        try {
            await fn();
            onReportChanged?.();
        } catch (err) {
            toast.error(err?.message || t('actionFailed'));
        } finally {
            setActionLoading(null);
        }
    };

    const openCompose = (report, type) => {
        setComposing({ reportId: report.id, type, message: '' });
    };

    const cancelCompose = () => setComposing(null);

    const handleSendComposed = () => {
        if (!composing) return;
        const { reportId, type, message } = composing;
        const report = reports.find((r) => r.id === reportId);
        if (!report) return;
        setComposing(null);

        if (type === 'reporter') {
            withLoading(`email-reporter-${reportId}`, async () => {
                await emailReporter(reportId, message.trim() || null);
                toast.success(t('admin.reports.emailReporterSuccess'));
            });
        } else {
            withLoading(`email-ah-${reportId}`, async () => {
                await emailAuctionHouse(reportId, message.trim() || null);
                toast.success(t('admin.reports.emailAuctionHouseSuccess'));
            });
        }
    };

    const handleDismiss = (report) =>
        withLoading(`dismiss-${report.id}`, async () => {
            await dismissReport(report.id);
            toast.success(t('admin.reports.dismissSuccess'));
        });

    const openDeleteConfirm = (report) => {
        setDeleteConfirm({ open: true, reportId: report.id, auctionTitle: report.auctionTitle });
    };

    const handleConfirmDeleteAuction = async () => {
        setDeleteConfirm((prev) => ({ ...prev, open: false }));
        await withLoading(`delete-auction-${deleteConfirm.reportId}`, async () => {
            await deleteReportedAuction(deleteConfirm.reportId);
            toast.success(t('admin.reports.auctionDeletedSuccess'));
        });
    };

    if (loading) {
        return (
            <Card dir={dir} className="border-[#D7E8E5] bg-white shadow-sm">
                <CardHeader className="border-b border-[#E4EFED]">
                    <CardTitle className="text-start text-[#1A2E2C]">{t('admin.reports.title')}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-36 w-full bg-[#EAF3F1]" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card dir={dir} className="border-[#D7E8E5] bg-white shadow-sm">
                <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                    <AlertCircle className="h-10 w-10 text-[#E05252]" />
                    <p className="text-[#E05252] font-semibold">{error}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card dir={dir} className="border-[#D7E8E5] bg-white shadow-sm">
                <CardHeader className="border-b border-[#E4EFED]">
                    <CardTitle className="flex items-center gap-2 text-start text-[#1A2E2C]">
                        <Flag className="h-5 w-5 shrink-0 text-[#E05252]" />
                        {t('admin.reports.title')}
                    </CardTitle>
                    <CardDescription className="text-start text-[#6B9E99]">
                        {t('admin.reports.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {reports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#C5E0DC] bg-[#F8FCFB] px-6 py-16 text-center">
                            <Flag className="mb-4 h-10 w-10 text-[#6B9E99]" />
                            <p className="text-lg font-semibold text-[#1A2E2C]">{t('admin.reports.emptyTitle')}</p>
                            <p className="mt-2 text-sm text-[#6B9E99]">{t('admin.reports.emptyDescription')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report) => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    isAr={isAr}
                                    t={t}
                                    actionLoading={actionLoading}
                                    composing={composing?.reportId === report.id ? composing : null}
                                    onComposeReporter={() => openCompose(report, 'reporter')}
                                    onComposeAuctionHouse={() => openCompose(report, 'auctionHouse')}
                                    onComposeMessageChange={(msg) => setComposing((prev) => prev ? { ...prev, message: msg } : prev)}
                                    onSendComposed={handleSendComposed}
                                    onCancelCompose={cancelCompose}
                                    onDeleteAuction={() => openDeleteConfirm(report)}
                                    onDismiss={() => handleDismiss(report)}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <ConfirmDialog
                open={deleteConfirm.open}
                onOpenChange={(open) => setDeleteConfirm((prev) => ({ ...prev, open }))}
                title={t('admin.reports.confirmDeleteTitle')}
                description={t('admin.reports.confirmDeleteDescription', { title: deleteConfirm.auctionTitle || '—' })}
                confirmText={t('admin.actions.delete')}
                cancelText={t('cancel')}
                onConfirm={handleConfirmDeleteAuction}
            />
        </>
    );
}

function ReportCard({
    report, isAr, t, actionLoading,
    composing,
    onComposeReporter, onComposeAuctionHouse,
    onComposeMessageChange, onSendComposed, onCancelCompose,
    onDeleteAuction, onDismiss,
}) {
    const style = STATUS_STYLES[report.status] || STATUS_STYLES.PENDING;
    const isDismissed = report.status === 'DISMISSED';
    const canDeleteAuction = report.auctionExists;
    const isComposingReporter = composing?.type === 'reporter';
    const isComposingAH = composing?.type === 'auctionHouse';

    return (
        <div className="rounded-xl border border-[#D7E8E5] bg-[#F8FCFB] p-5">
            {/* Header row */}
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3" dir="auto">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#1A2E2C]">
                        #{report.id}
                    </span>
                    <Badge className={`${style.bg} ${style.text} border-0 text-xs`}>
                        {t(style.labelKey)}
                    </Badge>
                    <span className="text-xs text-[#6B9E99]">{formatDate(report.createdAt, isAr)}</span>
                </div>
                {report.resolvedAt && (
                    <span className="text-xs text-[#6B9E99]">
                        {t('admin.reports.resolvedAt')}: {formatDate(report.resolvedAt, isAr)}
                    </span>
                )}
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                <InfoBlock label={t('admin.reports.reporter')}>
                    <p className="font-semibold text-[#1A2E2C] truncate">{report.reporterUsername}</p>
                    <p className="text-xs text-[#5F7D79] truncate" dir="ltr">{report.reporterEmail}</p>
                </InfoBlock>

                <InfoBlock label={t('admin.reports.listing')}>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-[#1A2E2C] break-words">{report.auctionTitle}</p>
                        {report.auctionExists && report.auctionId && (
                            <a
                                href={`/auction/${report.auctionId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#2A9D8F] hover:text-[#1A7A6E] shrink-0"
                                title={t('admin.reports.viewListing')}
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        )}
                    </div>
                    {!report.auctionExists && (
                        <span className="text-xs text-[#E05252]">{t('admin.reports.auctionDeleted')}</span>
                    )}
                </InfoBlock>

                <InfoBlock label={t('admin.reports.seller')}>
                    <p className="font-semibold text-[#1A2E2C] truncate">{report.sellerUsername}</p>
                    {report.sellerEmail && (
                        <p className="text-xs text-[#5F7D79] truncate" dir="ltr">{report.sellerEmail}</p>
                    )}
                    {report.auctionHouseName && (
                        <p className="text-xs text-[#6B9E99] truncate">{report.auctionHouseName}</p>
                    )}
                </InfoBlock>
            </div>

            {/* Message */}
            {report.message && (
                <div className="mb-4 rounded-lg border border-[#F0D9A7] bg-[#FFFBF0] px-4 py-3">
                    <p className="mb-1 text-start text-xs font-semibold text-[#8A6A21]">{t('admin.reports.reason')}</p>
                    <p className="text-start text-sm text-[#444] break-words whitespace-pre-wrap">{report.message}</p>
                </div>
            )}

            {/* Inline compose panel */}
            {composing && (
                <div className="mb-3 rounded-xl border border-[#A8D8D3] bg-[#EAF7F5] p-4 space-y-3">
                    <p className="text-start text-xs font-semibold text-[#1A7A6E]">
                        {isComposingReporter
                            ? t('admin.reports.composeToReporter')
                            : t('admin.reports.composeToAuctionHouse')}
                        <span className="ms-1 font-normal text-[#6B9E99]">({t('admin.reports.composeOptional')})</span>
                    </p>
                    <Textarea
                        value={composing.message}
                        onChange={(e) => onComposeMessageChange(e.target.value)}
                        placeholder={t('admin.reports.composePlaceholder')}
                        maxLength={2000}
                        rows={4}
                        className="resize-none border-[#C5E0DC] bg-white focus-visible:ring-[#2A9D8F] text-sm"
                        dir={isAr ? 'rtl' : 'ltr'}
                        autoFocus
                    />
                    <p className="text-end text-xs text-[#6B9E99]">{composing.message.length}/2000</p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            className="bg-[#2A9D8F] hover:bg-[#1A7A6E] gap-1.5"
                            onClick={onSendComposed}
                        >
                            <Send className="h-3.5 w-3.5" />
                            {t('admin.reports.composeSend')}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#6B9E99]"
                            onClick={onCancelCompose}
                        >
                            {t('cancel')}
                        </Button>
                    </div>
                </div>
            )}

            {/* Action buttons */}
            {!isDismissed && !composing && (
                <div className="flex flex-wrap gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-[#2A9D8F] text-[#2A9D8F] hover:bg-[#EAF7F5] gap-1.5"
                        disabled={!!actionLoading}
                        onClick={onComposeReporter}
                    >
                        <Mail className="h-3.5 w-3.5" />
                        {actionLoading === `email-reporter-${report.id}`
                            ? t('admin.reports.sending')
                            : t('admin.reports.emailReporter')}
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        className="border-[#2A9D8F] text-[#2A9D8F] hover:bg-[#EAF7F5] gap-1.5"
                        disabled={!!actionLoading}
                        onClick={onComposeAuctionHouse}
                    >
                        <Mail className="h-3.5 w-3.5" />
                        {actionLoading === `email-ah-${report.id}`
                            ? t('admin.reports.sending')
                            : t('admin.reports.emailAuctionHouse')}
                    </Button>

                    {canDeleteAuction && (
                        <Button
                            size="sm"
                            variant="destructive"
                            className="bg-[#E05252] hover:bg-[#C73F3F] gap-1.5"
                            disabled={!!actionLoading}
                            onClick={onDeleteAuction}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            {actionLoading === `delete-auction-${report.id}`
                                ? t('admin.actions.deleting')
                                : t('admin.reports.deleteAuction')}
                        </Button>
                    )}

                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-[#6B9E99] hover:bg-[#F4FAFA] hover:text-[#1A2E2C] gap-1.5 ms-auto"
                        disabled={!!actionLoading}
                        onClick={onDismiss}
                    >
                        <X className="h-3.5 w-3.5" />
                        {actionLoading === `dismiss-${report.id}`
                            ? t('admin.reports.dismissing')
                            : t('admin.reports.dismiss')}
                    </Button>
                </div>
            )}
        </div>
    );
}

function InfoBlock({ label, children }) {
    return (
        <div className="rounded-lg border border-[#D7E8E5] bg-white px-3 py-2.5 text-start">
            <p className="mb-1 text-xs font-medium text-[#6B9E99]">{label}</p>
            {children}
        </div>
    );
}

function formatDate(value, isAr) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat(isAr ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}
