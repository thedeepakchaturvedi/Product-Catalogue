import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { ProductService } from "../services/productService.js";

const limitSchema = z.coerce
  .number({ invalid_type_error: "Must be an integer between 1 and 20" })
  .int("Must be an integer between 1 and 20")
  .min(1, "Must be an integer between 1 and 20")
  .max(20, "Must be an integer between 1 and 20")
  .default(5);

const idSchema = z.coerce
  .number({ invalid_type_error: "Product ID must be a positive integer" })
  .int("Product ID must be a positive integer")
  .positive("Product ID must be a positive integer");

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  getTopRated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedLimit = limitSchema.safeParse(req.query.limit ?? 5);
      if (!parsedLimit.success) {
        res.status(400).json({
          success: false,
          error: {
            message: "Validation failed",
            details: [
              {
                field: "limit",
                message: "Must be an integer between 1 and 20",
              },
            ],
          },
        });
        return;
      }

      const products = await this.productService.getTopRated(parsedLimit.data);
      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  searchProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawQuery = req.query.q;
      if (typeof rawQuery !== "string" || rawQuery.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            message: "Validation failed",
            details: [
              {
                field: "q",
                message: "Search query is required",
              },
            ],
          },
        });
        return;
      }

      if (rawQuery.length > 200) {
        res.status(400).json({
          success: false,
          error: {
            message: "Validation failed",
            details: [
              {
                field: "q",
                message: "Search query must be at most 200 characters",
              },
            ],
          },
        });
        return;
      }

      const products = await this.productService.search(rawQuery);
      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedId = idSchema.safeParse(req.params.id);
      if (!parsedId.success) {
        res.status(400).json({
          success: false,
          error: {
            message: "Validation failed",
            details: [
              {
                field: "id",
                message: "Product ID must be a positive integer",
              },
            ],
          },
        });
        return;
      }

      const product = await this.productService.getById(parsedId.data);
      if (!product) {
        res.status(404).json({
          success: false,
          error: {
            message: "Product not found",
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.productService.getCategories();
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryParam = req.params.name;
      if (!categoryParam) {
        res.status(404).json({
          success: false,
          error: {
            message: "Category not found",
          },
        });
        return;
      }

      const categoryName = decodeURIComponent(categoryParam);
      const result = await this.productService.getByCategory(categoryName);

      if (!result) {
        res.status(404).json({
          success: false,
          error: {
            message: "Category not found",
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
