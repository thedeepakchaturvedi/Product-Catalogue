import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchResultsPage } from "./SearchResultsPage.js";
import * as clientApi from "../../api/client.js";

const mockResults = [
  {
    id: 1,
    title: "Awesome Backpack",
    price: 49.99,
    description: "Great pack",
    category: "bags",
    image: "https://example.com/bag.jpg",
    rating: { rate: 4.8, count: 120 },
  },
];

describe("SearchResultsPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it("renders matching products for query", async () => {
    vi.spyOn(clientApi, "searchProducts").mockResolvedValue(mockResults);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/search?q=Backpack"]}>
          <Routes>
            <Route path="/search" element={<SearchResultsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("Awesome Backpack")).toBeInTheDocument();
    expect(screen.getByText(/search results for/i)).toBeInTheDocument();
  });

  it("renders empty state when query returns no items", async () => {
    vi.spyOn(clientApi, "searchProducts").mockResolvedValue([]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/search?q=nothing"]}>
          <Routes>
            <Route path="/search" element={<SearchResultsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(
      await screen.findByText('No products matching "nothing"')
    ).toBeInTheDocument();
  });

  it("prompts user to enter query when q param is missing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/search"]}>
          <Routes>
            <Route path="/search" element={<SearchResultsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Search Products")).toBeInTheDocument();
  });
});
