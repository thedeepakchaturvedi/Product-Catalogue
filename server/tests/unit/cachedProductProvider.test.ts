import { describe, it, expect, vi } from "vitest";
import { CachedProductProvider } from "../../src/providers/cachedProductProvider.js";
import { Cache } from "../../src/providers/cache.js";
import type { Product, ProductProvider } from "../../src/types/index.js";

const mockProducts: Product[] = [
  {
    id: 1,
    title: "Test Product",
    price: 99.99,
    description: "Description",
    category: "electronics",
    image: "https://example.com/1.jpg",
    rating: { rate: 4.5, count: 100 },
  },
];

describe("CachedProductProvider (Decorator Pattern)", () => {
  it("fetches from inner provider on initial call and caches result", async () => {
    let fetchCount = 0;
    const innerProvider: ProductProvider = {
      async getAllProducts(): Promise<Product[]> {
        fetchCount++;
        return mockProducts;
      },
    };

    const cache = new Cache();
    const provider = new CachedProductProvider(innerProvider, cache, 60000);

    const firstResult = await provider.getAllProducts();
    expect(firstResult).toEqual(mockProducts);
    expect(fetchCount).toBe(1);

    // Second call should return from cache without invoking inner provider
    const secondResult = await provider.getAllProducts();
    expect(secondResult).toEqual(mockProducts);
    expect(fetchCount).toBe(1);
  });

  it("refetches from inner provider once TTL expires", async () => {
    let fetchCount = 0;
    const innerProvider: ProductProvider = {
      async getAllProducts(): Promise<Product[]> {
        fetchCount++;
        return mockProducts;
      },
    };

    const cache = new Cache();
    const provider = new CachedProductProvider(innerProvider, cache, 50); // 50ms TTL

    await provider.getAllProducts();
    expect(fetchCount).toBe(1);

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 60));

    await provider.getAllProducts();
    expect(fetchCount).toBe(2);
  });

  it("supports custom cache key isolation", async () => {
    const innerProvider: ProductProvider = {
      async getAllProducts(): Promise<Product[]> {
        return mockProducts;
      },
    };

    const cache = new Cache();
    const provider1 = new CachedProductProvider(innerProvider, cache, 60000, "custom_key_1");
    const provider2 = new CachedProductProvider(innerProvider, cache, 60000, "custom_key_2");

    await provider1.getAllProducts();
    expect(cache.get("custom_key_1")).toEqual(mockProducts);
    expect(cache.get("custom_key_2")).toBeNull();

    await provider2.getAllProducts();
    expect(cache.get("custom_key_2")).toEqual(mockProducts);
  });
});
