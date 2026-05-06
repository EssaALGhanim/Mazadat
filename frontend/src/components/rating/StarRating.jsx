import { Star } from 'lucide-react';

export default function StarRating({
    rating = 0,
    onRatingChange,
    readOnly = false,
    size = 'md',
    interactive = true
}) {
    const sizeMap = {
        sm: 'size-4',
        md: 'size-6',
        lg: 'size-8',
    };

    const starSize = sizeMap[size] || sizeMap.md;

    return (
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => !readOnly && interactive && onRatingChange?.(star)}
                    disabled={readOnly || !interactive}
                    className={`transition-all ${!readOnly && interactive ? 'cursor-pointer hover:scale-110' : ''} ${readOnly || !interactive ? 'cursor-default' : ''}`}
                    aria-label={`Rate ${star} stars`}
                >
                    <Star
                        className={`${starSize} ${
                            star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                        } transition-colors`}
                    />
                </button>
            ))}
        </div>
    );
}
