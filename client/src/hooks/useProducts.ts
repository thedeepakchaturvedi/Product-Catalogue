import { useQuery } from "@tanstack/react-query";
import {
  fetchTopRatedProducts,
  fetchProductsByCategory,
  searchProducts,
} from "../api/client.js";
import type { Product, CategoryProducts } from "../types/index.js";

export function useTopRatedProducts(limit = 5) {
  return useQuery<Product[], Error>({
    queryKey: ["products", "top-rated", limit],
    queryFn: () => fetchTopRatedProducts(limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useProductsByCategory(categoryName: string) {
  return useQuery<CategoryProducts, Error>({
    queryKey: ["products", "category", categoryName],
    queryFn: () => fetchProductsByCategory(categoryName),
    enabled: Boolean(categoryName && categoryName.trim().length > 0),
    staleTime: 1000 * 60 * 2,
  });
}

export function useSearchResults(query: string) {
  const cleanQuery = query.trim();
  return useQuery<Product[], Error>({
    queryKey: ["products", "search", cleanQuery],
    queryFn: () => searchProducts(cleanQuery),
    enabled: cleanQuery.length > 0,
    staleTime: 1000 * 60,
  });
}
