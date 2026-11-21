import express from "express";
import cors from "cors";
import type { Express } from "express";
import type { ProductController } from "./controllers/productController.js";
import type { EnquiryController } from "./controllers/enquiryController.js";
import { createProductRouter } from "./routes/productRoutes.js";
import { createEnquiryRouter } from "./routes/enquiryRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export interface AppDependencies {
  readonly productController: ProductController;
  readonly enquiryController: EnquiryController;
  readonly corsOrigin?: string;
}

export function createApp(deps: AppDependencies): Express {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: deps.corsOrigin ?? "*",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Accept"],
    })
  );
  app.use(express.json({ limit: "1mb" }));

  // Health check
  app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Mount API v1 routes
  app.use("/api/v1", createProductRouter(deps.productController));
  app.use("/api/v1", createEnquiryRouter(deps.enquiryController));

  // Catch-all 404 for undefined routes
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: "Not found",
      },
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
