import React, { useState } from 'react';
import { StarIcon } from './icons/StarIcon';

interface StarRatingProps {
  rating: number; // 0-5
  onRate: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, onRate }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center space-x-1 mt-2">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverRating || rating);
        
        return (
          <button
            key={starValue}
            onClick={() => onRate(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            className={`transition-colors duration-200 ${
              isFilled ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'
            } hover:text-amber-300`}
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <StarIcon className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
};