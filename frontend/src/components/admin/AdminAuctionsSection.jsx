import { Eye, Gavel, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const STABLE_SECTION_MIN_HEIGHT = 'min-h-[440px]';
const columnWidths = {
    id: 'w-[72px]',
    title: 'w-[200px]',
    seller: 'w-[130px]',
    auctionHouse: 'w-[160px]',
    status: 'w-[110px]',
    currentPrice: 'w-[130px]',
    bidCount: 'w-[70px]',
    endDate: 'w-[130px]',
    actions: 'w-[96px]',
};

function EmptyState({ title, description }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#C5E0DC] bg-[#F8FCFB] px-6 py-12 text-center">
            <Gavel className="mb-4 h-10 w-10 text-[#6B9E99]" />
            <p className="text-lg font-semibold text-[#1A2E2C]">{title}</p>
            <p className="mt-2 max-w-xl text-sm text-[#6B9E99]">{description}</p>
        </div>
    );
}

export default function AdminAuctionsSection({
    auctions,
    loading,
    error,
    deletingAuctionId,
    onInspectAuction,
    onDeleteAuction,
    getAuctionStatusMeta,
}) {
    const { t, i18n } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const isAr = i18n.language === 'ar';

    const filteredAuctions = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return auctions.filter((auction) => {
            const statusMeta = getAuctionStatusMeta(auction);
            if (statusFilter !== 'ALL' && statusMeta.code !== statusFilter) return false;
            if (!query) return true;

            return [
                auction?.id,
                auction?.title,
                auction?.sellerName,
                auction?.auctionHouseName,
                auction?.status,
            ].some((value) => String(value || '').toLowerCase().includes(query));
        });
    }, [auctions, searchQuery, statusFilter, getAuctionStatusMeta]);

    const hasAuctions = auctions.length > 0;
    const hasResults = filteredAuctions.length > 0;

    return (
        <Card className="border-[#D7E8E5] bg-white shadow-sm">
            <CardHeader className="gap-4 border-b border-[#E4EFED]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <CardTitle className="text-[#1A2E2C]">{t('admin.auctions.title')}</CardTitle>
                        <CardDescription className="text-[#6B9E99]">
                            {t('admin.auctions.description')}
                        </CardDescription>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative min-w-0 sm:w-80">
                            <Search className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B9E99] ${isAr ? 'right-3' : 'left-3'}`} />
                            <Input
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder={t('admin.auctions.searchPlaceholder')}
                                className={`border-[#C5E0DC] bg-white ${isAr ? 'pr-9' : 'pl-9'}`}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full border-[#C5E0DC] bg-white sm:w-52">
                                <SelectValue placeholder={t('admin.auctions.statusFilter')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">{t('admin.filters.allStatuses')}</SelectItem>
                                <SelectItem value="PENDING">{t('admin.status.pending')}</SelectItem>
                                <SelectItem value="ACTIVE">{t('admin.status.active')}</SelectItem>
                                <SelectItem value="ENDED">{t('admin.status.ended')}</SelectItem>
                                <SelectItem value="FAILED_BELOW_RESERVE">{t('admin.status.failedBelowReserve')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>

            <CardContent className={`p-6 ${STABLE_SECTION_MIN_HEIGHT}`}>
                {loading ? (
                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow className="border-[#E4EFED] hover:bg-transparent">
                                <TableHead className={`${columnWidths.id} text-[#6B9E99]`}>{t('admin.auctions.columns.id')}</TableHead>
                                <TableHead className={`${columnWidths.title} text-[#6B9E99]`}>{t('admin.auctions.columns.title')}</TableHead>
                                <TableHead className={`${columnWidths.seller} text-[#6B9E99]`}>{t('admin.auctions.columns.seller')}</TableHead>
                                <TableHead className={`${columnWidths.auctionHouse} text-[#6B9E99]`}>{t('admin.auctions.columns.auctionHouse')}</TableHead>
                                <TableHead className={`${columnWidths.status} text-[#6B9E99]`}>{t('admin.auctions.columns.status')}</TableHead>
                                <TableHead className={`${columnWidths.currentPrice} text-[#6B9E99]`}>{t('admin.auctions.columns.currentPrice')}</TableHead>
                                <TableHead className={`${columnWidths.bidCount} text-[#6B9E99]`}>{t('admin.auctions.columns.bidCount')}</TableHead>
                                <TableHead className={`${columnWidths.endDate} text-[#6B9E99]`}>{t('admin.auctions.columns.endDate')}</TableHead>
                                <TableHead className={`${columnWidths.actions} text-right text-[#6B9E99]`}>{t('admin.auctions.columns.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(6)].map((_, index) => (
                                <TableRow key={index} className="border-[#EEF5F3]">
                                    <TableCell className={columnWidths.id}><Skeleton className="h-5 w-12 bg-[#EAF3F1]" /></TableCell>
                                    <TableCell className={columnWidths.title}><Skeleton className="h-5 w-36 bg-[#EAF3F1]" /></TableCell>
                                    <TableCell className={columnWidths.seller}><Skeleton className="h-5 w-24 bg-[#EAF3F1]" /></TableCell>
                                    <TableCell className={columnWidths.auctionHouse}><Skeleton className="h-5 w-28 bg-[#EAF3F1]" /></TableCell>
                                    <TableCell className={columnWidths.status}><Skeleton className="h-5 w-20 bg-[#EAF3F1]" /></TableCell>
                                    <TableCell className={columnWidths.currentPrice}><Skeleton className="h-5 w-24 bg-[#EAF3F1]" /></TableCell>
                                    <TableCell className={columnWidths.bidCount}><Skeleton className="h-5 w-10 bg-[#EAF3F1]" /></TableCell>
                                    <TableCell className={columnWidths.endDate}><Skeleton className="h-5 w-24 bg-[#EAF3F1]" /></TableCell>
                                    <TableCell className={columnWidths.actions}>
                                        <div className="flex justify-end gap-2">
                                            <Skeleton className="h-8 w-8 shrink-0 bg-[#EAF3F1]" />
                                            <Skeleton className="h-8 w-8 shrink-0 bg-[#EAF3F1]" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : error ? (
                    <EmptyState title={t('admin.errors.auctionsLoadTitle')} description={error} />
                ) : !hasAuctions ? (
                    <EmptyState title={t('admin.auctions.emptyTitle')} description={t('admin.auctions.emptyDescription')} />
                ) : !hasResults ? (
                    <EmptyState title={t('admin.auctions.emptySearchTitle')} description={t('admin.auctions.emptySearchDescription')} />
                ) : (
                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow className="border-[#E4EFED] hover:bg-transparent">
                                <TableHead className={`${columnWidths.id} text-[#6B9E99]`}>{t('admin.auctions.columns.id')}</TableHead>
                                <TableHead className={`${columnWidths.title} text-[#6B9E99]`}>{t('admin.auctions.columns.title')}</TableHead>
                                <TableHead className={`${columnWidths.seller} text-[#6B9E99]`}>{t('admin.auctions.columns.seller')}</TableHead>
                                <TableHead className={`${columnWidths.auctionHouse} text-[#6B9E99]`}>{t('admin.auctions.columns.auctionHouse')}</TableHead>
                                <TableHead className={`${columnWidths.status} text-[#6B9E99]`}>{t('admin.auctions.columns.status')}</TableHead>
                                <TableHead className={`${columnWidths.currentPrice} text-[#6B9E99]`}>{t('admin.auctions.columns.currentPrice')}</TableHead>
                                <TableHead className={`${columnWidths.bidCount} text-[#6B9E99]`}>{t('admin.auctions.columns.bidCount')}</TableHead>
                                <TableHead className={`${columnWidths.endDate} text-[#6B9E99]`}>{t('admin.auctions.columns.endDate')}</TableHead>
                                <TableHead className={`${columnWidths.actions} text-right text-[#6B9E99]`}>{t('admin.auctions.columns.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAuctions.map((auction) => {
                                const statusMeta = getAuctionStatusMeta(auction);
                                return (
                                    <TableRow key={auction.id} className="border-[#EEF5F3]">
                                        <TableCell className={`${columnWidths.id} font-medium text-[#1A2E2C]`}>#{auction.id}</TableCell>
                                        <TableCell className={`${columnWidths.title} truncate text-[#1A2E2C]`}>{auction.title || '—'}</TableCell>
                                        <TableCell className={`${columnWidths.seller} truncate text-[#5F7D79]`}>{auction.sellerName || '—'}</TableCell>
                                        <TableCell className={`${columnWidths.auctionHouse} truncate text-[#5F7D79]`}>{auction.auctionHouseName || '—'}</TableCell>
                                        <TableCell className={columnWidths.status}>
                                            <span className={`inline-flex max-w-full truncate rounded-full px-2 py-1 text-xs font-semibold ${statusMeta.bgClass} ${statusMeta.textClass}`}>
                                                {getCompactStatusLabel(statusMeta.code, t)}
                                            </span>
                                        </TableCell>
                                        <TableCell className={`${columnWidths.currentPrice} text-[#1A2E2C]`}>{formatCurrency(auction.currentPrice ?? auction.startingPrice, i18n.language)}</TableCell>
                                        <TableCell className={`${columnWidths.bidCount} text-[#5F7D79]`}>{auction.bidCount ?? 0}</TableCell>
                                        <TableCell className={`${columnWidths.endDate} text-[#5F7D79]`}>{formatDate(auction.endDate, i18n.language)}</TableCell>
                                        <TableCell className={columnWidths.actions}>
                                            <div className="flex justify-end gap-1.5">
                                                <Button
                                                    variant="outline"
                                                    size="icon-sm"
                                                    className="shrink-0 border-[#C5E0DC] text-[#1A2E2C]"
                                                    title={t('admin.actions.view')}
                                                    onClick={() => onInspectAuction(auction)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">{t('admin.actions.view')}</span>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon-sm"
                                                    className="shrink-0 bg-[#E05252] text-white hover:bg-[#C73F3F]"
                                                    disabled={deletingAuctionId === auction.id}
                                                    title={deletingAuctionId === auction.id ? t('admin.actions.deleting') : t('admin.actions.delete')}
                                                    onClick={() => onDeleteAuction(auction)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">{deletingAuctionId === auction.id ? t('admin.actions.deleting') : t('admin.actions.delete')}</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

function formatDate(value, locale) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
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

function getCompactStatusLabel(code, t) {
    if (code === 'FAILED_BELOW_RESERVE') {
        return t('admin.status.failedCompact');
    }

    if (code === 'ENDED') {
        return t('admin.status.ended');
    }

    if (code === 'PENDING') {
        return t('admin.status.pending');
    }

    return t('admin.status.active');
}
