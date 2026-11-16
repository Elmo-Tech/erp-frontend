import { useQuery } from '@tanstack/react-query';
import { Activity, Building2, Database, ShieldCheck } from 'lucide-react';
import { getHealth } from './lib/api';

const cards = [
  { icon: Building2, title: 'Two legal companies', text: 'Egypt and Italy remain separate in accounting and access control.' },
  { icon: ShieldCheck, title: 'Scoped permissions', text: 'No financial company data without explicit membership and policy checks.' },
  { icon: Database, title: 'Accounting foundation', text: 'Immutable posted journals and multi-currency groundwork are next.' },
];
export default function App() {
  const health = useQuery({ queryKey: ['api', 'health'], queryFn: getHealth, retry: 1, refetchInterval: 30000 });
  return (
    <div className="min-h-screen bg-[#0c1727] text-slate-100">
      <header className="border-b border-slate-800 bg-[#111f33]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-blue-500/20 p-3 text-blue-300"><Building2 size={22} /></span>
            <div><h1 className="text-xl font-semibold tracking-tight">Elmo Tech ERP</h1><p className="text-sm text-slate-400">V2 / Foundation Preview</p></div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm" role="status" aria-live="polite">
            <Activity size={16} className={health.isSuccess ? 'text-emerald-400' : 'text-amber-400'} />
            <span>{health.isPending ? 'Checking API…' : health.isSuccess ? 'Backend connected' : 'Backend unavailable'}</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-14">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Phase 0 · P0-01</p>
        <h2 className="max-w-3xl text-3xl font-semibold leading-tight md:text-5xl">A clean foundation for managing Elmo Tech.</h2>
        <p className="mt-5 max-w-2xl text-slate-400">This screen is a technical preview, not a live dashboard. Financial data, user accounts and company controls will appear only after verified backend implementation.</p>
        <section className="mt-12 grid gap-4 md:grid-cols-3" aria-label="Architecture principles">
          {cards.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-slate-700 bg-[#132238] p-6">
              <Icon className="mb-5 text-blue-300" size={26} aria-hidden="true" />
              <h3 className="mb-2 font-semibold">{title}</h3><p className="text-sm leading-relaxed text-slate-400">{text}</p>
            </article>
          ))}
        </section>
        <footer className="mt-12 border-t border-slate-800 pt-5 text-xs text-slate-500">Internal ERP only · no client portal · no production data on this preview.</footer>
      </main>
    </div>
  );
}
