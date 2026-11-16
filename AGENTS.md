# Mandatory cross-chat continuity
Before making a change read the canonical documentation in `Elmo-Tech/erp-backend` branch `rebuild/erp-v2`: `docs/START_HERE.md`, `docs/PROJECT_STATUS.md`, `docs/WORK_PROTOCOL.md`, `docs/MODULE_ROADMAP.md`, `docs/DECISIONS.md`, and the task handoff.
One chat per tracked GitHub Issue; work on a `task/<task-id>-...` topic branch, submit a PR to `rebuild/erp-v2`. Update the backend canonical status and handoff for EVERY session. Keep test reports accurate, never invent passing builds. See `docs/START_HERE.md`.

# Elmo Tech ERP V2 - Frontend engineering rules
- This branch is a clean rewrite. Do not import features from legacy code without an ADR and tests.
- React 19 + TypeScript strict + Vite + Tailwind CSS 4.
- Backend is the source of truth for money, roles and company authorization.
- Never store auth tokens in localStorage or expose raw bank/employee secrets.
- Accessibility, RTL readiness, mobile usability, and clear empty/error/loading states are required.
- Every business mutation must be authenticated and protected by server-side authorization.
- Prefer small feature modules and composition; do not create 1,000-line components.
- Add tests before wiring financial flows; no fabricated operational numbers in dashboards.
- No production deployment without an approved release gate.
