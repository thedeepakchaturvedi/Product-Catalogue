import React from "react";
import styles from "./Footer.module.css";

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.copy}>
          © {new Date().getFullYear()} Product Catalogue Proof of Concept. All rights reserved.
        </p>
        <p className={styles.disclaimer}>
          Powered by Fake Store API proxy and Nodemailer.
        </p>
      </div>
    </footer>
  );
};
