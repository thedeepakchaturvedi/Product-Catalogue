import { describe, it, expect, vi } from "vitest";
import { EnquiryService } from "../../src/services/enquiryService.js";
import { ProductService } from "../../src/services/productService.js";
import { Cache } from "../../src/providers/cache.js";
import type { EmailProvider, Product, ProductProvider, SendEmailOptions } from "../../src/types/index.js";
import { ProviderError } from "../../src/types/index.js";

const mockProduct: Product = {
  id: 1,
  title: "Fjallraven Backpack",
  price: 109.95,
  description: "Test description",
  category: "men's clothing",
  image: "https://example.com/1.jpg",
  rating: { rate: 3.9, count: 120 },
};

class MockProductProvider implements ProductProvider {
  async getAllProducts(): Promise<Product[]> {
    return [mockProduct];
  }
}

describe("EnquiryService", () => {
  it("composes and sends email when product exists", async () => {
    let capturedOptions: SendEmailOptions | null = null;
    const mockEmailProvider: EmailProvider = {
      async sendEmail(options: SendEmailOptions): Promise<void> {
        capturedOptions = options;
      },
    };

    const productService = new ProductService(new MockProductProvider(), new Cache(), 5000);
    const service = new EnquiryService(mockEmailProvider, productService, {
      emailFrom: "noreply@catalogue.local",
      salesEmail: "sales@example.com",
    });

    const response = await service.submitEnquiry({
      productId: 1,
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "+1 555-0199",
      message: "I would like to order 10 units.",
    });

    expect(response.message).toContain("Thank you");
    expect(capturedOptions).not.toBeNull();
    expect(capturedOptions?.to).toBe("sales@example.com");
    expect(capturedOptions?.from).toBe("noreply@catalogue.local");
    expect(capturedOptions?.subject).toBe("Product Enquiry: Fjallraven Backpack");
    expect(capturedOptions?.html).toContain("Jane Doe");
    expect(capturedOptions?.html).toContain("jane@example.com");
    expect(capturedOptions?.html).toContain("+1 555-0199");
    expect(capturedOptions?.html).toContain("I would like to order 10 units.");
    expect(capturedOptions?.html).toContain("$109.95");
  });

  it("escapes HTML to prevent injection in emails", async () => {
    let capturedOptions: SendEmailOptions | null = null;
    const mockEmailProvider: EmailProvider = {
      async sendEmail(options: SendEmailOptions): Promise<void> {
        capturedOptions = options;
      },
    };

    const productService = new ProductService(new MockProductProvider(), new Cache(), 5000);
    const service = new EnquiryService(mockEmailProvider, productService, {
      emailFrom: "noreply@catalogue.local",
      salesEmail: "sales@example.com",
    });

    await service.submitEnquiry({
      productId: 1,
      firstName: "<script>alert('xss')</script>",
      lastName: "Doe",
      email: "jane@example.com",
      message: "<img src=x onerror=alert(1)>",
    });

    expect(capturedOptions?.html).not.toContain("<script>");
    expect(capturedOptions?.html).toContain("&lt;script&gt;");
    expect(capturedOptions?.html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("handles optional phone gracefully", async () => {
    let capturedOptions: SendEmailOptions | null = null;
    const mockEmailProvider: EmailProvider = {
      async sendEmail(options: SendEmailOptions): Promise<void> {
        capturedOptions = options;
      },
    };

    const productService = new ProductService(new MockProductProvider(), new Cache(), 5000);
    const service = new EnquiryService(mockEmailProvider, productService, {
      emailFrom: "noreply@catalogue.local",
      salesEmail: "sales@example.com",
    });

    await service.submitEnquiry({
      productId: 1,
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      message: "Interested in this item.",
    });

    expect(capturedOptions?.html).toContain("Not provided");
  });

  it("throws PRODUCT_NOT_FOUND when product does not exist", async () => {
    const mockEmailProvider: EmailProvider = {
      async sendEmail(): Promise<void> {},
    };

    const productService = new ProductService(new MockProductProvider(), new Cache(), 5000);
    const service = new EnquiryService(mockEmailProvider, productService, {
      emailFrom: "noreply@catalogue.local",
      salesEmail: "sales@example.com",
    });

    await expect(
      service.submitEnquiry({
        productId: 999,
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        message: "Hello",
      })
    ).rejects.toThrow("PRODUCT_NOT_FOUND");
  });

  it("propagates ProviderError when email provider fails", async () => {
    const mockEmailProvider: EmailProvider = {
      async sendEmail(): Promise<void> {
        throw new ProviderError("SMTP server down");
      },
    };

    const productService = new ProductService(new MockProductProvider(), new Cache(), 5000);
    const service = new EnquiryService(mockEmailProvider, productService, {
      emailFrom: "noreply@catalogue.local",
      salesEmail: "sales@example.com",
    });

    await expect(
      service.submitEnquiry({
        productId: 1,
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        message: "Hello",
      })
    ).rejects.toThrow(ProviderError);
  });
});
