import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTopRatedProducts } from "../../hooks/useProducts.js";
import { useCategories } from "../../hooks/useCategories.js";
import { ProductGrid } from "../../components/ProductGrid/ProductGrid.js";
import { LoadingSpinner } from "../../components/LoadingSpinner/LoadingSpinner.js";
import { ErrorBanner } from "../../components/ErrorBanner/ErrorBanner.js";
import styles from "./HomePage.module.css";

export const HomePage: React.FC = () => {
  useEffect(() => {
    document.title = "Home — Product Catalogue";
  }, []);

  const { data: products, isLoading, isError, error, refetch } = useTopRatedProducts(5);
  const { data: categories } = useCategories();

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>Curated Collection</span>
          <h1 className={styles.heroTitle}>Discover Our Top-Rated Products</h1>
          <p className={styles.heroSubtitle}>
            Hand-picked selections evaluated and rated by our community. Browse below or explore categories.
          </p>
        </div>
      </section>

      {isLoading && <LoadingSpinner message="Loading top-rated products..." />}

      {isError && (
        <ErrorBanner
          message={error?.message || "Failed to load featured products."}
          onRetry={() => refetch()}
        />
      )}

      {products && products.length > 0 && (
        <ProductGrid
          products={products}
          title="Top 5 Featured Products"
          subtitle="The highest customer rated items in our catalogue"
        />
      )}

      {categories && categories.length > 0 && (
        <section className={styles.categoriesSection}>
          <h2 className={styles.sectionTitle}>Browse by Category</h2>
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/categories/${encodeURIComponent(cat)}`}
                className={styles.categoryCard}
              >
                <span className={styles.catName}>{cat}</span>
                <span className={styles.catArrow}>Explore →</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
