# Product Catalogue — AI-Native Engineering Take-Home Challenge

A full-stack product catalogue web application featuring curated top-rated products, category browsing, debounced search with instant suggestions, product detail views, and a customer enquiry form that delivers notification emails to the sales team inbox.

---

## 1. Setup & Run Instructions (Reviewer Quick Start)

> **Goal**: Enable a reviewer to clone, boot, and evaluate the entire application in under 2 minutes with a single command.

### Reviewer Configuration & Zero-Config Guarantee

- **Zero Third-Party Accounts / Paid Services**: In compliance with challenge constraints, the application requires **no external accounts, credit cards, or paid API keys**.
- **Pre-configured Defaults**: All networking, ports, API proxy paths, and SMTP configurations are pre-wired.
- **Environment Files**: Provided via committed `.env.example` files (`server/.env.example` and `client/.env.example`). When running with Docker Compose, all environment variables are injected automatically.

---

### Recommended: 1-Command Startup (Docker Compose)

The fastest and most reliable way to run the entire stack (Frontend + Backend API + Mailpit SMTP server) on any operating system:

```bash
docker compose up --build
```

#### Running Services & URLs

| Service | URL | Description |
|---|---|---|
| **Frontend Web App** | [http://localhost:5173](http://localhost:5173) | React SPA catalogue interface |
| **Backend REST API** | [http://localhost:3001/api/v1](http://localhost:3001/api/v1) | Express API (Health: `/api/v1/health`) |
| **Mailpit Web Inbox** | [http://localhost:8025](http://localhost:8025) | Local SMTP web client for incoming sales enquiries |

To stop all services:
```bash
docker compose down
```

---

### Alternative: Running Locally with Node.js & npm

If you prefer to run services natively without Docker:

#### Prerequisites
- **Node.js**: `v18.0.0` or higher (tested on `v20` and `v24`)
- **npm**: `v9.0.0` or higher

#### Step 1: (Optional) Start Mailpit for Email Delivery
If Docker is available, run just the Mailpit SMTP container:
```bash
docker compose up -d mailpit
```
> *If Docker is not installed, the application will still run normally; customer enquiry submissions will log an SMTP notice to the backend console.*

#### Step 2: Start the Backend API
```bash
cd server
npm install
npm run dev
```
- API Base URL: **http://localhost:3001/api/v1**
- Health Check: **http://localhost:3001/api/v1/health**

#### Step 3: Start the Frontend Client
In a new terminal:
```bash
cd client
npm install
npm run dev
```
- Web Application: **http://localhost:5173**

---

### Running Automated Tests

Both suites are fully automated and run in headless mode:

```bash
# 1. Run Backend Tests (50 unit & API integration tests)
cd server
npm test

# Check backend TypeScript compilation
npm run typecheck
```

```bash
# 2. Run Frontend Tests (28 component & interaction tests)
cd client
npm test

# Check frontend TypeScript compilation
npm run typecheck
```

---

## 2. Tech Stack & Architectural Choices

Per **Technical Constraint 1**, here are the chosen layers and rationale:

| Layer | Choice | Rationale & Constraint Compliance |
|---|---|---|
| **Client** | **React 18 + TypeScript + Vite** | Modern single-page application with strict type safety, rapid HMR, and CSS Modules for scoped styling. TanStack Query manages server cache, loading states, and network deduplication. |
| **Backend** | **Node.js + Express + TypeScript** | Lightweight RESTful API serving as an isolated gateway. **Constraint 2 Compliance:** The Fake Store API is never called directly from the client; all retrieval, ranking, search, caching, and email dispatch remain strictly server-side. |
| **Validation** | **Zod** | Shared schema validation across client forms and Express request middleware to guarantee type safety and reject malformed inputs before processing. |
| **Email Testing** | **Nodemailer + Mailpit** | Zero-dependency local SMTP testing. Mailpit captures sent emails without external credentials and renders them in a web inbox. |
| **Infrastructure** | **Docker & Docker Compose** | **Constraint 3 Compliance:** Fully compatible with AWS (ECS Fargate task definitions, ECR images, or AWS App Runner / Amplify). |
| **Testing** | **Vitest + Supertest + React Testing Library** | High-speed unit and integration coverage across business logic, API route contracts, and component interaction flows. |

---

## 3. Application Features & Acceptance Criteria Mapping

| Acceptance Criteria (from Spec) | Implementation & Feature Highlights |
|---|---|
| **Home Page**: *"GIVEN I have chosen 5 products to be 'top rated' WHEN I am viewing the home page THEN I see those 5 featured products"* | Deterministically ranks products by `rating.rate` (descending), tie-broken by `rating.count` (descending) and `id` (ascending). Displays the Top 5 Featured Products alongside category navigation cards. |
| **Category Page**: *"THEN I see top rated products for that category AND I see additional products in that category"* | Categorizes items into **"Top Rated in this Category"** (top 3) followed by **"More Products"** for complete department browsing. |
| **Search**: *"WHEN I click the search button THEN I only see products that have text matching that search term"* | Features both: (1) Amazon-style debounced instant suggestion modal (300ms debounce, 3+ characters, keyboard accessible with Arrow/Enter/Escape), and (2) dedicated search results page (`/search?q=...`) matching title and description case-insensitively. |
| **Product Page**: *"WHEN I click on a product tile THEN I see the product details page"* | Full product detail view (`/products/:id`) displaying high-res imagery, rating breakdown, category badge, formatted price, description, and an "Enquire About This Product" CTA. |
| **Enquiry**: *"WHEN I submit the form THEN the sales inbox will receive an email AND the customer will see a 'Thank you' message"* | Contact form validating customer name, email, optional phone, and message. Transmits an HTML email to `sales@example.com` via SMTP with full product context, redirecting to a confirmation Thank You page. |

---

## 4. API Endpoints Specification

All API endpoints follow a uniform JSON envelope:
- **Success**: `{ "success": true, "data": ... }`
- **Error**: `{ "success": false, "error": { "message": "...", "details": [...] } }`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/products?limit=5` | Returns top-rated products (default 5, max 20) |
| `GET` | `/api/v1/products/search?q=:query` | Full-text search across product titles and descriptions |
| `GET` | `/api/v1/products/:id` | Returns individual product details |
| `GET` | `/api/v1/categories` | Lists all distinct product categories |
| `GET` | `/api/v1/categories/:name/products` | Returns category products split by top-rated and other |
| `POST` | `/api/v1/enquiries` | Validates contact payload and sends sales notification email |
| `GET` | `/api/v1/health` | Health check endpoint |

---

## 5. Submission Artifacts & Supplementary Docs

In accordance with the challenge deliverables, the repository includes:

1. **[DECISIONS.md](file:///c:/Projects/OpenWorks%20Assignment/DECISIONS.md)**:
   - Assumptions made where acceptance criteria left gaps (ranking formula, search scope, category splits).
   - Requirements dropped or simplified and rationale.
   - Architectural evolution beyond the PoC (Adapter pattern, AWS deployment path, database readiness).
   - Next steps with an additional working day.
2. **[AI_USAGE.md](file:///c:/Projects/OpenWorks%20Assignment/AI_USAGE.md)**:
   - AI tools, models, and specialized skills utilized.
   - Key prompts and steering moments that shaped the solution.
   - Mistakes made by AI and how they were caught and corrected through engineering oversight.
   - Honest time breakdown across planning, implementation, testing, and documentation.
3. **[Plan.md](file:///c:/Projects/OpenWorks%20Assignment/Plan.md)**:
   - Complete implementation blueprint and phase execution roadmap.
4. **[TIME_BREAKDOWN.md](file:///c:/Projects/OpenWorks%20Assignment/TIME_BREAKDOWN.md)**:
   - Granular phase-by-phase time log across planning, building, testing, and reviewing.

---

## 6. Project Structure

```
├── Plan.md                 # Implementation blueprint & execution plan
├── DECISIONS.md            # Architecture decision records & trade-offs
├── AI_USAGE.md             # AI tooling notes, mistake log & verification results
├── TIME_BREAKDOWN.md       # Detailed time tracking across challenge phases
├── README.md               # Setup, running instructions & API guide
├── docker-compose.yml      # Multi-container orchestration (client, server, mailpit)
├── server/                 # Express + TypeScript backend API
│   ├── Dockerfile          # Node 20 alpine production image
│   ├── .dockerignore
│   ├── .env.example        # Reference environment variables
│   ├── src/
│   │   ├── config/         # Zod-validated configuration
│   │   ├── controllers/    # Express controllers
│   │   ├── middleware/     # Error handler & validation middleware
│   │   ├── providers/      # FakeStore & Nodemailer adapters + TTL Cache
│   │   ├── routes/         # REST route definitions
│   │   ├── services/       # Domain logic (ranking, filtering, enquiries)
│   │   └── types/          # Domain TypeScript models
│   └── tests/              # 50 Vitest & Supertest unit/integration tests
└── client/                 # React 18 + Vite + TypeScript frontend
    ├── Dockerfile          # Node 20 alpine client container
    ├── .dockerignore
    ├── .env.example        # Reference environment variables
    ├── src/
    │   ├── api/            # Typed backend API client
    │   ├── components/     # Header, ProductCard, SearchBar, EnquiryForm, etc.
    │   ├── hooks/          # TanStack Query custom hooks
    │   ├── pages/          # Home, Category, Search, ProductDetail, Enquiry, ThankYou
    │   └── styles/         # CSS variables & design tokens
    └── tests/              # 28 React Testing Library & Vitest tests
```
