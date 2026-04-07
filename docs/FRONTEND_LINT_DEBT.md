# Frontend Lint Debt

## Current Status

- `npm run lint` passes with 59 warnings and 0 errors.
- The warnings are currently non-blocking in CI, but they are now categorized so they can be reduced incrementally.

## Warning Categories

### 1. Unused Imports and Variables

- Rule: `@typescript-eslint/no-unused-vars`
- Common examples:
  - unused `Link`, `Progress`, `Skeleton`, `Loader2`
  - unused local state such as `setMode`, `selectedFrequency`, `initialAmount`
- Recommended action:
  - remove dead imports and locals
  - convert intentionally unused callback params to `_` only where needed

### 2. React Compiler / React Hook Form Compatibility

- Rule: `react-hooks/incompatible-library`
- Affected pattern:
  - calling `form.watch(...)` directly during render in components such as dialogs and forms
- Recommended action:
  - replace render-time `watch()` usage with `useWatch`
  - isolate derived values in memo-safe hooks/components when needed

### 3. Hook Dependency Hygiene

- Rule: `react-hooks/exhaustive-deps`
- Affected pattern:
  - incomplete or unnecessary dependency arrays in `useMemo` / `useEffect`
- Recommended action:
  - either include the real dependencies or simplify the memoized block if memoization is not buying anything

### 4. Unused ESLint Directives

- Rule:
  - unused disable comments
- Recommended action:
  - delete stale `eslint-disable` directives once the underlying rule is no longer triggered

## Suggested Cleanup Order

1. Remove unused imports and locals.
2. Fix stale `eslint-disable` directives.
3. Refactor `form.watch()` call sites to `useWatch`.
4. Clean up remaining hook dependency warnings.
