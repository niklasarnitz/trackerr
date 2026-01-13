import { Star } from "lucide-react";

interface StarRatingDisplayProps {
  readonly rating: number;
}

/**
 * Renders a star rating display (1-5 stars with half-star support)
 */
export function StarRatingDisplay({ rating }: StarRatingDisplayProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = rating >= star;
        const isHalfFilled = rating >= star - 0.5 && rating < star;

        return (
          <Star
            key={star}
            className={`h-4 w-4 ${
              isFilled
                ? "fill-yellow-400 text-yellow-400"
                : isHalfFilled
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "text-gray-300"
            }`}
          />
        );
      })}
    </div>
  );
}
