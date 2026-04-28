"use client";

import Link from "next/link";
import { BarChart3, CalendarDays, ChevronRight, ClipboardCheck } from "lucide-react";
import type { EvaluationPeriod, PerformanceEvaluation, PeriodBonusSummary } from "@/entities/performance/model/types";
import { useEvaluationPeriods, useEvaluations, usePeriodBonuses } from "@/features/performance/model/use-performance-actions";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { Skeleton } from "@/shared/ui/skeleton";

interface PerformanceEvaluationWidgetProps {
	periodId?: number;
}

export function PerformanceEvaluationWidget({ periodId }: PerformanceEvaluationWidgetProps) {
	if (periodId) {
		return <PeriodBonusDetail periodId={periodId} />;
	}

	return <PerformanceOverview />;
}

function PerformanceOverview() {
	const evaluationsQuery = useEvaluations(20);
	const periodsQuery = useEvaluationPeriods(12);
	const evaluations = evaluationsQuery.data?.evaluations ?? [];
	const periods = periodsQuery.data?.periods ?? [];

	const columns: Column<PerformanceEvaluation>[] = [
		{
			key: "employee",
			header: "Employee",
			render: (evaluation) => (
				<div className="min-w-0">
					<p className="truncate text-sm font-medium">{evaluation.userName}</p>
					<p className="text-xs text-muted-foreground">#{evaluation.evaluationId}</p>
				</div>
			),
		},
		{
			key: "score",
			header: "Score",
			render: (evaluation) => <span className="text-sm tabular-nums">{evaluation.totalScore.toFixed(1)}</span>,
		},
		{
			key: "status",
			header: "Status",
			render: (evaluation) => <Badge variant="secondary">{evaluation.status}</Badge>,
		},
		{
			key: "period",
			header: "Period",
			className: "hidden md:table-cell",
			render: (evaluation) => <span className="text-xs text-muted-foreground">{evaluation.periodName ?? "Current"}</span>,
		},
	];

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Performance</h1>
				<p className="text-sm text-muted-foreground">Evaluation periods, scoring, and bonus review.</p>
			</div>

			<div className="grid gap-3 md:grid-cols-3">
				<Metric title="Evaluations" value={evaluationsQuery.data?.pagination?.total ?? evaluations.length} icon={ClipboardCheck} />
				<Metric title="Periods" value={periodsQuery.data?.pagination?.total ?? periods.length} icon={CalendarDays} />
				<Metric title="Avg score" value={averageScore(evaluations)} icon={BarChart3} />
			</div>

			<div className="grid gap-4 xl:grid-cols-[320px_1fr]">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm">Recent periods</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{periodsQuery.isLoading ? (
							<PeriodSkeleton />
						) : (
							periods.map((period) => <PeriodRow key={period.periodId} period={period} />)
						)}
					</CardContent>
				</Card>

				<DataTable
					title="Evaluations"
					columns={columns}
					data={evaluations}
					keyExtractor={(evaluation) => evaluation.evaluationId}
					isLoading={evaluationsQuery.isLoading}
					error={evaluationsQuery.error}
					pagination={evaluationsQuery.data?.pagination}
					emptyState={{ icon: ClipboardCheck, title: "No evaluations", description: "No performance evaluations were found." }}
				/>
			</div>
		</div>
	);
}

function PeriodBonusDetail({ periodId }: { periodId: number }) {
	const bonusesQuery = usePeriodBonuses(periodId);
	const bonuses = bonusesQuery.data?.evaluations ?? [];
	const summary = bonusesQuery.data?.summary;
	const columns: Column<PeriodBonusSummary["evaluations"][number]>[] = [
		{
			key: "employee",
			header: "Employee",
			render: (bonus) => <span className="text-sm font-medium">{bonus.userName}</span>,
		},
		{
			key: "points",
			header: "Points",
			render: (bonus) => <span className="text-sm tabular-nums">{bonus.totalScore.toLocaleString()}</span>,
		},
		{
			key: "tier",
			header: "Tier",
			render: (bonus) => <Badge variant="outline">{bonus.bonusTierLabel}</Badge>,
		},
		{
			key: "bonus",
			header: "Bonus",
			render: (bonus) => <span className="text-sm tabular-nums">{bonus.finalBonusAmount.toLocaleString()}</span>,
		},
	];

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Period bonuses</h1>
				<p className="text-sm text-muted-foreground">Bonus summary for evaluation period #{periodId}.</p>
			</div>

			<div className="grid gap-3 md:grid-cols-3">
				<Metric title="Employees" value={summary?.totalEmployees ?? 0} icon={ClipboardCheck} />
				<Metric title="Total bonus" value={summary?.totalBonusAmount?.toLocaleString() ?? 0} icon={BarChart3} />
				<Metric title="Avg score" value={summary?.averageScore?.toFixed(1) ?? "0.0"} icon={CalendarDays} />
			</div>

			<DataTable
				columns={columns}
				data={bonuses}
				keyExtractor={(bonus) => bonus.userId}
				isLoading={bonusesQuery.isLoading}
				error={bonusesQuery.error}
				emptyState={{ icon: BarChart3, title: "No bonuses", description: "No bonus entries were found for this period." }}
			/>
		</div>
	);
}

function PeriodRow({ period }: { period: EvaluationPeriod }) {
	return (
		<Link href={`/dashboard/performance/periods/${period.periodId}`} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted/50">
			<div className="min-w-0">
				<p className="truncate font-medium">{period.name}</p>
				<p className="text-xs text-muted-foreground">{formatDate(period.startDate)} - {formatDate(period.endDate)}</p>
			</div>
			<div className="flex items-center gap-2">
				<Badge variant="secondary">{period.status}</Badge>
				<ChevronRight className="size-4 text-muted-foreground" />
			</div>
		</Link>
	);
}

function Metric({ title, value, icon: Icon }: { title: string; value: string | number; icon: typeof BarChart3 }) {
	return (
		<Card>
			<CardContent className="flex items-center justify-between p-4">
				<div>
					<p className="text-xs text-muted-foreground">{title}</p>
					<p className="text-xl font-semibold tabular-nums">{value}</p>
				</div>
				<Icon className="size-4 text-muted-foreground" />
			</CardContent>
		</Card>
	);
}

function PeriodSkeleton() {
	return (
		<>
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-12 w-full" />
		</>
	);
}

function averageScore(evaluations: PerformanceEvaluation[]) {
	if (!evaluations.length) {
		return "0.0";
	}

	return (evaluations.reduce((total, evaluation) => total + evaluation.totalScore, 0) / evaluations.length).toFixed(1);
}

function formatDate(value: string) {
	return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
