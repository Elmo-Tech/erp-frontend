# Feature-Sliced Design Migration

This frontend is being migrated to Feature-Sliced Design incrementally.

`src/_old` contains the current application logic that was moved out of the new FSD layers for gradual migration. Existing routes may temporarily import from `@/_old/...` while features are moved one by one into the proper layers.

## Active Layers

- `src/app` keeps the Next.js App Router entrypoints, layouts, providers, and route files.
- `src/pages` is reserved for FSD page-level compositions.
- `src/widgets` is reserved for reusable page sections and complex UI blocks.
- `src/features` is reserved for user-facing actions and use cases.
- `src/entities` is reserved for domain models, entity APIs, and entity UI.
- `src/shared` contains reusable infrastructure with no business ownership.

## Deprecated Area

The following legacy areas live under `src/_old`:

- `src/_old/features`
- `src/_old/store`
- `src/_old/hooks`
- `src/_old/components`
- `src/_old/lib`

Do not add new code to `src/_old`. Treat it as a compatibility layer until each feature is migrated.

## Shared Layer Setup

- Shared UI primitives and reusable UI helpers now live in `src/shared/ui`.
- General-purpose utilities now live in `src/shared/lib`.
- Shared hooks now live in `src/shared/hooks`.
- The new Axios base client lives in `src/shared/api/base.ts`.

## Migration Rules

Move one vertical slice at a time:

1. Move domain types and domain-specific helpers into `src/entities/<entity>`.
2. Move user actions, forms, mutations, and feature-specific hooks into `src/features/<feature>`.
3. Move composed dashboard/client blocks into `src/widgets/<widget>`.
4. Keep route files thin in `src/app`; they should compose pages/widgets/features, not own business logic.
5. Keep `src/shared` generic. It must not import from `app`, `pages`, `widgets`, `features`, `entities`, or `_old`.
6. Remove `_old` imports only after the migrated slice has parity and tests.

## Initial Scaffold Commands

```bash
mkdir -p src/_old src/shared src/pages src/widgets src/entities src/shared/api src/shared/lib src/shared/config src/shared/hooks
git mv src/features src/_old/features
git mv src/store src/_old/store
git mv src/hooks src/_old/hooks
git mv src/components/ui src/shared/ui
git mv src/components/shared/* src/shared/ui/
git mv src/components src/_old/components
git mv src/lib src/_old/lib

git mv src/_old/lib/utils.ts src/shared/lib/utils.ts
git mv src/_old/lib/dateUtils.ts src/shared/lib/dateUtils.ts
git mv src/_old/lib/formatters.ts src/shared/lib/formatters.ts
git mv src/_old/lib/statusHelpers.ts src/shared/lib/statusHelpers.ts
git mv src/_old/lib/api-error.ts src/shared/lib/api-error.ts
git mv src/_old/lib/errorHandling.ts src/shared/lib/errorHandling.ts
git mv src/_old/lib/hooks/useDebounce.ts src/shared/hooks/useDebounce.ts
git mv src/_old/lib/hooks/index.ts src/shared/hooks/index.ts

mkdir -p src/features src/pages src/widgets src/entities src/shared/config
touch src/features/.gitkeep src/pages/.gitkeep src/widgets/.gitkeep src/entities/.gitkeep src/shared/config/.gitkeep
```
