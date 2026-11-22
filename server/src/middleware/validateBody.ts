import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodSchema } from "zod";
import type { ValidationDetail } from "../types/index.js";

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details: ValidationDetail[] = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          details,
        },
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
