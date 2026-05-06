import { Users, Gavel, ShieldCheck, Store, Activity, TimerReset, BadgeDollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap = {
    totalUsers: Users,
    buyersCount: Users,
    sellersCount: Store,
    adminsCount: ShieldCheck,
    totalAuctions: Gavel,
    activeAuctions: Activity,
    endedAuctions: TimerReset,
    totalBids: BadgeDollarSign,
};

export default function AdminOverviewSection({ stats, loading }) {
    const { t } = useTranslation('common');

    const cards = [
        { key: 'totalUsers', label: t('admin.overview.totalUsers') },
        { key: 'buyersCount', label: t('admin.overview.buyers') },
        { key: 'sellersCount', label: t('admin.overview.sellers') },
        { key: 'adminsCount', label: t('admin.overview.admins') },
        { key: 'totalAuctions', label: t('admin.overview.totalAuctions') },
        { key: 'activeAuctions', label: t('admin.overview.activeAuctions') },
        { key: 'endedAuctions', label: t('admin.overview.endedAuctions') },
        { key: 'totalBids', label: t('admin.overview.totalBids') },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
                const Icon = iconMap[card.key];
                return (
                    <Card key={card.key} className="border-[#D7E8E5] bg-white shadow-sm">
                        <CardContent className="flex items-start justify-between p-6">
                            <div className="text-start">
                                <p className="text-sm font-medium text-[#6B9E99]">{card.label}</p>
                                {loading ? (
                                    <Skeleton className="mt-3 h-9 w-24 bg-[#E6F1EF]" />
                                ) : (
                                    <p className="mt-3 text-3xl font-bold text-[#1A2E2C]">
                                        {Number(stats?.[card.key] || 0).toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <div className="rounded-xl bg-[#F4FAFA] p-3 text-[#2A9D8F]">
                                <Icon className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
