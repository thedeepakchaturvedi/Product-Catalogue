import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useProductsByCategory } from "../../hooks/useProducts.js";
import { ProductGrid } from "../../components/ProductGrid/ProductGrid.js";
import { LoadingSpinner } from "../../components/LoadingSpinner/LoadingSpinner.js";
import { ErrorBanner } from "../../components/ErrorBanner/ErrorBanner.js";
import { EmptyState } from "../../components/EmptyState/EmptyState.js";
import styles from "./CategoryPage.module.css";

export const CategoryPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const categoryName = name ? decodeURIComponent(name) : "";

  useEffect(() => {
    document.title = categoryName
      ? `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} — Product Catalogue`
      : "Category — Product Catalogue";
  }, [categoryName]);

  const { data, isLoading, isError, error, refetch } = useProductsByCategory(categoryName);

  if (isLoading) {
    return <LoadingSpinner message={`Loading products in ${categoryName}...`} />;
  }

  if (isError) {
    return (
      <ErrorBanner
        message={error?.message || "Failed to load category products."}
        onRetry={() => refetch()}
      />
    );
  }

  if (!data || (data.topRated.length === 0 && data.other.length === 0)) {
    return (
      <EmptyState
        message={`No products found in "${categoryName}"`}
        description="Try exploring other categories or returning to the home page."
        action={
          <Link to="/" className={styles.homeLink}>
            Back to Home
          </Link>
        }
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link to="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{data.category}</span>
        </nav>
        <h1 className={styles.title}>{data.category}</h1>
        <p className={styles.countText}>
          Showing {data.topRated.length + data.other.length} products
        </p>
      </div>

      {data.topRated.length > 0 && (
        <ProductGrid
          products={data.topRated}
          title="Top Rated in this Category"
          subtitle="Customer favourites with highest satisfaction"
        />
      )}

      {data.other.length > 0 && (
        <ProductGrid
          products={data.other}
          title="More Products"
          subtitle={`Additional items in ${data.category}`}
        />
      )}
    </div>
  );
};
