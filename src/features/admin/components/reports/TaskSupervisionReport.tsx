"use client";

import { useState } from "react";
import { AlertCircle, Clock3, Loader2, RefreshCw, UserRoundCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaskSupervisionSummary } from "@/features/dashboard/hooks/useTaskSupervision";

interface DateRange {
	from: string;
	to: string;
}

function toDateInputValue(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

function getDefaultDateRange(): DateRange {
	const to = new Date();
	const from = new Date(to);
	from.setDate(to.getDate() - 29);

	return { from: toDateInputValue(from), to: toDateInputValue(to) };
}

export function TaskSupervisionReport() {
	const [dateRange, setDateRange] = useState(getDefaultDateRange);
	const [appliedDateRange, setAppliedDateRange] = useState(getDefaultDateRange);
	const filters = {
		...(appliedDateRange.from ? { from: appliedDateRange.from } : {}),
		...(appliedDateRange.to ? { to: appliedDateRange.to } : {}),
	};
	const summaryQuery = useTaskSupervisionSummary(filters);
	const summary = summaryQuery.data?.summary;
	const isDateRangeInvalid = Boolean(dateRange.from && dateRange.to && dateRange.from > dateRange.to);
	const isEmpty = summary?.totalHelpRequests === 0 && summary.totalSessions === 0;

	const applyDateRange = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!isDateRangeInvalid) setAppliedDateRange(dateRange);
	};

	return (
		<Card>
			<CardHeader className="gap-3">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<UserRoundCheck className="size-5" />
							Task Supervision
						</CardTitle>
						<CardDescription className="mt-1">Help requests and supervision sessions across managed work.</CardDescription>
					</div>
					<Button type="button" variant="outline" size="sm" onClick={() => summaryQuery.refetch()} disabled={summaryQuery.isFetching}>
						<RefreshCw className={`mr-2 size-4 ${summaryQuery.isFetching ? "animate-spin" : ""}`} />
						Refresh
					</Button>
				</div>
				<form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end" onSubmit={applyDateRange}>
					<div className="grid gap-2">
						<Label htmlFor="supervision-report-from">From</Label>
						<Input
							id="supervision-report-from"
							type="date"
							value={dateRange.from}
							max={dateRange.to || undefined}
							onChange={(event) => setDateRange((current) => ({ ...current, from: event.target.value }))}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="supervision-report-to">To</Label>
						<Input
							id="supervision-report-to"
							type="date"
							value={dateRange.to}
							min={dateRange.from || undefined}
							onChange={(event) => setDateRange((current) => ({ ...current, to: event.target.value }))}
						/>
					</div>
					<Button type="submit" disabled={isDateRangeInvalid || summaryQuery.isFetching}>Apply range</Button>
				</form>
				{isDateRangeInvalid && <p className="text-sm text-destructive">The start date must be on or before the end date.</p>}
			</CardHeader>
			<CardContent className="space-y-4">
				<Alert>
					<Clock3 className="size-4" />
					<AlertDescription>Supervision is tracked separately from work time and does not change work timers or time entries.</AlertDescription>
				</Alert>

				{summaryQuery.isLoading ? (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{Array.from({ length: 8 }).map((_, index) => <Skeleton className="h-20" key={index} />)}
					</div>
				) : summaryQuery.isError ? (
					<Alert variant="destructive">
						<AlertCircle className="size-4" />
						<AlertDescription className="flex flex-wrap items-center gap-3">
							<span>Unable to load task supervision activity{summaryQuery.error.message ? `: ${summaryQuery.error.message}` : "."}</span>
							<Button type="button" variant="outline" size="sm" onClick={() => summaryQuery.refetch()} disabled={summaryQuery.isFetching}>
								{summaryQuery.isFetching && <Loader2 className="mr-2 size-4 animate-spin" />}
								Retry
							</Button>
						</AlertDescription>
					</Alert>
				) : !summary ? (
					<Alert>
						<AlertDescription className="flex flex-wrap items-center gap-3">
							<span>No supervision summary is available for this range.</span>
							<Button type="button" variant="outline" size="sm" onClick={() => summaryQuery.refetch()}>Retry</Button>
						</AlertDescription>
					</Alert>
				) : (
					<>
						{isEmpty && <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">No supervisor help requests or sessions were recorded in this date range.</div>}
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
							<SupervisionMetric label="Total help requests" value={summary.totalHelpRequests} />
							<SupervisionMetric label="Open requests" value={summary.openHelpRequests} />
							<SupervisionMetric label="Acknowledged requests" value={summary.acknowledgedHelpRequests} />
							<SupervisionMetric label="Resolved requests" value={summary.resolvedHelpRequests} />
							<SupervisionMetric label="Cancelled requests" value={summary.cancelledHelpRequests} />
							<SupervisionMetric label="Total sessions" value={summary.totalSessions} />
							<SupervisionMetric label="Active sessions" value={summary.activeSessions} />
							<SupervisionMetric label="Total duration" value={`${summary.totalDurationMinutes} minutes`} />
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}

function SupervisionMetric({ label, value }: { label: string; value: number | string }) {
	return (
		<div className="rounded-lg border bg-muted/30 p-3">
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="mt-1 text-xl font-semibold">{value}</p>
		</div>
	);
}
