import React from "react";
import styles from "./StarRating.module.css";

interface StarRatingProps {
  readonly rate: number;
  readonly count?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ rate, count }) => {
  const rounded = Math.round(Math.min(Math.max(rate, 0), 5));
  const stars = Array.from({ length: 5 }, (_, i) => i < rounded);

  const label = count !== undefined
    ? `${rate} out of 5 stars, ${count} customer ratings`
    : `${rate} out of 5 stars`;

  return (
    <div className={styles.container} aria-label={label} role="img">
      <div className={styles.stars} aria-hidden="true">
        {stars.map((filled, index) => (
          <span
            key={index}
            className={filled ? styles.starFilled : styles.starEmpty}
          >
            ★
          </span>
        ))}
      </div>
      <span className={styles.score}>{rate.toFixed(1)}</span>
      {count !== undefined && (
        <span className={styles.count}>({count})</span>
      )}
    </div>
  );
};
