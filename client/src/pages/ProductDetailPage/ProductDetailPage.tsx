import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct } from "../../hooks/useProduct.js";
import { StarRating } from "../../components/StarRating/StarRating.js";
import { LoadingSpinner } from "../../components/LoadingSpinner/LoadingSpinner.js";
import { ErrorBanner } from "../../components/ErrorBanner/ErrorBanner.js";
import { EmptyState } from "../../components/EmptyState/EmptyState.js";
import styles from "./ProductDetailPage.module.css";

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : NaN;

  const { data: product, isLoading, isError, error, refetch } = useProduct(numericId);

  useEffect(() => {
    if (product) {
      document.title = `${product.title} — Product Catalogue`;
    } else {
      document.title = "Product Detail — Product Catalogue";
    }
  }, [product]);

  if (isNaN(numericId) || numericId <= 0) {
    return (
      <EmptyState
        message="Invalid Product ID"
        description="The product ID requested is invalid."
        action={
          <Link to="/" className={styles.backButton}>
            Back to Home
          </Link>
        }
      />
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading product details..." />;
  }

  if (isError) {
    return (
      <ErrorBanner
        message={error?.message || "Failed to load product."}
        onRetry={() => refetch()}
      />
    );
  }

  if (!product) {
    return (
      <EmptyState
        message="Product Not Found"
        description="The product you are looking for does not exist in our catalogue."
        action={
          <Link to="/" className={styles.backButton}>
            Back to Home
          </Link>
        }
      />
    );
  }

  return (
    <article className={styles.container}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link to="/" className={styles.breadcrumbLink}>Home</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link
          to={`/categories/${encodeURIComponent(product.category)}`}
          className={styles.breadcrumbLink}
        >
          {product.category}
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{product.title}</span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.imageColumn}>
          <div className={styles.imageWrapper}>
            <img
              src={product.image}
              alt={product.title}
              className={styles.image}
            />
          </div>
        </div>

        <div className={styles.infoColumn}>
          <span className={styles.category}>{product.category}</span>
          <h1 className={styles.title}>{product.title}</h1>

          <div className={styles.ratingRow}>
            <StarRating
              rate={product.rating.rate}
              count={product.rating.count}
            />
          </div>

          <div className={styles.priceRow}>
            <span className={styles.price}>${product.price.toFixed(2)}</span>
            <span className={styles.stockStatus}>In Stock</span>
          </div>

          <div className={styles.descriptionSection}>
            <h2 className={styles.descriptionHeading}>About This Product</h2>
            <p className={styles.descriptionText}>{product.description}</p>
          </div>

          <div className={styles.actions}>
            <Link
              to={`/products/${product.id}/enquire`}
              className={styles.enquireButton}
            >
              Enquire About This Product
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};
