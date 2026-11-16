# P0-02 SPA auth integration

## Latest tested integration — atomic MFA code (2026-11-16)

- Workflow `.github/workflows/browser-e2e.yml` now pins **both** backend checkout and SHA verification to `ceded61c936009105b0607c022c02967e2645a6b`; workflow change committed as [frontend `85141d4`](https://github.com/Elmo-Tech/erp-frontend/commit/85141d4dab62ff13f778971fa7fd2beb28ac2de3).
- [**Chromium browser E2E #43884430301 — SUCCESS**](https://github.com/Elmo-Tech/erp-frontend/actions/runs/43884430301): pinned exact-revision check, synthetic PostgreSQL, real Laravel/Vite localhost origins, CSRF/cookies, initial TOTP enrollment and recovery/reuse, permissions and CORS negative tests. Tested frontend SHA: `85141d4dab62ff13f778971fa7fd2beb28ac2de3`.
- [**Frontend CI #43884430300 — SUCCESS**](https://github.com/Elmo-Tech/erp-frontend/actions/runs/43884430300) at the same frontend SHA. [Backend PostgreSQL 18 / 27 tests / 233 assertions #43881203049 — SUCCESS](https://github.com/Elmo-Tech/erp-backend/actions/runs/43881203049) for the pinned backend code.
- **Remaining gates:** independent qualified human security review NOT COMPLETED; owner policy proposals NOT APPROVED; PRs #6 backend and #2 frontend remain Draft/unmerged, docs PR #5 draft, no production testing or deployment.
- Canonical durable status: [P0-02 handoff](https://github.com/Elmo-Tech/erp-backend/blob/task/p0-02-auth-rbac/docs/handoffs/P0-02.md). Historical E2E evidence below describes older code and is retained for provenance.

Canonical API and security policy: [backend docs/AUTH_SECURITY_CONTRACT.md](https://github.com/Elmo-Tech/erp-backend/blob/task/p0-02-auth-rbac/docs/AUTH_SECURITY_CONTRACT.md).

- Set VITE_API_ORIGIN to the real Laravel origin (no /api suffix).
- SPA requests use credentials: include. Mutations first retrieve /sanctum/csrf-cookie and submit the XSRF cookie via X-XSRF-TOKEN.
- The session cookie is HttpOnly. No bearer token or localStorage-based authentication.
- A privileged login returns HTTP 202 and requires TOTP MFA; on first sign in a six-digit confirmation enrolls the authenticator. Recovery codes display once.
- The company list comes from the server. Switching uses POST /api/v1/companies/switch, not a client-generated company header.
- Permission badges are informative only. The backend is the access-control authority.
- Browser-backed localhost:5173 → localhost:8000 and real PostgreSQL/Auth/CORS/CSRF verification must be recorded in the backend P0-02 handoff before signoff. NOT VERIFIED solely from unit tests.

## 2026-11-16 security review E2E evidence

- **Backend code pinned to immutable SHA:** `0d2843ccb2df9c5df3629ce3f4ad0b56dfd44cea` (checked with `git rev-parse HEAD` in the E2E job). Test frontend SHA: `6b2b3f97c2dbe8321373cd7d4b195b95ed5f5869`.
- **PASS** [Chromium run #43875272279](https://github.com/Elmo-Tech/erp-frontend/actions/runs/43875272279). Disposable PostgreSQL 18 + Laravel localhost:8000 + Vite localhost:5173. Tested real first privileged TOTP setup with externally provisioned synthetic trusted activation, expired OTP rejection, eight displayed once recovery codes, used-code replay denial, DOM clearance, /me no-store, CSRF 419, logout, global company visibility without raw finance/payroll, CORS block of untrusted origin.
- **PASS** [Frontend CI #43875272312](https://github.com/Elmo-Tech/erp-frontend/actions/runs/43875272312) — typecheck, Vitest, Vite build and Docker/Nginx smoke. **PASS** [Backend CI #43874999124](https://github.com/Elmo-Tech/erp-backend/actions/runs/43874999124) — PostgreSQL migrations, 24 PHPUnit tests / 178 assertions, Docker/health.
- The backend authentication model hides/encrypts MFA secrets and requires an unexpired `user_mfa_enrollment_authorizations` entry issued only by a trusted operational process. **This issuance/recovery/security policy is PROPOSED pending owner approval**. The SPA only shows setup seeds when enrolling, and clears them plus recovery codes from UI after confirmation/dismiss/logout. No application tokens in localStorage.
- All PRs remain Draft/unmerged; there is no production deployment or proof against real accounts.
