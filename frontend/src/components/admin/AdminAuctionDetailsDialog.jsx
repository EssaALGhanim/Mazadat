import { useMemo } from 'react';
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
import { resolveImageUrl } from '@/services/imageService';

export default function AdminAuctionDetailsDialog({
    open,
    onOpenChange,
    auction,
    loading,
    getAuctionStatusMeta,
}) {
    const { t, i18n } = useTranslation('common');
    const statusMeta = useMemo(() => getAuctionStatusMeta(auction), [auction, getAuctionStatusMeta]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto border-[#D7E8E5] bg-[#FCFEFD] sm:max-w-4xl" dir={i18n.dir()}>
                <DialogHeader className="text-start">
                    <DialogTitle className="text-[#1A2E2C]">{t('admin.auctions.detailsTitle')}</DialogTitle>
                    <DialogDescription className="text-[#6B9E99]">
                        {t('admin.auctions.detailsDescription')}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, index) => (
                            <Skeleton key={index} className="h-20 w-full bg-[#EAF3F1]" />
                        ))}
                    </div>
                ) : auction ? (
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <DetailCard label={t('admin.auctions.columns.id')} value={`#${auction.id || '—'}`} />
                            <DetailCard label={t('admin.auctions.columns.title')} value={auction.title || '—'} />
                            <DetailCard label={t('admin.auctions.columns.seller')} value={auction.sellerName || '—'} />
                            <DetailCard label={t('admin.auctions.columns.auctionHouse')} value={auction.auctionHouseName || '—'} />
                            <DetailCard
                                label={t('admin.auctions.columns.status')}
                                value={<Badge className={`${statusMeta.bgClass} ${statusMeta.textClass}`}>{statusMeta.label}</Badge>}
                            />
                            <DetailCard label={t('admin.auctions.columns.currentPrice')} value={formatCurrency(auction.currentPrice ?? auction.startingPrice, i18n.language)} />
                            <DetailCard label={t('admin.auctions.columns.startingPrice')} value={formatCurrency(auction.startingPrice, i18n.language)} />
                            <DetailCard label={t('admin.auctions.columns.bidCount')} value={String(auction.bidCount ?? 0)} />
                            <DetailCard label={t('admin.auctions.columns.startDate')} value={formatDate(auction.startDate, i18n.language)} />
                            <DetailCard label={t('admin.auctions.columns.endDate')} value={formatDate(auction.endDate, i18n.language)} />
                            <DetailCard label={t('admin.auctions.columns.featured')} value={auction.isActivelyFeatured ? t('admin.common.yes') : t('admin.common.no')} />
                            <DetailCard label={t('admin.auctions.columns.highestBidder')} value={auction.highestBidder || '—'} />
                        </div>

                        <div className="rounded-xl border border-[#E4EFED] bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-[#6B9E99]">{t('description')}</p>
                            <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-[#1A2E2C]">
                                {auction.description || t('admin.auctions.noDescription')}
                            </p>
                        </div>

                        <div className="rounded-xl border border-[#E4EFED] bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-[#6B9E99]">{t('admin.auctions.images')}</p>
                            {auction.images?.length ? (
                                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {auction.images.map((image) => (
                                        <img
                                            key={image.id || image.url}
                                            src={resolveImageUrl(image.url, image.createdAt || image.id)}
                                            alt={auction.title || 'Auction'}
                                            className="h-44 w-full rounded-xl border border-[#E4EFED] object-cover"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-[#6B9E99]">{t('admin.auctions.noImages')}</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-[#C5E0DC] bg-[#F8FCFB] px-6 py-10 text-center text-sm text-[#6B9E99]">
                        {t('admin.auctions.detailsUnavailable')}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function DetailCard({ label, value }) {
    return (
        <div className="rounded-xl border border-[#E4EFED] bg-white p-4 shadow-sm">
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

function formatCurrency(value, locale) {
    if (value == null || Number.isNaN(Number(value))) return '—';
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: 'SAR',
        maximumFractionDigits: 0,
    }).format(Number(value));
}
