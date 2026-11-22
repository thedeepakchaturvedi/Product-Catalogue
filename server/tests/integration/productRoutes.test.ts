import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { createApp } from "../../src/app.js";
import { ProductController } from "../../src/controllers/productController.js";
import { EnquiryController } from "../../src/controllers/enquiryController.js";
import { ProductService } from "../../src/services/productService.js";
import { EnquiryService } from "../../src/services/enquiryService.js";
import { Cache } from "../../src/providers/cache.js";
import { CachedProductProvider } from "../../src/providers/cachedProductProvider.js";
import type { Product, ProductProvider, EmailProvider } from "../../src/types/index.js";

const mockProducts: Product[] = [
  {
    id: 1,
    title: "Fjallraven Backpack",
    price: 109.95,
    description: "Everyday backpack with laptop sleeve",
    category: "men's clothing",
    image: "https://example.com/1.jpg",
    rating: { rate: 4.8, count: 120 },
  },
  {
    id: 2,
    title: "Casual Slim Fit T-Shirt",
    price: 22.3,
    description: "Slim-fitting style",
    category: "men's clothing",
    image: "https://example.com/2.jpg",
    rating: { rate: 4.5, count: 259 },
  },
  {
    id: 3,
    title: "SanDisk 1TB SSD",
    price: 109,
    description: "High performance SSD storage",
    category: "electronics",
    image: "https://example.com/3.jpg",
    rating: { rate: 3.5, count: 470 },
  },
];

class MockProductProvider implements ProductProvider {
  async getAllProducts(): Promise<Product[]> {
    return mockProducts;
  }
}

const mockEmailProvider: EmailProvider = {
  async sendEmail(): Promise<void> {},
};

describe("Product Routes Integration Tests", () => {
  let app: Express;

  beforeEach(() => {
    const cache = new Cache();
    const productProvider = new CachedProductProvider(new MockProductProvider(), cache, 5000);
    const productService = new ProductService(productProvider);
    const enquiryService = new EnquiryService(mockEmailProvider, productService, {
      emailFrom: "noreply@catalogue.local",
      salesEmail: "sales@example.com",
    });
    const productController = new ProductController(productService);
    const enquiryController = new EnquiryController(enquiryService);

    app = createApp({
      productController,
      enquiryController,
    });
  });

  describe("GET /api/v1/products", () => {
    it("returns top rated products with default limit of 5", async () => {
      const res = await request(app).get("/api/v1/products");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.data[0].id).toBe(1);
    });

    it("respects limit query param", async () => {
      const res = await request(app).get("/api/v1/products?limit=2");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].id).toBe(1);
      expect(res.body.data[1].id).toBe(2);
    });

    it("returns 400 for non-numeric limit", async () => {
      const res = await request(app).get("/api/v1/products?limit=abc");
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe("Validation failed");
    });

    it("returns 400 for limit greater than 20", async () => {
      const res = await request(app).get("/api/v1/products?limit=50");
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for limit less than 1", async () => {
      const res = await request(app).get("/api/v1/products?limit=0");
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/products/search", () => {
    it("returns matching products for valid search query", async () => {
      const res = await request(app).get("/api/v1/products/search?q=Backpack");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe("Fjallraven Backpack");
    });

    it("returns empty array when no products match", async () => {
      const res = await request(app).get("/api/v1/products/search?q=xyznonexistent");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it("returns 400 when search query is missing", async () => {
      const res = await request(app).get("/api/v1/products/search");
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.details[0].field).toBe("q");
    });

    it("returns 400 when search query is blank", async () => {
      const res = await request(app).get("/api/v1/products/search?q=   ");
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/products/:id", () => {
    it("returns product details for valid ID", async () => {
      const res = await request(app).get("/api/v1/products/1");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.title).toBe("Fjallraven Backpack");
    });

    it("returns 404 for unknown product ID", async () => {
      const res = await request(app).get("/api/v1/products/999");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe("Product not found");
    });

    it("returns 400 for non-integer or negative ID", async () => {
      const res = await request(app).get("/api/v1/products/not-a-number");
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.details[0].field).toBe("id");
    });
  });

  describe("GET /api/v1/categories", () => {
    it("returns list of categories alphabetically", async () => {
      const res = await request(app).get("/api/v1/categories");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(["electronics", "men's clothing"]);
    });
  });

  describe("GET /api/v1/categories/:name/products", () => {
    it("returns topRated and other products for existing category", async () => {
      const res = await request(app).get("/api/v1/categories/men's clothing/products");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category).toBe("men's clothing");
      expect(res.body.data.topRated).toHaveLength(2);
      expect(res.body.data.other).toHaveLength(0);
    });

    it("handles URL encoded category names", async () => {
      const res = await request(app).get("/api/v1/categories/men%27s%20clothing/products");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category).toBe("men's clothing");
    });

    it("returns 404 for non-existent category", async () => {
      const res = await request(app).get("/api/v1/categories/nonexistent/products");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe("Category not found");
    });
  });

  describe("Health Check & Fallback", () => {
    it("responds to /api/v1/health", async () => {
      const res = await request(app).get("/api/v1/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });

    it("returns 404 for unknown endpoints", async () => {
      const res = await request(app).get("/api/v1/unknown-endpoint");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
