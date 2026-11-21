import { useQuery } from "@tanstack/react-query";
import { fetchProduct } from "../api/client.js";
import type { Product } from "../types/index.js";

export function useProduct(id: number | null | undefined) {
  return useQuery<Product, Error>({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id as number),
    enabled: typeof id === "number" && !isNaN(id) && id > 0,
    staleTime: 1000 * 60 * 5,
  });
}
