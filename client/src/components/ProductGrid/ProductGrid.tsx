import React from "react";
import type { Product } from "../../types/index.js";
import { ProductCard } from "../ProductCard/ProductCard.js";
import styles from "./ProductGrid.module.css";

interface ProductGridProps {
  readonly products: Product[];
  readonly title?: string;
  readonly subtitle?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  title,
  subtitle,
}) => {
  return (
    <section className={styles.section}>
      {(title || subtitle) && (
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}
      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
