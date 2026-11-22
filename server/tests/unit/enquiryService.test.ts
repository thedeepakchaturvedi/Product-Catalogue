import { describe, it, expect } from "vitest";
import { EnquiryService } from "../../src/services/enquiryService.js";
import { ProductService } from "../../src/services/productService.js";
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
    const capturedEmails: SendEmailOptions[] = [];
    const mockEmailProvider: EmailProvider = {
      async sendEmail(options: SendEmailOptions): Promise<void> {
        capturedEmails.push(options);
      },
    };

    const productService = new ProductService(new MockProductProvider());
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
    expect(capturedEmails).toHaveLength(1);
    const [options] = capturedEmails;
    expect(options!.to).toBe("sales@example.com");
    expect(options!.from).toBe("noreply@catalogue.local");
    expect(options!.subject).toBe("Product Enquiry: Fjallraven Backpack");
    expect(options!.html).toContain("Jane Doe");
    expect(options!.html).toContain("jane@example.com");
    expect(options!.html).toContain("+1 555-0199");
    expect(options!.html).toContain("I would like to order 10 units.");
    expect(options!.html).toContain("$109.95");
  });

  it("escapes HTML to prevent injection in emails", async () => {
    const capturedEmails: SendEmailOptions[] = [];
    const mockEmailProvider: EmailProvider = {
      async sendEmail(options: SendEmailOptions): Promise<void> {
        capturedEmails.push(options);
      },
    };

    const productService = new ProductService(new MockProductProvider());
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

    expect(capturedEmails).toHaveLength(1);
    const [options] = capturedEmails;
    expect(options!.html).not.toContain("<script>");
    expect(options!.html).toContain("&lt;script&gt;");
    expect(options!.html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("handles optional phone gracefully", async () => {
    const capturedEmails: SendEmailOptions[] = [];
    const mockEmailProvider: EmailProvider = {
      async sendEmail(options: SendEmailOptions): Promise<void> {
        capturedEmails.push(options);
      },
    };

    const productService = new ProductService(new MockProductProvider());
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

    expect(capturedEmails).toHaveLength(1);
    const [options] = capturedEmails;
    expect(options!.html).toContain("Not provided");
  });

  it("throws PRODUCT_NOT_FOUND when product does not exist", async () => {
    const mockEmailProvider: EmailProvider = {
      async sendEmail(): Promise<void> {},
    };

    const productService = new ProductService(new MockProductProvider());
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

    const productService = new ProductService(new MockProductProvider());
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
