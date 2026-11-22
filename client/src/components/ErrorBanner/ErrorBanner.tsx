import React from "react";
import styles from "./ErrorBanner.module.css";

interface ErrorBannerProps {
  readonly message: string;
  readonly onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => {
  return (
    <div className={styles.container} role="alert">
      <div className={styles.iconWrapper} aria-hidden="true">
        ⚠️
      </div>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className={styles.retryButton}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
};
