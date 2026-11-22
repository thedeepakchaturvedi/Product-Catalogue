# AI Usage Notes

This document details the multi-model architecture, context management, human oversight, specialized skills, key steering moments, mistake analysis, limitations, and verification results for the Product Catalogue project.

---

## 1. Multi-Model Architecture: The Senior Architect + Junior Developer Pattern

Rather than relying on a single model for all tasks, the project employed a **tiered model orchestration strategy** mimicking an engineering team structure. This optimized for both architectural rigor and token efficiency.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SENIOR ARCHITECT & ORCHESTRATOR                       │
│                        High-Reasoning Planning Model                        │
│                                                                             │
│  • Deep reasoning, requirements decomposition & trade-off analysis          │
│  • Domain modeling, boundary isolation & ADR formulation                    │
│  • Skills: feature-forge, architecture-designer                             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼ Generates deterministic Plan.md
┌─────────────────────────────────────────────────────────────────────────────┐
│                     JUNIOR IMPLEMENTER & CODE REVIEWER                      │
│                        Fast Execution & Review Model                        │
│                                                                             │
│  • High-throughput implementation against strict specifications             │
│  • Test suite authorship, type validation & refactoring                     │
│  • Skills: typescript-pro, api-designer, fullstack-guardian, react-expert,   │
│           test-master, code-reviewer                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Engineering Rationale

- **Model Tiering**: Reduced reliance on expensive reasoning models for repetitive implementation tasks while reserving deeper reasoning capabilities for architecture and complex engineering decisions.
- **Human Oversight & Engineering Ownership**: AI-generated plans and implementations were treated as proposals, not authoritative outputs. Engineering responsibilities included:
  - Making final architectural and implementation decisions.
  - Reviewing generated code against acceptance criteria.
  - Challenging unnecessary abstractions and complexity.
  - Running tests, type checks, and validating critical user journeys.
  - Resolving issues that automated tooling identified.
  - The final implementation and engineering decisions remain the author's responsibility.

### Context Management & Execution Control

To maintain consistency between planning and implementation:
- [`Plan.md`](file:///c:/Projects/OpenWorks%20Assignment/Plan.md) served as the primary implementation contract.
- Each implementation phase was scoped strictly against explicit plan sections.
- Agents were instructed not to introduce new dependencies, architectural patterns, or endpoints without justification.
- Changes to the original plan required explicit review before implementation.
- Implementation was validated incrementally through type checks and automated tests.
- This approach minimized conflicting assumptions and reduced context drift across model interactions.

---

## 2. Specialized Skills Utilized

| Phase | Model Role | Specialized Skill | Purpose & Responsibility |
|---|---|---|---|
| **Discovery & Specs** | Planning Model | `feature-forge` | Deconstructed prompt into Given/When/Then acceptance criteria and EARS functional specifications. |
| **System Design** | Planning Model | `architecture-designer` | Evaluated trade-offs, defined the Provider/Adapter Pattern, and authored Architecture Decision Records (ADRs). |
| **Type Safety** | Implementation Model | `typescript-pro` | Configured strict type systems (`noImplicitOverride`, branded types, discriminated unions). |
| **API Contracts** | Implementation Model | `api-designer` | Enforced uniform JSON response envelopes (`{ success, data, error }`) and REST status codes. |
| **Security & Auth** | Implementation Model | `fullstack-guardian` | Handled client/server input sanitization, HTML email injection protection, and CORS configuration. |
| **UI & State** | Implementation Model | `react-expert` | Built React 18+ component trees, TanStack Query hooks, scoped CSS Modules, and keyboard accessibility. |
| **Quality Assurance**| Implementation Model | `test-master` | Authored 80 automated tests (52 backend Vitest/Supertest, 28 frontend React Testing Library). |
| **Static Analysis** | Review Model | `code-reviewer` | Audited code boundaries, identified caching coupling, and verified error-handling paths. |

---

## 3. Key Prompts and Moments That Shaped the Solution

### Moment 1: Establishing a Closed, Deterministic Implementation Plan
- **Context**: The challenge requested a foundation that can grow, noting that prototypes are often thrown away if not properly architected.
- **Direction**: Rather than jumping straight into code, we directed the planning model to generate a comprehensive, deterministic specification in `Plan.md` covering all 11 architectural domains before generating any application code.
- **Outcome**: `Plan.md` eliminated ambiguities around sorting logic, tie-breaking, search scope, and error envelopes.

### Moment 2: Strict Abstraction of External Integrations (Adapter Pattern)
- **Context**: The requirements emphasized that Fake Store API, look-and-feel, and email provider are all expected to change.
- **Direction**: Enforced the Adapter/Provider pattern via `ProductProvider` and `EmailProvider` interfaces.
- **Outcome**: Concrete classes (`FakeStoreProductProvider`, `NodemailerEmailProvider`) implement these interfaces. Changing either service in the future requires modifying zero lines of business logic in `ProductService` or `EnquiryService`.

### Moment 3: Decoupling Caching via the Decorator Pattern
- **Context**: An initial implementation placed caching directly inside `ProductService`, tightly coupling domain logic with infrastructure.
- **Direction**: Directed the agent to apply the Gang-of-Four Decorator Pattern: wrap `ProductProvider` with `CachedProductProvider` so `ProductService` remains pure domain logic.
- **Outcome**: Satisfied both Single Responsibility (SRP) and Open-Closed (OCP) principles. When switching to a CMS with thousands of products, caching can be bypassed or swapped for Redis without changing `ProductService`.

### Moment 4: Defense-in-Depth Validation and HTML Email Sanitization
- **Context**: Submitting customer contact forms over email presents injection risks (XSS / HTML injection).
- **Direction**: Employed `fullstack-guardian` principles: validate request payloads using Zod on both client and server, enforce strict regex on telephone input, and escape all customer-supplied strings before interpolating them into HTML email templates.

---

## 4. Engineering Issues Identified and Resolved

### Case 1: Test Design Assumption vs. Substring Matching
- **What happened**: A unit test for `productService.search()` searched for `"RING"` expecting 2 jewelry items. The test failed because `"Cotton Jacket"` contains the word `"Spring"` in its description (`"outerwear jackets for Spring/Autumn/Winter"`), which correctly matched the substring `"ring"`.
- **Insight**: The implementation was correct according to the requirement ("text matching that search term"), but the test expectation made an unverified assumption about word boundaries.
- **Resolution**: Refined the test search term to `"PETITE"` (which uniquely identifies the targeted jewelry item) while confirming that the case-insensitive substring matching behavior was accurate.

### Case 2: TypeScript Parameter Property Override in `ProviderError`
- **What happened**: In `server/src/types/index.ts`, `ProviderError` attempted to declare `constructor(message: string, public readonly cause?: unknown)`. Under TypeScript strict mode with `noImplicitOverride: true`, `cause` exists on standard ES2022 `Error`, triggering compiler error `TS4115: This parameter property must have an 'override' modifier`.
- **How it was caught**: Running `npm run typecheck` caught this immediately during compilation.
- **Resolution**: Updated `ProviderError` to explicitly declare `override readonly cause?: unknown` and assign it cleanly in the constructor.

### Case 3: TypeScript Narrowing on Asynchronous Callback Mutation in Tests
- **What happened**: In `enquiryService.test.ts`, tracking captured options with `let capturedOptions: SendEmailOptions | null = null` caused TypeScript to narrow `capturedOptions` to `null` because reassignment occurred inside an async mock callback. Optional chaining triggered `Property 'to' does not exist on type 'never'`.
- **How it was caught**: Running `tsc -p tests/tsconfig.json` flagged the compiler error.
- **Resolution**: Refactored the test spy to the **Array Collector Pattern** (`const capturedEmails: SendEmailOptions[] = []`), cleanly preserving array element types across asynchronous closures without type assertions.

---

## 5. AI Limitations & Lessons Learned

The exercise highlighted several practical limitations of AI-assisted development:

1. **Tests Are Not Proof of Correctness**: AI-generated tests can encode incorrect assumptions (such as the substring test expectation above). Expected test results must be independently verified against business requirements rather than accepted blindly.
2. **Overengineering Risk**: Language models tend to introduce speculative abstractions beyond what a focused application needs. Architecture was kept proportional to current requirements while preserving clean extension boundaries.
3. **Cross-Model Consistency**: Different models and contexts can interpret requirements differently. Maintaining a single implementation plan (`Plan.md`) significantly reduced divergence across phases.
4. **Verification Over Confidence**: Generated code was not considered complete until it passed type checks, automated tests, multi-container Docker execution, and manual verification.

---

## 6. Implementation Verification

| Validation Area | Result | Details |
|---|---|---|
| **Backend Automated Tests** | **52 passed** | Unit tests (cache, domain logic, decorator) + Supertest API integration tests |
| **Frontend Automated Tests** | **28 passed** | React Testing Library + Vitest (components, debounce, keyboard nav, forms) |
| **TypeScript Compilation** | **Passed** | 0 errors across backend (`src/` and `tests/`) and frontend under strict mode |
| **Docker Compose Startup** | **Verified** | Single `docker compose up --build` starts frontend, backend, and Mailpit |
| **Fake Store API Integration** | **Verified** | Live data fetch with in-memory TTL caching and timeout handling |
| **Enquiry Email Delivery** | **Verified** | Verified both via unit test mocks and live end-to-end SMTP delivery to Mailpit container |
| **Environment Configuration** | **Verified** | Committed `.env.example` templates; pre-configured zero-config Docker defaults |

*All verification results reflect the final implementation at submission time.*

---

## 7. Time Breakdown

> *Detailed phase-by-phase activity breakdown available in [TIME_BREAKDOWN.md](file:///c:/Projects/OpenWorks%20Assignment/TIME_BREAKDOWN.md).*

| Activity | Estimated Time | Notes |
|----------|---------------|-------|
| **Planning & Spec Generation** | ~30 min | Analyzed requirements, drafted `Plan.md` with complete API contracts and ADRs. |
| **Backend Implementation** | ~35 min | Scaffolding, providers, services, validation schemas, controllers, routes, and unit/integration tests. |
| **Frontend Implementation** | ~35 min | React components, CSS modules, custom query hooks, forms, responsive layouts, and component tests. |
| **Refactoring & Polish** | ~15 min | Refactored caching to Decorator Pattern, Docker multi-container compose, resolved TypeScript test typing. |
| **Documentation & Packaging** | ~10 min | Authored `README.md`, `DECISIONS.md`, `AI_USAGE.md`, and validated 1-command Docker start. |
| **Total** | **~2 hr 10 min** | Well within the recommended 2–3 hour time box. |
