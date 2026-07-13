import { BarChart3, CircleDollarSign } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ExecutiveFinancialSnapshot } from "./ExecutiveStatsWidget";
import type { TeamPerformanceSnapshot } from "./TeamPerformanceWidget";

interface OperationalChartsWidgetProps {
	financial?: ExecutiveFinancialSnapshot;
	team?: TeamPerformanceSnapshot;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	notation: "compact",
	maximumFractionDigits: 1,
});

export function OperationalChartsWidget({ financial, team }: OperationalChartsWidgetProps) {
	return (
		<section className={cn("grid gap-4", financial && team && "xl:grid-cols-2")}>
			{financial ? <CashPositionChart financial={financial} /> : null}
			{team ? <WorkflowChart team={team} /> : null}
		</section>
	);
}

function CashPositionChart({ financial }: { financial?: ExecutiveFinancialSnapshot }) {
	const invoiced = financial?.invoiced_total ?? 0;
	const collected = Math.min(financial?.paid_total ?? 0, invoiced);
	const overdue = Math.min(financial?.overdue_total ?? 0, Math.max(0, invoiced - collected));
	const pending = Math.max(0, invoiced - collected - overdue);
	const collectionRate = percentage(collected, invoiced);
	const segments = [
		{ label: "Collected", value: collected, color: "bg-emerald-500" },
		{ label: "Pending", value: pending, color: "bg-primary" },
		{ label: "Overdue", value: overdue, color: "bg-destructive" },
	] as const;

	return (
		<div className="rounded-lg border bg-card p-5">
			<div className="flex items-start justify-between gap-3">
				<div><h2 className="text-sm font-semibold">Cash position</h2><p className="mt-1 text-xs text-muted-foreground">How invoiced revenue is distributed now</p></div>
				<CircleDollarSign className="size-4 text-muted-foreground" />
			</div>
			<div className="mt-6 flex items-end justify-between gap-4"><div><p className="text-3xl font-semibold tabular-nums">{collectionRate}%</p><p className="text-xs text-muted-foreground">collection rate</p></div><p className="text-sm tabular-nums text-muted-foreground">{currencyFormatter.format(invoiced)} invoiced</p></div>
			<div className="mt-4 flex h-3 overflow-hidden rounded-full bg-muted" aria-label={`${collectionRate}% of invoiced revenue collected`}>
				{segments.map((segment) => <span key={segment.label} className={segment.color} style={{ width: `${percentage(segment.value, invoiced)}%` }} />)}
			</div>
			<div className="mt-4 grid grid-cols-3 gap-3">
				{segments.map((segment) => <div key={segment.label}><p className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className={`size-2 rounded-full ${segment.color}`} />{segment.label}</p><p className="mt-1 text-sm font-semibold tabular-nums">{currencyFormatter.format(segment.value)}</p></div>)}
			</div>
		</div>
	);
}

function WorkflowChart({ team }: { team?: TeamPerformanceSnapshot }) {
	const tasks = team?.tasks;
	const bars = [
		{ label: "To do", value: tasks?.todo ?? 0, color: "bg-slate-400" },
		{ label: "Active", value: tasks?.in_progress ?? 0, color: "bg-primary" },
		{ label: "Review", value: tasks?.review ?? 0, color: "bg-amber-500" },
		{ label: "Testing", value: tasks?.testing ?? 0, color: "bg-cyan-500" },
		{ label: "Done", value: tasks?.completed ?? 0, color: "bg-emerald-500" },
	] as const;
	const maximum = Math.max(1, ...bars.map((bar) => bar.value));
	const completionRate = percentage(tasks?.completed ?? 0, tasks?.total ?? 0);

	return (
		<div className="rounded-lg border bg-card p-5">
			<div className="flex items-start justify-between gap-3">
				<div><h2 className="text-sm font-semibold">Workflow distribution</h2><p className="mt-1 text-xs text-muted-foreground">Current work across execution stages</p></div>
				<BarChart3 className="size-4 text-muted-foreground" />
			</div>
			<div className="mt-5 flex h-32 items-end gap-3 border-b border-border px-1" role="img" aria-label="Task counts by workflow stage">
				{bars.map((bar) => (
					<div key={bar.label} className="flex h-full flex-1 flex-col justify-end gap-2 text-center">
						<span className="text-xs font-semibold tabular-nums">{bar.value}</span>
						<div className={`mx-auto w-full max-w-10 rounded-t-sm ${bar.color}`} style={{ height: `${bar.value === 0 ? 0 : Math.max(4, (bar.value / maximum) * 88)}px` }} />
					</div>
				))}
			</div>
			<div className="mt-2 grid grid-cols-5 gap-2 text-center text-[11px] text-muted-foreground">{bars.map((bar) => <span key={bar.label}>{bar.label}</span>)}</div>
			<p className="mt-4 text-xs text-muted-foreground"><span className="font-semibold text-foreground">{completionRate}%</span> of tracked work is complete.</p>
		</div>
	);
}

function percentage(numerator: number, denominator: number) {
	if (denominator <= 0) return 0;
	return Math.max(0, Math.min(100, Math.round((numerator / denominator) * 100)));
}
