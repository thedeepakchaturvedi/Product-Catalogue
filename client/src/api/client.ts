import type {
  Product,
  CategoryProducts,
  EnquiryFormData,
  EnquiryResponse,
  ValidationDetail,
  ApiResponse,
} from "../types/index.js";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: ValidationDetail[]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:3001/api/v1";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options?.headers,
      },
    });
  } catch (error) {
    throw new ApiError(
      "Unable to connect to the server. Please check your connection and try again.",
      0
    );
  }

  let body: ApiResponse<T>;
  try {
    body = await response.json();
  } catch (error) {
    throw new ApiError(
      `Invalid server response (${response.status})`,
      response.status
    );
  }

  if (!response.ok || !body.success) {
    const errorMsg =
      (!body.success && body.error?.message) ||
      `Request failed with status ${response.status}`;
    const details = !body.success ? body.error?.details : undefined;
    throw new ApiError(errorMsg, response.status, details);
  }

  return body.data;
}

export async function fetchTopRatedProducts(limit = 5): Promise<Product[]> {
  return apiFetch<Product[]>(`/products?limit=${limit}`);
}

export async function fetchProduct(id: number): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

export async function fetchCategories(): Promise<string[]> {
  return apiFetch<string[]>("/categories");
}

export async function fetchProductsByCategory(
  categoryName: string
): Promise<CategoryProducts> {
  return apiFetch<CategoryProducts>(
    `/categories/${encodeURIComponent(categoryName)}/products`
  );
}

export async function searchProducts(query: string): Promise<Product[]> {
  return apiFetch<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
}

export async function submitEnquiry(
  data: EnquiryFormData
): Promise<EnquiryResponse> {
  return apiFetch<EnquiryResponse>("/enquiries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
