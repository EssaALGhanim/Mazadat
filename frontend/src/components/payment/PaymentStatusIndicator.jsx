import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react';

const DEADLINE_WINDOW_MS = 48 * 60 * 60 * 1000;

function normalizeStatus(value) {
    return String(value || '').trim().toUpperCase();
}

export function resolvePaymentStatus({ status, isPaid, paidAt, endDate }) {
    const normalizedStatus = normalizeStatus(status);

    if (isPaid === true || Boolean(paidAt) || ['PAID', 'COMPLETED', 'SUCCESS'].includes(normalizedStatus)) {
        return 'paid';
    }

    if (['OVERDUE', 'EXPIRED', 'LATE', 'FAILED'].includes(normalizedStatus)) {
        return 'overdue';
    }

    if (['PENDING', 'UNPAID', 'WAITING'].includes(normalizedStatus)) {
        return 'pending';
    }

    const endTime = endDate ? new Date(endDate).getTime() : NaN;
    if (Number.isNaN(endTime)) {
        return 'pending';
    }

    const deadline = endTime + DEADLINE_WINDOW_MS;
    return Date.now() > deadline ? 'overdue' : 'pending';
}

export default function PaymentStatusIndicator({
    status,
    isPaid,
    paidAt,
    endDate,
    className = '',
}) {
    const { i18n } = useTranslation('common');
    const isAr = i18n.language === 'ar';
    const resolvedStatus = resolvePaymentStatus({ status, isPaid, paidAt, endDate });

    const statusConfig = {
        pending: {
            icon: Clock3,
            label: isAr ? 'بانتظار الدفع' : 'Pending Payment',
            classes: 'bg-[#FFF8E8] text-[#9B6B00] border border-[#F5D08A]/70',
        },
        paid: {
            icon: CheckCircle2,
            label: isAr ? 'مدفوع' : 'Paid',
            classes: 'bg-[#EAF7F5] text-[#1A7A6E] border border-[#2A9D8F]/30',
        },
        overdue: {
            icon: AlertTriangle,
            label: isAr ? 'متأخر' : 'Overdue',
            classes: 'bg-[#FFF1F1] text-[#C93C3C] border border-[#E05252]/35',
        },
    };

    const config = statusConfig[resolvedStatus] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${config.classes} ${className}`.trim()}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </span>
    );
}