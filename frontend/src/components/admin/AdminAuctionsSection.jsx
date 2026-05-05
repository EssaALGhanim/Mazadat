import { Eye, Gavel, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

            <CardContent className="p-6">
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(6)].map((_, index) => (
                            <Skeleton key={index} className="h-12 w-full bg-[#EAF3F1]" />
                        ))}
                    </div>
                ) : error ? (
                    <EmptyState title={t('admin.errors.auctionsLoadTitle')} description={error} />
                ) : !hasAuctions ? (
                    <EmptyState title={t('admin.auctions.emptyTitle')} description={t('admin.auctions.emptyDescription')} />
                ) : !hasResults ? (
                    <EmptyState title={t('admin.auctions.emptySearchTitle')} description={t('admin.auctions.emptySearchDescription')} />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="border-[#E4EFED] hover:bg-transparent">
                                <TableHead className="text-[#6B9E99]">{t('admin.auctions.columns.id')}</TableHead>
                                <TableHead className="text-[#6B9E99]">{t('admin.auctions.columns.title')}</TableHead>
                                <TableHead className="text-[#6B9E99]">{t('admin.auctions.columns.seller')}</TableHead>
                                <TableHead className="text-[#6B9E99]">{t('admin.auctions.columns.auctionHouse')}</TableHead>
                                <TableHead className="text-[#6B9E99]">{t('admin.auctions.columns.status')}</TableHead>
                                <TableHead className="text-[#6B9E99]">{t('admin.auctions.columns.currentPrice')}</TableHead>
                                <TableHead className="text-[#6B9E99]">{t('admin.auctions.columns.bidCount')}</TableHead>
                                <TableHead className="text-[#6B9E99]">{t('admin.auctions.columns.endDate')}</TableHead>
                                <TableHead className="text-right text-[#6B9E99]">{t('admin.auctions.columns.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAuctions.map((auction) => {
                                const statusMeta = getAuctionStatusMeta(auction);
                                return (
                                    <TableRow key={auction.id} className="border-[#EEF5F3]">
                                        <TableCell className="font-medium text-[#1A2E2C]">#{auction.id}</TableCell>
                                        <TableCell className="max-w-[220px] truncate text-[#1A2E2C]">{auction.title || '—'}</TableCell>
                                        <TableCell className="max-w-[160px] truncate text-[#5F7D79]">{auction.sellerName || '—'}</TableCell>
                                        <TableCell className="max-w-[160px] truncate text-[#5F7D79]">{auction.auctionHouseName || '—'}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.bgClass} ${statusMeta.textClass}`}>
                                                {statusMeta.label}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-[#1A2E2C]">{formatCurrency(auction.currentPrice ?? auction.startingPrice, i18n.language)}</TableCell>
                                        <TableCell className="text-[#5F7D79]">{auction.bidCount ?? 0}</TableCell>
                                        <TableCell className="text-[#5F7D79]">{formatDate(auction.endDate, i18n.language)}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-[#C5E0DC] text-[#1A2E2C]"
                                                    onClick={() => onInspectAuction(auction)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span>{t('admin.actions.view')}</span>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={deletingAuctionId === auction.id}
                                                    onClick={() => onDeleteAuction(auction)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span>{deletingAuctionId === auction.id ? t('admin.actions.deleting') : t('admin.actions.delete')}</span>
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
