import { useCountdown } from '@/hooks/useCountdown';
import { useTranslation } from 'react-i18next';

export default function CountdownTimer({ targetDate, mode = 'end' }) {
    const { t } = useTranslation('common');
    const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);

    if (expired) {
        if (mode === 'start') {
            return null;
        }

        return (
            <span className="text-[#E05252] font-bold text-sm">
                {t('auctionEnded')}
            </span>
        );
    }

    const pad = (n) => String(n).padStart(2, '0');

    return (
        <div className="flex w-full items-center justify-center gap-2 font-bold text-[#1A2E2C]" dir="ltr">
            <Unit value={pad(days)} label={t('days')} />
            <Separator />
            <Unit value={pad(hours)} label={t('hours')} />
            <Separator />
            <Unit value={pad(minutes)} label={t('minutes')} />
            <Separator />
            <Unit value={pad(seconds)} label={t('seconds')} />
        </div>
    );
}

function Unit({ value, label }) {
    return (
        <div className="flex flex-col items-center">
      <span className="bg-[#F4FAFA] border border-[#C5E0DC] rounded-lg px-2 py-1 text-base text-[#2A9D8F] min-w-[36px] text-center">
        {value}
      </span>
            <span className="text-[#6B9E99] font-light text-xs mt-1">{label}</span>
        </div>
    );
}

function Separator() {
    return <span className="text-[#C5E0DC] font-bold text-lg mb-4">:</span>;
}