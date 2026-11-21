import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ProductCard } from "./ProductCard.js";
import type { Product } from "../../types/index.js";

const sampleProduct: Product = {
  id: 1,
  title: "Fjallraven Backpack",
  price: 109.95,
  description: "Durable pack for laptops",
  category: "men's clothing",
  image: "https://example.com/backpack.jpg",
  rating: { rate: 4.5, count: 120 },
};

describe("ProductCard Component", () => {
  it("renders product title, price, category, and rating", () => {
    render(
      <BrowserRouter>
        <ProductCard product={sampleProduct} />
      </BrowserRouter>
    );

    expect(screen.getByText("Fjallraven Backpack")).toBeInTheDocument();
    expect(screen.getByText("$109.95")).toBeInTheDocument();
    expect(screen.getByText("men's clothing")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("(120)")).toBeInTheDocument();
  });

  it("links to the product detail page with correct URL", () => {
    render(
      <BrowserRouter>
        <ProductCard product={sampleProduct} />
      </BrowserRouter>
    );

    const link = screen.getByRole("link", {
      name: /view details for fjallraven backpack/i,
    });
    expect(link).toHaveAttribute("href", "/products/1");
  });

  it("renders image with alt text", () => {
    render(
      <BrowserRouter>
        <ProductCard product={sampleProduct} />
      </BrowserRouter>
    );

    const image = screen.getByRole("img", { name: "Fjallraven Backpack" });
    expect(image).toHaveAttribute("src", "https://example.com/backpack.jpg");
  });
});
