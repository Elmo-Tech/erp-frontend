# The Tables ERP — Product Requirements & E2E Acceptance PRD

**Version:** 1.0  
**Prepared:** October 11, 2026  
**Audience:** TestSprite / QA automation  
**Application:** Next.js frontend + Laravel API  
**Primary UI language:** English; Arabic API messages are also supported.

## 1. Objective and acceptance authority

Validate real user workflows across CRM, projects, task timers, employee HR, settings,
authorization, and financial records. The goal is to detect incomplete or incorrect
behavior, including features previously described as complete.

This is an acceptance specification, NOT a statement that all scenarios currently pass.
Use the September 23 client requirements, the client lateness penalty table, the six
confirmed business decisions, and Achraf's October 1 issue report as acceptance inputs.
Current implementation observations are listed separately in section 10.

Do not weaken assertions to match a bug. Do not count a successful HTTP response,
success toast, or passing unit test as proof that a workflow is correct. Verify the
saved data, balances, authorization, and behavior after reload.

## 2. Environment and run inputs

Fill these values before running. Credentials must be supplied privately to the test
runner; do not put real passwords or tokens in this document or reports.

| Input | Value / requirement |
| --- | --- |
| `FRONTEND_URL` | `<staging URL>`; local default `http://localhost:3000` |
| `API_BASE_URL` | `<API origin>/api/v1`; local default `http://localhost:8000/api/v1` |
| `ERP_SIMPLIFIED_MODE` | `true` for the primary acceptance run |
| Release identifiers | Record frontend and backend revision IDs before testing |
| Timezone | Record browser, server, and application timezone; financial fixtures use Africa/Cairo |
| Accounts | Super Admin, Manager A, Manager B, Employee A, Employee B, Supervisor, limited HR role, Client |
| Browser | Chromium primary; WebKit/Safari follow-up for uploads, menus, timers, audio, and time fields |
| Viewports | Desktop 1440×900; mobile 390×844 |
| File fixtures | Real valid PDF, PNG, DOCX, CSV; disallowed executable; file >10 MB |
| Google Drive | Dedicated test account/folder with credentials and access supplied by the operator |
| Live timer dependencies | Working queue/broadcasting services when exercising cross-session updates |

Use an isolated staging database and synthetic records. Destructive scenarios operate
only on records created for this run. Use the prefix `E2E_<run-id>_` for names and
unique synthetic email addresses. Preserve existing business records.

For local testing, frontend commands are `npm run dev` or `npm run build` followed by
`npm run start`. Backend migrations and services must already be ready. The Laravel
unit-test `.env.testing` uses an in-memory database and is NOT an E2E server environment.
Never run `migrate:fresh` or a broad `db:seed` against a shared database to prepare E2E.

### 2.1 Execution and result rules

- Prefer UI-driven setup and interaction. Use real authenticated APIs only for fixture
  setup or assertions that cannot be observed in the UI; mark these cases `UI+API`.
- Use separate browser contexts for employees and reviewers. Do not reuse a Super
  Admin context to claim an employee authorization scenario passed.
- Do not mock application API responses in acceptance tests. An unavailable UI action
  is a product failure if required; an API-only success does not make the UI pass.
- Missing credentials, inaccessible staging, missing fixture tooling, unavailable
  Google OAuth, or restricted OS notification testing are `BLOCKED`, never `PASS`.
- Expected negative requests (401/403/422) pass only if access is correctly denied,
  the user sees understandable feedback, and no forbidden data changes occur.
- Capture unexpected console errors and network failures. Pace setup to respect API
  limits; distinguish a runner-induced 429 from a normal workflow that hits limits.
- Restore modified company policies/roles after a run and stop test-created timers.

## 3. Product scope and navigation

The Tables ERP manages clients, project delivery, employee attendance, HR requests,
and auditable financial adjustments. It is not a tax, banking, or full payslip engine.

| Screen | Route / navigation |
| --- | --- |
| Login | `/login` |
| Dashboard | `/dashboard` |
| Clients | `/dashboard/clients`; details `/dashboard/clients/<clientId>` |
| Projects | `/dashboard/projects`; details/pipeline `/dashboard/projects/<projectId>` |
| Employee directory | `/dashboard/employees` |
| Employee workspace | `/dashboard/employees/<employeeId>` |
| Employee self-service | `/dashboard/my-requests` |
| Own attendance | `/dashboard/my-attendance` |
| Attendance administration | `/dashboard/attendance` |
| Reports | `/dashboard/admin` |
| Roles and permissions | `/dashboard/roles` |
| Settings | `/dashboard/settings` |
| Personal profile | `/dashboard/profile` |
| Client portal | `/client`, `/client/projects` |
| Drive OAuth callback | `/dashboard/integrations/google-drive/callback` |

Employee workspace sections: Overview, Contracts, Attendance, Documents, Leave,
Short permissions, Overtime, Late deductions, Direct deductions, Advances, Partial
pay, Supervision. Tab changes should preserve form state and query only active workflows.

Required settings: Project Types, Contract Durations, Leave Types, Permission Policy,
Deduction Types, Late Deduction Tiers, Overtime Policy, Google Drive. Some policies
may share the HR Policies screen; separate pages are not required if controls are clear.

Sales quotations/contracts, invoicing, points, performance scoring, and unrelated
advanced analytics are outside the primary simplified-mode acceptance scope.
HR deduction-type management and traceable financial outcomes remain IN scope even
when an implementation accidentally places their routes behind a disabled module.

## 4. Confirmed business rules and fixtures

### 4.1 Client-confirmed rules

| Rule | Required behavior |
| --- | --- |
| Hourly rate | Entered manually by an authorized administrator; do not silently substitute a salary-derived rate for payable overtime |
| Unpaid leave deduction | Monthly base salary / 30 × eligible leave days |
| Lateness occurrence period | Monthly reset plus administrator-triggered manual reset |
| Overtime pay | Manual hourly rate × 1.5 × actual approved hours |
| Leave creation | Both employee self-request and administrator registration for an employee |
| Task supervision | One optional supervisor per task now; multiple supervisors are future scope |

### 4.2 Controlled E2E policy values

These are test fixtures, not claims that every company default is client-approved:

- Working week: Sunday–Thursday, five days; shift 09:00–17:00.
- Base salary: **30,000**; manual hourly rate: **200**.
- Paid leave allowance: **21** days; separate unpaid leave type enabled.
- Monthly paid permission allowance: **6 hours / 360 minutes**.
- Permission overage: warning, administrator explicitly selects Paid or Unpaid;
  no automatic hard rejection solely because allowance is exceeded.
- Advance limit: total approved/disbursed open exposure at most **30,000**.
- Advance recovery: next payroll; optional installments enabled.
- First-month supported example: hire on day 15, payable units **15**.
- Use distinct employees or fresh periods for independent financial cases.

### 4.3 Lateness penalty table (client attachment)

Percentages apply to DAILY salary, not monthly salary. For the fixture salary,
daily salary = **1,000**.

| Actual eligible lateness | First occurrence | Second | Third | Fourth |
| --- | ---: | ---: | ---: | ---: |
| More than 15 and up to 30 minutes | Warning / 0% | 20% | 30% | 50% |
| More than 30 and up to 45 minutes | 10% | 20% | 30% | 50% |
| More than 45 and up to 60 minutes | 20% | 30% | 40% | 50% |
| More than 60 minutes | 30% | 40% | 50% | 60% |

Mandatory boundary inputs: **15, 16, 29, 30, 31, 44, 45, 46, 59, 60, 61** minutes.
The attachment does not prescribe a monetary penalty at exactly 15 minutes.
The recorded implementation plan applies column four to occurrence 4+ and counts
eligible events across the employee's month. Verify that documented behavior, but
report the fifth+ rule and mixed-band counting as assumptions requiring confirmation
if the client has not separately approved them.

### 4.4 Reference financial expectations

| Fixture | Expected result |
| --- | --- |
| Two unpaid working days | Deduction **2,000**, unchanged base salary **30,000** |
| 2 approved overtime hours at manual rate 200 | Addition **600** |
| Actual 17:00–20:00; authorization 17:00–19:00 | Actual 180 min, payable approved 120 min, unapproved 60 min, pay **600** |
| Extra 17:00–18:30 without authorization | Actual/unapproved 90 min, approved 0, pay **0** |
| Two nonoverlapping authorizations 17:00–18:00 and 18:00–19:00; clock-out 19:00 | Actual 120 min once, approved 120 min, unapproved 0, pay **600** |
| Paid permission usage 240 + 180 minutes | Used 420, remaining 0, overage 60; explicit administrator decision allowed |
| Fixed direct deduction | Deduction **500**, exactly one linked adjustment on approval |
| First month, day-15 hire | Gross **15,000** at salary/30 |
| Termination gross 15,000; disbursed outstanding advance 4,000 | Combined settlement net **11,000**, recovery once, no duplicate future recovery |

Financial amounts must be rounded consistently to two decimal places. Approved
records preserve the calculation inputs used; later settings changes must not
rewrite historical amounts.

## 5. Roles and authorization requirements

Prepare two separate managers so a request creator can have a different reviewer
where required. Use ordinary Employee A/B as financial test subjects. A manager's
own profile must be readable, but self-approval and privileged self-editing remain denied.

| Actor | Expected scope |
| --- | --- |
| Super Admin | Configure settings/roles and manage authorized targets; readable own HR history; cannot approve own financial requests |
| Manager A/B | Manage permitted lower-tier employee records, requests, and task assignments; no access to protected/peer targets beyond policy |
| Employee A/B | Own self-service leaves, own attendance/history, assigned projects/tasks; no management of unrelated employees |
| Supervisor | Assigned supervision tasks/help/session actions; work and supervision timers may run concurrently |
| Limited HR role | Only explicitly granted HR actions; test with no `manage_employees` fallback to detect hidden dependencies |
| Client | Own portal projects only; no internal HR documents, salary, settings, or other clients' records |

Required granular permissions: `manage_employee_contracts`, `manage_leaves`,
`manage_permissions`, `manage_deductions`, `manage_overtime`,
`manage_employee_documents`, `manage_supervision`. Settings also use
`manage_hr_settings` and `manage_leave_types`.

The original client requirement gives short-permission creation to administrators.
Employee creation of short permissions is not implicitly approved by the leave
self-service decision. Test it as an authorization/scope discrepancy if enabled.
Employees may request overtime review where supported, but only a manager's prior
authorization makes any extra time payable.

## 6. E2E acceptance scenarios

**Priority:** P0 = financial/auth/data-loss blocker; P1 = essential feature/UX;
P2 = secondary compatibility/long-running check. Each ID is independently reportable.

### 6.1 Authentication and isolation

| ID | Priority | Steps | Expected outcome |
| --- | --- | --- | --- |
| AUTH-01 | P0 | Log in as each prepared role; refresh a protected page | Correct identity/navigation; session remains valid; no redirect loop |
| AUTH-02 | P1 | Submit an invalid password, then a valid password | Clear single error; retry works; button stops loading |
| AUTH-03 | P0 | Open protected UI/API in an unauthenticated context | Login redirect or 401; no protected data |
| AUTH-04 | P0 | Employee A requests Employee B's HR/document endpoints and Client tries internal HR | 403/404; no salary/document disclosure |
| AUTH-05 | P0 | Manager/Super Admin opens own Late and Direct deductions | History loads without 403; review/reset/create controls correctly restricted |
| AUTH-06 | P0 | Attempt own approval and manager edits of peer/protected roles | Denied; no state change; unrelated authorized actions still work |
| AUTH-07 | P1 | Log out normally, then try a protected route | Session/token cleared and access denied |

### 6.2 CRM clients

| ID | Priority | Steps | Expected outcome |
| --- | --- | --- | --- |
| CRM-01 | P1 | Create synthetic client; edit; refresh; search/filter | One record, one success per action, persisted fields and accurate filters |
| CRM-02 | P0 | Open client actions menu; choose Edit then Delete on a client with no projects | Edit opens edit UI only; Delete opens confirmation only; no row navigation |
| CRM-03 | P1 | Cancel deletion, then confirm deletion | Cancel preserves record; confirm removes it; no stuck dialog/button |
| CRM-04 | P1 | Delete a test client linked to a project | Understandable rejection; client/project remain intact |

### 6.3 Projects, pipeline, and forms

| ID | Priority | Steps | Expected outcome |
| --- | --- | --- | --- |
| PRJ-01 | P1 | Create/edit Project Type in Settings; assign on create/edit project | Type persists, visible in list/filter and relevant reports |
| PRJ-02 | P1 | Deactivate a used type; reopen old project and create new project | Old relation retained; inactive type unavailable for new assignment |
| PRJ-03 | P1 | Create project with a client; refresh; test type/client/status search | Correct records and no unrelated results |
| TASK-01 | P0 | Create task in project without cover; rapidly double-click Create | Exactly one task; exactly one success toast; loading ends and dialog closes |
| TASK-02 | P1 | Create/edit task with cover and employee/supervisor selections | Correct task/file/assignments saved; one understandable final success for the user action |
| TASK-03 | P1 | Trigger validation error, correct it, submit again | Field/message explains error; no duplicate task; button recovers |
| TASK-04 | P1 | Drag task to another workflow column and refresh | One move notification; saved stage/order; no duplicated action |
| TASK-05 | P1 | Open card; use menu/drag handle/start controls | Controls act independently and do not unexpectedly open details |
| TASK-06 | P1 | Open task and employee create dialogs on desktop/mobile; scroll long content | Cancel/Create remain visible and usable; no clipping or accidental submission |
| TASK-07 | P0 | Finish a running task by drag/drop and separately by Edit status | All work timers on that task stop; duration saved; navbar/card/details reconcile |
| TASK-08 | P0 | Delete a running test task or move it to terminal trash | No orphan timer; one confirmation; no running session on deleted work |
| TASK-09 | P1 | Start another task while one work timer runs | Clear constraint or deliberate switch flow; never two normal work timers |

### 6.4 Timers, reminders, and background traffic

| ID | Priority | Steps | Expected outcome |
| --- | --- | --- | --- |
| TMR-01 | P0 | Start, Pause, Resume, Hold with reason, Resume, End | Accurate accumulated time, correct status/reason, no double counting |
| TMR-02 | P1 | Keep page open through at least two 45-second heartbeats | No "Timer heartbeat accepted" or generic "Success" toast |
| TMR-03 | P1 | Stop timer in another context; let old context heartbeat | State reconciles; no repeated "session is no longer active" error spam |
| TMR-04 | P1 | Disconnect network briefly, reconnect/focus page | Loading/state recover without repeated toasts or extra sessions |
| TMR-05 | P1 | Inspect document title and favicon during running timer, then after End | Task name/time visible; active indicator present; previous title/icon restored |
| TMR-06 | P1 | Reload with no active timer and clean form; repeat with an active timer | No unnecessary unload warning when idle; browser-generic warning allowed when timer runs |
| TMR-07 | P0 | With active timer click Sign Out; cancel confirmation, then confirm separately | Cancel keeps session AND timer; confirm logs out as expected |
| TMR-08 | P2 | After real user gesture, keep timer past 45 minutes with page hidden; repeat at next interval | Two short beeps, title/favicon flash around 10 sec, browser notification when permission granted; no continuous alert flood |
| TMR-09 | P2 | Deny notification permission; repeat reminder eligibility | Title/icon reminders continue; no crash or repeated permission prompts |

For TMR-08, browser clocks may be accelerated only in a separate instrumented case
after application startup; report the acceleration. The server heartbeat must remain
consistent. Instrumented audio/Notification API calls prove invocation, not physical
sound or OS delivery. Real minimized-window behavior, Safari throttling, and sound
require a headed/manual follow-up if the runner cannot observe them. A fully closed
browser cannot execute a page reminder; push/service-worker delivery is not in scope.

### 6.5 Employees and contracts

| ID | Priority | Steps | Expected outcome |
| --- | --- | --- | --- |
| EMP-01 | P1 | Create employee with photo and manual hourly rate; refresh/relogin | Persisted data/photo/rate; no raw `messages.employee_*` keys; one overall success |
| EMP-02 | P1 | Edit employee fields/photo; refresh | Saved values; no two/triple success toasts; no stuck Save |
| EMP-03 | P1 | Open workspace; switch all tabs; revisit an unfinished form | Correct employee throughout; sensible loading/empty/error; form state retained |
| EMP-04 | P1 | Deactivate/reactivate disposable employee and test login | Access follows status; understandable feedback |
| EMP-05 | P0 | Delete disposable employee; test own/protected employee deletion separately | History preserved; deleted account cannot continue access; self/last-protected deletion denied |
| EMP-06 | P1 | Inspect Add Employee fields | Photo/basic data/manual rate clear; legacy Grace Days/Month and Work Hours/Day removed from basic creation per client request; schedule managed through contracts |
| CON-01 | P1 | Create Full Time contract, start 2026-01-01, duration 3 months, five workdays | End 2026-03-31; salary/schedule/status persist |
| CON-02 | P1 | Create Part Time contract with required monthly working hours | Monthly requirement visible, accepted, persisted; other contract fields retained |
| CON-03 | P1 | Add/edit/deactivate Contract Duration in Settings; create/edit contract | Settings-backed dropdown reflects active durations; old records retain duration |
| CON-04 | P0 | Activate/renew contract; update salary from 30,000 to 33,000 | One current contract; old history retained; future calculations consistent; prior approvals unchanged |
| CON-05 | P1 | Upload valid signed contract file; download; replace/remove | Private authenticated file round-trip; bytes/name correct; visible upload location |
| CON-06 | P0 | Another employee/client requests contract file URL | Access denied; no public storage path or content leak |
| CON-07 | P1 | Delete draft contract; try to delete historical active/terminated contract | Draft deletion works with confirmation; historical contract preserved with clear permitted alternative |

### 6.6 Attendance, leave, and permissions

| ID | Priority | Steps | Expected outcome |
| --- | --- | --- | --- |
| ATT-01 | P1 | Add attendance using shadcn hour/minute controls; edit and reload | Time selection reliable; saved clock-in/out match chosen local time |
| ATT-02 | P1 | Enter duplicate day, end before start, invalid date | Clear rejection, no duplicate/invalid attendance |
| ATT-03 | P1 | Filter employee/date range; inspect workspace attendance | Clock-in/out, lateness, absence/leave context and totals accurate; no truncated totals presented as full history |
| LEV-01 | P1 | Add/edit/deactivate paid and unpaid leave types | Days/paid flag persisted; inactive excluded from new requests; old history retained |
| LEV-02 | P0 | Employee A submits paid leave via My Requests; Manager A approves | Pending→approved; two working days use 2 of 21; remaining 19 |
| LEV-03 | P1 | Manager registers leave for Employee B from workspace | Same balance/workflow rules; employee sees request/history |
| LEV-04 | P0 | Approve unpaid two-day leave | Exactly one traceable deduction total 2,000; salary unchanged |
| LEV-05 | P0 | Cancel approved paid/unpaid leave; repeat Cancel | Paid balance restored once; unpaid adjustment cancelled once if unprocessed; no duplicated reversal |
| LEV-06 | P0 | Cancel unpaid leave whose adjustment is already processed | Consistent documented reversal/rejection; never erase history while leaving an unexplained processed charge |
| LEV-07 | P1 | Edit pending leave; try overlap and insufficient balance | Days recalculated; overlap/balance rules enforced; no stale consumption |
| LEV-08 | P0 | Request leave across weekend, month boundary, and year boundary | Only employee-contracted working days consumed; allocation/payroll periods correct |
| LEV-09 | P0 | Employee tries approving own leave or changing another employee's request | Denied; balances/data unchanged |
| PER-01 | P1 | Administrator creates permission with date/from/to/reason; approves Paid | Duration derived on server, creator/reviewer retained, allowance updated |
| PER-02 | P1 | Approve paid permission beyond six-hour allowance | Warning with used/remaining/overage; Paid/Unpaid explicit; no automatic hard block |
| PER-03 | P0 | Cancel paid permission and repeat; approve Unpaid separately | Paid minutes released once; unpaid does not consume paid allowance |
| PER-04 | P1 | Edit pending date/time; try overlapping window | Derived minutes updated, overlap rejected; approved edits reconciled or clearly require cancellation/recreation |
| PER-05 | P0 | Employee attempts administrator-only permission creation | Denied or reported as scope discrepancy pending client approval; leave self-service remains available |

### 6.7 Deductions and financial records

| ID | Priority | Steps | Expected outcome |
| --- | --- | --- | --- |
| DED-01 | P0 | In simplified mode create/activate Deduction Type through Settings | Usable type created; active list updates; no duplicated `/api/v1/v1/` or disabled-module rejection |
| DED-02 | P0 | Submit fixed 500 deduction for Employee A; approve; retry approval | Pending has no charge; approval produces one 500 adjustment; retry creates nothing extra |
| DED-03 | P1 | Reject/cancel pending deduction with reason | History/audit kept; no approved financial charge |
| DED-04 | P0 | Open own Late/Direct history as Super Admin and employee via authorized endpoint | Reads succeed; own management/approval remains denied and UI controls match |
| DED-05 | P0 | Evaluate first lateness event for each band, then second/third/fourth | Exact daily-salary percentages from section 4.3; correct sequential occurrences |
| DED-06 | P0 | Evaluate lateness at all 11 boundary inputs | Literal client ranges respected; report off-by-one boundaries independently |
| DED-07 | P0 | Evaluate same month twice; change policy after evaluation | No duplicate adjustments; original snapshots/amounts retained |
| DED-08 | P0 | Add paid permission overlapping only part of lateness before shift; evaluate | Only overlap excused, no double overlap subtraction; uncovered lateness evaluated correctly |
| DED-09 | P1 | Move into new month; manual Reset current month; record a later eligible event | Monthly occurrence restart; manual reset preserves audit and applies documented behavior |
| DED-10 | P0 | Override deduction to 0; override positive amount; try processed adjustment | Reason/audit retained; zero cancels eligible unprocessed charge; processed financial history not rewritten |
| DED-11 | P1 | Inspect direct deduction value input and optional Task reference | Configured amount/percentage/hours modes and optional task linkage supported as required; report missing modes/linkage |

Manual Reset currently means waiving unprocessed existing month records, not deleting
attendance or rerunning the same event as a new penalty. Verify actual behavior and
report separately if the intended client meaning was only resetting future counters.

### 6.8 Overtime, advances, and partial pay

| ID | Priority | Steps | Expected outcome |
| --- | --- | --- | --- |
| OT-01 | P0 | Preauthorize tomorrow's window; close matching attendance; view Overtime | Approved pay derived from actual intersection, rate 200 ×1.5; one linked addition |
| OT-02 | P0 | Fixture 17:00–20:00 actual, 17:00–19:00 authorized | 180 actual, 120 approved, 60 unapproved, payable 600 |
| OT-03 | P0 | Close attendance with 90 extra minutes and no authorization/request | Actual/unapproved 90 visible; approved/payable 0 |
| OT-04 | P0 | Submit overlapping authorizations; try concurrent requests | Overlap rejected atomically; no double payment |
| OT-05 | P0 | Submit adjacent nonoverlapping windows; close attendance; view totals | Actual day counted once; approved total/pay correct; no duplicated unapproved duration |
| OT-06 | P0 | Change salary/manual rate/settings after approval; resync | Old approved rate/multiplier retained; processed adjustment unchanged |
| OT-07 | P0 | Manual rate unset or set to 0; attempt approval | Actionable validation or explicit zero-rate decision; no silent salary-derived substitution |
| OT-08 | P1 | Try late/post-event authorization and creator self-review | Preapproval/authorization rules enforced; no retroactive paid overtime silently created |
| ADV-01 | P0 | Request 6,000 advance; another manager approves; disburse | Requested/approved/disbursed distinct; outstanding 6,000 only after payout |
| ADV-02 | P0 | Open exposure 25,000; try approval of another 6,000 | Limit 30,000 enforced, including concurrent approvals |
| ADV-03 | P0 | Settle three 2,000 installments; repeat settlement | Outstanding 4,000→2,000→0; each recovery created exactly once |
| ADV-04 | P1 | Reject/cancel undistributed advance; try employee review/disbursement | No imaginary debt; unauthorized actions denied |
| PAY-01 | P0 | Day-15 first-month preview, create, another manager approves | 15,000 gross; one record for payroll period; repeated approval idempotent |
| PAY-02 | P1 | Hire date other than day 15 | Explicit current limitation; no guessed proration; report wider-date requirement as unresolved |
| PAY-03 | P0 | Terminate with gross 15,000 and outstanding disbursed 4,000; approve twice | Recovery 4,000 once; combined net 11,000; no later scheduled recovery repeats |
| PAY-04 | P0 | Outstanding debt exceeds gross; include approved but undistributed advance | Debt clearly represented; no fake disbursement/recovery; negative/residual treatment explicit |

### 6.9 Documents, supervision, integrations, and reporting

| ID | Priority | Steps | Expected outcome |
| --- | --- | --- | --- |
| DOC-01 | P1 | Upload real PDF/PNG and allowed Office file; reload; download | Persisted metadata, bytes/name correct, one success; no "The file failed to upload" for a valid file |
| DOC-02 | P1 | Upload >10 MB and disallowed extension; then retry a valid file | Clear validation; failed upload leaves no broken metadata; retry works |
| DOC-03 | P0 | Employee A/client requests Employee B's document download | Access denied; no path/public URL leak |
| DOC-04 | P1 | Manager removes document; retry download | Controlled deletion; no unintended row/workspace navigation |
| SUP-01 | P1 | Assign optional supervisor distinct from assignee; inspect supervisor view | Task visible as supervision; assignment doesn't add work assignee implicitly |
| SUP-02 | P1 | Assignee requests help; supervisor accepts/resolves | Notification reaches supervisor, request lifecycle/audit retained |
| SUP-03 | P0 | Run work timer on Task A plus supervision timer on Task B for overlapping interval | Both run independently; work totals unchanged by supervision |
| SUP-04 | P0 | Start second concurrent supervision session for same supervisor | Rejected; no duplicate/overlapping supervision totals |
| SUP-05 | P1 | View task/workspace/report for supervisor over date range | Session count, task count, total supervision hours correct and separate from work |
| DRV-01 | P1 | Read disconnected status; perform OAuth against test account; reconnect | Settings state accurate; callback succeeds and failure is understandable |
| DRV-02 | P1 | Upload project file to Drive; open/download via application | End-to-end file contents/access correct, not just Connected badge |
| DRV-03 | P1 | Exercise expired token/revoked access/test folder restrictions | Refresh/reconnect or useful error; never false successful upload |
| REP-01 | P1 | Filter Projects/reports by Project Type | Matching projects only, historical inactive types retained |
| REP-02 | P1 | Compare HR period summaries with created leave/permission/deduction/overtime fixtures | Counts, balances, Paid/Unpaid and financial totals reconcile |
| REP-03 | P1 | Request cross-employee/date-filtered HR reports | Required attendance/leave/permission/deduction/overtime/supervision reporting available; report missing UI/filter/export requirements |
| AUD-01 | P0 | Inspect audit for approved financial actions, reset/override, policy and contract changes | Actor, time, target, reason, amounts/calculation inputs and before/after where applicable are traceable |

### 6.10 UX and regressions from Achraf's report

| ID | Priority | Steps | Expected outcome |
| --- | --- | --- | --- |
| UX-01 | P1 | Create/update employee/task, drag task, save Settings | One understandable success per user action; no duplicate side-effect submit |
| UX-02 | P1 | Open any paginated/loading panel; cause allowed/denied validation | Clear loading/empty/error; no retry-driven repeated toast stack |
| UX-03 | P1 | Leave dialog open through save success | Loading resets or dialog closes; Cancel/Create stays usable; errors permit retry |
| UX-04 | P1 | Use Arabic API language then English; create/update employee | Human-readable messages, no raw translation keys; consistent direction/layout |
| UX-05 | P1 | Observe background heartbeat, refocus, reload clean idle page | No heartbeat/error spam; unload warning only for actual timer/unsaved risk |
| UX-06 | P2 | Mobile navigation, long forms, all employee tabs, keyboard menu actions | Reachable content/actions, no accidental navigation, time fields consistent |

## 7. Financial and file verification beyond UI

When screens do not expose ledger/audit values, use an authorized API assertion or
operator-provided read-only staging inspection and label the case `UI+API`.
Never query data as an unrestricted administrator to prove an employee can access it.

Useful route references (relative to **one** `/api/v1` prefix):

| Concern | Endpoint |
| --- | --- |
| Deduction type management | `/hr/deduction-types` |
| Active direct types | `/deduction-types/active` |
| HR policy | `/hr/policies/current`, `/hr/policies` |
| Contract history | `/employees/<id>/employment-contracts` |
| Contract/file | `/employment-contracts/<id>`, `/employment-contracts/<id>/file` |
| Leaves | `/employees/<id>/leaves`, `/employee-leaves/<id>/approve\|reject\|cancel` |
| Permissions | `/employees/<id>/short-permissions`, `/employee-short-permissions/<id>/approve\|reject\|cancel` |
| Late deductions | `/employees/<id>/late-deductions`, `/evaluate`, `/reset` |
| Direct deductions | `/employees/<id>/deductions`, `/employee-deductions/<id>/approve\|reject\|cancel` |
| Overtime | `/employees/<id>/overtime-requests`, `/employee-overtime-requests/<id>/approve\|reject\|cancel` |
| Advances | `/employees/<id>/advances`, `/employee-advances/<id>/approve\|disburse`, `/employee-advance-settlements/<id>/settle` |
| Partial pay | `/employees/<id>/partial-pays`, `/preview`, `/employee-partial-pays/<id>/approve` |
| Documents | `/employees/<id>/documents`, `/employee-documents/<id>/download` |
| Timer | `/time-entries/active`, `/resumable`, `/heartbeat`, `/pause`, `/hold`, `/end` |

Suffix notation is descriptive, not a literal request URL. Follow actual routes and
resource IDs. `/api/v1/v1/hr/deduction-types` must NEVER be requested.

Verify financial persistence: salary unchanged by deduction, exactly one adjustment
per approval/settlement, cancel restores/releases once, historical snapshot immutable,
processed transactions not silently edited. If simplified mode hides ledger inspection,
arrange read-only fixture evidence rather than enabling unrelated modules to force a pass.

## 8. Release gates

1. All P0 cases pass or have an explicitly documented unresolved product blocker.
2. No unaccounted financial duplication, wrong rate, unauthorized access, or orphan timer.
3. Essential CRUD, requests, Settings, and file round-trips work after refresh.
4. No unexplained 403 for an authorized reader, duplicated version prefix, raw message key,
   duplicate success alerts, or permanently loading submit control.
5. Desktop and mobile smoke passes; Safari-critical flows receive a real compatibility check.
6. Drive/audio/notification cases blocked by runner capability remain explicitly unverified.

## 9. Required TestSprite deliverables

Produce:

- Generated test plan mapping each test to scenario IDs in section 6.
- Executed browser test results with role, viewport, browser, revision, and fixture IDs.
- Screenshots/trace and sanitized request/response evidence for each failure.
- Separate `PASS`, `FAIL`, `BLOCKED`, and `NOT RUN` counts; no combined success percentage
  that treats blocked or omitted scenarios as passed.
- Financial reconciliation results with expected vs actual numbers.
- A prioritized defect list, not automatic changes to the application.

For every defect record:

```text
Scenario ID:
Severity: P0 / P1 / P2
Frontend / backend revision:
Role / browser / viewport:
Preconditions and test data IDs:
Steps to reproduce:
Expected result:
Actual result:
Sanitized failing request URL / status / response:
Screenshot / trace / console evidence:
State after reload:
Classification: product defect / environment blocker / unresolved business rule
```

## 10. Implementation observations — targeted checks, not exemptions

These observations come from source review and prior issue reports, not a fresh
live-site certification. Test the deployed revisions and report discrepancies.

1. Deduction-type CRUD routes currently carry `simplified.disabled:advanced_deductions`,
   although Settings exposes that feature. Keep simplified mode enabled and test DED-01.
2. Current default late bands are 15–29, 30–44, 45–59, 60+, which differ from the
   literal client attachment at boundary minutes. DED-06 must use section 4.3 as oracle.
3. Manual hourly rate currently has a computed fallback; zero can take that path.
   OT-07 must catch silent substitution rather than declare it acceptable.
4. Contract duration presets exist in Settings; verify the contract form actually
   consumes them. A Settings record alone does not fulfill CON-03.
5. Contract form/schema currently centers daily hours. Verify monthly Part Time
   required hours separately; do not treat daily hours as equivalent.
6. Basic employee form still has legacy schedule/grace controls in the reviewed code.
   EMP-06 verifies the explicit removal requirement.
7. Granular permission checks are uneven and much UI uses `manage_employees`.
   Test a genuinely limited HR role without that broad permission.
8. Source contains self-view fixes for Late/Direct deductions. Check both deployed
   endpoints AND hidden self-review controls; the earlier screenshots showed 403.
9. Toast ownership is mixed between interceptor, hooks, and components. Count actual
   toasts and actual writes, including avatar/cover uploads and dropdown `onClick/onSelect`.
10. Current overtime summaries combine request totals and attendance extra time;
    adjacent requests can reveal duplicate actual-day counting. OT-05 is mandatory.
11. Page reminders run every 45 minutes. Unit tests do not establish that a minimized
    Safari window will make sound; retain a headed follow-up.
12. Approval/cancellation period handling, processed unpaid-leave cancellations, and
    employee-specific schedules require explicit LEV-06/08 reconciliation.
13. First-month automatic partial pay is currently bounded to day-15 hires. Broader
    proration is an unresolved scope item, not silently implemented.
14. Manual late reset currently waives existing unprocessed month records. Client
    confirmation is needed if reset should only change future occurrence numbering.
15. Employee documents are private local storage. Drive storage for HR documents was
    an implementation suggestion, not a confirmed storage requirement; project Drive
    end-to-end verification remains required.
16. A deployed upload error may come from PHP/Nginx limits, filesystem ownership, or
    multipart handling. Record file size, status, and response rather than guessing.
17. Existing test suite success does not prove tests for these new acceptance cases
    already exist. Generate and execute them; report incomplete coverage.
