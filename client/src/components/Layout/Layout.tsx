import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header.js";
import { Footer } from "./Footer.js";
import styles from "./Layout.module.css";

export const Layout: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};
