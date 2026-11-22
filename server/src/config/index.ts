import { config as loadDotenv } from "dotenv";
import { z } from "zod";
import type { AppConfig } from "../types/index.js";

loadDotenv();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  FAKE_STORE_API_URL: z.string().url().default("https://fakestoreapi.com"),
  PRODUCT_CACHE_TTL_MS: z.coerce.number().int().positive().default(300000),
  SMTP_HOST: z.string().min(1).default("localhost"),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_SECURE: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  EMAIL_FROM: z.string().email().default("noreply@catalogue.local"),
  SALES_EMAIL: z.string().email().default("sales@example.com"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  NODE_ENV: z.string().default("development"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Configuration validation error:", parsedEnv.error.format());
  throw new Error("Invalid application configuration");
}

export const config: AppConfig = {
  port: parsedEnv.data.PORT,
  fakeStoreApiUrl: parsedEnv.data.FAKE_STORE_API_URL,
  productCacheTtlMs: parsedEnv.data.PRODUCT_CACHE_TTL_MS,
  smtpHost: parsedEnv.data.SMTP_HOST,
  smtpPort: parsedEnv.data.SMTP_PORT,
  smtpSecure: parsedEnv.data.SMTP_SECURE,
  emailFrom: parsedEnv.data.EMAIL_FROM,
  salesEmail: parsedEnv.data.SALES_EMAIL,
  corsOrigin: parsedEnv.data.CORS_ORIGIN,
  nodeEnv: parsedEnv.data.NODE_ENV,
};
