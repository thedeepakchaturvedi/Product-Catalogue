# Technical Decisions and Assumptions

This document records the engineering decisions, explicit assumptions, trade-offs, and future roadmap for the Product Catalogue application.

---

## 1. Assumptions Made Where Acceptance Criteria Were Unclear

| Area | Challenge Text | Engineering Assumption & Implementation | Rationale |
|------|---------------|----------------------------------------|-----------|
| **Top Rated Definition** | *"GIVEN I have chosen 5 products to be 'top rated'"* | Products are ranked deterministically: primary by `rating.rate` descending, secondary by `rating.count` descending, tertiary by `id` ascending. | For an MVP PoC, an algorithmic selection based on customer reviews avoids premature building of an admin curation CMS while remaining deterministic and reproducible. |
| **Search Scope** | *"THEN I only see products that have text matching that search term"* | Search queries are matched case-insensitively as substring matches against both `product.title` and `product.description`. | Customers frequently remember descriptive words (e.g. "laptop", "outerwear", "cotton") rather than exact title prefixes. |
| **Category Layout** | *"THEN I see top rated products for that category AND I see additional products in that category"* | In category pages, the top 3 highest-rated products are presented in a "Top Rated in this Category" section, followed by the remaining items in a "More Products" section. | Delivers a clear visual distinction between featured picks and the rest of the category without pagination overhead on a small 20-item catalogue. |
| **Enquiry Flow & Target** | *"THEN the sales inbox will receive an email"* | The enquiry form is product-specific (linked from `/products/:id/enquire`), and the generated email captures customer details (`firstName`, `lastName`, `email`, optional `phone`, `message`) plus full product context (`productId`, `title`, `price`, `category`). Target email defaults to `SALES_EMAIL=sales@example.com`. | Sales representatives need immediate context regarding which product the customer wants and its price, rather than a generic unlinked message. |
| **Local SMTP Testing** | *"Email notification to the sales inbox"* | Configured with Nodemailer pointing to a local Mailpit container (`localhost:1025` SMTP, `localhost:8025` Web UI) via Docker Compose. | Zero third-party accounts, free, works offline, and reviewers can visually inspect incoming HTML emails instantly. |

---

## 2. Requirements Simplified or Dropped and Why

1. **In-Memory Backend Product Filtering Over Database / Upstream Querying**:
   - The Fake Store API does not support rating sort or full-text search parameters.
   - The entire catalogue contains exactly 20 items.
   - *Decision:* The backend fetches all 20 products and caches them with a 5-minute TTL. Sorting, category splitting, and search are performed in memory on the backend.
   - *Why:* Keeps upstream network latency low (cached), avoids hammering third-party endpoints, and keeps architecture simple without introducing an external search index or database for a 20-item PoC.

2. **Phone Number Made Optional on Enquiry Form**:
   - Some customers prefer email communication or do not want to provide phone numbers upfront.
   - *Decision:* Phone is optional, but if provided, it is validated using strict regex for valid format.

3. **No Authentication or Cart / Checkout**:
   - Explicitly out of scope per coding challenge requirements. The goal is browsing, search, and enquiry submission.

---

## 3. How the Design Supports Growing Beyond the PoC

The system is designed with strict separation of concerns and provider abstractions:

```
[ Frontend: React SPA ]
       │ HTTP / JSON
[ Backend Controller ]
       │
[ Domain Services (ProductService, EnquiryService) ]
       │
   ┌───┴────────────────────────┐
   ▼                            ▼
[ ProductProvider Interface ] [ EmailProvider Interface ]
   │                            │
   ▼ (Adapter)                  ▼ (Adapter)
FakeStoreProductProvider     NodemailerEmailProvider
   │ (Future: Shopify/DB)       │ (Future: AWS SES / SendGrid)
```

1. **Data Source Swapping (`ProductProvider`)**:
   - `ProductService` depends solely on the `ProductProvider` interface (`getAllProducts(): Promise<Product[]>`).
   - Moving from Fake Store API to a PostgreSQL database, Shopify Storefront API, or Strapi CMS requires only writing a new class implementing `ProductProvider` and swapping it in `index.ts`. No controller or service logic changes.
2. **Email Provider Swapping (`EmailProvider`)**:
   - `EnquiryService` depends only on `EmailProvider` (`sendEmail(options): Promise<void>`).
   - In production on AWS, an `AwsSesEmailProvider` can replace `NodemailerEmailProvider` in 20 lines of code without altering business logic or validation.
3. **Frontend API Abstraction Layer**:
   - All React components interact through typed custom hooks (`useTopRatedProducts`, `useProductsByCategory`, `useSearchResults`, `useProduct`, `useEnquiryMutation`) backed by `api/client.ts`.
   - Any backend contract changes or authentication additions are isolated to the API client layer.

---

## 4. What We Would Do Next with Another Day

1. **Database & Admin CMS**:
   - Introduce PostgreSQL with Prisma or Drizzle ORM to store custom products, inventory counts, and incoming enquiry submissions persistently.
   - Add a lightweight authenticated admin portal to curate top-rated featured products manually and manage customer enquiries.
2. **AWS Cloud Infrastructure (Terraform / CDK)**:
   - Backend deployed on AWS ECS Fargate or Lambda via API Gateway.
   - Frontend static build deployed to S3 + CloudFront CDN.
   - Email sending routed through AWS Simple Email Service (SES).
3. **Advanced Product Filtering & Facets**:
   - Multi-facet filtering (price range sliders, rating filters, in-stock status).
   - Client-side debounced instant search preview in the search bar.
4. **Enhanced E2E Test Suite**:
   - Expand Playwright test suite to execute across mobile viewports (iOS Safari / Android Chrome emulation) and add visual regression testing.
