import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CategoryPage } from "./CategoryPage.js";
import * as clientApi from "../../api/client.js";

const mockCategoryProducts = {
  category: "electronics",
  topRated: [
    {
      id: 1,
      title: "Top Laptop",
      price: 999,
      description: "Fast laptop",
      category: "electronics",
      image: "https://example.com/1.jpg",
      rating: { rate: 4.9, count: 50 },
    },
  ],
  other: [
    {
      id: 2,
      title: "Other Cable",
      price: 15,
      description: "USB cable",
      category: "electronics",
      image: "https://example.com/2.jpg",
      rating: { rate: 3.2, count: 20 },
    },
  ],
};

describe("CategoryPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it("renders top rated and more products sections for category", async () => {
    vi.spyOn(clientApi, "fetchProductsByCategory").mockResolvedValue(
      mockCategoryProducts
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/categories/electronics"]}>
          <Routes>
            <Route path="/categories/:name" element={<CategoryPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("Top Laptop")).toBeInTheDocument();
    expect(screen.getByText("Other Cable")).toBeInTheDocument();
    expect(screen.getByText("Top Rated in this Category")).toBeInTheDocument();
    expect(screen.getByText("More Products")).toBeInTheDocument();
  });

  it("renders empty state when no products in category", async () => {
    vi.spyOn(clientApi, "fetchProductsByCategory").mockResolvedValue({
      category: "empty",
      topRated: [],
      other: [],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/categories/empty"]}>
          <Routes>
            <Route path="/categories/:name" element={<CategoryPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(
      await screen.findByText('No products found in "empty"')
    ).toBeInTheDocument();
  });
});
