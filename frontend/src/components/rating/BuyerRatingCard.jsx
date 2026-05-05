import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StarRating from './StarRating';

export default function BuyerRatingCard({ rating, transaction }) {
    const { t, i18n } = useTranslation('rating');
    const isAr = i18n.language === 'ar';

    const formattedDate = format(
        new Date(rating.submittedAt),
        'PPP',
        { locale: isAr ? ar : undefined }
    );

    return (
        <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">
                    {t('card.title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">{t('card.buyer')}:</span> {transaction.buyerName}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">{t('card.auction')}:</span> {transaction.auctionTitle}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">{t('card.finalPrice')}:</span> {transaction.finalPrice}
                    </p>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-4">
                    <p className="text-sm font-medium text-gray-700">
                        {t('card.ratingLabel')}
                    </p>
                    <StarRating
                        rating={rating.rating}
                        readOnly={true}
                        size="md"
                    />
                </div>

                {rating.comment && (
                    <div className="space-y-2 border-t border-gray-100 pt-4">
                        <p className="text-sm font-medium text-gray-700">
                            {t('card.commentLabel')}
                        </p>
                        <p className={`text-sm text-gray-600 leading-relaxed ${isAr ? 'text-right' : 'text-left'}`}>
                            {rating.comment}
                        </p>
                    </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500">
                        {t('card.submittedOn')} {formattedDate}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

