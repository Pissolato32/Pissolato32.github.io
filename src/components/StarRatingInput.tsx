"use client";

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingInputProps {
  totalStars?: number;
  initialRating?: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  className?: string;
  readOnly?: boolean;
}

export function StarRatingInput({
  totalStars = 5,
  initialRating = 0,
  onRatingChange,
  size = 24,
  className,
  readOnly = false,
}: StarRatingInputProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleClick = (newRating: number) => {
    if (readOnly) return;
    const finalRating = rating === newRating ? 0 : newRating; // Allow unsetting by clicking the same star
    setRating(finalRating);
    onRatingChange(finalRating);
  };

  const handleMouseMove = (newHoverRating: number) => {
    if (readOnly) return;
    setHoverRating(newHoverRating);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  return (
    <div className={cn("flex items-center gap-1", className)} onMouseLeave={handleMouseLeave}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        const displayRating = hoverRating || rating;
        
        let fillPercentage = 0;
        if (displayRating >= starValue) {
          fillPercentage = 100;
        } else if (displayRating > index && displayRating < starValue) {
          fillPercentage = (displayRating - index) * 100;
        }

        return (
          <div
            key={starValue}
            className={cn("relative cursor-pointer", readOnly && "cursor-default")}
            onClick={() => handleClick(starValue)}
            onMouseMove={() => handleMouseMove(starValue)}
            aria-label={`Rate ${starValue} out of ${totalStars} stars`}
          >
            <Star
              className="text-muted-foreground"
              size={size}
              strokeWidth={1.5}
            />
            {fillPercentage > 0 && (
              <div
                className="absolute top-0 left-0 h-full overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star
                  className="text-accent" // Neon Green for filled part
                  fill="currentColor"
                  size={size}
                  strokeWidth={1.5}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
