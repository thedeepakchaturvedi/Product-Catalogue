import { z } from "zod";

export const enquirySchema = z.object({
  productId: z
    .number({ required_error: "Product ID is required", invalid_type_error: "Product ID must be a number" })
    .int("Product ID must be an integer")
    .positive("Product ID must be a positive integer"),
  firstName: z
    .string({ required_error: "First name is required" })
    .trim()
    .min(1, "First name is required")
    .max(100, "First name must be 100 characters or less"),
  lastName: z
    .string({ required_error: "Last name is required" })
    .trim()
    .min(1, "Last name is required")
    .max(100, "Last name must be 100 characters or less"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Invalid email address")
    .max(254, "Email must be 254 characters or less"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone must be at least 7 characters")
    .max(20, "Phone must be 20 characters or less")
    .regex(/^[0-9\s\-()+]+$/, "Phone may only contain digits, spaces, hyphens, parentheses, and +")
    .optional()
    .or(z.literal("")),
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(1, "Message is required")
    .max(1000, "Message must be 1000 characters or less"),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
