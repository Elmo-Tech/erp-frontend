# P0-02 SPA auth integration

Canonical API and security policy: [backend docs/AUTH_SECURITY_CONTRACT.md](https://github.com/Elmo-Tech/erp-backend/blob/task/p0-02-auth-rbac/docs/AUTH_SECURITY_CONTRACT.md).

- Set VITE_API_ORIGIN to the real Laravel origin (no /api suffix).
- SPA requests use credentials: include. Mutations first retrieve /sanctum/csrf-cookie and submit the XSRF cookie via X-XSRF-TOKEN.
- The session cookie is HttpOnly. No bearer token or localStorage-based authentication.
- A privileged login returns HTTP 202 and requires TOTP MFA; on first sign in a six-digit confirmation enrolls the authenticator. Recovery codes display once.
- The company list comes from the server. Switching uses POST /api/v1/companies/switch, not a client-generated company header.
- Permission badges are informative only. The backend is the access-control authority.
- Browser-backed localhost:5173 → localhost:8000 and real PostgreSQL/Auth/CORS/CSRF verification must be recorded in the backend P0-02 handoff before signoff. NOT VERIFIED solely from unit tests.
