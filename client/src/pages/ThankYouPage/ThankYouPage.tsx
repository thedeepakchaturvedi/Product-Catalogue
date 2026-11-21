import React, { useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import styles from "./ThankYouPage.module.css";

interface LocationState {
  submitted?: boolean;
  productTitle?: string;
}

export const ThankYouPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  useEffect(() => {
    document.title = "Thank You! — Product Catalogue";
    // Navigation guard: if accessed without form submission, redirect home
    if (!state?.submitted) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  if (!state?.submitted) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconCircle} aria-hidden="true">
          ✓
        </div>
        <h1 className={styles.title}>Thank You!</h1>
        <p className={styles.message}>
          Your enquiry has been received successfully.
        </p>
        {state.productTitle && (
          <p className={styles.productNote}>
            Regarding: <strong>{state.productTitle}</strong>
          </p>
        )}
        <p className={styles.subtext}>
          Our sales representative has been notified via email and will reach out to your provided contact details shortly.
        </p>

        <div className={styles.actions}>
          <Link to="/" className={styles.primaryButton}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
