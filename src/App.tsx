import { useEffect, useState } from 'react';
import { Activity, Building2, LockKeyhole, LogOut, ShieldCheck } from 'lucide-react';
import { getHealth } from './lib/api';
import { ApiError, authApi, type Identity, type MfaRequired, type Permission } from './lib/auth-api';

type Stage = 'checking' | 'login' | 'mfa' | 'ready';
const permissionLabels: Record<Permission, string> = {
  'company.view': 'Company overview',
  'projects.view': 'Projects',
  'finance.view': 'Finance',
  'finance.export': 'Finance exports',
  'payroll.view': 'Payroll',
};
const allPermissions = Object.keys(permissionLabels) as Permission[];

export default function App() {
  const [stage, setStage] = useState<Stage>('checking');
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [mfa, setMfa] = useState<MfaRequired | null>(null);
  const [enrollment, setEnrollment] = useState<{ secret: string; otpauth_uri: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [health, setHealth] = useState<'checking' | 'connected' | 'offline'>('checking');

  useEffect(() => {
    let alive = true;
    void getHealth().then(() => { if (alive) setHealth('connected'); }).catch(() => { if (alive) setHealth('offline'); });
    void authApi.me().then(async (user) => {
      if (!alive) return;
      setIdentity(user);
      try {
        const context = await authApi.getContext();
        if (alive) { setSelectedCompany(context.company_id); setPermissions(context.permissions); }
      } catch { /* No current authorized context is a valid empty state. */ }
      if (alive) setStage('ready');
    }).catch(async () => {
      try {
        const state = await authApi.mfaStatus();
        if (alive) { setMfa(state); setStage('mfa'); }
      } catch { if (alive) setStage('login'); }
    });
    return () => { alive = false; };
  }, []);

  async function act(callback: () => Promise<void>) {
    setBusy(true);
    setError('');
    try { await callback(); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Request failed. Check your connection and try again.'); }
    finally { setBusy(false); }
  }

  const reloadIdentity = async () => {
    const user = await authApi.me();
    setIdentity(user);
    setMfa(null);
    setCode('');
    setEnrollment(null);
    setStage('ready');
  };

  const login = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void act(async () => {
      const result = await authApi.login(email, password);
      setPassword('');
      if ('status' in result && result.status === 'mfa_required') {
        setMfa(result); setStage('mfa');
      } else {
        setIdentity(result as Identity);
        setStage('ready');
      }
    });
  };
  const verify = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void act(async () => {
      if (mfa?.enrollment_required) {
        const result = await authApi.confirmEnrollment(code);
        setRecoveryCodes(result.recovery_codes);
      } else {
        await authApi.verifyMfa(code);
      }
      await reloadIdentity();
    });
  };
  const company = identity?.companies.find((item) => item.id === selectedCompany);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div className="flex items-center gap-3">
            <Building2 className="text-sky-400" aria-hidden="true" />
            <div><h1 className="text-xl font-semibold">Elmo Tech ERP</h1><p className="text-xs text-slate-400">Internal access · V2</p></div>
          </div>
          <p role="status" className="flex items-center gap-2 text-sm text-slate-400">
            <Activity size={16} aria-hidden="true" />
            {health === 'checking' ? 'Checking API…' : health === 'connected' ? 'API connected' : 'API unavailable'}
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10" dir="auto">
        {error && <p role="alert" className="mb-6 rounded-lg border border-red-700 bg-red-950 p-4 text-red-200">{error}</p>}
        {stage === 'checking' && <p role="status">Checking your session…</p>}
        {stage === 'login' && (
          <section className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-7">
            <h2 className="mb-2 flex items-center gap-2 text-2xl font-semibold"><LockKeyhole size={22} /> Sign in</h2>
            <p className="mb-6 text-sm text-slate-400">Authorized internal accounts only.</p>
            <form onSubmit={login} className="grid gap-4">
              <label className="grid gap-1 text-sm">Work email<input required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg border border-slate-600 bg-slate-950 p-3" /></label>
              <label className="grid gap-1 text-sm">Password<input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-lg border border-slate-600 bg-slate-950 p-3" /></label>
              <button disabled={busy} className="rounded-lg bg-sky-600 px-4 py-3 font-semibold hover:bg-sky-500 disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'}</button>
            </form>
          </section>
        )}
        {stage === 'mfa' && (
          <section className="max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-7">
            <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold"><ShieldCheck size={22} /> Security verification</h2>
            {mfa?.enrollment_required ? (
              <div className="mb-5 text-sm text-slate-300">
                <p>Register an authenticator app. Keep your authenticator seed private.</p>
                {!enrollment ? <button disabled={busy} onClick={() => void act(async () => setEnrollment(await authApi.startEnrollment()))} className="mt-4 rounded-lg bg-sky-600 px-4 py-2 disabled:opacity-50">Start enrollment</button> :
                <div className="mt-4 break-all rounded-lg border border-slate-700 p-3"><p className="font-semibold">Manual setup secret</p><code>{enrollment.secret}</code><p className="mt-2 text-xs text-slate-400">Enter the six-digit code in your authenticator app to finish setup.</p></div>}
              </div>
            ) : <p className="mb-5 text-sm text-slate-300">Enter your authenticator code or a one-time recovery code.</p>}
            {(!mfa?.enrollment_required || enrollment) &&
              <form onSubmit={verify} className="grid gap-4">
                <label className="grid gap-1 text-sm">Verification code<input required autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} className="rounded-lg border border-slate-600 bg-slate-950 p-3" /></label>
                <button disabled={busy} className="rounded-lg bg-sky-600 p-3 font-semibold disabled:opacity-50">Verify</button>
              </form>}
            <button onClick={() => { setStage('login'); setMfa(null); setEnrollment(null); setError(''); }} className="mt-5 text-sm text-slate-300 underline">Back to sign in</button>
          </section>
        )}
        {stage === 'ready' && identity && (
          <section className="space-y-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div><h2 className="text-2xl font-semibold">Welcome, {identity.user.name}</h2><p className="text-sm text-slate-400">{identity.user.email}</p></div>
              <button disabled={busy} onClick={() => void act(async () => { await authApi.logout(); setIdentity(null); setSelectedCompany(''); setPermissions([]); setRecoveryCodes([]); setStage('login'); })} className="flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 disabled:opacity-50"><LogOut size={16} /> Sign out</button>
            </div>
            {recoveryCodes.length > 0 && <div role="alert" className="rounded-xl border border-amber-600 bg-amber-950 p-5"><h3 className="font-semibold">Save these recovery codes now — shown once</h3><div className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm">{recoveryCodes.map((item) => <code key={item}>{item}</code>)}</div><button onClick={() => setRecoveryCodes([])} className="mt-4 underline">I have saved them</button></div>}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="mb-4 text-lg font-semibold">Company context</h3>
              {identity.companies.length === 0 ? <p role="status" className="text-slate-400">No active company access. Contact an administrator.</p> :
                <label className="grid max-w-md gap-2 text-sm">Authorized legal company
                  <select disabled={busy} value={selectedCompany} onChange={(event) => void act(async () => { const value = event.target.value; if (!value) return; const context = await authApi.switchCompany(value); setSelectedCompany(context.company_id); setPermissions(context.permissions); })} className="rounded-lg border border-slate-600 bg-slate-950 p-3">
                    <option value="">Choose company…</option>
                    {identity.companies.map((item) => <option key={item.id} value={item.id}>{item.legal_name} ({item.code})</option>)}
                  </select>
                </label>}
              {company && <p className="mt-3 text-sm text-slate-400">Active context: {company.country_code} · {company.code}</p>}
            </div>
            {company && <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h3 className="mb-4 text-lg font-semibold">Authorized areas</h3><div className="flex flex-wrap gap-3">{allPermissions.map((permission) => <span key={permission} className={`rounded-full border px-3 py-2 text-sm ${permissions.includes(permission) ? 'border-emerald-700 text-emerald-300' : 'border-slate-700 text-slate-500'}`}>{permissionLabels[permission]} · {permissions.includes(permission) ? 'Allowed' : 'Restricted'}</span>)}</div><p className="mt-4 text-xs text-slate-500">Displayed permissions are informational. The API rechecks access for each request.</p></div>}
          </section>
        )}
      </main>
    </div>
  );
}
