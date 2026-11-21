import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HomePage } from "./HomePage.js";
import * as clientApi from "../../api/client.js";

const mockProducts = [
  {
    id: 1,
    title: "Product 1",
    price: 10,
    description: "Desc 1",
    category: "electronics",
    image: "https://example.com/1.jpg",
    rating: { rate: 4.8, count: 100 },
  },
  {
    id: 2,
    title: "Product 2",
    price: 20,
    description: "Desc 2",
    category: "jewelery",
    image: "https://example.com/2.jpg",
    rating: { rate: 4.7, count: 80 },
  },
];

describe("HomePage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it("renders top 5 featured products heading and items", async () => {
    vi.spyOn(clientApi, "fetchTopRatedProducts").mockResolvedValue(mockProducts);
    vi.spyOn(clientApi, "fetchCategories").mockResolvedValue(["electronics", "jewelery"]);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
    expect(screen.getByText("Top 5 Featured Products")).toBeInTheDocument();
    expect(screen.getByText("Browse by Category")).toBeInTheDocument();
  });

  it("displays error banner when API fails", async () => {
    vi.spyOn(clientApi, "fetchTopRatedProducts").mockRejectedValue(
      new Error("Server offline")
    );
    vi.spyOn(clientApi, "fetchCategories").mockResolvedValue([]);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("Server offline")).toBeInTheDocument();
  });
});
