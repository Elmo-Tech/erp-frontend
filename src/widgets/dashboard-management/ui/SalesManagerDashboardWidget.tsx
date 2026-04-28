"use client";

import { AlertTriangle, BarChart3, Target, UsersRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { useSalesManagerSummary } from "../model/dashboard.api";

export function SalesManagerDashboardWidget() {
	const summaryQuery = useSalesManagerSummary();
	const summary = summaryQuery.data;
	const metrics = summary?.metrics?.length
		? summary.metrics
		: [
				{ label: "Pipeline value", value: 0 },
				{ label: "Team quota", value: 0 },
				{ label: "Open bottlenecks", value: summary?.bottlenecks?.length ?? 0 },
				{ label: "Alerts", value: summary?.alerts?.length ?? 0 },
			];

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Sales manager</h1>
				<p className="text-sm text-muted-foreground">Pipeline health, team performance, and exceptions.</p>
			</div>

			<div className="grid gap-3 md:grid-cols-4">
				{summaryQuery.isLoading ? (
					<>
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-24 w-full" />
					</>
				) : (
					metrics.slice(0, 4).map((metric, index) => <Metric key={`${metric.label}-${index}`} label={metric.label} value={metric.value} index={index} />)
				)}
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<Panel title="Team performance" items={(summary?.teamPerformance ?? []).map((item) => ({ id: item.id, title: item.name, value: `${item.value}${item.label ? ` ${item.label}` : ""}` }))} />
				<Panel title="Bottlenecks" items={summary?.bottlenecks ?? []} />
				<Panel title="Alerts" items={summary?.alerts ?? []} />
			</div>
		</div>
	);
}

function Metric({ label, value, index }: { label: string; value: string | number; index: number }) {
	const icons = [BarChart3, Target, AlertTriangle, UsersRound];
	const Icon = icons[index % icons.length];

	return (
		<Card>
			<CardContent className="flex items-center justify-between p-4">
				<div>
					<p className="text-xs text-muted-foreground">{label}</p>
					<p className="text-xl font-semibold tabular-nums">{value}</p>
				</div>
				<Icon className="size-4 text-muted-foreground" />
			</CardContent>
		</Card>
	);
}

function Panel({ title, items }: { title: string; items: Array<{ id: string | number; title: string; description?: string; value?: string }> }) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-sm">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="divide-y rounded-md border">
					{items.length ? (
						items.slice(0, 8).map((item) => (
							<div key={item.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
								<div className="min-w-0">
									<p className="truncate font-medium">{item.title}</p>
									{item.description && <p className="truncate text-xs text-muted-foreground">{item.description}</p>}
								</div>
								{item.value && <span className="text-xs font-medium text-muted-foreground">{item.value}</span>}
							</div>
						))
					) : (
						<p className="px-3 py-6 text-center text-sm text-muted-foreground">No items.</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
