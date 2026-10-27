# ERP acceptance tests

Run from `erp-frontend` with the sibling `erp-backend` checkout present:

```sh
npx playwright install chromium
npm run test:e2e
npm run test:e2e:local -- chromium mobile-chrome
```

The runner creates a new temporary directory named `erp-qa-*`, builds a separate
production frontend, migrates/seeds a disposable SQLite database, and starts the
Laravel API, Reverb and Next.js on available local ports. It does not reset the
normal development database, reuse running servers, change `.env`, or deploy.
Every browser project starts with fresh fixtures. Mail uses the array driver and
external Web Push credentials are cleared. Child servers are stopped at exit.

Results, screenshots and failure traces are saved under
`test-results/erp-qa-*/<browser>/`; open `html/index.html` for the Playwright report.
Server logs and the test database remain in the temporary directory printed by
the runner. The directory can be deleted after reviewing the evidence.

Install Firefox/WebKit to run those additional projects. You can supply
`E2E_CHROMIUM_EXECUTABLE_PATH` to use an already installed Playwright Chromium.
`E2E_API_PORT`, `E2E_WEB_PORT` and `E2E_SOCKET_PORT` override automatic port selection.
The suite's fixture dates currently exercise the 2026 acceptance release.

For an already prepared disposable stack, the raw runner is:

```sh
E2E_BASE_URL=http://localhost:<web-port> \
E2E_API_URL=http://127.0.0.1:<api-port>/api/v1 \
E2E_FIXTURES=/path/to/erp-qa-*/fixtures.json \
npx playwright test --project=chromium
```

The suite includes browser workflows and direct HTTP integration assertions.
It uses actual API/database/WebSocket traffic; `page.clock` advances only browser
time to verify the recurring timer popup. It does not claim hardware-device
connectivity, delivery through a real OS push service, or deployed-site acceptance.

The leave review controls offer Approve/Reject. A submitted leave request has
`status: null` and `needsReview: true` until a reviewer decides; there is no Pending
leave status. Submission does not deduct balance. Cancellation remains a separate
withdrawal action. Short-permission and overtime workflows retain their own states.

Deploy the backend migration `2026_10_27_000001_remove_pending_leave_status.php`
before the updated frontend. It converts old Pending leave rows without changing
dates, consumed balances, existing decisions or audit fields. The migration has
separate PostgreSQL CHECK-constraint handling and supports rollback.
