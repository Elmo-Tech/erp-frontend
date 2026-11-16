# Elmo Tech ERP V2 - Frontend

**Status:** P0-01 foundation preview, not production ready.

Clean replacement for the legacy Next.js app, running React 19 + Vite + TypeScript + Tailwind CSS 4. Old code remains available on `oberation`.

## Start
```bash
cp .env.example .env
npm install
npm run dev
```
Open http://localhost:5173 with the backend running at http://localhost:8000.

```bash
npm run typecheck && npm test && npm run build
```

## Security and scope
Internal application only. API health is public; business endpoints will require Sanctum cookie authentication, membership and permission checks. All financial reporting is company scoped. The app never directly connects to PostgreSQL.

## Deployment
`Dockerfile` builds a static Vite bundle served by Nginx. Set `VITE_API_ORIGIN` at build time to the first-party Laravel API domain and configure allowed origins for Sanctum/CORS.
**Do not** point staging to the production ERP database.

## Next delivery
Authentication, authorized company switcher, shared layout/navigation, and generated API types. See `docs/ARCHITECTURE.md`.

