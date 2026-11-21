import React, { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSearchResults } from "../../hooks/useProducts.js";
import { ProductGrid } from "../../components/ProductGrid/ProductGrid.js";
import { LoadingSpinner } from "../../components/LoadingSpinner/LoadingSpinner.js";
import { ErrorBanner } from "../../components/ErrorBanner/ErrorBanner.js";
import { EmptyState } from "../../components/EmptyState/EmptyState.js";
import styles from "./SearchResultsPage.module.css";

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  useEffect(() => {
    document.title = query
      ? `Search: "${query}" — Product Catalogue`
      : "Search Products — Product Catalogue";
  }, [query]);

  const { data: products, isLoading, isError, error, refetch } = useSearchResults(query);

  if (!query.trim()) {
    return (
      <EmptyState
        message="Search Products"
        description="Enter a keyword in the search bar above to look up products by title or description."
      />
    );
  }

  if (isLoading) {
    return <LoadingSpinner message={`Searching for "${query}"...`} />;
  }

  if (isError) {
    return (
      <ErrorBanner
        message={error?.message || "Search failed. Please try again."}
        onRetry={() => refetch()}
      />
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        message={`No products matching "${query}"`}
        description="Check your spelling or try broader search terms."
        action={
          <Link to="/" className={styles.homeLink}>
            Browse All Products
          </Link>
        }
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Search Results for <span className={styles.query}>"{query}"</span>
        </h1>
        <p className={styles.subtitle}>
          Found {products.length} {products.length === 1 ? "product" : "products"}
        </p>
      </div>

      <ProductGrid products={products} />
    </div>
  );
};
