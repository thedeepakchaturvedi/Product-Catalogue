import React from "react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  readonly message: string;
  readonly description?: string;
  readonly action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  description,
  action,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.icon} aria-hidden="true">
        📦
      </div>
      <h3 className={styles.title}>{message}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};
