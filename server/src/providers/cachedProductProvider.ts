import type { Product, ProductProvider } from "../types/index.js";
import type { Cache } from "./cache.js";

export const DEFAULT_PRODUCT_CACHE_KEY = "all_products";

/**
 * Decorator that wraps any ProductProvider with an in-memory TTL cache.
 * Follows the Gang of Four Decorator Pattern so caching remains a composable
 * infrastructure concern without polluting core business domain services.
 */
export class CachedProductProvider implements ProductProvider {
  constructor(
    private readonly inner: ProductProvider,
    private readonly cache: Cache,
    private readonly ttlMs: number,
    private readonly cacheKey: string = DEFAULT_PRODUCT_CACHE_KEY
  ) {}

  async getAllProducts(): Promise<Product[]> {
    const cached = this.cache.get<Product[]>(this.cacheKey);
    if (cached) {
      return cached;
    }

    const products = await this.inner.getAllProducts();
    this.cache.set(this.cacheKey, products, this.ttlMs);
    return products;
  }
}
