import React from "react";
import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  readonly message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading products...",
}) => {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <span className={styles.message}>{message}</span>
    </div>
  );
};
