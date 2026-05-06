"use client";

import { toast } from "sonner";
import { format } from "date-fns";
import { Clock, LogOut, CheckCircle2, AlertCircle, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { cn } from "@/shared/lib/utils";
import { useMyAttendance, useTodayAttendance, useCheckOutMutation } from "@/features/hr/model/use-hr-actions";
import type { AttendanceRecord, AttendanceStatus } from "@/entities/hr/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatTime(iso: string | null): string {
	if (!iso) return "—";
	return format(new Date(iso), "hh:mm a");
}

function formatDate(dateStr: string | null): string {
	if (!dateStr) return "—";
	return format(new Date(dateStr), "dd MMM yyyy");
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
	present: { label: "Present", variant: "default" },
	late: { label: "Late", variant: "secondary" },
	absent: { label: "Absent", variant: "destructive" },
	excused: { label: "Excused", variant: "outline" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Today's attendance hero card
// ─────────────────────────────────────────────────────────────────────────────

function TodayAttendanceCard() {
	const { data: today, isLoading } = useTodayAttendance();
	const checkOut = useCheckOutMutation();

	const handleCheckOut = () => {
		checkOut.mutate(undefined, {
			onSuccess: () => toast.success("Checked out successfully"),
			onError: () => toast.error("Failed to check out. Please try again."),
		});
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Today's Attendance</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-10 w-36" />
				</CardContent>
			</Card>
		);
	}

	// Not clocked in
	if (!today) {
		return (
			<Card className="border-dashed">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<CalendarDays className="h-4 w-4 text-muted-foreground" />
						Today's Attendance
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-3 text-muted-foreground">
						<AlertCircle className="h-5 w-5 shrink-0" />
						<p className="text-sm">Not clocked in yet for today.</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Clocked in — awaiting check-out
	if (today.isClockedIn) {
		return (
			<Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
						Today's Attendance
					</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-col gap-1">
						<p className="text-sm text-muted-foreground">Clocked in at</p>
						<p className="text-2xl font-bold tabular-nums text-green-700 dark:text-green-300">{formatTime(today.clockIn)}</p>
						{today.isLate && (
							<Badge
								variant="secondary"
								className="w-fit text-xs"
							>
								Late by {today.lateMinutes} min
							</Badge>
						)}
					</div>
					<Button
						size="lg"
						variant="destructive"
						className="shrink-0 gap-2"
						onClick={handleCheckOut}
						disabled={checkOut.isPending}
					>
						<LogOut className="h-4 w-4" />
						{checkOut.isPending ? "Checking out…" : "Check Out"}
					</Button>
				</CardContent>
			</Card>
		);
	}

	// Fully checked out
	return (
		<Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
					Today's Attendance
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-wrap gap-6">
				<div>
					<p className="text-xs uppercase tracking-wide text-muted-foreground">Clock In</p>
					<p className="text-lg font-semibold tabular-nums">{formatTime(today.clockIn)}</p>
				</div>
				<div>
					<p className="text-xs uppercase tracking-wide text-muted-foreground">Clock Out</p>
					<p className="text-lg font-semibold tabular-nums">{formatTime(today.clockOut)}</p>
				</div>
				<div>
					<p className="text-xs uppercase tracking-wide text-muted-foreground">Total Worked</p>
					<p className="text-lg font-semibold tabular-nums">{today.totalWorkedMinutes != null ? `${Math.floor(today.totalWorkedMinutes / 60)}h ${today.totalWorkedMinutes % 60}m` : "—"}</p>
				</div>
				<div className="flex items-end">
					<Badge
						variant={STATUS_CONFIG[today.status]?.variant ?? "outline"}
						className="capitalize"
					>
						{STATUS_CONFIG[today.status]?.label ?? today.status}
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Historical table columns
// ─────────────────────────────────────────────────────────────────────────────

const columns: Column<AttendanceRecord>[] = [
	{
		key: "date",
		header: "Date",
		render: (rec) => <span className="whitespace-nowrap text-sm">{formatDate(rec.date)}</span>,
	},
	{
		key: "clockIn",
		header: "Clock In",
		render: (rec) => <span className="text-sm tabular-nums">{formatTime(rec.clockIn)}</span>,
	},
	{
		key: "clockOut",
		header: "Clock Out",
		render: (rec) => <span className="text-sm tabular-nums">{formatTime(rec.clockOut)}</span>,
	},
	{
		key: "status",
		header: "Status",
		render: (rec) => {
			const cfg = STATUS_CONFIG[rec.status] ?? {
				label: rec.status,
				variant: "outline" as const,
			};
			return (
				<Badge
					variant={cfg.variant}
					className="capitalize text-xs"
				>
					{cfg.label}
				</Badge>
			);
		},
	},
	{
		key: "worked",
		header: "Worked",
		className: "text-right",
		render: (rec) => <span className={cn("text-sm tabular-nums", !rec.totalWorkedMinutes && "text-muted-foreground")}>{rec.totalWorkedMinutes != null ? `${Math.floor(rec.totalWorkedMinutes / 60)}h ${rec.totalWorkedMinutes % 60}m` : "—"}</span>,
	},
];

// ─────────────────────────────────────────────────────────────────────────────
// Widget
// ─────────────────────────────────────────────────────────────────────────────

export function MyAttendanceWidget() {
	const { data, isLoading, error } = useMyAttendance();
	const records = data?.data ?? [];

	return (
		<section className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">My Attendance</h1>
				<p className="text-sm text-muted-foreground">Track your daily clock-in/out records and attendance status.</p>
			</div>

			<TodayAttendanceCard />

			<DataTable<AttendanceRecord>
				title="Attendance History"
				titleBadge={data ? String(records.length) : undefined}
				columns={columns}
				data={records}
				keyExtractor={(rec) => rec.id}
				isLoading={isLoading}
				error={error}
				emptyState={{
					icon: CalendarDays,
					title: "No attendance records",
					description: "Your attendance history will appear here once records are available.",
				}}
			/>
		</section>
	);
}
