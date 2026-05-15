import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';

export default function PaymentButton({
    auctionId,
    disabled = false,
    className = '',
    shortLabel = false,
    label,
    stopPropagation = false,
    showIcon = true,
    unstyled = false,
}) {
    const { i18n } = useTranslation('common');
    const navigate = useNavigate();
    const isAr = i18n.language === 'ar';

    const buttonLabel = label || (shortLabel
        ? (isAr ? 'ادفع' : 'Pay')
        : (isAr ? 'ادفع الآن' : 'Pay Now'));

    const defaultClassName = 'w-full bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm';
    const mergedClassName = unstyled
        ? className
        : `${defaultClassName} ${className}`.trim();

    const handleClick = (event) => {
        if (stopPropagation) {
            event.stopPropagation();
        }

        navigate(`/auction/${auctionId}/pay`);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className={mergedClassName}
        >
            <span className="inline-flex w-full items-center justify-center gap-2">
                {showIcon && <CreditCard className="h-4 w-4 shrink-0" />}
                <span>{buttonLabel}</span>
            </span>
        </button>
    );
}