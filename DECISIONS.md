# Technical Decisions and Assumptions

This document records the architectural decisions, explicit assumptions, justified trade-offs, and engineering practices for the Product Catalogue application.

---

## 1. Assumptions Made Where Acceptance Criteria Were Unclear

| Area | Acceptance Criteria Gap | Engineering Assumption & Decision |
|---|---|---|
| **Top Rated Ranking** | *"GIVEN I have chosen 5 products to be 'top rated'"* | The Fake Store API has no curation endpoint or flag. Products are ranked algorithmically by `rating.rate` (descending), tie-broken by `rating.count` (descending) and `id` (ascending). The top 5 are displayed as featured. |
| **Search Matching** | *"THEN I only see products that have text matching that search term"* | Queries are matched case-insensitively as substrings against both `title` and `description`. The search bar provides instant debounced suggestions (3+ characters) as well as navigating to `/search?q=...` on Enter/button click. |
| **Category Page Split** | *"THEN I see top rated products for that category AND I see additional products in that category"* | The specification does not define how many items are "top rated" within a category. The top 3 products by rating form the "Top Rated in this Category" section; the rest appear under "More Products". |
| **Enquiry Context & Recipient** | *"THEN the sales inbox will receive an email"* | The enquiry form is product-specific (linked from `/products/:id/enquire`) and auto-binds product ID, title, and price. Emails are routed via SMTP to a configurable `SALES_EMAIL` (`sales@example.com`). |
| **Contact Details** | *"complete the subsequent form with my contact details"* | First name, last name, email, and message are required. Phone number is optional to reduce drop-off, but validated with regex when provided. |

---

## 2. Requirements Simplified or Dropped and Why

1. **In-Memory Filtering Instead of an External Database or Search Engine**:
   - The Fake Store API contains only 20 static products and lacks search or sort parameters.
   - The backend fetches all 20 items once, caches them in memory with a 5-minute TTL, and performs search, sorting, and category splitting in memory.
   - *Why*: Adding PostgreSQL or Elasticsearch for 20 items would add unnecessary complexity and slow down setup without performance gain.

2. **Stateless Enquiry Processing (No Database Persistence)**:
   - Enquiries are validated and dispatched directly over SMTP; submissions are not stored in a database table.
   - *Why*: Strictly satisfies the acceptance criteria (*"sales inbox will receive an email AND the customer will see a 'Thank you' message"*) while staying within the 2–3 hour timebox.

3. **No Authentication, Cart, or Checkout**:
   - Deliberately omitted.
   - *Why*: The scenario specifies an MVP product catalogue where customer engagement happens through enquiries, not immediate online purchasing.

---

## 3. How the Design Supports Growing Beyond the PoC

The application isolates volatile dependencies behind interfaces so future changes require zero modification to business logic:

```
[ React SPA ] ──HTTP/JSON──> [ Controllers ] ──> [ ProductService ]
                                                        │
                                                        ▼ (depends on interface)
                                              [ ProductProvider ]
                                                        ▲
                               ┌────────────────────────┴────────────────────────┐
                               │ (Decorator Pattern)                             │
                     [ CachedProductProvider ]                                   │
                               │ wraps                                           │
                               ▼                                                 ▼
                   [ FakeStoreProductProvider ]                     [ Future: CmsProductProvider ]
                   (raw upstream HTTP calls)                        (PostgreSQL / Shopify / Strapi)
```

1. **Pluggable Data Source & Caching via Decorator Pattern (`ProductProvider`)**:
   - `ProductService` contains only domain business logic (ranking, category splitting, search matching). It has zero knowledge of caching, TTLs, or cache keys.
   - Caching is implemented as an independent **Decorator** (`CachedProductProvider implements ProductProvider`) that wraps the raw provider (`FakeStoreProductProvider`).
   - **CMS / Database Extensibility**: When replacing Fake Store API with a CMS or PostgreSQL containing thousands of products:
     - A new `CmsProductProvider implements ProductProvider` is created that delegates sorting, full-text search, and pagination to the database/CMS query engine.
     - The in-memory `CachedProductProvider` can be omitted entirely or replaced with a `RedisCachedProductProvider` with zero changes to `ProductService`, controllers, routes, or tests (satisfying both **Single Responsibility** and **Open-Closed** principles).

2. **Pluggable Email Service (`EmailProvider`)**:
   - `EnquiryService` depends only on `EmailProvider` (`sendEmail`).
   - Switching from local Mailpit to AWS SES or SendGrid in production requires only a new adapter class; email templates and validation stay untouched.

3. **Decoupled Look and Feel (Design Tokens)**:
   - All colors, typography, spacing, and shadows live in `client/src/styles/variables.css`.
   - Components use scoped CSS Modules. When creative brand guidelines are finalized, re-theming requires editing CSS variables rather than rewriting components.

4. **Layered Validation & Security**:
   - Zod schemas run on both client (instant feedback) and backend (security boundary).
   - User inputs are escaped before interpolation into HTML email templates to prevent HTML injection/XSS.

---

## 4. What We Would Do Next with Another Day

1. **Persistence & Admin Portal**: Add PostgreSQL with Drizzle ORM to store product inventory and persist enquiries. Build a protected `/admin` route for manual curation of featured products.
2. **AWS Deployment (IaC)**: Deploy the backend to AWS ECS Fargate or Lambda, host the frontend on S3 + CloudFront CDN, and wire transactional emails to AWS SES.
3. **Faceted Filtering**: Add multi-attribute filters (price range slider, category checkboxes, minimum rating) and sorting dropdowns (price ascending/descending).
4. **Resilience & Rate Limiting**: Add Redis for distributed caching across backend instances and `express-rate-limit` on search and enquiry endpoints.
5. **End-to-End Tests**: Add Playwright E2E suites running against desktop and mobile viewports in CI.

---

## 5. Testing Strategy & Quality Assurance

The implementation prioritizes testing critical business logic and user journeys across 80 automated tests (52 backend, 28 frontend):

- **Unit Tests**:
  - `ProductService`: Deterministic tie-breaking, boundary limits, single product lookup, sorted category lists, case-insensitive category grouping, and substring search logic across title and description.
  - `CachedProductProvider`: Initial cache misses, in-memory cache hits, TTL expiration refetches, and key isolation.
  - `EnquiryService`: Email payload compilation, HTML sanitization against XSS payloads, non-existent product handling, and email provider error propagation.
  - `Cache`: Basic set/get, TTL expiration, deletion, and size reporting.
- **Integration Tests (Supertest)**:
  - Express route contracts for `/api/v1/products`, `/api/v1/products/search`, `/api/v1/categories`, `/api/v1/categories/:name/products`, and `/api/v1/enquiries`.
  - Verification of standard `{ success, data }` and `{ success, error }` response envelopes.
  - HTTP status codes: `200 OK`, `400 Bad Request` (Zod validation details), `404 Not Found`, `502 Bad Gateway`.
- **Frontend Component & Journey Tests (React Testing Library + Vitest)**:
  - `SearchBar`: Real-time debounced suggestion fetching, keyboard navigation (ArrowDown, ArrowUp, Enter, Escape), suggestion clicks, and submission navigation.
  - `EnquiryForm`: Client-side validation triggers, field-level error messages, phone format validation, loading state disabling, and navigation to `/thank-you` upon successful mutation.
  - `ProductCard` & Pages (`HomePage`, `CategoryPage`, `SearchResultsPage`): Proper rendering of ratings, price formatting, category badges, loading states, and error banner retries.

---

## 6. Error Handling & Reliability

The application handles expected failures explicitly rather than allowing unhandled rejections to crash processes or leave users stranded:

- **Upstream API Failure**: In `FakeStoreProductProvider`, HTTP errors, network timeouts (10s `AbortSignal`), and invalid JSON trigger typed `ProviderError` exceptions mapped to clean `502 Bad Gateway` API envelopes. When cache exists, `CachedProductProvider` continues serving data uninterrupted.
- **Cache Isolation**: Caching is decoupled via the Decorator Pattern; cache read/write issues do not corrupt underlying product data retrieval.
- **Email Dispatch Failure**: In `EnquiryService`, failures from the SMTP transport propagate as `ProviderError` returning `502 Bad Gateway` with a clear message to the client. A success response is returned only after successful email dispatch.
- **Input Validation**: `validateBody` middleware rejects malformed request bodies before route handlers execute, returning structured `400 Bad Request` responses with exact field paths and issue descriptions.
- **Frontend Resilience**: React Query handles network retry policies, while components render explicit loading skeletons, zero-result empty states, and dismissible `ErrorBanner` components with manual retry CTAs.

---

## 7. API Design & Contracts

The backend exposes a uniform RESTful API interface designed for client decoupling:

- **Consistent Envelope Schema**:
  - Success: `{ "success": true, "data": T }`
  - Failure: `{ "success": false, "error": { "message": string, "details"?: [{ "field": string, "message": string }] } }`
- **Resource Endpoints**:
  - `GET /api/v1/products?limit=5`: Top-rated featured products.
  - `GET /api/v1/products/search?q=:query`: Substring matching across title and description.
  - `GET /api/v1/products/:id`: Individual product details.
  - `GET /api/v1/categories`: List of distinct category names.
  - `GET /api/v1/categories/:name/products`: Category-specific products split into `topRated` (max 3) and `other`.
  - `POST /api/v1/enquiries`: Validated customer contact submissions.
  - `GET /api/v1/health`: System health status check.
- **Interface Secrecy**: Upstream provider details (Fake Store API endpoints, Nodemailer SMTP transport) remain completely hidden behind Express controllers, preventing data source leaks across the network boundary.

---

## 8. AI-Assisted Development Approach

As an AI-Native Engineering project, AI tools were leveraged as engineering accelerators while maintaining strict architectural oversight:

- **Requirements Analysis (`feature-forge`)**: Deconstructed the challenge prompt to extract acceptance criteria, resolve ambiguity in the "top rated" selection formula, and establish clear EARS-format requirements.
- **Architectural Design (`architecture-designer`)**: Modeled the Provider/Adapter Pattern, identified the Decorator Pattern for caching, and planned boundary isolation before writing implementation code.
- **Implementation Acceleration**: Used AI for TypeScript scaffolding, boilerplate Express routes, CSS Module tokens, and exhaustive Zod validation schemas.
- **Critical Code Review (`code-reviewer`)**:
  - Identified tight coupling of caching inside `ProductService` and refactored it to `CachedProductProvider` (Decorator Pattern).
  - Detected HTML injection risks in customer enquiry email templates and implemented input sanitization.
  - Fixed TypeScript compiler errors where `cause` was overridden without modifier in `ProviderError`.
- **Validation Oversight**: Independently confirmed all 80 automated unit and integration tests passed, executed Docker Compose multi-container builds, and validated end-to-end enquiry delivery against Mailpit.

---

## 9. Security Considerations

- **No Committed Secrets**: Zero credentials, passwords, or private API keys exist in the repository; configurations are driven by committed `.env.example` templates and injected environment variables.
- **Server as the True Security Boundary**: Although the React client validates inputs for UX responsiveness, backend Zod middleware independently enforces schema validation on every request.
- **Email HTML Injection Prevention**: User inputs (`firstName`, `lastName`, `email`, `phone`, `message`) are escaped for special HTML characters (`&`, `<`, `>`, `"`, `'`) before being interpolated into email notification templates.
- **Server-Side SMTP Credential Secrecy**: SMTP credentials and `SALES_EMAIL` targets remain strictly server-side; the client cannot alter email recipients.
- **Origin Protection**: Backend enforces CORS headers (`CORS_ORIGIN=http://localhost:5173`) to restrict unauthorized browser origins. Production deployments would further incorporate `express-rate-limit` against search and enquiry spam.
