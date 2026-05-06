"use client";

import { Star } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/shared/ui/badge";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { cn } from "@/shared/lib/utils";
import { useMyPoints } from "@/features/hr/model/use-hr-actions";
import type { PointTransaction } from "@/entities/hr/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatModelType(modelType: string | null): string {
	if (!modelType) return "—";
	return modelType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─────────────────────────────────────────────────────────────────────────────
// Column definitions
// ─────────────────────────────────────────────────────────────────────────────

const columns: Column<PointTransaction>[] = [
	{
		key: "created_at",
		header: "Date",
		render: (tx) => <span className="whitespace-nowrap text-sm text-muted-foreground">{format(new Date(tx.created_at), "dd MMM yyyy, HH:mm")}</span>,
	},
	{
		key: "reason",
		header: "Reason",
		render: (tx) => <span className="text-sm">{tx.reason || "—"}</span>,
	},
	{
		key: "model_type",
		header: "Source",
		render: (tx) => (
			<Badge
				variant="outline"
				className="capitalize text-xs"
			>
				{formatModelType(tx.model_type)}
			</Badge>
		),
	},
	{
		key: "points",
		header: "Points",
		className: "text-right",
		render: (tx) => <span className={cn("text-sm font-semibold tabular-nums", tx.points > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>{tx.points > 0 ? `+${tx.points}` : tx.points}</span>,
	},
];

// ─────────────────────────────────────────────────────────────────────────────
// Widget
// ─────────────────────────────────────────────────────────────────────────────

export function MyPointsWidget() {
	const { data, isLoading, error } = useMyPoints();

	const transactions = data?.data ?? [];
	const total = transactions.reduce((sum, tx) => sum + tx.points, 0);

	return (
		<section className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">My Points</h1>
				<p className="text-sm text-muted-foreground">Your gamification point history — earned through tasks, attendance, and code reviews.</p>
			</div>

			{/* ── Balance summary card ── */}
			{!isLoading && !error && (
				<div className="flex w-fit items-center gap-3 rounded-lg border bg-card px-5 py-4 shadow-sm">
					<Star className="h-5 w-5 text-yellow-500" />
					<div>
						<p className="text-xs uppercase tracking-wide text-muted-foreground">Total Balance</p>
						<p className={cn("text-2xl font-bold tabular-nums", total >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>{total >= 0 ? `+${total}` : total} pts</p>
					</div>
				</div>
			)}

			<DataTable<PointTransaction>
				title="Transaction History"
				titleBadge={data ? String(transactions.length) : undefined}
				columns={columns}
				data={transactions}
				keyExtractor={(tx) => tx.id}
				isLoading={isLoading}
				error={error}
				emptyState={{
					icon: Star,
					title: "No point transactions yet",
					description: "Complete tasks and maintain good attendance to earn points.",
				}}
			/>
		</section>
	);
}
