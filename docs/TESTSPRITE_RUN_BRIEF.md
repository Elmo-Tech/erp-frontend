# TestSprite execution brief

## Before the run

1. Supply the frontend staging URL and API base URL ending in `/api/v1`.
2. Supply credentials privately for Super Admin, Manager A/B, Employee A/B,
   Supervisor, limited HR role, and Client. Do not paste passwords into the PRD.
3. Record deployed frontend/backend revision IDs. Run on synthetic staging data.
4. Keep `ERP_SIMPLIFIED_MODE=true` for the primary run. Prepare real file fixtures,
   fixed financial data, queue/broadcasting, and the test Drive account when available.
5. Upload `docs/TESTSPRITE_PRD.md` as the product requirements document. If working
   from the workspace, point TestSprite to that file in `erp-frontend`.

## Prompt to give TestSprite

```text
Read docs/TESTSPRITE_PRD.md and generate a frontend E2E acceptance test plan
for The Tables ERP. Use the provided staging URL and privately supplied role
credentials. Record the deployed frontend/backend revisions.

Map every generated test to the PRD scenario IDs. First execute P0 financial,
authorization, and timer-lifecycle cases, then P1 essential UI workflows and
Achraf regressions, then P2 mobile/Safari/integration/reminder cases.

Use real UI interactions and real APIs, not mocked success responses. Verify
persistence after reload and reconcile the exact fixture amounts in the PRD.
An API-only test cannot pass a missing required UI control.

Keep simplified ERP mode enabled. Test deduction-type Settings even if a
disabled-module guard currently blocks it. Use client lateness boundaries
as the expected rule, not the implementation's incorrect ranges.

Do not modify production data, run global seed/reset commands, change code,
or weaken assertions. Use uniquely named synthetic test records and clean
up only records/timers created for this run. Restore changed policies/roles.

If a role account, fixture service, OAuth account, or real OS notification/
audio capability is missing, report BLOCKED and identify the exact missing
input. Do not report these tests as passed. Instrumented audio/browser-clock
checks must be clearly identified, with headed/manual follow-up where needed.

Return the plan, scenario-by-scenario PASS/FAIL/BLOCKED/NOT RUN results,
screenshots/traces, sanitized failing network requests, financial expected
vs actual results, and a severity-ranked defect report. Do not claim the
whole product is complete when any required scenario has not been executed.
```

## Suggested execution batches

| Batch | Scope |
| --- | --- |
| Smoke | AUTH-01/03, CRM-01/02, PRJ-01, TASK-01/04, TMR-02, EMP-03, DED-01/04 |
| Financial & access gates | Remaining P0 cases from authentication, timer, leave, deductions, overtime, advances, partial pay, files, supervision and audit |
| Functional & UX | Remaining P1 cases, including Achraf's reported regressions |
| Compatibility/integrations | P2 + Drive OAuth/file round-trip + headed audio/notification check |

If the runner cannot execute the entire plan in one run, preserve the full scenario
inventory and explicitly list the remaining IDs. Follow-up runs should target failed,
blocked, or not-run IDs without discarding prior evidence.
