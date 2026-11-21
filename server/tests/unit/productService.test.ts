import { describe, it, expect, beforeEach } from "vitest";
import { ProductService } from "../../src/services/productService.js";
import { Cache } from "../../src/providers/cache.js";
import type { Product, ProductProvider } from "../../src/types/index.js";

const mockProducts: Product[] = [
  {
    id: 1,
    title: "Fjallraven Backpack",
    price: 109.95,
    description: "Everyday backpack with laptop sleeve",
    category: "men's clothing",
    image: "https://example.com/1.jpg",
    rating: { rate: 3.9, count: 120 },
  },
  {
    id: 2,
    title: "Casual Slim Fit T-Shirts",
    price: 22.3,
    description: "Slim-fitting style, contrast raglan long sleeve",
    category: "men's clothing",
    image: "https://example.com/2.jpg",
    rating: { rate: 4.1, count: 259 },
  },
  {
    id: 3,
    title: "Cotton Jacket",
    price: 55.99,
    description: "Great outerwear jackets for Spring/Autumn/Winter",
    category: "men's clothing",
    image: "https://example.com/3.jpg",
    rating: { rate: 4.7, count: 500 },
  },
  {
    id: 4,
    title: "Solid Gold Petite Micropave",
    price: 168,
    description: "Satisfaction guaranteed ring",
    category: "jewelery",
    image: "https://example.com/4.jpg",
    rating: { rate: 4.6, count: 400 },
  },
  {
    id: 5,
    title: "White Gold Princess",
    price: 9.99,
    description: "Classic created wedding engagement diamond solitaire ring",
    category: "jewelery",
    image: "https://example.com/5.jpg",
    rating: { rate: 4.6, count: 350 }, // same rate as #4, lower count
  },
  {
    id: 6,
    title: "WD 2TB Gaming Drive",
    price: 64,
    description: "Expand your PS4 gaming experience",
    category: "electronics",
    image: "https://example.com/6.jpg",
    rating: { rate: 4.6, count: 400 }, // same rate and count as #4, higher id
  },
  {
    id: 7,
    title: "SanDisk 1TB SSD",
    price: 109,
    description: "High performance SSD storage",
    category: "electronics",
    image: "https://example.com/7.jpg",
    rating: { rate: 2.9, count: 470 },
  },
];

class MockProductProvider implements ProductProvider {
  constructor(private readonly products: Product[]) {}
  async getAllProducts(): Promise<Product[]> {
    return [...this.products];
  }
}

describe("ProductService", () => {
  let service: ProductService;
  let cache: Cache;

  beforeEach(() => {
    cache = new Cache();
    service = new ProductService(new MockProductProvider(mockProducts), cache, 10000);
  });

  it("fetches top-rated products with correct tie-breaking order", async () => {
    const topRated = await service.getTopRated(5);
    expect(topRated).toHaveLength(5);

    // Expected order:
    // 1. #3 (rate: 4.7, count: 500)
    // 2. #4 (rate: 4.6, count: 400, id: 4)
    // 3. #6 (rate: 4.6, count: 400, id: 6) - tie break by id asc
    // 4. #5 (rate: 4.6, count: 350) - tie break by count desc
    // 5. #2 (rate: 4.1, count: 259)
    expect(topRated[0]!.id).toBe(3);
    expect(topRated[1]!.id).toBe(4);
    expect(topRated[2]!.id).toBe(6);
    expect(topRated[3]!.id).toBe(5);
    expect(topRated[4]!.id).toBe(2);
  });

  it("respects limit parameter in getTopRated", async () => {
    const top3 = await service.getTopRated(3);
    expect(top3).toHaveLength(3);
    expect(top3[0]!.id).toBe(3);
    expect(top3[1]!.id).toBe(4);
    expect(top3[2]!.id).toBe(6);
  });

  it("returns product by ID if found", async () => {
    const product = await service.getById(1);
    expect(product).not.toBeNull();
    expect(product?.title).toBe("Fjallraven Backpack");
  });

  it("returns null for non-existent product ID", async () => {
    const product = await service.getById(9999);
    expect(product).toBeNull();
  });

  it("returns unique sorted categories", async () => {
    const categories = await service.getCategories();
    expect(categories).toEqual(["electronics", "jewelery", "men's clothing"]);
  });

  it("returns products by category split into topRated (max 3) and other", async () => {
    const result = await service.getByCategory("men's clothing");
    expect(result).not.toBeNull();
    expect(result?.category).toBe("men's clothing");
    // 3 items in men's clothing: #3 (4.7), #2 (4.1), #1 (3.9)
    expect(result?.topRated).toHaveLength(3);
    expect(result?.topRated[0]!.id).toBe(3);
    expect(result?.topRated[1]!.id).toBe(2);
    expect(result?.topRated[2]!.id).toBe(1);
    expect(result?.other).toHaveLength(0);
  });

  it("handles case-insensitive category lookup", async () => {
    const result = await service.getByCategory("ELECTRONICS");
    expect(result).not.toBeNull();
    expect(result?.topRated).toHaveLength(2);
    expect(result?.topRated[0]!.id).toBe(6);
    expect(result?.topRated[1]!.id).toBe(7);
  });

  it("returns null for unknown category", async () => {
    const result = await service.getByCategory("unknown-category");
    expect(result).toBeNull();
  });

  it("searches matching text in title", async () => {
    const results = await service.search("Backpack");
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe(1);
  });

  it("searches matching text in description", async () => {
    const results = await service.search("outerwear");
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe(3);
  });

  it("is case-insensitive and trims search query", async () => {
    const results = await service.search("  PETITE  ");
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe(4);
  });

  it("returns empty array for non-matching search", async () => {
    const results = await service.search("xylophone");
    expect(results).toHaveLength(0);
  });

  it("returns empty array for empty or whitespace-only search query", async () => {
    const results = await service.search("   ");
    expect(results).toHaveLength(0);
  });

  it("uses cached products on subsequent calls", async () => {
    let callCount = 0;
    const provider: ProductProvider = {
      async getAllProducts() {
        callCount++;
        return mockProducts;
      },
    };

    const cachedService = new ProductService(provider, new Cache(), 5000);
    await cachedService.getAllProducts();
    await cachedService.getTopRated(2);
    await cachedService.getCategories();
    await cachedService.getById(1);

    expect(callCount).toBe(1);
  });
});
