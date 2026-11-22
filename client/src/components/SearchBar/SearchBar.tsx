import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { searchProducts } from "../../api/client.js";
import type { Product } from "../../types/index.js";
import styles from "./SearchBar.module.css";

const MIN_CHARS = 3;

interface SearchBarProps {
  readonly initialQuery?: string;
  readonly placeholder?: string;
  /** Debounce delay in ms for suggestion fetching. Default 300. Set to 0 in tests. */
  readonly debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = "",
  placeholder = "Search products by name or description...",
  debounceMs = 300,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track latest fetch to prevent stale responses from overwriting newer ones
  const fetchIdRef = useRef(0);

  // Debounce the query for the suggestions dropdown only
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = query.trim();
    if (trimmed.length < MIN_CHARS) {
      setDebouncedQuery("");
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(trimmed);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Fetch suggestions whenever debounced query changes
  useEffect(() => {
    if (!debouncedQuery) return;

    const currentFetchId = ++fetchIdRef.current;
    setIsLoadingSuggestions(true);

    searchProducts(debouncedQuery)
      .then((results) => {
        // Discard stale responses
        if (currentFetchId !== fetchIdRef.current) return;
        setSuggestions(results.slice(0, 7)); // show max 7 suggestions
        setIsDropdownOpen(results.length > 0);
        setActiveSuggestionIndex(-1);
      })
      .catch(() => {
        if (currentFetchId !== fetchIdRef.current) return;
        setSuggestions([]);
        setIsDropdownOpen(false);
      })
      .finally(() => {
        if (currentFetchId !== fetchIdRef.current) return;
        setIsLoadingSuggestions(false);
      });
  }, [debouncedQuery]);

  // Close dropdown when clicking outside the component
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
    setActiveSuggestionIndex(-1);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      closeDropdown();
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    // Reopen dropdown if user starts typing again (and meets threshold)
    if (e.target.value.trim().length >= MIN_CHARS) {
      setIsDropdownOpen(suggestions.length > 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter": {
        if (activeSuggestionIndex >= 0) {
          e.preventDefault();
          const selected = suggestions[activeSuggestionIndex];
          if (selected) {
            closeDropdown();
            navigate(`/products/${selected.id}`);
          }
        }
        break;
      }
      case "Escape":
        e.preventDefault();
        closeDropdown();
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const handleSuggestionMouseDown = (productId: number) => {
    // mousedown fires before blur — navigate directly
    closeDropdown();
    navigate(`/products/${productId}`);
  };

  const isDropdownVisible =
    isDropdownOpen && suggestions.length > 0 && query.trim().length >= MIN_CHARS;

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <form className={styles.form} onSubmit={handleSubmit} role="search">
        <label htmlFor="search-input" className={styles.srOnly}>
          Search products
        </label>
        <input
          id="search-input"
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 && query.trim().length >= MIN_CHARS) {
              setIsDropdownOpen(true);
            }
          }}
          placeholder={placeholder}
          className={styles.input}
          maxLength={200}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={isDropdownVisible ? "search-suggestions" : undefined}
          aria-activedescendant={
            activeSuggestionIndex >= 0
              ? `suggestion-${activeSuggestionIndex}`
              : undefined
          }
          aria-expanded={isDropdownVisible}
        />
        <button type="submit" className={styles.button} aria-label="Submit search">
          Search
        </button>
      </form>

      {/* Real-time suggestion dropdown */}
      {isDropdownVisible && (
        <ul
          id="search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
          className={styles.dropdown}
        >
          {suggestions.map((product, index) => (
            <li
              key={product.id}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={index === activeSuggestionIndex}
              className={`${styles.suggestionItem} ${
                index === activeSuggestionIndex ? styles.suggestionActive : ""
              }`}
              onMouseDown={() => handleSuggestionMouseDown(product.id)}
              onMouseEnter={() => setActiveSuggestionIndex(index)}
              onMouseLeave={() => setActiveSuggestionIndex(-1)}
            >
              <img
                src={product.image}
                alt=""
                aria-hidden="true"
                className={styles.suggestionImage}
              />
              <span className={styles.suggestionTitle}>{product.title}</span>
              <span className={styles.suggestionPrice}>
                ${product.price.toFixed(2)}
              </span>
            </li>
          ))}
          {/* Footer hint */}
          <li className={styles.dropdownFooter} role="presentation">
            Press <kbd className={styles.kbd}>Enter</kbd> or click{" "}
            <strong>Search</strong> to see all results
          </li>
        </ul>
      )}

      {/* Loading indicator while fetching suggestions (subtle) */}
      {isLoadingSuggestions && query.trim().length >= MIN_CHARS && (
        <div className={styles.loadingBar} aria-hidden="true" />
      )}
    </div>
  );
};
