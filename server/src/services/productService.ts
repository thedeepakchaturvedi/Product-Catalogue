import type { Product, CategoryProducts, ProductProvider } from "../types/index.js";
import type { Cache } from "../providers/cache.js";

const CACHE_KEY_PRODUCTS = "all_products";

export class ProductService {
  constructor(
    private readonly provider: ProductProvider,
    private readonly cache: Cache,
    private readonly cacheTtlMs: number
  ) {}

  private compareProducts(a: Product, b: Product): number {
    // 1. rating.rate desc
    if (b.rating.rate !== a.rating.rate) {
      return b.rating.rate - a.rating.rate;
    }
    // 2. rating.count desc
    if (b.rating.count !== a.rating.count) {
      return b.rating.count - a.rating.count;
    }
    // 3. id asc
    return a.id - b.id;
  }

  async getAllProducts(): Promise<Product[]> {
    const cached = this.cache.get<Product[]>(CACHE_KEY_PRODUCTS);
    if (cached) {
      return cached;
    }

    const products = await this.provider.getAllProducts();
    this.cache.set(CACHE_KEY_PRODUCTS, products, this.cacheTtlMs);
    return products;
  }

  async getTopRated(limit = 5): Promise<Product[]> {
    const products = await this.getAllProducts();
    const sorted = [...products].sort(this.compareProducts);
    return sorted.slice(0, limit);
  }

  async getById(id: number): Promise<Product | null> {
    const products = await this.getAllProducts();
    const found = products.find((p) => p.id === id);
    return found ?? null;
  }

  async getCategories(): Promise<string[]> {
    const products = await this.getAllProducts();
    const categoriesSet = new Set<string>();
    for (const product of products) {
      if (product.category) {
        categoriesSet.add(product.category);
      }
    }
    return Array.from(categoriesSet).sort((a, b) => a.localeCompare(b));
  }

  async getByCategory(name: string): Promise<CategoryProducts | null> {
    const products = await this.getAllProducts();
    const targetCategory = name.toLowerCase();

    const matching = products.filter(
      (p) => p.category.toLowerCase() === targetCategory
    );

    if (matching.length === 0) {
      return null;
    }

    const sorted = [...matching].sort(this.compareProducts);
    const topRated = sorted.slice(0, 3);
    const other = sorted.slice(3);

    return {
      category: matching[0]!.category,
      topRated,
      other,
    };
  }

  async search(query: string): Promise<Product[]> {
    const products = await this.getAllProducts();
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery) {
      return [];
    }

    const filtered = products.filter(
      (p) =>
        p.title.toLowerCase().includes(cleanQuery) ||
        p.description.toLowerCase().includes(cleanQuery)
    );

    return [...filtered].sort(this.compareProducts);
  }
}
