import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReceiptText } from 'lucide-react';
import { toast } from 'sonner';
import { generateReceipt } from '@/services/receiptService';
import PaymentButton from '@/components/payment/PaymentButton';
import { resolvePaymentStatus } from '@/components/payment/PaymentStatusIndicator';

export default function WinnerPaymentAction({
    auctionId,
    status,
    isPaid,
    paidAt,
    endDate,
    disabled = false,
    stopPropagation = false,
    payLabel,
    receiptLabel,
    shortPayLabel = false,
    payClassName = '',
    receiptClassName = '',
}) {
    const { i18n } = useTranslation('common');
    const [receiptLoading, setReceiptLoading] = useState(false);
    const isAr = i18n.language === 'ar';

    const resolvedStatus = resolvePaymentStatus({
        status,
        isPaid,
        paidAt,
        endDate,
    });

    const handleGenerateReceipt = async (event) => {
        if (stopPropagation) {
            event.stopPropagation();
        }

        setReceiptLoading(true);
        try {
            await generateReceipt(auctionId, i18n.language);
            toast.success(isAr ? 'تم تحميل الإيصال بنجاح' : 'Receipt downloaded successfully!');
        } catch (err) {
            toast.error(err.message || (isAr ? 'فشل تحميل الإيصال' : 'Failed to generate receipt'));
        } finally {
            setReceiptLoading(false);
        }
    };

    if (resolvedStatus === 'paid') {
        return (
            <button
                type="button"
                onClick={handleGenerateReceipt}
                disabled={disabled || receiptLoading}
                className={receiptClassName}
            >
                <span className="inline-flex w-full items-center justify-center gap-2">
                    <ReceiptText className="h-4 w-4 shrink-0" />
                    <span>
                        {receiptLoading
                            ? (isAr ? 'جاري التحميل...' : 'Downloading...')
                            : (receiptLabel || (isAr ? 'عرض الإيصال' : 'View Receipt'))}
                    </span>
                </span>
            </button>
        );
    }

    return (
        <PaymentButton
            auctionId={auctionId}
            disabled={disabled || receiptLoading}
            stopPropagation={stopPropagation}
            shortLabel={shortPayLabel}
            label={payLabel}
            unstyled
            className={payClassName}
        />
    );
}
