import { BriefcaseBusiness, CircleDollarSign, Clock3, FolderKanban } from "lucide-react";
import { StatStrip, StatTile } from "@/shared/ui/data-display/StatTile";

import type { StatTrend as FinancialTrend } from "@/shared/ui/data-display/StatTile";

// Accepts the current backend keys plus executive-friendly aliases used by the dashboard contract.
export interface ExecutiveFinancialSnapshot {
	total_collected?: number;
	pending_receivables?: number;
	active_clients?: number;
	total_projects?: number;
	active_projects?: number;
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
			key: "total_projects",
			label: "Total Projects",
			value: integerFormatter.format(financial?.total_projects ?? financial?.active_projects ?? financial?.active_clients ?? 0),
			trend: financial?.trends?.active_clients,
			icon: FolderKanban,
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
		<StatStrip className="lg:grid-cols-4">
			{stats.map((stat) => (
				<StatTile key={stat.key} label={stat.label} value={stat.value} icon={stat.icon} trend={stat.trend} />
			))}
		</StatStrip>
	);
}

function formatCurrency(value?: number) {
	return compactCurrencyFormatter.format(value ?? 0);
}
