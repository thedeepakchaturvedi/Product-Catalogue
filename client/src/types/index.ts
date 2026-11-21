// Product rating
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

// Category products response
export interface CategoryProducts {
  readonly category: string;
  readonly topRated: Product[];
  readonly other: Product[];
}

// Enquiry Form Data (user inputs)
export interface EnquiryFormData {
  readonly productId: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string;
  readonly message: string;
}

// Enquiry response
export interface EnquiryResponse {
  readonly message: string;
}

// API Success envelope
export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T;
}

// Field validation detail
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
