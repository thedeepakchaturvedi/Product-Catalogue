import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../api/client.js";

export function useCategories() {
  return useQuery<string[], Error>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
