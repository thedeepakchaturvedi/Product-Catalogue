import type {
  EmailProvider,
  EnquiryRequest,
  EnquiryResponse,
  AppConfig,
} from "../types/index.js";
import type { ProductService } from "./productService.js";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export class EnquiryService {
  constructor(
    private readonly emailProvider: EmailProvider,
    private readonly productService: ProductService,
    private readonly config: Pick<AppConfig, "emailFrom" | "salesEmail">
  ) {}

  async submitEnquiry(data: EnquiryRequest): Promise<EnquiryResponse> {
    const product = await this.productService.getById(data.productId);
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    const safeFirstName = escapeHtml(data.firstName.trim());
    const safeLastName = escapeHtml(data.lastName.trim());
    const safeEmail = escapeHtml(data.email.trim());
    const safePhone = data.phone?.trim() ? escapeHtml(data.phone.trim()) : "Not provided";
    const safeMessage = escapeHtml(data.message.trim());
    const safeProductTitle = escapeHtml(product.title);

    const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <h2 style="color: #111;">New Product Enquiry</h2>
  <hr style="border: 0; border-top: 1px solid #eee;" />
  <h3 style="color: #444;">Customer Details</h3>
  <table style="border-collapse: collapse; width: 100%;">
    <tr><td style="padding: 4px 12px 4px 0; font-weight: bold; width: 120px;">Name:</td><td>${safeFirstName} ${safeLastName}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Email:</td><td><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
    <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Phone:</td><td>${safePhone}</td></tr>
  </table>
  <h3 style="color: #444; margin-top: 20px;">Product Details</h3>
  <table style="border-collapse: collapse; width: 100%;">
    <tr><td style="padding: 4px 12px 4px 0; font-weight: bold; width: 120px;">Product:</td><td>${safeProductTitle}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Product ID:</td><td>${product.id}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Price:</td><td>$${product.price.toFixed(2)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Category:</td><td>${escapeHtml(product.category)}</td></tr>
  </table>
  <h3 style="color: #444; margin-top: 20px;">Message</h3>
  <p style="background: #f8f9fa; padding: 14px; border-radius: 6px; white-space: pre-wrap; line-height: 1.5; border: 1px solid #e9ecef;">${safeMessage}</p>
  <hr style="border: 0; border-top: 1px solid #eee; margin-top: 24px;" />
  <p style="color: #888; font-size: 12px;">This email was sent from the Product Catalogue enquiry system.</p>
</body>
</html>`;

    await this.emailProvider.sendEmail({
      from: this.config.emailFrom,
      to: this.config.salesEmail,
      subject: `Product Enquiry: ${product.title}`,
      html: htmlBody,
    });

    return {
      message: "Thank you for your enquiry. We will be in touch soon.",
    };
  }
}
