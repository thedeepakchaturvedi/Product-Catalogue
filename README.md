# Product Catalogue — AI-Native Engineering Take-Home Challenge

A full-stack product catalogue web application featuring curated top-rated products, category browsing, full-text product search, detail views, and a customer enquiry form that sends email notifications to the sales team.

---

## Tech Stack & Architectural Choices

| Layer | Choice | Rationale |
|---|---|---|
| **Frontend** | **React (v18) + TypeScript + Vite** | High-performance single-page application with type safety, rapid HMR, and modern component architecture. TanStack Query manages server state and caching seamlessly. |
| **Backend** | **Node.js + Express + TypeScript** | Lightweight RESTful API providing an isolated proxy to the upstream Fake Store API. Keeps product data retrieval, caching, filtering, and email delivery strictly server-side. |
| **Validation** | **Zod** | Shared schema validation on both client and server to ensure robust input validation and type safety. |
| **Email Testing** | **Nodemailer + Mailpit** | Mailpit runs locally via Docker Compose (or direct binary), offering a local SMTP server and web inbox without requiring third-party credentials or API keys. |
| **Testing** | **Vitest + Supertest + React Testing Library** | Fast unit and integration tests across backend domain logic, API endpoints, and frontend user interactions. |

---

## Prerequisites

- **Node.js**: `v18.0.0` or higher (tested on `v24.22.0`)
- **npm**: `v9.0.0` or higher
- **Docker & Docker Compose** *(optional for viewing sent emails in Mailpit UI)*

---

## Quick Start (Run Locally in Under 5 Minutes)

### 1. (Optional) Start Mailpit for Email Delivery

If you have Docker installed, start the local SMTP server and Mailpit web inbox:

```bash
docker compose up -d
```
> Mailpit Web Inbox will be available at: **http://localhost:8025**  
> *(If you don't have Docker installed, the application will still run. Enquiry attempts will log a warning or use your configured SMTP host).*

---

### 2. Start the Backend API

Open a terminal and run:

```bash
cd server
npm install
npm run dev
```

The backend server starts on: **http://localhost:3001**  
Health check endpoint: **http://localhost:3001/api/v1/health**

---

### 3. Start the Frontend Client

Open a second terminal and run:

```bash
cd client
npm install
npm run dev
```

The web application will open on: **http://localhost:5173**

---

## Running the Automated Tests

### Backend Tests (Unit & API Integration Tests)

```bash
cd server
npm test
```
*Runs 50 tests across cache, productService, enquiryService, and Express routes with Supertest.*

```bash
# To run type checking
npm run typecheck
```

### Frontend Tests (Component & Interaction Tests)

```bash
cd client
npm test
```
*Runs 28 component and interaction tests across ProductCard, SearchBar (including debounced suggestions & keyboard nav), EnquiryForm, ErrorBanner, HomePage, CategoryPage, and SearchResultsPage.*

```bash
# To run type checking
npm run typecheck
```

---

## Application Features & User Journeys

1. **Home Page (`/`)**:
   - Displays the **Top 5 Featured Products**, automatically ranked by customer rating (`rating.rate` descending, `rating.count` descending, `id` ascending).
   - Category exploration cards to browse specific departments.
2. **Category Pages (`/categories/:name`)**:
   - Displays **Top Rated in this Category** (up to 3 products) followed by **More Products** for that category.
3. **Search & Real-time Suggestions (`/search?q=...`)**:
   - Amazon-style real-time dropdown modal on input (debounced by 300ms after 3+ characters).
   - Shows product thumbnails, titles, and prices with direct navigation to the product detail page on click.
   - Full keyboard accessibility (Arrow Up/Down navigation, Enter selection, Escape to dismiss).
   - Pressing "Search" CTA or Enter with no item selected navigates to the dedicated full search results page.
   - Server-side case-insensitive search across product title and description.
   - Handles empty queries, zero results, and special characters.
4. **Product Detail Page (`/products/:id`)**:
   - High-resolution product image, title, price, star rating, customer review count, category badge, and full description.
   - "Enquire About This Product" button leading to the enquiry form.
5. **Customer Enquiry Flow (`/products/:id/enquire`)**:
   - Clean contact form capturing Customer First Name, Last Name, Email, optional Phone, and Message.
   - Client and server validation with field-level error messages.
   - HTML notification email dispatched via SMTP to the sales inbox (`sales@example.com`).
   - Seamless transition to the **Thank You Confirmation Page** upon submission.

---

## API Endpoints Specification

All endpoints return a uniform JSON envelope:
- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "error": { "message": "...", "details": [...] } }`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/products?limit=5` | Returns top-rated products (default 5, max 20) |
| `GET` | `/api/v1/products/search?q=:query` | Searches products by title and description |
| `GET` | `/api/v1/products/:id` | Returns single product details |
| `GET` | `/api/v1/categories` | Lists all unique product categories |
| `GET` | `/api/v1/categories/:name/products` | Returns products in category split by top-rated and other |
| `POST` | `/api/v1/enquiries` | Submits enquiry and triggers sales email notification |
| `GET` | `/api/v1/health` | Service health status |

---

## Project Structure

```
├── Plan.md              # Complete implementation plan & single source of truth
├── DECISIONS.md         # Architecture decision records, assumptions & trade-offs
├── AI_USAGE.md          # AI tools, prompts, mistake logs & time breakdown
├── README.md            # Setup guide & project overview
├── docker-compose.yml   # Mailpit service container
├── server/              # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/      # Zod-validated environment config
│   │   ├── controllers/ # HTTP route handlers
│   │   ├── middleware/  # Error handler & Zod validation middleware
│   │   ├── providers/   # FakeStore API & Nodemailer adapters + TTL Cache
│   │   ├── routes/      # Express route definitions
│   │   ├── services/    # Business logic (ranking, filtering, enquiry)
│   │   ├── types/       # TypeScript domain types & interfaces
│   │   └── validation/  # Zod request validation schemas
│   └── tests/           # Vitest unit & Supertest integration tests
└── client/              # React 18 + Vite + TypeScript SPA
    ├── src/
    │   ├── api/         # Typed API client
    │   ├── components/  # Layout, Header, ProductCard, SearchBar, EnquiryForm, etc.
    │   ├── hooks/       # TanStack Query custom hooks
    │   ├── pages/       # Home, Category, Search, ProductDetail, Enquiry, ThankYou
    │   ├── styles/      # CSS variables & design tokens
    │   └── types/       # Shared TypeScript interfaces
```

---

## Local URLs

- **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
- **Mailpit Web Inbox**: [http://localhost:8025](http://localhost:8025)
