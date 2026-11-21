import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = "Page Not Found — Product Catalogue";
  }, []);

  return (
    <div className={styles.container}>
      <span className={styles.code}>404</span>
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.description}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className={styles.homeButton}>
        Back to Home
      </Link>
    </div>
  );
};
