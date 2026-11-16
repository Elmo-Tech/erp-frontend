import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.getByText('Sign in', { exact: true }).first().waitFor();

  const health = await page.evaluate(async () => {
    const response = await fetch('http://localhost:8000/api/v1/health', { credentials: 'include' });
    return { status: response.status, cors: response.headers.get('content-type'), data: await response.json() };
  });
  assert.equal(health.status, 200);
  assert.equal(health.data.status, 'ok');

  // CSRF must reject an unbootstrapped mutating browser request.
  const badCsrf = await page.evaluate(async () => {
    const response = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: 'browser-ci@example.test', password: 'browser-ci-only-password' }),
    });
    return response.status;
  });
  assert.equal(badCsrf, 419, 'login without CSRF must be rejected');

  await page.getByLabel('Work email').fill('browser-ci@example.test');
  await page.getByLabel('Password').fill('browser-ci-only-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByText('Welcome, Browser Test').waitFor({ timeout: 20000 });
  await page.getByRole('combobox').selectOption({ label: 'Synthetic Egypt Test Entity (CI-EG)' });
  await page.getByText('Active context: EG · CI-EG').waitFor();
  assert(await page.getByText('Projects · Allowed').isVisible());
  assert(await page.getByText('Finance · Restricted').isVisible());

  const [me, denied] = await page.evaluate(async () => {
    const a = await fetch('http://localhost:8000/api/v1/auth/me', { credentials: 'include', headers: { Accept: 'application/json' } });
    const b = await fetch('http://localhost:8000/api/v1/companies/authorize/payroll.view', { credentials: 'include', headers: { Accept: 'application/json' } });
    return [a.status, b.status];
  });
  assert.equal(me, 200);
  assert.equal(denied, 403);

  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.getByRole('button', { name: 'Sign in' }).waitFor();
  const loggedOut = await page.evaluate(async () =>
    (await fetch('http://localhost:8000/api/v1/auth/me', { credentials: 'include', headers: { Accept: 'application/json' } })).status
  );
  assert.equal(loggedOut, 401);

  const untrusted = await browser.newContext();
  const otherPage = await untrusted.newPage();
  await otherPage.goto('http://127.0.0.1:5999/');
  const corsBlocked = await otherPage.evaluate(async () => {
    try {
      await fetch('http://localhost:8000/api/v1/health', { credentials: 'include' });
      return false;
    } catch {
      return true;
    }
  });
  assert.equal(corsBlocked, true, 'unlisted browser origin must not read API');
  assert.deepEqual(errors, []);
  await untrusted.close();
  console.log('PASS: Chromium actual origins 5173/8000, CSRF 419, cookie login/me/logout, switch, role 403, untrusted origin blocked.');
} finally {
  await browser.close();
}
