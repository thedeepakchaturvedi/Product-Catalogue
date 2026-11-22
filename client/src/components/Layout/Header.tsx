import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useCategories } from "../../hooks/useCategories.js";
import { SearchBar } from "../SearchBar/SearchBar.js";
import styles from "./Header.module.css";

export const Header: React.FC = () => {
  const { data: categories, isLoading } = useCategories();

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo} aria-label="Product Catalogue Home">
            <span className={styles.logoIcon}>🛍️</span>
            <span className={styles.logoText}>Catalogue</span>
          </Link>
          <div className={styles.searchWrapper}>
            <SearchBar />
          </div>
        </div>
      </div>
      <nav className={styles.navBar} aria-label="Product categories navigation">
        <div className={styles.container}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                }
              >
                Featured
              </NavLink>
            </li>
            {!isLoading &&
              categories?.map((category) => (
                <li key={category} className={styles.navItem}>
                  <NavLink
                    to={`/categories/${encodeURIComponent(category)}`}
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                    }
                  >
                    {category}
                  </NavLink>
                </li>
              ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};
