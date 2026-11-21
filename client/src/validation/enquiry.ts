import { z } from "zod";

export const enquiryFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name must be 100 characters or less"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(100, "Last name must be 100 characters or less"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(254, "Email must be 254 characters or less"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone must be at least 7 characters")
    .max(20, "Phone must be 20 characters or less")
    .regex(
      /^[0-9\s\-()+]+$/,
      "Phone may only contain digits, spaces, hyphens, parentheses, and +"
    )
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(1000, "Message must be 1000 characters or less"),
});

export type EnquiryFormInput = z.infer<typeof enquiryFormSchema>;
