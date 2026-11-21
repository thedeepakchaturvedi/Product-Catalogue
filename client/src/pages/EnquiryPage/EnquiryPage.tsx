import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct } from "../../hooks/useProduct.js";
import { EnquiryForm } from "../../components/EnquiryForm/EnquiryForm.js";
import { LoadingSpinner } from "../../components/LoadingSpinner/LoadingSpinner.js";
import { ErrorBanner } from "../../components/ErrorBanner/ErrorBanner.js";
import { EmptyState } from "../../components/EmptyState/EmptyState.js";
import styles from "./EnquiryPage.module.css";

export const EnquiryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : NaN;

  const { data: product, isLoading, isError, error, refetch } = useProduct(numericId);

  useEffect(() => {
    document.title = product
      ? `Enquire: ${product.title} — Product Catalogue`
      : "Submit Enquiry — Product Catalogue";
  }, [product]);

  if (isNaN(numericId) || numericId <= 0) {
    return (
      <EmptyState
        message="Invalid Product"
        description="The product ID provided is invalid."
        action={
          <Link to="/" className={styles.homeLink}>
            Return Home
          </Link>
        }
      />
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading product information..." />;
  }

  if (isError) {
    return (
      <ErrorBanner
        message={error?.message || "Failed to load product details."}
        onRetry={() => refetch()}
      />
    );
  }

  if (!product) {
    return (
      <EmptyState
        message="Product Not Found"
        description="Cannot submit an enquiry for a product that does not exist."
        action={
          <Link to="/" className={styles.homeLink}>
            Return Home
          </Link>
        }
      />
    );
  }

  return (
    <div className={styles.container}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link to="/" className={styles.breadcrumbLink}>Home</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link to={`/products/${product.id}`} className={styles.breadcrumbLink}>
          {product.title}
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>Enquiry</span>
      </nav>

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.badge}>Product Enquiry</span>
          <h1 className={styles.title}>Send an Enquiry</h1>
          <p className={styles.subtitle}>
            Interested in <strong>{product.title}</strong>? Fill out your contact details below and our sales team will reach out directly.
          </p>
        </div>

        <div className={styles.productSnippet}>
          <img
            src={product.image}
            alt={product.title}
            className={styles.productImage}
          />
          <div className={styles.snippetDetails}>
            <span className={styles.snippetTitle}>{product.title}</span>
            <span className={styles.snippetPrice}>${product.price.toFixed(2)}</span>
          </div>
        </div>

        <EnquiryForm productId={product.id} productTitle={product.title} />
      </div>
    </div>
  );
};
