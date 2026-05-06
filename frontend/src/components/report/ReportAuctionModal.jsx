import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flag } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { submitReport } from '@/services/reportService';

export default function ReportAuctionModal({ open, onOpenChange, auction }) {
    const { t, i18n } = useTranslation('common');
    const isAr = i18n.language === 'ar';
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!auction?.id) return;
        setLoading(true);
        try {
            await submitReport(auction.id, message.trim() || null);
            toast.success(t('report.submitSuccess'));
            setMessage('');
            onOpenChange(false);
        } catch (error) {
            toast.error(error?.message || t('report.submitError'));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setMessage('');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                dir={i18n.dir()}
                className="max-w-md border-[#A8CFC8] bg-gradient-to-br from-[#F1FBF8] via-[#FBFEFD] to-[#EEF6FF] shadow-[0_24px_70px_rgba(26,46,44,0.22)]"
            >
                <DialogHeader className="rounded-2xl border border-[#D8ECE8] bg-gradient-to-r from-[#C73F3F] to-[#E05252] px-5 py-4 text-start shadow-sm">
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <Flag className="h-4 w-4 shrink-0" />
                        {t('report.modalTitle')}
                    </DialogTitle>
                    <DialogDescription className="text-white/80 text-start">
                        {t('report.modalDescription')}
                    </DialogDescription>
                </DialogHeader>

                {auction && (
                    <div className="rounded-xl border border-[#D7E8E5] bg-[#F8FCFB] px-4 py-3 text-sm">
                        <p className="text-[#6B9E99]">{t('report.listing')}</p>
                        <p className="mt-1 font-semibold text-[#1A2E2C] break-words">{auction.title}</p>
                        {auction.sellerName && (
                            <p className="mt-0.5 text-[#5F7D79]">
                                {t('report.seller')}: <span className="font-medium">{auction.sellerName}</span>
                            </p>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1A2E2C]">
                        {t('report.reasonLabel')}
                        <span className="ml-1 text-[#6B9E99] font-normal">({t('report.optional')})</span>
                    </label>
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t('report.reasonPlaceholder')}
                        maxLength={1000}
                        rows={4}
                        className="resize-none border-[#C5E0DC] bg-white focus-visible:ring-[#2A9D8F]"
                        dir={isAr ? 'rtl' : 'ltr'}
                    />
                    <p className="text-right text-xs text-[#6B9E99]">{message.length}/1000</p>
                </div>

                <div className="flex gap-3 pt-1">
                    <Button
                        variant="outline"
                        className="flex-1 border-[#C5E0DC] text-[#5F7D79] hover:bg-[#F4FAFA]"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        className="flex-1 bg-[#E05252] text-white hover:bg-[#C73F3F]"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? t('report.submitting') : t('report.submitButton')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
