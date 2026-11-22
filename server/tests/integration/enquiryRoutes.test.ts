import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { createApp } from "../../src/app.js";
import { ProductController } from "../../src/controllers/productController.js";
import { EnquiryController } from "../../src/controllers/enquiryController.js";
import { ProductService } from "../../src/services/productService.js";
import { EnquiryService } from "../../src/services/enquiryService.js";
import { Cache } from "../../src/providers/cache.js";
import type { Product, ProductProvider, EmailProvider } from "../../src/types/index.js";
import { ProviderError } from "../../src/types/index.js";

const mockProduct: Product = {
  id: 1,
  title: "Fjallraven Backpack",
  price: 109.95,
  description: "Everyday backpack with laptop sleeve",
  category: "men's clothing",
  image: "https://example.com/1.jpg",
  rating: { rate: 4.8, count: 120 },
};

class MockProductProvider implements ProductProvider {
  async getAllProducts(): Promise<Product[]> {
    return [mockProduct];
  }
}

describe("Enquiry Routes Integration Tests", () => {
  let app: Express;
  let shouldEmailFail = false;

  const mockEmailProvider: EmailProvider = {
    async sendEmail(): Promise<void> {
      if (shouldEmailFail) {
        throw new ProviderError("SMTP server unavailable");
      }
    },
  };

  beforeEach(() => {
    shouldEmailFail = false;
    const cache = new Cache();
    const productService = new ProductService(new MockProductProvider(), cache, 5000);
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

  const validPayload = {
    productId: 1,
    firstName: "Alice",
    lastName: "Smith",
    email: "alice@example.com",
    phone: "+1 555-0100",
    message: "I am interested in buying 5 backpacks.",
  };

  it("submits enquiry successfully and returns 201", async () => {
    const res = await request(app).post("/api/v1/enquiries").send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe("Thank you for your enquiry. We will be in touch soon.");
  });

  it("accepts valid submission without optional phone", async () => {
    const { phone, ...withoutPhone } = validPayload;
    const res = await request(app).post("/api/v1/enquiries").send(withoutPhone);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("accepts valid submission with empty string phone", async () => {
    const res = await request(app)
      .post("/api/v1/enquiries")
      .send({ ...validPayload, phone: "" });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("returns 400 when missing required fields", async () => {
    const res = await request(app)
      .post("/api/v1/enquiries")
      .send({ firstName: "Alice" }); // missing productId, lastName, email, message

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe("Validation failed");
    expect(res.body.error.details.length).toBeGreaterThanOrEqual(4);
  });

  it("returns 400 when email is invalid format", async () => {
    const res = await request(app)
      .post("/api/v1/enquiries")
      .send({ ...validPayload, email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    const emailError = res.body.error.details.find((d: any) => d.field === "email");
    expect(emailError).toBeDefined();
    expect(emailError.message).toBe("Invalid email address");
  });

  it("returns 400 when phone contains invalid characters", async () => {
    const res = await request(app)
      .post("/api/v1/enquiries")
      .send({ ...validPayload, phone: "call-me-maybe" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 when product does not exist", async () => {
    const res = await request(app)
      .post("/api/v1/enquiries")
      .send({ ...validPayload, productId: 9999 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe("Product not found");
  });

  it("returns 502 when email delivery fails", async () => {
    shouldEmailFail = true;
    const res = await request(app).post("/api/v1/enquiries").send(validPayload);

    expect(res.status).toBe(502);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe("Unable to send enquiry. Please try again later.");
  });
});
