# AI Usage Notes

This document details the AI tools, models, skills, prompts, and engineering oversight used during the planning and implementation of the Product Catalogue application.

---

## 1. Tools and Models Used

- **Primary Orchestrator & Planner**: Claude Opus 4.6 (Thinking)
- **Implementation & Refactoring Agent**: Gemini 3.8 Flash (Medium)
- **Development Environment**: Antigravity AI-Native Agent Workspace
- **Specialized Skills Utilized**:
  - `feature-forge`: Requirements breakdown, acceptance criteria, and EARS-style specs.
  - `architecture-designer`: System architecture, sequence diagrams, and Architecture Decision Records (ADRs).
  - `typescript-pro`: Strict type systems, branded types, and tsconfig optimization.
  - `api-designer`: RESTful endpoint design, error envelope schemas, and HTTP status code semantics.
  - `fullstack-guardian`: Frontend-to-backend integration, client/server input validation, XSS prevention.
  - `react-expert`: React 18+ component architecture, TanStack Query integration, CSS Modules, accessibility.
  - `test-master`: Unit, integration, and component testing design across Vitest, Supertest, and React Testing Library.
  - `code-reviewer`: Static analysis and verification of boundaries, error handling, and test coverage.

---

## 2. Key Prompts and Moments That Shaped the Solution

### Moment 1: Establishing a Closed, Deterministic Implementation Plan
- **Context**: The challenge requested a foundation that can grow, noting that prototypes are often thrown away if not properly architected.
- **Direction**: Rather than jumping straight into code, we directed the AI to generate a comprehensive, deterministic specification in `Plan.md` covering all 11 architectural domains, including complete endpoint contracts, Zod schemas, component hierarchies, and 9 sequential execution phases.
- **Outcome**: `Plan.md` served as the single source of truth, eliminating ambiguities around sorting logic, tie-breaking, search scope, and error envelopes.

### Moment 2: Strict Abstraction of External Integrations
- **Context**: The requirements emphasized that Fake Store API, look-and-feel, and email provider are all expected to change.
- **Direction**: Enforced the Adapter/Provider pattern via `ProductProvider` and `EmailProvider` interfaces.
- **Outcome**: Concrete classes (`FakeStoreProductProvider`, `NodemailerEmailProvider`) implement these interfaces. Changing either service in the future requires modifying zero lines of business logic in `ProductService` or `EnquiryService`.

### Moment 3: Defense-in-Depth Validation and Sanitization
- **Context**: Submitting customer contact forms over email presents injection risks (XSS / HTML injection).
- **Direction**: Employed `fullstack-guardian` principles: validate request payloads using Zod on both client and server, enforce strict regex on telephone input, and escape all customer-supplied strings before interpolating them into HTML email templates.

---

## 3. Where the AI Got Something Wrong and How It Was Caught

### Mistake 1: Substring Matching Inadvertently Matching Substrings in Test Data
- **What happened**: In the unit test for `productService.search()`, the test searched for `"RING"` expecting 2 jewelry items. However, the test failed because `"Cotton Jacket"` contains the word `"Spring"` in its description (`"outerwear jackets for Spring/Autumn/Winter"`), which matched the substring `"ring"`.
- **How it was caught**: Running the automated Vitest test suite (`npm test`) immediately highlighted the discrepancy: `expected 2 but got 3`.
- **Resolution**: Refined the test search term to `"PETITE"` (which uniquely identifies the targeted jewelry item) while confirming that the substring matching behavior in `productService.ts` was indeed working accurately.

### Mistake 2: TypeScript Parameter Property Override in `ProviderError`
- **What happened**: In `server/src/types/index.ts`, `ProviderError` attempted to declare `constructor(message: string, public readonly cause?: unknown)`. Under TypeScript strict mode with `noImplicitOverride: true`, `cause` exists on standard ES2022 `Error`, triggering compiler error `TS4115: This parameter property must have an 'override' modifier`.
- **How it was caught**: Running `npm run typecheck` caught this immediately during the Phase 1-4 validation.
- **Resolution**: Updated `ProviderError` to explicitly declare `override readonly cause?: unknown` and assign it cleanly in the constructor.

---

## 4. Time Breakdown

| Activity | Estimated Time | Notes |
|----------|---------------|-------|
| **Planning & Spec Generation** | ~40 min | Analyzed requirements, reviewed skills, drafted `Plan.md` with complete API contracts and ADRs. |
| **Backend Implementation** | ~35 min | Scaffolding, providers, services, validation schemas, controllers, routes, and unit/integration tests. |
| **Frontend Implementation** | ~35 min | React components, CSS modules, custom query hooks, forms, responsive layouts, and component tests. |
| **Testing & Review** | ~20 min | Ran full Vitest test suites across backend and frontend, verified builds, ensured zero type errors. |
| **Documentation & Packaging** | ~15 min | Authored `README.md`, `DECISIONS.md`, `AI_USAGE.md`, and validated local developer experience. |
| **Total** | **~2 hr 25 min** | Well within the recommended 2–3 hour time box. |
