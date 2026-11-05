import type { ReactNode } from "react";
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

export function ChartCard({ title, description, aside, children, className }: { title: string; description?: string; aside?: ReactNode; children: ReactNode; className?: string }) {
	return (
		<div className={cn("flex flex-col rounded-xl border border-border bg-card shadow-[var(--shadow-card)]", className)}>
			<div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
				<div className="min-w-0">
					<h2 className="text-[0.9375rem] font-semibold tracking-tight">{title}</h2>
					{description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
				</div>
				{aside}
			</div>
			<div className="flex-1 p-5">{children}</div>
		</div>
	);
}

/** Hover/focus tooltip for a single mark. */
function MarkTooltip({ children }: { children: ReactNode }) {
	return (
		<span
			role="tooltip"
			className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-md bg-navy px-2.5 py-1.5 text-xs whitespace-nowrap text-white opacity-0 shadow-md transition-opacity duration-100 group-hover/mark:opacity-100 group-focus-visible/mark:opacity-100 dark:border dark:border-border dark:bg-surface-menu dark:text-foreground"
		>
			{children}
		</span>
	);
}

function CashPositionChart({ financial }: { financial?: ExecutiveFinancialSnapshot }) {
	const invoiced = financial?.invoiced_total ?? 0;
	const collected = Math.min(financial?.paid_total ?? 0, invoiced);
	const overdue = Math.min(financial?.overdue_total ?? 0, Math.max(0, invoiced - collected));
	const pending = Math.max(0, invoiced - collected - overdue);
	const collectionRate = percentage(collected, invoiced);
	const segments = [
		{ label: "Collected", value: collected, color: "bg-success" },
		{ label: "Pending", value: pending, color: "bg-chart-1" },
		{ label: "Overdue", value: overdue, color: "bg-destructive" },
	] as const;
	const visible = segments.filter((segment) => segment.value > 0);

	return (
		<ChartCard title="Cash position" description="How invoiced revenue is distributed now">
			<div className="flex items-end justify-between gap-4">
				<div>
					<p className="text-[1.75rem] leading-none font-semibold tracking-[-0.02em] tabular-nums">{collectionRate}%</p>
					<p className="mt-1.5 text-xs text-muted-foreground">collection rate</p>
				</div>
				<p className="text-sm text-muted-foreground">
					<span className="font-medium text-foreground tabular-nums">{currencyFormatter.format(invoiced)}</span> invoiced
				</p>
			</div>

			<div className="mt-5 flex h-3 gap-0.5 rounded-sm bg-chart-track" role="img" aria-label={`${collectionRate}% of ${currencyFormatter.format(invoiced)} invoiced revenue collected`}>
				{visible.map((segment) => (
					<span
						key={segment.label}
						tabIndex={0}
						className={cn("group/mark relative h-full outline-none first:rounded-l-sm last:rounded-r-sm focus-visible:ring-2 focus-visible:ring-ring", segment.color)}
						style={{ width: `${(segment.value / invoiced) * 100}%` }}
					>
						<MarkTooltip>
							{segment.label}: <span className="font-semibold tabular-nums">{currencyFormatter.format(segment.value)}</span> · {percentage(segment.value, invoiced)}%
						</MarkTooltip>
					</span>
				))}
			</div>

			<dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
				{segments.map((segment) => (
					<div key={segment.label} className="min-w-0">
						<dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<span className={cn("size-2 shrink-0 rounded-[2px]", segment.color)} aria-hidden="true" />
							{segment.label}
						</dt>
						<dd className="mt-1 truncate text-sm font-semibold tabular-nums">{currencyFormatter.format(segment.value)}</dd>
					</div>
				))}
			</dl>
		</ChartCard>
	);
}

function WorkflowChart({ team }: { team?: TeamPerformanceSnapshot }) {
	const tasks = team?.tasks;
	const bars = [
		{ label: "To do", value: tasks?.todo ?? 0 },
		{ label: "Active", value: tasks?.in_progress ?? 0 },
		{ label: "Review", value: tasks?.review ?? 0 },
		{ label: "Testing", value: tasks?.testing ?? 0 },
		{ label: "Done", value: tasks?.completed ?? 0 },
	] as const;
	const total = bars.reduce((sum, bar) => sum + bar.value, 0);
	const maximum = Math.max(1, ...bars.map((bar) => bar.value));
	const completionRate = percentage(tasks?.completed ?? 0, tasks?.total ?? 0);

	return (
		<ChartCard
			title="Workflow distribution"
			description="Current tasks by execution stage"
			aside={
				<p className="shrink-0 text-right text-xs text-muted-foreground">
					<span className="block text-sm font-semibold text-foreground tabular-nums">{completionRate}%</span>
					complete
				</p>
			}
		>
			<ul className="space-y-3" aria-label="Task counts by workflow stage">
				{bars.map((bar) => (
					<li key={bar.label} className="grid grid-cols-[4.5rem_minmax(0,1fr)_2.5rem] items-center gap-3">
						<span className="text-xs text-muted-foreground">{bar.label}</span>
						<span className="relative h-2.5 rounded-sm bg-chart-track">
							{bar.value > 0 && (
								<span
									tabIndex={0}
									className="group/mark absolute inset-y-0 left-0 rounded-sm bg-chart-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
									style={{ width: `${Math.max(2, (bar.value / maximum) * 100)}%` }}
								>
									<MarkTooltip>
										{bar.label}: <span className="font-semibold tabular-nums">{bar.value}</span> · {percentage(bar.value, total)}% of tasks
									</MarkTooltip>
								</span>
							)}
						</span>
						<span className="text-right text-xs font-semibold tabular-nums">{bar.value}</span>
					</li>
				))}
			</ul>
		</ChartCard>
	);
}

function percentage(numerator: number, denominator: number) {
	if (denominator <= 0) return 0;
	return Math.max(0, Math.min(100, Math.round((numerator / denominator) * 100)));
}
