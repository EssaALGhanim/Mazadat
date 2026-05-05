import { Eye, Search, Trash2, UserX } from 'lucide-react';
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
            <UserX className="mb-4 h-10 w-10 text-[#6B9E99]" />
            <p className="text-lg font-semibold text-[#1A2E2C]">{title}</p>
            <p className="mt-2 max-w-xl text-sm text-[#6B9E99]">{description}</p>
        </div>
    );
}

export default function AdminUsersSection({
    users,
    loading,
    error,
    deletingUserId,
    onInspectUser,
    onDeleteUser,
}) {
    const { t, i18n } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const isAr = i18n.language === 'ar';

    const filteredUsers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return users.filter((user) => {
            const role = String(user?.role || '').toUpperCase();
            if (roleFilter !== 'ALL' && role !== roleFilter) return false;
            if (!query) return true;

            return [
                user?.id,
                user?.Id,
                user?.username,
                user?.email,
                user?.role,
            ].some((value) => String(value || '').toLowerCase().includes(query));
        });
    }, [users, searchQuery, roleFilter]);

    const hasUsers = users.length > 0;
    const hasResults = filteredUsers.length > 0;

    return (
        <Card className="border-[#D7E8E5] bg-white shadow-sm">
            <CardHeader className="gap-4 border-b border-[#E4EFED]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <CardTitle className="text-[#1A2E2C]">{t('admin.users.title')}</CardTitle>
                        <CardDescription className="text-[#6B9E99]">
                            {t('admin.users.description')}
                        </CardDescription>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative min-w-0 sm:w-72">
                            <Search className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B9E99] ${isAr ? 'right-3' : 'left-3'}`} />
                            <Input
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder={t('admin.users.searchPlaceholder')}
                                className={`border-[#C5E0DC] bg-white ${isAr ? 'pr-9' : 'pl-9'}`}
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full border-[#C5E0DC] bg-white sm:w-44">
                                <SelectValue placeholder={t('admin.users.roleFilter')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">{t('admin.filters.allRoles')}</SelectItem>
                                <SelectItem value="BUYER">{t('admin.roles.buyer')}</SelectItem>
                                <SelectItem value="SELLER">{t('admin.roles.seller')}</SelectItem>
                                <SelectItem value="ADMIN">{t('admin.roles.admin')}</SelectItem>
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
                    <EmptyState title={t('admin.errors.usersLoadTitle')} description={error} />
                ) : !hasUsers ? (
                    <EmptyState title={t('admin.users.emptyTitle')} description={t('admin.users.emptyDescription')} />
                ) : !hasResults ? (
                    <EmptyState title={t('admin.users.emptySearchTitle')} description={t('admin.users.emptySearchDescription')} />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="border-[#E4EFED] hover:bg-transparent">
                                <TableHead className="text-[#6B9E99]">{t('admin.users.columns.id')}</TableHead>
                                <TableHead className="text-[#6B9E99]">{t('username')}</TableHead>
                                <TableHead className="text-[#6B9E99]">{t('email')}</TableHead>
                                <TableHead className="text-[#6B9E99]">{t('admin.users.columns.role')}</TableHead>
                                <TableHead className="text-[#6B9E99]">{t('admin.users.columns.created')}</TableHead>
                                <TableHead className="text-[#6B9E99]">{t('admin.users.columns.updated')}</TableHead>
                                <TableHead className="text-right text-[#6B9E99]">{t('admin.users.columns.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => {
                                const userId = user?.id ?? user?.Id;
                                return (
                                    <TableRow key={userId} className="border-[#EEF5F3]">
                                        <TableCell className="font-medium text-[#1A2E2C]">#{userId}</TableCell>
                                        <TableCell className="max-w-[180px] truncate text-[#1A2E2C]">{user?.username || '-'}</TableCell>
                                        <TableCell className="max-w-[220px] truncate text-[#5F7D79]">{user?.email || '—'}</TableCell>
                                        <TableCell className="text-[#1A2E2C]">{t(`admin.roles.${String(user?.role || '').toLowerCase()}`, user?.role || '—')}</TableCell>
                                        <TableCell className="text-[#5F7D79]">{formatDate(user?.createdAt, i18n.language)}</TableCell>
                                        <TableCell className="text-[#5F7D79]">{formatDate(user?.updatedAt, i18n.language)}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-[#C5E0DC] text-[#1A2E2C]"
                                                    onClick={() => onInspectUser(user)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span>{t('admin.actions.view')}</span>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={deletingUserId === userId}
                                                    onClick={() => onDeleteUser(user)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span>{deletingUserId === userId ? t('admin.actions.deleting') : t('admin.actions.delete')}</span>
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
