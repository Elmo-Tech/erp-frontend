# ERP V2 Frontend — Start Here

This repo is the **React 19 + Vite + TypeScript UI** of a two-repository ERP. The canonical shared business/architecture/task record is in the **Backend** repo.

## Required before every frontend change or new ChatGPT chat

1. Read https://github.com/Elmo-Tech/erp-backend/blob/rebuild/erp-v2/docs/START_HERE.md
2. Read https://github.com/Elmo-Tech/erp-backend/blob/rebuild/erp-v2/docs/PROJECT_STATUS.md
3. Read https://github.com/Elmo-Tech/erp-backend/blob/rebuild/erp-v2/docs/WORK_PROTOCOL.md
4. Read https://github.com/Elmo-Tech/erp-backend/blob/rebuild/erp-v2/docs/MODULE_ROADMAP.md
5. Read https://github.com/Elmo-Tech/erp-backend/blob/rebuild/erp-v2/docs/DECISIONS.md and the active `docs/handoffs/<TASK-ID>.md`.
6. Read this repo's `AGENTS.md` and `docs/ARCHITECTURE.md`, latest commits, PRs and CI checks.

**Single source of truth:** backend `docs/` for business behavior and task handoffs. Do not fork product requirements between repositories. The frontend documents UI-specific implementation here and links its PR and tests to the shared Issue.

## Now

- Current task [P0-01 — CI & Builds](https://github.com/Elmo-Tech/erp-backend/issues/1).
- Suggested chat title: `ERP V2 | P0-01 | CI & Builds`.
- Initial frontend CI failed: https://github.com/Elmo-Tech/erp-frontend/actions/runs/43843105601. Root cause **not yet established**.
- No successful full build/typecheck/test or deployment has been verified yet.

## Session completion gate

Commit code only on a dedicated topic branch created from `rebuild/erp-v2`, target PR to `rebuild/erp-v2`, then update the backend canonical task handoff + PROJECT_STATUS, including verified CI links and precise next steps. Do NOT modify `main`, `oberation` or production systems without approval.

Chat transcripts and an old downloaded ZIP are not authoritative. Check GitHub live each time.
