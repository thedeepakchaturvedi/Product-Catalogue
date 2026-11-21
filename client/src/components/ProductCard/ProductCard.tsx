import React from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../types/index.js";
import { StarRating } from "../StarRating/StarRating.js";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  readonly product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <article className={styles.card}>
      <Link
        to={`/products/${product.id}`}
        className={styles.link}
        aria-label={`View details for ${product.title}`}
      >
        <div className={styles.imageContainer}>
          <img
            src={product.image}
            alt={product.title}
            className={styles.image}
            loading="lazy"
          />
        </div>
        <div className={styles.details}>
          <span className={styles.category}>{product.category}</span>
          <h3 className={styles.title} title={product.title}>
            {product.title}
          </h3>
          <div className={styles.ratingRow}>
            <StarRating
              rate={product.rating.rate}
              count={product.rating.count}
            />
          </div>
          <div className={styles.priceRow}>
            <span className={styles.price}>${product.price.toFixed(2)}</span>
            <span className={styles.viewButton}>View Details</span>
          </div>
        </div>
      </Link>
    </article>
  );
};
