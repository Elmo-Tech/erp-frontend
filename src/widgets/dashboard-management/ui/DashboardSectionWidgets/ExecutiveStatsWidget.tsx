import { BriefcaseBusiness, CircleDollarSign, Clock3, TrendingDown, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

type TrendDirection = "up" | "down" | "neutral";

interface FinancialTrend {
	value: string;
	direction?: TrendDirection;
}

// Accepts the current backend keys plus executive-friendly aliases used by the dashboard contract.
export interface ExecutiveFinancialSnapshot {
	total_collected?: number;
	pending_receivables?: number;
	active_clients?: number;
	pipeline_value?: number;
	invoiced_total?: number;
	paid_total?: number;
	overdue_total?: number;
	project_budget_total?: number;
	trends?: {
		total_collected?: FinancialTrend;
		pending_receivables?: FinancialTrend;
		active_clients?: FinancialTrend;
		pipeline_value?: FinancialTrend;
	};
}

interface ExecutiveStatsWidgetProps {
	financial?: ExecutiveFinancialSnapshot;
}

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	notation: "compact",
	maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
	maximumFractionDigits: 0,
});

export function ExecutiveStatsWidget({ financial }: ExecutiveStatsWidgetProps) {
	const pendingReceivables = financial?.pending_receivables ?? Math.max((financial?.invoiced_total ?? 0) - (financial?.paid_total ?? 0), financial?.overdue_total ?? 0);
	const stats = [
		{
			key: "total_collected",
			label: "Total Collected",
			value: formatCurrency(financial?.total_collected ?? financial?.paid_total),
			trend: financial?.trends?.total_collected,
			icon: CircleDollarSign,
		},
		{
			key: "pending_receivables",
			label: "Pending Receivables",
			value: formatCurrency(pendingReceivables),
			trend: financial?.trends?.pending_receivables,
			icon: Clock3,
		},
		{
			key: "active_clients",
			label: "Active Clients",
			value: integerFormatter.format(financial?.active_clients ?? 0),
			trend: financial?.trends?.active_clients,
			icon: Users,
		},
		{
			key: "pipeline_value",
			label: "Pipeline Value",
			value: formatCurrency(financial?.pipeline_value ?? financial?.project_budget_total),
			trend: financial?.trends?.pipeline_value,
			icon: BriefcaseBusiness,
		},
	] as const;

	return (
		<section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
			{stats.map((stat) => {
				const Icon = stat.icon;

				return (
					<Card
						key={stat.key}
						className="rounded-md border-border bg-card/60 backdrop-blur-md py-0"
					>
						<CardContent className="p-4">
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<p className="truncate text-xs font-medium text-muted-foreground">{stat.label}</p>
									<p className="mt-2 truncate text-2xl font-semibold tracking-tight tabular-nums text-foreground">{stat.value}</p>
								</div>
								<div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
									<Icon className="size-4" />
								</div>
							</div>

							<TrendLine trend={stat.trend} />
						</CardContent>
					</Card>
				);
			})}
		</section>
	);
}

function TrendLine({ trend }: { trend?: FinancialTrend }) {
	if (!trend) {
		return <p className="mt-3 text-xs text-muted-foreground">Updated live</p>;
	}

	const isPositive = trend.direction === "up";
	const isNegative = trend.direction === "down";
	const TrendIcon = isNegative ? TrendingDown : TrendingUp;

	return (
		<div className={cn("mt-3 flex items-center gap-1 text-xs", isPositive ? "text-emerald-600 dark:text-emerald-400" : isNegative ? "text-red-600 dark:text-red-400" : "text-muted-foreground")}>
			{trend.direction && trend.direction !== "neutral" ? <TrendIcon className="size-3" /> : null}
			<span>{trend.value}</span>
		</div>
	);
}

function formatCurrency(value?: number) {
	return compactCurrencyFormatter.format(value ?? 0);
}
