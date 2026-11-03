import { spawn } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, openSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = path.resolve(root, '../erp-backend');
const workspace = mkdtempSync(path.join(tmpdir(), 'erp-qa-'));
const database = path.join(workspace, 'e2e.sqlite');
const frontend = path.join(workspace, 'frontend');
const projects = process.argv.slice(2).length ? process.argv.slice(2) : ['chromium'];
const supported = new Set(['chromium', 'firefox', 'webkit', 'mobile-chrome']);
if (projects.some(p => !supported.has(p))) throw new Error('Use chromium, firefox, webkit or mobile-chrome as project names.');
async function availablePort() {
 const { createServer } = await import('node:net');
 return new Promise((resolve, reject) => {
  const server = createServer();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
   const port = server.address().port;
   server.close(() => resolve(port));
  });
 });
}
const apiPort = Number(process.env.E2E_API_PORT || await availablePort());
const webPort = Number(process.env.E2E_WEB_PORT || await availablePort());
const socketPort = Number(process.env.E2E_SOCKET_PORT || await availablePort());
const baseURL = `http://localhost:${webPort}`;
const reportRoot = path.join(root, 'test-results', path.basename(workspace));
mkdirSync(reportRoot, { recursive: true });
const env = {
 ...process.env, APP_ENV: 'testing', APP_DEBUG: 'true',
 APP_KEY: 'base64:MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=',
 APP_URL: `http://127.0.0.1:${apiPort}`, FRONTEND_URL: baseURL,
 DB_CONNECTION: 'sqlite', DB_DATABASE: database, DB_URL: '',
 CACHE_STORE: 'array', SESSION_DRIVER: 'array', QUEUE_CONNECTION: 'sync', MAIL_MAILER: 'array',
 ERP_SIMPLIFIED_MODE: 'true', API_RATE_LIMIT: '1200', AUTH_RATE_LIMIT: '100',
 BROADCAST_CONNECTION: 'reverb', REVERB_APP_ID: 'erp-e2e', REVERB_APP_KEY: 'erp-e2e-key', REVERB_APP_SECRET: 'erp-e2e-secret',
 REVERB_HOST: '127.0.0.1', REVERB_PORT: String(socketPort), REVERB_SERVER_PORT: String(socketPort), REVERB_SCHEME: 'http',
 WEB_PUSH_PUBLIC_KEY: '', WEB_PUSH_PRIVATE_KEY: '',
 NEXT_PUBLIC_API_URL: `http://127.0.0.1:${apiPort}/api/v1`,
 NEXT_PUBLIC_REVERB_APP_KEY: 'erp-e2e-key', NEXT_PUBLIC_REVERB_HOST: '127.0.0.1', NEXT_PUBLIC_REVERB_PORT: String(socketPort), NEXT_PUBLIC_REVERB_SCHEME: 'http',
 E2E_BASE_URL: baseURL, E2E_API_URL: `http://127.0.0.1:${apiPort}/api/v1`, E2E_FIXTURES: path.join(workspace, 'fixtures.json'),
};
const children = [];
function run(command, args, cwd, extra = {}) {
 return new Promise((resolve, reject) => {
  const child = spawn(command, args, { cwd, env: { ...env, ...extra }, stdio: 'inherit' });
  child.once('error', reject);
  child.once('exit', code => code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`)));
 });
}
function start(command, args, cwd, name) {
 const log = openSync(path.join(workspace, `${name}.log`), 'a');
 const child = spawn(command, args, { cwd, env, stdio: ['ignore', log, log], detached: true });
 children.push(child);
 child.on('error', error => console.error(`${name}: ${error.message}`));
 return child;
}
async function waitFor(url) {
 for (let n = 0; n < 120; n++) {
  try { if ((await fetch(url)).ok) return; } catch {}
  await new Promise(resolve => setTimeout(resolve, 500));
 }
 throw new Error(`Server did not become healthy: ${url}; inspect ${workspace}`);
}
function stop() {
 for (const child of children.reverse()) {
  try { process.kill(-child.pid, 'SIGTERM'); } catch {}
 }
}
process.on('SIGINT', () => { stop(); process.exit(130); });
process.on('SIGTERM', () => { stop(); process.exit(143); });
try {
 // Do not reuse or terminate the user's running servers.
 for (const port of [apiPort, webPort, socketPort]) {
  const { createServer } = await import('node:net');
  const inUse = await new Promise(resolve => {
   const server = createServer();
   server.once('error', () => resolve(true));
   server.listen(port, '127.0.0.1', () => server.close(() => resolve(false)));
  });
  if (inUse) throw new Error(`Port ${port} is in use. Choose different E2E_API_PORT / E2E_WEB_PORT / E2E_SOCKET_PORT.`);
 }
 console.log(`Disposable E2E workspace: ${workspace}`);
 writeFileSync(database, '');
 const excluded = new Set(['.git', '.next', 'node_modules', 'test-results', 'playwright-report', '.playwright-cli', 'state']);
 cpSync(root, frontend, { recursive: true, filter: source => !path.relative(root, source).split(path.sep).some(part => excluded.has(part)) });
 symlinkSync(path.join(root, 'node_modules'), path.join(frontend, 'node_modules'), 'dir');
 await run('npm', ['run', 'build'], frontend);
 await run('php', ['artisan', 'migrate', '--seed', '--force'], backend);
 start('php', ['artisan', 'serve', '--host=127.0.0.1', `--port=${apiPort}`], backend, 'api');
 start('php', ['artisan', 'reverb:start', '--host=127.0.0.1', `--port=${socketPort}`], backend, 'reverb');
 start('npm', ['run', 'start', '--', '--port', String(webPort)], frontend, 'web');
 await Promise.all([waitFor(`${env.APP_URL}/api/v1/health`), waitFor(`${baseURL}/login`)]);
 let failed = false;
 for (let index = 0; index < projects.length; index++) {
  if (index > 0) await run('php', ['artisan', 'migrate:fresh', '--seed', '--force'], backend);
  // The seed script itself rejects non-disposable databases.
  const fixtureOutput = openSync(env.E2E_FIXTURES, 'w');
  await new Promise((resolve, reject) => {
   const child = spawn('php', ['tests/E2E/seed.php'], { cwd: backend, env, stdio: ['ignore', fixtureOutput, 'inherit'] });
   child.once('error', reject); child.once('exit', code => code === 0 ? resolve() : reject(new Error('Fixture seeding failed')));
  });
  const report = path.join(reportRoot, projects[index]);
  mkdirSync(report, { recursive: true });
  try {
   await run('npx', ['playwright', 'test', `--project=${projects[index]}`, '--output', path.join(report, 'artifacts'), ...(process.env.E2E_GREP ? ['--grep', process.env.E2E_GREP] : [])], root, {
    E2E_REPORT_DIR: report,
   });
  } catch (error) { failed = true; console.error(error.message); }
 }
 console.log(`Reports: ${reportRoot}`);
 console.log(`Server logs and disposable database: ${workspace}`);
 if (failed) process.exitCode = 1;
} finally { stop(); }
