// Product Rating
export interface ProductRating {
  readonly rate: number;
  readonly count: number;
}

// Product
export interface Product {
  readonly id: number;
  readonly title: string;
  readonly price: number;
  readonly description: string;
  readonly category: string;
  readonly image: string;
  readonly rating: ProductRating;
}

// Upstream raw product type (same structure, validated with Zod)
export type FakeStoreProduct = Product;

// Category products response
export interface CategoryProducts {
  readonly category: string;
  readonly topRated: Product[];
  readonly other: Product[];
}

// Enquiry request payload
export interface EnquiryRequest {
  readonly productId: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string;
  readonly message: string;
}

// Enquiry success response
export interface EnquiryResponse {
  readonly message: string;
}

// API Success envelope
export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T;
}

// Validation detail
export interface ValidationDetail {
  readonly field: string;
  readonly message: string;
}

// API Error envelope
export interface ApiErrorResponse {
  readonly success: false;
  readonly error: {
    readonly message: string;
    readonly details?: ValidationDetail[];
  };
}

// Union API response
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Email sending options
export interface SendEmailOptions {
  readonly to: string;
  readonly from: string;
  readonly subject: string;
  readonly html: string;
}

// Provider interfaces
export interface ProductProvider {
  getAllProducts(): Promise<Product[]>;
}

export interface EmailProvider {
  sendEmail(options: SendEmailOptions): Promise<void>;
}

// Application Config
export interface AppConfig {
  readonly port: number;
  readonly fakeStoreApiUrl: string;
  readonly productCacheTtlMs: number;
  readonly smtpHost: string;
  readonly smtpPort: number;
  readonly smtpSecure: boolean;
  readonly emailFrom: string;
  readonly salesEmail: string;
  readonly corsOrigin: string;
  readonly nodeEnv: string;
}

// Custom error for upstream/external provider failures
export class ProviderError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "ProviderError";
    this.cause = cause;
  }
}
