import { config } from "./config/index.js";
import { Cache } from "./providers/cache.js";
import { FakeStoreProductProvider } from "./providers/productProvider.js";
import { NodemailerEmailProvider } from "./providers/emailProvider.js";
import { ProductService } from "./services/productService.js";
import { EnquiryService } from "./services/enquiryService.js";
import { ProductController } from "./controllers/productController.js";
import { EnquiryController } from "./controllers/enquiryController.js";
import { createApp } from "./app.js";

async function main(): Promise<void> {
  const cache = new Cache();
  const productProvider = new FakeStoreProductProvider(config.fakeStoreApiUrl);
  const emailProvider = new NodemailerEmailProvider({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
  });

  const productService = new ProductService(
    productProvider,
    cache,
    config.productCacheTtlMs
  );

  const enquiryService = new EnquiryService(emailProvider, productService, {
    emailFrom: config.emailFrom,
    salesEmail: config.salesEmail,
  });

  const productController = new ProductController(productService);
  const enquiryController = new EnquiryController(enquiryService);

  const app = createApp({
    productController,
    enquiryController,
    corsOrigin: config.corsOrigin,
  });

  app.listen(config.port, () => {
    console.log(`🚀 Catalogue Backend API running on port ${config.port}`);
    console.log(`📦 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Allowed CORS origin: ${config.corsOrigin}`);
  });
}

main().catch((error) => {
  console.error("Fatal startup error:", error);
  process.exit(1);
});
