"use client";

import { Star } from "lucide-react";
import { Button } from "~/components/ui/button";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  editable?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  rating,
  onRatingChange,
  editable = false,
  size = "md",
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = rating >= i;
    const halfFilled = rating >= i - 0.5 && rating < i;

    stars.push(
      <Button
        key={i}
        type="button"
        variant="ghost"
        size="sm"
        className="h-auto p-1"
        onClick={() => {
          if (!editable) return;

          // If clicking on the same star, toggle between full and half
          if (rating === i) {
            onRatingChange(i - 0.5);
          } else if (rating === i - 0.5) {
            onRatingChange(i);
          } else {
            onRatingChange(i);
          }
        }}
        disabled={!editable}
      >
        <Star
          className={`${sizeClasses[size]} ${
            filled
              ? "fill-yellow-400 text-yellow-400"
              : halfFilled
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-gray-300"
          }`}
        />
      </Button>,
    );
  }

  return (
    <div className="flex items-center gap-1">
      {stars}
      {editable && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-auto p-1 text-xs"
          onClick={() => onRatingChange(0)}
        >
          Clear
        </Button>
      )}
    </div>
  );
}
