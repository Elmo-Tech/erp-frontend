# Frontend Architecture - ERP V2
## Approved choices (2026-11-16)
- React 19, Vite, TypeScript in strict mode; Laravel 13 REST API as source of truth.
- Tailwind CSS 4 with shadcn/ui primitives during design-system phase.
- TanStack Query for server state; TanStack Router and generated OpenAPI types in next PR.
- PostgreSQL 18 and Redis belong to the backend; no direct database access from browser.
- First-party Sanctum SPA cookie sessions, CSRF, MFA and company-bound authorization on API.
## Routing / feature evolution
Target: `src/app`, `src/features`, `src/entities`, `src/shared`. Each feature exposes typed hooks and pages; shared state is minimal.
## Access
Company switching is an authorized API operation, not a client-side data filter. Never derive finance access from project membership.
## Rollout
P0-01 ships health connectivity and shell only; P0-02 adds session and companies; subsequent PRs introduce real screens. No fake financial totals.
## Single source of decisions
See `Elmo-Tech/erp-backend` branch `rebuild/erp-v2` docs for business rules, ADR register and database contract.


## Collaboration and handoff

Follow [docs/START_HERE.md](START_HERE.md) and the canonical backend [WORK_PROTOCOL.md](https://github.com/Elmo-Tech/erp-backend/blob/rebuild/erp-v2/docs/WORK_PROTOCOL.md). All cross-repo UI/API decisions belong to the same task Issue and are documented with code and test evidence, not only in a chat.
