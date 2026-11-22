# Time Breakdown

This document provides a realistic breakdown of the actual time spent completing the Product Catalogue take-home challenge, roughly split across planning, building, testing, reviewing, and packaging per challenge requirements.

---

## Overall Summary

| Phase | Time Spent | Percentage | Core Focus |
|---|---|---|---|
| **1. Planning & Architecture** | 30 min | 23.1% | Requirements decomposition, ambiguity resolution, ADR formulation, `Plan.md` specification. |
| **2. Backend Implementation** | 35 min | 26.9% | TypeScript Express API, FakeStore adapter, in-memory cache, Nodemailer adapter, Zod validation. |
| **3. Frontend Implementation** | 35 min | 26.9% | React 18 SPA, TanStack Query hooks, SearchBar with debounced suggestions, EnquiryForm, CSS Modules. |
| **4. Testing & Verification** | 20 min | 15.4% | 52 backend tests (Vitest + Supertest), 28 frontend tests (RTL + Vitest), type checking, live Mailpit test. |
| **5. Review, Refactoring & Docs** | 10 min | 7.7% | Decorator pattern refactor for caching, Docker Compose 1-command startup, `README.md`, `DECISIONS.md`. |
| **Total Time** | **2 hr 10 min** | **100%** | **Target: 2–3 hour time-box** |

---

## Detailed Phase Breakdown

### Phase 1: Planning & Architecture (~30 min)
- Read and deconstructed the challenge prompt and technical constraints.
- Analyzed acceptance criteria gaps (top-rated ranking formula, search scope, category split threshold).
- Evaluated architectural patterns (Provider/Adapter pattern for swappable product and email sources).
- Authored the comprehensive 11-section specification in [`Plan.md`](file:///c:/Projects/OpenWorks%20Assignment/Plan.md) to serve as a deterministic single source of truth.

### Phase 2: Backend Implementation (~35 min)
- Scaffolding of Node.js + Express + TypeScript project structure.
- Configured environment loading with Zod validation.
- Implemented `FakeStoreProductProvider` with timeout signals and error normalization.
- Implemented `ProductService` domain logic (sorting, tie-breaking, substring search, category grouping).
- Implemented `EnquiryService` with HTML sanitization and Nodemailer SMTP transport.
- Built controllers, error-handling middleware, and uniform API envelopes (`{ success, data, error }`).

### Phase 3: Frontend Implementation (~35 min)
- Bootstrapped React 18 + TypeScript SPA with Vite.
- Set up CSS custom properties (`variables.css`) and scoped CSS Modules.
- Built custom TanStack Query hooks with network deduplication and client-side caching.
- Created `SearchBar` with debounced instant modal suggestions and keyboard navigation (Arrow keys, Enter, Escape).
- Created `ProductCard`, `Header`, `ErrorBanner`, and pages (`HomePage`, `CategoryPage`, `SearchResultsPage`, `ProductDetailPage`, `EnquiryPage`, `ThankYouPage`).
- Implemented `EnquiryForm` with client-side Zod validation and field-level error messages.

### Phase 4: Testing & Verification (~20 min)
- Authored 52 backend automated unit and integration tests (Supertest + Vitest).
- Authored 28 frontend component and user journey tests (React Testing Library + Vitest).
- Ran strict TypeScript type checks across both projects (`tsc --noEmit`).
- Verified live end-to-end integration: Fake Store API retrieval, enquiry form submission, and email reception in Mailpit.

### Phase 5: Review, Refactoring & Packaging (~10 min)
- Refactored `ProductService` to decouple caching via `CachedProductProvider` (Decorator Pattern).
- Configured multi-container `docker-compose.yml` and Dockerfiles for 1-command reviewer startup (`docker compose up --build`).
- Authored and cross-referenced submission documentation: [`README.md`](file:///c:/Projects/OpenWorks%20Assignment/README.md), [`DECISIONS.md`](file:///c:/Projects/OpenWorks%20Assignment/DECISIONS.md), and [`AI_USAGE.md`](file:///c:/Projects/OpenWorks%20Assignment/AI_USAGE.md).
