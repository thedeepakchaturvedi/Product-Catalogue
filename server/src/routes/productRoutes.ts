import { Router } from "express";
import type { ProductController } from "../controllers/productController.js";

export function createProductRouter(controller: ProductController): Router {
  const router = Router();

  // Search products endpoint (placed before :id so /products/search is not matched as an ID)
  router.get("/products/search", controller.searchProducts);

  // List top-rated products endpoint (home page)
  router.get("/products", controller.getTopRated);

  // Single product detail endpoint
  router.get("/products/:id", controller.getProductById);

  // List categories endpoint
  router.get("/categories", controller.getCategories);

  // List products by category endpoint
  router.get("/categories/:name/products", controller.getProductsByCategory);

  return router;
}
