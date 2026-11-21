import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  readonly initialQuery?: string;
  readonly placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = "",
  placeholder = "Search products by name or description...",
}) => {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} role="search">
      <label htmlFor="search-input" className={styles.srOnly}>
        Search products
      </label>
      <input
        id="search-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
        maxLength={200}
        autoComplete="off"
      />
      <button type="submit" className={styles.button} aria-label="Submit search">
        Search
      </button>
    </form>
  );
};
