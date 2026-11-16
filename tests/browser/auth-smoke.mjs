import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { chromium } from 'playwright';

function currentTotp(secret, offsetSeconds = 0) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const letter of secret) bits += alphabet.indexOf(letter).toString(2).padStart(5, '0');
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(Math.floor((Date.now() / 1000 + offsetSeconds) / 30)));
  const hmac = createHmac('sha1', Buffer.from(bytes)).update(buffer).digest();
  const offset = hmac[19] & 0xf;
  const number = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000;
  return String(number).padStart(6, '0');
}

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
  await page.getByLabel('Password').fill('incorrect-test-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('alert').getByText('Invalid credentials.').waitFor();
  assert.equal(await page.getByLabel('Password').inputValue(), '', 'failed-login password must be cleared');
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

  // Privileged account must remain outside /me until a true TOTP challenge succeeds.
  await page.getByLabel('Work email').fill('manager-ci@example.test');
  await page.getByLabel('Password').fill('browser-ci-only-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByText('Security verification').waitFor();
  const pendingDenied = await page.evaluate(async () =>
    (await fetch('http://localhost:8000/api/v1/auth/me', { credentials: 'include', headers: { Accept: 'application/json' } })).status
  );
  assert.equal(pendingDenied, 401);
  await page.getByLabel('Verification code').fill(currentTotp('JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP'));
  await page.getByRole('button', { name: 'Verify' }).click();
  await page.getByText('Welcome, Browser Global Manager').waitFor();
  assert.equal(await page.getByRole('combobox').locator('option').count(), 3);
  await page.getByRole('combobox').selectOption({ label: 'Synthetic Italy Test Entity (CI-IT)' });
  await page.getByText('Active context: IT · CI-IT').waitFor();
  assert(await page.getByText('Finance · Restricted').isVisible());
  assert(await page.getByText('Payroll · Restricted').isVisible());
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.getByRole('button', { name: 'Sign in' }).waitFor();

  // Trusted first-time MFA enrollment: privileged API stays unauthenticated until confirmation.
  await page.getByLabel('Work email').fill('enroll-ci@example.test');
  await page.getByLabel('Password').fill('browser-ci-only-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByText('Security verification').waitFor();
  const unauthorizedBeforeEnrollment = await page.evaluate(async () =>
    (await fetch('http://localhost:8000/api/v1/auth/me', {
      credentials: 'include', headers: { Accept: 'application/json' },
    })).status
  );
  assert.equal(unauthorizedBeforeEnrollment, 401);
  const startPromise = page.waitForResponse((r) => r.url().endsWith('/api/v1/auth/mfa/enroll/start'));
  await page.getByRole('button', { name: 'Start enrollment' }).click();
  const start = await startPromise;
  assert.equal(start.status(), 200);
  assert.match(start.headers()['cache-control'] || '', /no-store/);
  const pendingSecret = (await page.locator('section code').first().textContent()).trim();
  assert.match(pendingSecret, /^[A-Z2-7]{32}$/);
  const unsafeOtp = currentTotp(pendingSecret, -180);
  await page.getByLabel('Verification code').fill(unsafeOtp);
  await page.getByRole('button', { name: 'Verify' }).click();
  await page.getByRole('alert').getByText('Invalid verification code.').waitFor();
  assert.equal(await page.getByLabel('Verification code').inputValue(), '');
  await page.getByLabel('Verification code').fill(currentTotp(pendingSecret));
  await page.getByRole('button', { name: 'Verify' }).click();
  await page.getByText('Welcome, Browser Enroll').waitFor();
  await page.getByText('Save these recovery codes now — shown once').waitFor();
  const recovery = (await page.locator('[role="alert"] code').allTextContents()).map((v) => v.trim());
  assert.equal(recovery.length, 8);
  assert(!((await page.locator('body').innerText()).includes(pendingSecret)), 'TOTP seed cleared after confirmation');
  const meNoStore = await page.evaluate(async () => {
    const r = await fetch('http://localhost:8000/api/v1/auth/me', {
      credentials: 'include', headers: { Accept: 'application/json' },
    });
    return { status: r.status, cache: r.headers.get('cache-control'), body: await r.text() };
  });
  assert.equal(meNoStore.status, 200);
  assert.match(meNoStore.cache || '', /no-store/);
  assert(!meNoStore.body.includes(pendingSecret), 'secret must not be serialized into /me');
  assert(!meNoStore.body.includes(recovery[0]), 'recovery must not appear in /me');

  await page.getByRole('button', { name: 'I have saved them' }).click();
  assert(!((await page.locator('body').innerText()).includes(recovery[0])), 'dismissal removes codes from DOM');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.getByRole('button', { name: 'Sign in' }).waitFor();
  assert(!((await page.locator('body').innerText()).includes(pendingSecret)), 'logout removes secret from DOM');
  assert(!((await page.locator('body').innerText()).includes(recovery[0])), 'logout removes recovery from DOM');

  const loginEnrollUser = async () => {
    await page.getByLabel('Work email').fill('enroll-ci@example.test');
    await page.getByLabel('Password').fill('browser-ci-only-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByText('Security verification').waitFor();
  };
  await loginEnrollUser();
  await page.getByLabel('Verification code').fill(recovery[0]);
  await page.getByRole('button', { name: 'Verify' }).click();
  await page.getByText('Welcome, Browser Enroll').waitFor();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.getByRole('button', { name: 'Sign in' }).waitFor();

  await loginEnrollUser();
  await page.getByLabel('Verification code').fill(recovery[0]);
  await page.getByRole('button', { name: 'Verify' }).click();
  await page.getByRole('alert').getByText('Invalid verification code.').waitFor();
  const reuseDenied = await page.evaluate(async () =>
    (await fetch('http://localhost:8000/api/v1/auth/me', {
      credentials: 'include', headers: { Accept: 'application/json' },
    })).status
  );
  assert.equal(reuseDenied, 401, 'reused recovery code cannot authenticate');
  await page.getByLabel('Verification code').fill(recovery[1]);
  await page.getByRole('button', { name: 'Verify' }).click();
  await page.getByText('Welcome, Browser Enroll').waitFor();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.getByRole('button', { name: 'Sign in' }).waitFor();

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
  console.log('PASS: Chromium actual origins 5173/8000, CSRF 419, cookie login/me/logout, trusted first-time MFA enrollment, expired TOTP denial, one-time recovery reuse denial, secret DOM clearance, MFA TOTP, global switch and restricted finance/payroll, role 403, untrusted origin blocked.');
} finally {
  await browser.close();
}
