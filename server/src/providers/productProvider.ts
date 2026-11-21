import { z } from "zod";
import type { Product, ProductProvider } from "../types/index.js";
import { ProviderError } from "../types/index.js";

const productSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  description: z.string(),
  category: z.string().min(1),
  image: z.string().url(),
  rating: z.object({
    rate: z.number().min(0).max(5),
    count: z.number().int().nonnegative(),
  }),
});

export class FakeStoreProductProvider implements ProductProvider {
  constructor(private readonly baseUrl: string) {}

  async getAllProducts(): Promise<Product[]> {
    const url = `${this.baseUrl.replace(/\/+$/, "")}/products`;
    let response: Response;

    try {
      response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });
    } catch (error) {
      throw new ProviderError(
        `Failed to reach Fake Store API at ${url}: ${error instanceof Error ? error.message : String(error)}`,
        error
      );
    }

    if (!response.ok) {
      throw new ProviderError(
        `Fake Store API returned HTTP ${response.status}: ${response.statusText}`
      );
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch (error) {
      throw new ProviderError("Invalid JSON returned by Fake Store API", error);
    }

    if (!Array.isArray(json)) {
      throw new ProviderError("Expected an array of products from Fake Store API");
    }

    const validatedProducts: Product[] = [];
    for (const item of json) {
      const parsed = productSchema.safeParse(item);
      if (parsed.success) {
        validatedProducts.push(parsed.data);
      } else {
        console.warn("Product failed validation from Fake Store API, skipping item:", parsed.error.issues);
      }
    }

    if (validatedProducts.length === 0 && json.length > 0) {
      throw new ProviderError("All products from Fake Store API failed schema validation");
    }

    return validatedProducts;
  }
}
