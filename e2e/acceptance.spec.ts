import { test, expect, type Page, type APIRequest, type APIRequestContext } from '@playwright/test';
import fs from 'node:fs';
import type { EmployeeLeave, LeaveBalance, LeaveType } from '../src/features/hr/types/leave-management';
interface Notice { type: string; data: { type: string; request_id: number; project_id?: number; task_id?: number } }

const api = process.env.E2E_API_URL || 'http://127.0.0.1:8011/api/v1';
if (!['localhost', '127.0.0.1'].includes(new URL(api).hostname)) throw new Error('Acceptance mutations require a local disposable API.');
if (!process.env.E2E_FIXTURES) throw new Error('Run npm run test:e2e:local to create disposable E2E fixtures.');
const fixtures = JSON.parse(fs.readFileSync(process.env.E2E_FIXTURES, 'utf8'));
const year = new Date().getFullYear();
let admin: APIRequestContext, employee: APIRequestContext, other: APIRequestContext;
let types: LeaveType[];
let leaveId: number;

async function authenticated(request: APIRequest, email: string) {
 const context = await request.newContext({ baseURL: api + '/', extraHTTPHeaders: { Accept: 'application/json' } });
 const response = await context.post('auth/login', { data: { email, password: 'password' } });
 expect(response.status(), await response.text()).toBe(200);
 const payload = (await response.json()).data;
 await context.dispose();
 return request.newContext({ baseURL: api + '/', extraHTTPHeaders: { Accept: 'application/json', Authorization: `Bearer ${payload.tokenDetails.token}` } });
}
async function login(page: Page, email = 'admin@thetables.com') {
 await page.goto('/login');
 await page.getByLabel('Email', { exact: true }).fill(email);
 await page.getByLabel('Password', { exact: true }).fill('password');
 await page.getByRole('button', { name: 'Sign In', exact: true }).click();
 await expect(page).toHaveURL(/\/dashboard$/);
 await expect(page.getByText('No timer', { exact: true })).toBeVisible();
}
async function history(context = employee, id = fixtures.employee) {
 const response = await context.get(`employees/${id}/leaves?year=${year}`);
 expect(response.ok(), await response.text()).toBeTruthy();
 return (await response.json()).data;
}
async function leavePanel(page: Page) {
 await page.goto(`/dashboard/employees/${fixtures.employee}`);
 await page.getByRole('tab', { name: 'Attendance & time off' }).click();
 await page.getByRole('button', { name: 'Leave', exact: true }).click();
 await expect(page.getByRole('dialog')).toContainText('Leave management');
 await expect(page.getByRole('dialog')).not.toContainText(/pending/i);
 return page.getByRole('dialog');
}
async function notifications(context: APIRequestContext) {
 const response = await context.get('notifications?perPage=100');
 expect(response.ok()).toBeTruthy();
 return (await response.json()).data.notifications;
}

test.beforeAll(async ({ playwright }) => {
 admin = await authenticated(playwright.request, 'admin@thetables.com');
 employee = await authenticated(playwright.request, 'employee@thetables.com');
 other = await authenticated(playwright.request, 'qa-other@thetables.com');
 const response = await admin.get('leave-types');
 types = (await response.json()).data;
});
test.afterAll(async () => { await Promise.all([admin?.dispose(), employee?.dispose(), other?.dispose()]); });

test('invalid login retains email and shows one error toast', async ({ page }) => {
 await page.goto('/login');
 await page.getByLabel('Email', { exact: true }).fill('employee@thetables.com');
 await page.getByLabel('Password', { exact: true }).fill('incorrect-password');
 const response = page.waitForResponse(r => r.url().endsWith('/auth/login'));
 await page.getByRole('button', { name: 'Sign In', exact: true }).click();
 expect((await response).status()).toBe(401);
 await expect(page.getByLabel('Email', { exact: true })).toHaveValue('employee@thetables.com');
 await expect(page.locator('[data-sonner-toast][data-type="error"]')).toHaveCount(1);
 await expect(page).toHaveURL(/\/login$/);
});

for (const [role, email] of [['Super Admin', 'admin@thetables.com'], ['Admin', 'qa-admin@thetables.com'], ['Employee', 'employee@thetables.com']]) {
 test(`${role} dashboard renders live role-appropriate data without runtime errors`, async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await login(page, email);
  await expect(page.getByText(role === 'Employee' ? 'My Hours' : 'Work Hours', { exact: true })).toBeVisible();
  if (role === 'Employee') {
   await expect(page.getByText('Active Clients', { exact: true })).toHaveCount(0);
   await expect(page.getByRole('link', { name: /QA Working Project/ }).first()).toBeVisible();
  } else {
   await expect(page.getByText('Active Clients', { exact: true })).toBeVisible();
   await expect(page.getByText('Running Timers', { exact: true })).toBeVisible();
   await expect(page.getByText('QA Employee', { exact: true })).toBeVisible();
  }
  expect(errors).toEqual([]);
 });
}

test('employee sees personal details, own contract and reminder preferences', async ({ page }) => {
 await login(page, 'employee@thetables.com');
 await page.goto('/dashboard/profile');
 for (const value of ['QA Engineer', 'Cairo QA Residence', '29502031234567', '01012345678', 'Computer Science']) {
  await expect(page.getByText(value, { exact: true }).first()).toBeVisible();
 }
 await page.getByText('My employment contracts', { exact: true }).click();
 await expect(page.getByText(/Full.time/i).first()).toBeVisible();
 await page.getByLabel('Timer reminder interval').selectOption('5');
 await expect.poll(async () => (await (await employee.get('notifications/settings')).json()).data.reminderMinutes).toBe(5);
 await page.reload();
 await expect(page.getByLabel('Timer reminder interval')).toHaveValue('5');
 const invalid = await employee.put('notifications/preferences', { data: { reminderMinutes: 7 } });
 expect(invalid.status()).toBe(422);
});

test('task page lists project tasks and opens their details', async ({ page }) => {
 await login(page);
 await page.getByRole('link', { name: 'Tasks', exact: true }).click();
 await expect(page).toHaveURL(/\/dashboard\/tasks$/);
 await expect(page.getByText('Tasks by status', { exact: true })).toBeVisible();
 await page.screenshot({ path: test.info().outputPath('tasks-list.png'), fullPage: true });
 await page.getByRole('textbox', { name: 'Search tasks' }).fill('QA Timer Task');
 await page.getByRole('button', { name: /QA Timer Task/ }).click();
 await expect(page.getByRole('dialog')).toContainText('QA Timer Task');
});

test('dashboard groups company tasks by status and opens task details', async ({ page }) => {
 await login(page);
 await expect(page.getByText('Tasks by status', { exact: true })).toBeVisible();
 await expect(page.getByRole('region', { name: 'Completed tasks' })).toContainText('QA Completed Task');
 await expect(page.getByRole('region', { name: /To Do tasks/i })).toContainText('QA Timer Task');
 await page.screenshot({ path: test.info().outputPath('dashboard-task-list.png'), fullPage: true });
 await page.getByRole('textbox', { name: 'Search dashboard tasks' }).fill('QA Timer Task');
 await page.getByRole('button', { name: /QA Timer Task/ }).click();
 await expect(page.getByRole('dialog')).toContainText('QA Timer Task');
});

test('task list keeps wide tables scrollable on a narrow screen', async ({ page }) => {
 await page.setViewportSize({ width: 390, height: 844 });
 await login(page);
 await page.goto('/dashboard/tasks');
 const group = page.getByRole('region', { name: /To Do tasks/i });
 await expect(group).toContainText('QA Timer Task');
 const scrollArea = group.locator('table').locator('..');
 expect(await scrollArea.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('employee submits leave through UI and admin receives exactly one notification', async ({ page, browser }) => {
 const adminPage = await browser.newPage();
 await login(adminPage);
 await login(page, 'employee@thetables.com');
 await page.goto('/dashboard/my-requests');
 await page.getByLabel('Leave type').selectOption(String(types.find(t => t.slug === 'annual')!.id));
 await page.getByLabel('Leave start date').fill(`${year}-11-02`);
 await page.getByLabel('Leave end date').fill(`${year}-11-03`);
 const response = page.waitForResponse(r => r.request().method() === 'POST' && r.url().endsWith(`/employees/${fixtures.employee}/leaves`));
 await page.getByRole('button', { name: 'Submit', exact: true }).click();
 const result = await response;
 expect(result.status(), await result.text()).toBe(201);
 const created = (await result.json()).data;
 expect(created.status).toBeNull();
 expect(created.needsReview).toBe(true);
 leaveId = created.id;
 await expect(page.locator('main')).not.toContainText(/pending/i);
 await expect(page.getByText(`${year}-11-02 → ${year}-11-03 · 2d`)).toBeVisible();
 const balance = (await history()).balances.find((b: LeaveBalance) => b.leaveType.slug === 'annual');
 expect(balance.usedDays).toBe(0);
 await expect.poll(async () => (await notifications(admin)).filter((n: Notice) => n.data.type === 'leave_submitted' && n.data.request_id === leaveId).length).toBe(1);
 await adminPage.getByRole('button', { name: /Notifications/ }).click();
 await expect(adminPage.getByText('QA Employee submitted a leave request', { exact: true }).first()).toBeVisible();
 await adminPage.getByRole('menuitem').filter({ hasText: 'QA Employee submitted a leave request' }).first().click();
 await expect(adminPage.getByRole('dialog').getByRole('button', { name: 'Approve', exact: true })).toBeVisible();
 await expect(adminPage.getByRole('dialog').getByRole('button', { name: 'Reject', exact: true })).toBeVisible();
 await adminPage.close();
});

test('admin approves in UI, employee receives result and working days consume balance once', async ({ page }) => {
 leaveId = (await history()).leaves.find((l: EmployeeLeave) => l.startDate === `${year}-11-02`).id;
 await login(page);
 const panel = await leavePanel(page);
 await panel.getByRole('button', { name: 'Approve', exact: true }).click();
 const confirmation = page.getByRole('alertdialog');
 await confirmation.getByRole('button', { name: 'Approve', exact: true }).click();
 await expect(panel.getByText('Approved', { exact: true }).first()).toBeVisible();
 const data = await history();
 expect(data.leaves.find((l: EmployeeLeave) => l.id === leaveId).status).toBe('approved');
 expect(data.balances.find((b: LeaveBalance) => b.leaveType.slug === 'annual').usedDays).toBe(2);
 const repeated = await admin.post(`employee-leaves/${leaveId}/approve`);
 expect(repeated.status()).toBe(422);
 expect((await notifications(employee)).filter((n: Notice) => n.data.type === 'leave_approved' && n.data.request_id === leaveId)).toHaveLength(1);
});

test('employee request history survives reload; cancellation releases balance', async ({ page }) => {
 await login(page, 'employee@thetables.com');
 await page.goto('/dashboard/my-requests');
 await expect(page.getByText(`${year}-11-02 → ${year}-11-03 · approved · 2d`)).toBeVisible();
 await page.reload();
 await expect(page.getByText(`${year}-11-02 → ${year}-11-03 · approved · 2d`)).toBeVisible();
 await page.getByRole('button', { name: 'Cancel', exact: true }).click();
 await expect(page.getByText(`${year}-11-02 → ${year}-11-03 · cancelled · 2d`)).toBeVisible();
 expect((await history()).balances.find((b: LeaveBalance) => b.leaveType.slug === 'annual').usedDays).toBe(0);
});

test('reject leaves through admin UI without consuming balance', async ({ page }) => {
 const created = await employee.post(`employees/${fixtures.employee}/leaves`, { data: { leaveTypeId: types[0].id, startDate: `${year}-11-09`, endDate: `${year}-11-09`, reason: 'QA reject' } });
 expect(created.status()).toBe(201);
 const id = (await created.json()).data.id;
 await login(page);
 const panel = await leavePanel(page);
 await panel.getByRole('button', { name: 'Reject', exact: true }).click();
 await page.getByRole('alertdialog').getByRole('button', { name: 'Reject', exact: true }).click();
 await expect(panel.getByText('Rejected', { exact: true }).first()).toBeVisible();
 expect((await history()).leaves.find((l: EmployeeLeave) => l.id === id).status).toBe('rejected');
 expect((await notifications(employee)).filter((n: Notice) => n.data.type === 'leave_rejected' && n.data.request_id === id)).toHaveLength(1);
});

test('direct admin leave consumes only working days and cancellation restores them', async () => {
 const response = await admin.post(`employees/${fixtures.employee}/leaves`, { data: { leaveTypeId: types[0].id, startDate: `${year}-11-12`, endDate: `${year}-11-15` } });
 expect(response.status(), await response.text()).toBe(201);
 const leave = (await response.json()).data;
 expect(leave.status).toBe('approved'); expect(leave.workingDays).toBe(2);
 expect((await history()).balances.find((b: LeaveBalance) => b.leaveTypeId === types[0].id).usedDays).toBe(2);
 expect((await admin.post(`employee-leaves/${leave.id}/cancel`)).status()).toBe(200);
});

test('allowance changes preserve custom allocations, usage and unrelated leave types', async () => {
 const annual = types.find(t => t.slug === 'annual')!;
 const before = (await history()).balances;
 expect((await admin.put(`employees/${fixtures.other}/leave-balances/${annual.id}`, { data: { year, useDefault: false, allocatedDays: 25 } })).status()).toBe(200);
 expect((await admin.put(`leave-types/${annual.id}`, { data: { annualAllowanceDays: 23 } })).status()).toBe(200);
 const after = (await history()).balances;
 expect(after.find((b: LeaveBalance) => b.leaveTypeId === annual.id).allocatedDays).toBe(23);
 for (const balance of before.filter((b: LeaveBalance) => b.leaveTypeId !== annual.id)) {
  expect(after.find((b: LeaveBalance) => b.leaveTypeId === balance.leaveTypeId).allocatedDays, balance.leaveType.name).toBe(balance.allocatedDays);
 }
 expect((await history(other, fixtures.other)).balances.find((b: LeaveBalance) => b.leaveTypeId === annual.id).allocatedDays).toBe(25);
 await admin.put(`leave-types/${annual.id}`, { data: { annualAllowanceDays: annual.annualAllowanceDays } });
 await admin.put(`employees/${fixtures.other}/leave-balances/${annual.id}`, { data: { year, useDefault: true } });
});

test('employee cannot read or mutate another employee HR, salary, roles or settings', async () => {
 for (const path of [`employees/${fixtures.other}`, `employees/${fixtures.other}/leaves`, `employees/${fixtures.other}/employment-contracts`, `employees/${fixtures.other}/overview`, 'hr/policies/current', 'time-entries/active-timers', 'admin/roles']) {
  const response = await employee.get(path); expect([403, 404], path + ': ' + await response.text()).toContain(response.status());
 }
 expect((await employee.put(`employees/${fixtures.employee}/salary`, { data: { salary: 99999 } })).status()).toBe(403);
 expect((await employee.put(`employees/${fixtures.employee}/leave-balances/${types[0].id}`, { data: { year, useDefault: false, allocatedDays: 99 } })).status()).toBe(403);
});

test('timer lifecycle updates other admin browser through real WebSocket', async ({ page, browser }) => {
 await login(page);
 await expect(page.getByText('Working now (0)', { exact: true })).toBeVisible();
 const start = await employee.post('time-entries/start', { data: { trackableType: 'task', trackableId: fixtures.task } });
 expect(start.status(), await start.text()).toBe(201);
 await expect(page.getByText('Working now (1)', { exact: true })).toBeVisible();
 await expect(page.getByText('QA Timer Task', { exact: true }).first()).toBeVisible();
 const employeePage = await browser.newPage();
 await employeePage.goto('/login');
 await employeePage.getByLabel('Email', { exact: true }).fill('employee@thetables.com');
 await employeePage.getByLabel('Password', { exact: true }).fill('password');
 await employeePage.getByRole('button', { name: 'Sign In', exact: true }).click();
 await expect(employeePage.getByRole('button', { name: 'Pause timer', exact: true })).toBeVisible();
 await employeePage.getByRole('button', { name: 'Pause timer', exact: true }).click();
 await expect(page.getByText('Working now (0)', { exact: true })).toBeVisible();
 await expect(page.getByText('Paused work (1)', { exact: true })).toBeVisible();
 await employeePage.mouse.move(0, 200);
 await expect(employeePage.locator('[data-sonner-toast]')).toHaveCount(0);
 await employeePage.getByRole('button', { name: /Resume QA Timer Task/ }).click();
 await expect(page.getByText('Working now (1)', { exact: true })).toBeVisible();
 await expect(page.getByText('Paused work (0)', { exact: true })).toBeVisible();
 await employeePage.clock.install();
 await employeePage.clock.fastForward(5 * 60 * 1000);
 await expect(employeePage.getByRole('dialog', { name: 'Your work timer is still running' })).toBeVisible();
 await employeePage.getByRole('button', { name: 'Continue working', exact: true }).click();
 await employeePage.screenshot({ path: test.info().outputPath('running-timer.png'), fullPage: true });
 expect(await employeePage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
 await employeePage.mouse.move(0, 200);
 await employeePage.clock.fastForward(5000);
 if (await employeePage.getByRole('button', { name: 'Close toast', exact: true }).count()) await employeePage.getByRole('button', { name: 'Close toast', exact: true }).first().click();
 await employeePage.getByRole('button', { name: 'End timer', exact: true }).click();
 await expect(page.getByText('Working now (0)', { exact: true })).toBeVisible();
 await employeePage.close();
});

test('service worker is served with valid script headers and registers', async ({ page }) => {
 await page.goto('/login');
 const response = await page.request.get('/push-sw.js');
 expect(response.status()).toBe(200);
 expect(response.headers()['content-type']).toContain('javascript');
 expect(response.headers()['service-worker-allowed']).toBe('/');
 expect(await page.evaluate(async () => { const r = await navigator.serviceWorker.register('/push-sw.js'); await navigator.serviceWorker.ready; return r.scope; })).toBe(new URL('/', page.url()).href);
});

test('completed tasks remain in My Tasks board and read-only employees see no creation controls', async ({ page }) => {
 const failures: string[] = [];
 const warnings: string[] = [];
 page.on('console', message => { if (/DialogContent.*DialogTitle|Missing.*Description/.test(message.text())) warnings.push(message.text()); });
 page.on('response', response => {
  if (response.url().startsWith(api) && response.status() >= 400) failures.push(`${response.status()} ${new URL(response.url()).pathname}`);
 });
 await login(page, 'qa-other@thetables.com');
 await page.goto('/dashboard/my-tasks');
 await page.getByPlaceholder('Search tasks...').fill('QA Completed Task');
 await expect(page.getByRole('heading', { name: 'QA Completed Task', exact: true })).toBeVisible();
 const doneSummary = page.locator('[data-slot="card-content"]').filter({ has: page.getByText('Done', { exact: true }) });
 await expect(doneSummary).toContainText('1');
 await expect(page.getByRole('button', { name: 'New Task', exact: true })).toHaveCount(0);
 await page.getByRole('tab', { name: 'List', exact: true }).click();
 await expect(page.getByRole('heading', { name: 'QA Completed Task', exact: true })).toBeVisible();
 await expect(page.getByRole('button', { name: 'Change status for QA Completed Task', exact: true })).toBeDisabled();
 expect(failures).toEqual([]);
 await expect(page.locator('[data-sonner-toast][data-type="error"]')).toHaveCount(0);
 await page.screenshot({ path: test.info().outputPath('my-tasks-completed.png'), fullPage: true });
 await page.getByRole('heading', { name: 'QA Completed Task', exact: true }).click();
 await expect(page.getByRole('dialog')).toHaveAccessibleDescription('Task details, assigned employees, supervision, and time tracking.');
 expect(warnings).toEqual([]);
});

test('clock out refreshes history and preserves elapsed and idle totals after reload', async ({ page }) => {
 const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date());
 const created = await admin.post('attendance', { data: { userId: fixtures.other, date, clockIn: `${date}T00:00:00` } });
 expect(created.status(), await created.text()).toBe(201);
 await login(page, 'qa-other@thetables.com');
 await page.goto('/dashboard/my-attendance');
 await page.getByRole('button', { name: 'Clock Out', exact: true }).click();
 await expect(page.getByText('Clocked Out', { exact: true })).toBeVisible();
 await expect(page.getByRole('row').filter({ hasText: 'Today' }).getByRole('cell').nth(2)).not.toHaveText('—');
 const today = (await (await other.get('attendance/today')).json()).data;
 expect(today.currentIdleMinutes).toBeGreaterThan(0);
 for (let pass = 0; pass < 2; pass++) {
  if (pass) await page.reload();
  await expect(page.getByText('Total', { exact: true }).locator('..')).not.toHaveText(/Total\s*0m$/);
  await expect(page.getByText('Idle', { exact: true }).first().locator('..')).not.toHaveText(/Idle\s*0m$/);
 }
 await page.screenshot({ path: test.info().outputPath('clocked-out-summary.png'), fullPage: true });
 await page.goto('/dashboard');
 await expect(page.getByText('Clocked out', { exact: true })).toBeVisible();
});

test('task assignment refreshes project overview and task dialog has no accessibility warnings', async ({ page }) => {
 const warnings: string[] = [];
 page.on('console', message => { if (/DialogContent.*DialogTitle|Missing.*Description/.test(message.text())) warnings.push(message.text()); });
 await login(page);
 await page.goto(`/dashboard/projects/${fixtures.projects['QA Restore Project']}`);
 await page.getByRole('button', { name: 'Open project menu' }).click();
 await expect(page.getByRole('dialog', { name: 'Project menu' })).not.toContainText('Other QA Employee');
 await page.getByRole('dialog', { name: 'Project menu' }).getByRole('button', { name: 'Close' }).click();
 await page.getByRole('button', { name: 'Add task to Backlog', exact: true }).click();
 await page.getByRole('textbox', { name: 'Title', exact: true }).fill('QA Membership Refresh');
 await page.getByRole('combobox', { name: 'Choose employees for this task', exact: true }).click();
 await page.getByRole('option').filter({ hasText: 'Other QA Employee' }).click();
 await page.getByRole('listbox', { name: 'Suggestions', exact: true }).press('Escape');
 await page.getByRole('button', { name: 'Create task', exact: true }).click();
 await expect(page.getByRole('dialog', { name: 'Create task in Backlog', exact: true })).toBeHidden();
 await page.getByRole('button', { name: 'Open project menu' }).click();
 await page.getByRole('tab', { name: 'Overview', exact: true }).click();
 await expect(page.getByRole('dialog', { name: 'Project menu' })).toContainText('Other QA Employee');
 await page.getByRole('dialog', { name: 'Project menu' }).getByRole('button', { name: 'Close' }).click();
 await page.getByRole('button', { name: 'Open task details: QA Membership Refresh', exact: true }).click();
 await expect(page.getByRole('dialog', { name: 'QA Membership Refresh', exact: true })).toBeVisible();
 expect(warnings).toEqual([]);
});

test('project list and dashboard reflect live pipeline tasks', async ({ page }) => {
 await login(page);
 await page.goto(`/dashboard/projects/${fixtures.projects['QA Restore Project']}`);
 await page.getByRole('tab', { name: 'List', exact: true }).click();
 await expect(page.getByRole('button', { name: 'QA Membership Refresh', exact: true })).toBeVisible();
 await expect(page.getByRole('row').filter({ hasText: 'QA Membership Refresh' })).toContainText('Other QA Employee');
 await page.screenshot({ path: test.info().outputPath('project-task-list.png'), fullPage: true });
 await page.getByRole('textbox', { name: 'Search project tasks' }).fill('does not exist');
 await expect(page.getByRole('button', { name: 'QA Membership Refresh', exact: true })).toHaveCount(0);
 await page.getByRole('tab', { name: 'Dashboard', exact: true }).click();
 await expect(page.getByText('Total tasks', { exact: true })).toBeVisible();
 await expect(page.getByText('Other QA Employee', { exact: true })).toBeVisible();
 await expect(page.getByText('1 total · 1 open · 0 completed', { exact: true })).toBeVisible();
 await page.screenshot({ path: test.info().outputPath('project-task-dashboard.png'), fullPage: true });
});

async function deleteProjectDialog(page: Page, title: string) {
 await page.goto('/dashboard/projects');
 const row = page.getByRole('row').filter({ hasText: title });
 await expect(row).toBeVisible();
 await row.getByRole('button').last().click();
 await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
 await expect(page.getByRole('dialog')).not.toContainText(/pending/i);
 return page.getByRole('dialog');
}

test('soft delete through UI keeps project in trash and restore returns it', async ({ page }) => {
 await login(page);
 const title = 'QA Restore Project', id = fixtures.projects[title];
 const dialog = await deleteProjectDialog(page, title);
 await expect(dialog.getByRole('button', { name: 'Permanent deletion', exact: true })).toBeVisible();
 await dialog.getByRole('button', { name: 'Move to trash', exact: true }).last().click();
 await expect(dialog).toBeHidden();
 await page.goto('/dashboard/projects/trash');
 await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
 expect((await admin.get(`projects/${id}`)).status()).toBe(404);
 await page.getByRole('button', { name: 'Restore', exact: true }).click();
 await expect(page.getByRole('heading', { name: title, exact: true })).toBeHidden();
 expect((await admin.get(`projects/${id}`)).status()).toBe(200);
});

test('permanent deletion requires the exact project name and removes it', async ({ page }) => {
 await login(page);
 const title = 'QA Permanent Project', id = fixtures.projects[title];
 const dialog = await deleteProjectDialog(page, title);
 await dialog.getByRole('button', { name: 'Permanent deletion', exact: true }).click();
 const confirm = dialog.getByRole('button', { name: 'Delete everything permanently', exact: true });
 await expect(confirm).toBeDisabled();
 await dialog.getByRole('textbox').fill('wrong name'); await expect(confirm).toBeDisabled();
 await dialog.getByRole('textbox').fill(title); await confirm.click();
 await expect(dialog).toBeHidden();
 expect((await admin.get(`projects/${id}`)).status()).toBe(404);
 const trash = (await (await admin.get('projects/trash')).json()).data;
 expect(trash.some((p: { projectId: number }) => p.projectId === id)).toBe(false);
});

test('project type is dynamic, linked deletion explains blocker, unused deletion succeeds', async ({ page }) => {
 await login(page);
 await page.goto('/dashboard/settings?tab=project_types');
 await page.getByRole('button', { name: 'Add New', exact: true }).click();
 await page.getByLabel('Label', { exact: true }).fill('QA Browser Type');
 await page.getByRole('dialog').getByRole('button', { name: /Create|Save|Add Option/ }).click();
 await expect(page.getByText('QA Browser Type', { exact: true })).toBeVisible();
 const list = (await (await admin.get('settings/lookup-options?type=project_type')).json()).data;
 const type = list.find((t: { id: number; label: string }) => t.label === 'QA Browser Type');
 expect(type).toBeTruthy();
 const project = fixtures.projects['QA Type Project'];
 const updated = await admin.put(`projects/${project}`, { data: { title: 'QA Type Project', projectTypeId: type.id } });
 expect(updated.status(), await updated.text()).toBe(200);
 await page.getByRole('button', { name: 'Delete QA Browser Type', exact: true }).click();
 await page.getByRole('alertdialog').getByRole('button', { name: 'Delete', exact: true }).click();
 await expect(page.getByRole('alert')).toContainText(/linked|used|project/i);
 await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel', exact: true }).click();
 expect((await admin.put(`projects/${project}`, { data: { title: 'QA Type Project', projectTypeId: null } })).status()).toBe(200);
 await page.getByRole('button', { name: 'Delete QA Browser Type', exact: true }).click();
 await page.getByRole('alertdialog').getByRole('button', { name: 'Delete', exact: true }).click();
 await expect(page.getByRole('alertdialog')).toBeHidden();
 await expect(page.getByText('QA Browser Type', { exact: true })).toBeHidden();
});

test('configured project status appears in edit and filters and saves to the project', async ({ page }) => {
 const response = await admin.post('settings/lookup-options', { data: { type: 'project_status', value: 'qa_client_review', label: 'QA Client Review', is_active: true } });
 expect(response.status(), await response.text()).toBe(201);
 const id = fixtures.projects['QA Type Project'];
 await login(page);
 await page.goto(`/dashboard/projects/${id}`);
 await page.getByRole('button', { name: 'Edit Project', exact: true }).click();
 const dialog = page.getByRole('dialog', { name: 'Edit Project' });
 await dialog.getByRole('combobox', { name: 'Status', exact: true }).click();
 await page.getByRole('option', { name: 'QA Client Review', exact: true }).click();
 await dialog.getByRole('button', { name: 'Update Project', exact: true }).click();
 await expect(dialog).toBeHidden();
 await expect(page.getByText('QA Client Review', { exact: true }).first()).toBeVisible();
 expect((await (await admin.get(`projects/${id}`)).json()).data.status).toBe('qa_client_review');
 await page.goto('/dashboard/projects');
 const statusFilter = page.getByRole('combobox').filter({ hasText: 'All' }).first();
 await statusFilter.click();
 await page.getByRole('option', { name: 'QA Client Review', exact: true }).click();
 await expect(page.getByText('QA Type Project', { exact: true })).toBeVisible();
});

test('deleted statuses are absent from the project filter, creation and editing menus', async ({ page }) => {
 const options = (await (await admin.get('settings/lookup-options?type=project_status')).json()).data;
 for (const value of ['ui_ux', 'development', 'testing']) {
  const item = options.find((status: { value: string }) => status.value === value);
  const response = await admin.delete(`settings/lookup-options/${item.id}`);
  expect(response.status(), await response.text()).toBe(200);
 }
 await login(page);
 await page.goto('/dashboard/projects');
 await page.getByRole('combobox').filter({ hasText: 'All' }).first().click();
 for (const label of ['UI/UX Phase', 'Development', 'Testing']) await expect(page.getByRole('option', { name: label, exact: true })).toHaveCount(0);
 for (const label of ['Draft', 'Active', 'Completed', 'On Hold', 'Cancelled']) await expect(page.getByRole('option', { name: label, exact: true })).toBeVisible();
 await page.keyboard.press('Escape');
 await page.getByRole('button', { name: 'Create Project', exact: true }).click();
 const create = page.getByRole('dialog', { name: 'Create Project' });
 await create.getByRole('combobox', { name: 'Status', exact: true }).click();
 for (const label of ['UI/UX', 'Development', 'Testing']) await expect(page.getByRole('option', { name: label, exact: true })).toHaveCount(0);
 for (const label of ['Draft', 'Active', 'Completed', 'On Hold', 'Cancelled']) await expect(page.getByRole('option', { name: label, exact: true })).toBeVisible();
 await page.keyboard.press('Escape');
 await create.getByRole('button', { name: 'Close', exact: true }).click();
 await page.goto(`/dashboard/projects/${fixtures.projects['QA Type Project']}`);
 await page.getByRole('button', { name: 'Edit Project', exact: true }).click();
 const edit = page.getByRole('dialog', { name: 'Edit Project' });
 await edit.getByRole('combobox', { name: 'Status', exact: true }).click();
 for (const label of ['UI/UX', 'Development', 'Testing']) await expect(page.getByRole('option', { name: label, exact: true })).toHaveCount(0);
 for (const label of ['Draft', 'Active', 'Completed', 'On Hold', 'Cancelled']) await expect(page.getByRole('option', { name: label, exact: true })).toBeVisible();
});

test('per-employee allocation editor saves and returns to company default', async ({ page }) => {
 await login(page);
 const panel = await leavePanel(page);
 await panel.getByRole('button', { name: 'Edit allocation', exact: true }).first().click();
 await panel.getByLabel('Total allocation (used days stay unchanged)').fill('26');
 await panel.getByRole('button', { name: 'Save allocation', exact: true }).click();
 await expect(panel.getByText('Custom employee allocation', { exact: true })).toBeVisible();
 expect((await history()).balances[0].allocatedDays).toBe(26);
 await panel.getByRole('button', { name: 'Use company default', exact: true }).click();
 await expect(panel.getByText('Custom employee allocation', { exact: true })).toBeHidden();
 expect((await history()).balances[0].isCustom).toBe(false);
});

test('profile shortcut adjusts annual leave for a selected year and persists without altering used days', async ({ page }) => {
 const annual = types.find(t => t.slug === 'annual')!;
 const leaveResponse = await admin.post(`employees/${fixtures.employee}/leaves`, { data: { leaveTypeId: annual.id, startDate: `${year}-11-23`, endDate: `${year}-11-23` } });
 expect(leaveResponse.status(), await leaveResponse.text()).toBe(201);
 const leave = (await leaveResponse.json()).data;
 await login(page);
 await page.goto(`/dashboard/employees/${fixtures.employee}`);
 await page.getByRole('button', { name: 'Adjust leave balance', exact: true }).click();
 const dialog = page.getByRole('dialog', { name: 'Adjust leave balances' });
 await expect(dialog).toBeVisible();
 const section = dialog.locator('section').filter({ has: page.getByRole('heading', { name: annual.name, exact: true }) });
 const before = (await history()).balances.find((b: LeaveBalance) => b.leaveTypeId === annual.id);
 expect(before.usedDays).toBeGreaterThan(0);
 await section.getByRole('button', { name: 'Edit allocation' }).click();
 await section.getByLabel('Total allocation (used days stay unchanged)').fill('18');
 const saved = page.waitForResponse(r => r.request().method() === 'PUT' && r.url().endsWith(`/employees/${fixtures.employee}/leave-balances/${annual.id}`));
 await section.getByRole('button', { name: 'Save allocation' }).click();
 expect((await saved).status()).toBe(200);
 await expect(section).toContainText('18 total days');
 const updated = (await history()).balances.find((b: LeaveBalance) => b.leaveTypeId === annual.id);
 expect(updated.allocatedDays).toBe(18);
 expect(updated.usedDays).toBe(before.usedDays);
 await page.reload();
 await page.getByRole('button', { name: 'Adjust leave balance', exact: true }).click();
 await expect(page.getByRole('dialog', { name: 'Adjust leave balances' }).locator('section').filter({ has: page.getByRole('heading', { name: annual.name, exact: true }) })).toContainText('18 total days');
 await page.getByLabel('Balance year').fill(String(year + 1));
 await expect(page.getByRole('dialog').locator('section').filter({ has: page.getByRole('heading', { name: annual.name, exact: true }) })).toContainText(`${annual.annualAllowanceDays} total days`);
 await admin.post(`employee-leaves/${leave.id}/cancel`);
 await admin.put(`employees/${fixtures.employee}/leave-balances/${annual.id}`, { data: { year, useDefault: true } });
});

test('short permission request notifies admin and approval notifies employee once', async () => {
 const created = await employee.post(`employees/${fixtures.employee}/short-permissions`, { data: { permissionDate: `${year}-11-16`, startTime: '09:00', endTime: '10:00', reason: 'QA appointment' } });
 expect(created.status(), await created.text()).toBe(201);
 const id = (await created.json()).data.id;
 expect((await notifications(admin)).filter((n: Notice) => n.data.request_id === id && n.type === 'permission_pending')).toHaveLength(1);
 const approved = await admin.post(`employee-short-permissions/${id}/approve`, { data: { compensationType: 'paid' } });
 expect(approved.status(), await approved.text()).toBe(200);
 expect((await notifications(employee)).filter((n: Notice) => n.data.request_id === id && n.type === 'permission_approved')).toHaveLength(1);
 expect((await admin.post(`employee-short-permissions/${id}/cancel`)).status()).toBe(200);
});

for (const path of ['/dashboard/clients', '/dashboard/employees', '/dashboard/attendance', '/dashboard/roles', '/dashboard/settings', '/dashboard/admin/users']) {
 test(`admin page ${path} loads without runtime or server errors`, async ({ page }) => {
  await login(page);
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 500 && r.url().includes('/api/')) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/Application error|Something went wrong/)).toHaveCount(0);
  expect(errors).toEqual([]);
 });
}

test('project and task assignment notifications reach the assigned employee once', async ({ page }) => {
 const project = fixtures.projects['QA Working Project'];
 const denied = await employee.post(`projects/${project}/members`, { data: { userId: fixtures.other } });
 expect(denied.status()).toBe(403);
 const member = await admin.post(`projects/${project}/members`, { data: { userId: fixtures.other, role: 'member' } });
 expect(member.status(), await member.text()).toBe(201);
 expect((await notifications(other)).filter((n: Notice) => n.type === 'user_added_to_project' && n.data.project_id === project)).toHaveLength(1);
 const assigned = await admin.post(`tasks/${fixtures.task}/assignees`, { data: { userId: fixtures.other, role: 'developer', isPrimary: false } });
 expect(assigned.status(), await assigned.text()).toBe(201);
 expect((await notifications(other)).filter((n: Notice) => n.type === 'task_assigned' && n.data.task_id === fixtures.task)).toHaveLength(1);
 await login(page, 'qa-other@thetables.com');
 await page.getByRole('button', { name: /Notifications/ }).click();
 await expect(page.getByText(/assigned you to task: QA Timer Task/).first()).toBeVisible();
});

test('contract and employee document files download intact with access checks', async () => {
 const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=', 'base64');
 const upload = { name: 'qa-document.png', mimeType: 'image/png', buffer: bytes };
 const contract = await admin.post(`employment-contracts/${fixtures.contract}/file`, { multipart: { file: upload } });
 expect(contract.status(), await contract.text()).toBe(201);
 const ownFile = await employee.get(`employment-contracts/${fixtures.contract}/file`);
 expect(ownFile.status()).toBe(200); expect(await ownFile.body()).toEqual(bytes);
 expect((await other.get(`employment-contracts/${fixtures.contract}/file`)).status()).toBe(403);
 const document = await admin.post(`employees/${fixtures.employee}/documents`, { multipart: { name: 'QA identity', documentType: 'Identity', file: upload } });
 expect(document.status(), await document.text()).toBe(201);
 const id = (await document.json()).data.id;
 const download = await admin.get(`employee-documents/${id}/download`);
 expect(download.status()).toBe(200); expect(await download.body()).toEqual(bytes);
 expect((await other.get(`employee-documents/${id}/download`)).status()).toBe(403);
 expect((await admin.delete(`employee-documents/${id}`)).status()).toBe(200);
 expect((await admin.delete(`employment-contracts/${fixtures.contract}/file`)).status()).toBe(200);
});

test('authorized salary changes synchronize the current employment contract', async () => {
 const update = await admin.put(`employees/${fixtures.employee}/salary`, { data: { baseSalary: 6500 } });
 expect(update.status(), await update.text()).toBe(200);
 const contracts = await employee.get(`employees/${fixtures.employee}/employment-contracts`);
 expect(contracts.status()).toBe(200);
 const data = (await contracts.json()).data;
 expect(data.find((contract: { id: number }) => contract.id === fixtures.contract).baseSalary).toBe(6500);
 expect((await employee.put(`employees/${fixtures.employee}/salary`, { data: { baseSalary: 99999 } })).status()).toBe(403);
 expect((await admin.put(`employees/${fixtures.employee}/salary`, { data: { baseSalary: 6000 } })).status()).toBe(200);
});
