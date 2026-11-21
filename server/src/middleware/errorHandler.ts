import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ProviderError } from "../types/index.js";

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  if (err instanceof ProviderError) {
    console.error("Provider Error:", err.message, err.cause);
    res.status(502).json({
      success: false,
      error: {
        message: "Unable to process request due to external service failure. Please try again later.",
      },
    });
    return;
  }

  if (err instanceof Error && err.message === "PRODUCT_NOT_FOUND") {
    res.status(404).json({
      success: false,
      error: {
        message: "Product not found",
      },
    });
    return;
  }

  console.error("Unhandled Internal Server Error:", err);
  res.status(500).json({
    success: false,
    error: {
      message: "Internal server error",
    },
  });
};
