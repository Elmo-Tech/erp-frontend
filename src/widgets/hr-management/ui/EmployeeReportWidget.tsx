"use client";

/**
 * EmployeeReportWidget — Employee 360 Performance Report
 *
 * A high-density, print-friendly report aggregating:
 *   • Summary KPI cards (hours, points, late days, net salary)
 *   • Point ledger (detailed transaction history)
 *   • Attendance log (daily clock-in/out, worked hours, late minutes)
 *   • Deliverables & QA (daily submission status + QA notes)
 *   • Financial breakdown (base + bonuses − deductions = net)
 *
 * Layout: controlled by month/year picker in the header.
 * Print: @media print styles collapse the picker and show clean tables.
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { addDays, endOfMonth, endOfWeek, format as formatDate } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Activity, ArrowLeft, Printer, Clock, Star, AlertTriangle, DollarSign, CheckCircle2, XCircle, TrendingUp, TrendingDown, CalendarDays, CalendarRange, Pencil, PlusCircle, ShieldAlert, Target } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormDatePicker } from "@/shared/ui/forms/FormDatePicker";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { Separator } from "@/shared/ui/separator";
import { Progress } from "@/shared/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { useCreatePointAdjustment, useEmployeeReport } from "@/features/hr/model/use-hr-actions";
import { hrAdminKeys } from "@/entities/hr/model/query-keys";
import { useEmployeePersonalTasks, useUpdatePersonalTask, useUpdatePersonalTimeEntry, type PersonalTask, type PersonalTimeEntry, type PersonalTaskStatus } from "@/features/personal-tasks/api/personal-tasks.api";
import type { AttendanceStatus, EmployeeReport, ReportAttendanceDay, ReportDeliverableDay, ReportPointEntry } from "@/entities/hr/model/types";
import { cn } from "@/shared/lib/utils";
import { TaskPriority, TaskPriorityLabels } from "@/shared/lib/statusHelpers";
import { useEmployeePermissions, usePointPermissions } from "@/entities/user/model/permissions";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MONTHS = [
	{ value: "1", label: "January" },
	{ value: "2", label: "February" },
	{ value: "3", label: "March" },
	{ value: "4", label: "April" },
	{ value: "5", label: "May" },
	{ value: "6", label: "June" },
	{ value: "7", label: "July" },
	{ value: "8", label: "August" },
	{ value: "9", label: "September" },
	{ value: "10", label: "October" },
	{ value: "11", label: "November" },
	{ value: "12", label: "December" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 4 }, (_, i) => {
	const y = CURRENT_YEAR - i;
	return { value: String(y), label: String(y) };
});

const ATTENDANCE_STATUS_CONFIG: Record<AttendanceStatus, { label: string; className: string }> = {
	present: { label: "Present", className: "text-green-600" },
	late: { label: "Late", className: "text-amber-600" },
	absent: { label: "Absent", className: "text-destructive" },
	excused: { label: "Excused", className: "text-muted-foreground" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmt(n: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	}).format(n);
}

function fmtHours(h: number): string {
	const hrs = Math.floor(h);
	const mins = Math.round((h - hrs) * 60);
	return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function fmtMinutes(minutes: number | null | undefined): string {
	if (minutes == null) return "—";
	const hrs = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

function toDateTimeLocal(value: string | null | undefined): string {
	if (!value) return "";
	const date = new Date(value);
	const pad = (part: number) => String(part).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface KpiCellProps {
	icon: React.ElementType;
	label: string;
	value: string;
	sub?: string;
	trend?: "positive" | "negative" | "neutral";
}

function KpiCell({ icon: Icon, label, value, sub, trend = "neutral" }: KpiCellProps) {
	return (
		<div className="flex min-w-0 flex-col gap-2 px-4 py-3">
			<div className="flex items-center justify-between">
				<span className="text-xs font-medium text-muted-foreground">{label}</span>
				<Icon className={cn("h-4 w-4", trend === "positive" && "text-green-500", trend === "negative" && "text-destructive", trend === "neutral" && "text-muted-foreground")} />
			</div>
			<p className={cn("truncate text-2xl font-semibold tabular-nums", trend === "positive" && "text-green-600", trend === "negative" && "text-destructive")}>{value}</p>
			{sub && <p className="text-xs text-muted-foreground">{sub}</p>}
		</div>
	);
}

function PerformanceOverview({ report }: { report: EmployeeReport }) {
	const expectedMinutes = report.attendanceDays.reduce((total, day) => total + day.expectedWorkedMinutes, 0);
	const actualMinutes = report.attendanceDays.reduce((total, day) => total + day.actualWorkedMinutes, 0);
	const trackedAttendanceDays = report.summary.presentDays + report.summary.absentDays;
	const totalTasks = report.deliverableDays.reduce((total, day) => total + day.taskCount, 0);
	const completedTasks = report.deliverableDays.reduce((total, day) => total + day.completedTaskCount, 0);
	const metrics = [
		{ label: "Attendance rate", value: percentage(report.summary.presentDays, trackedAttendanceDays), detail: `${report.summary.presentDays} of ${trackedAttendanceDays} tracked days` },
		{ label: "Punctuality", value: percentage(report.summary.presentDays - report.summary.lateDays, report.summary.presentDays), detail: `${report.summary.lateDays} late days` },
		{ label: "Work-hour coverage", value: percentage(actualMinutes, expectedMinutes), detail: `${fmtMinutes(actualMinutes)} of ${fmtMinutes(expectedMinutes)}` },
		{ label: "Task completion", value: percentage(completedTasks, totalTasks), detail: `${completedTasks} of ${totalTasks} due tasks` },
	];
	const graceExhausted = report.employee.graceDaysRemaining === 0;

	return (
		<div className="grid overflow-hidden rounded-xl border bg-card print-avoid-break lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.7fr)]">
			<div className="p-5">
				<div className="mb-5 flex items-center gap-2"><Activity className="size-4 text-primary" /><h2 className="text-sm font-semibold">Performance overview</h2></div>
				<div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
					{metrics.map((metric) => <ProgressMetric key={metric.label} {...metric} />)}
				</div>
			</div>
			<div className={cn("border-t p-5 lg:border-l lg:border-t-0", graceExhausted ? "bg-destructive/5" : "bg-muted/25")}>
				<div className="flex items-start gap-3">
					<div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", graceExhausted ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
						{graceExhausted ? <ShieldAlert className="size-4" /> : <Target className="size-4" />}
					</div>
					<div>
						<p className="text-sm font-semibold">{graceExhausted ? "Grace allowance exhausted" : `${report.employee.graceDaysRemaining} grace days remaining`}</p>
						<p className="mt-1 text-xs leading-5 text-muted-foreground">Used {report.employee.graceDaysUsed} of {report.employee.graceDaysAllowed} days in the current allowance cycle.</p>
					</div>
				</div>
				<div className="mt-5 flex gap-2" aria-label={`${report.employee.graceDaysUsed} grace days used out of ${report.employee.graceDaysAllowed}`}>
					{Array.from({ length: report.employee.graceDaysAllowed }, (_, index) => <span key={index} className={cn("h-2 flex-1 rounded-full", index < report.employee.graceDaysUsed ? (graceExhausted ? "bg-destructive" : "bg-primary") : "bg-border")} />)}
				</div>
			</div>
		</div>
	);
}

function ProgressMetric({ label, value, detail }: { label: string; value: number; detail: string }) {
	return (
		<div>
			<div className="flex items-baseline justify-between gap-3"><p className="text-sm font-medium">{label}</p><p className="text-sm font-semibold tabular-nums">{value}%</p></div>
			<Progress value={value} className="mt-2 h-1.5" />
			<p className="mt-1.5 text-xs text-muted-foreground">{detail}</p>
		</div>
	);
}

interface WeeklyHours {
	label: string;
	range: string;
	presenceMinutes: number;
	trackedMinutes: number;
	untrackedMinutes: number;
	expectedMinutes: number;
}

function WorkHoursBreakdown({ report }: { report: EmployeeReport }) {
	const weeks = monthlyWeekHours(report);
	const totalPresenceMinutes = weeks.reduce((total, week) => total + week.presenceMinutes, 0);
	const totalTrackedMinutes = weeks.reduce((total, week) => total + week.trackedMinutes, 0);
	const totalUntrackedMinutes = weeks.reduce((total, week) => total + week.untrackedMinutes, 0);
	const totalExpectedMinutes = weeks.reduce((total, week) => total + week.expectedMinutes, 0);

	return (
		<section className="overflow-hidden rounded-xl border bg-card print-avoid-break">
			<div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
				<div className="border-b bg-muted/20 p-5 lg:border-b-0 lg:border-r">
					<div className="flex items-center gap-2 text-sm font-semibold"><Clock className="size-4 text-primary" />Monthly attendance total</div>
					<p className="mt-5 text-3xl font-semibold tabular-nums">{fmtMinutes(totalPresenceMinutes)}</p>
					<p className="mt-1 text-xs text-muted-foreground">of {fmtMinutes(totalExpectedMinutes)} expected in {report.period.label}</p>
					<div className="mt-4 flex items-center justify-between text-xs"><span className="text-muted-foreground">Monthly coverage</span><span className="font-semibold tabular-nums">{percentage(totalPresenceMinutes, totalExpectedMinutes)}%</span></div>
					<Progress value={percentage(totalPresenceMinutes, totalExpectedMinutes)} className="mt-2 h-1.5" />
					<div className="mt-5 grid grid-cols-2 gap-2 border-t pt-4 text-xs">
						<div><p className="text-muted-foreground">On task timers</p><p className="mt-1 font-semibold tabular-nums">{fmtMinutes(totalTrackedMinutes)}</p></div>
						<div><p className="text-muted-foreground">Not on timers</p><p className="mt-1 font-semibold tabular-nums">{fmtMinutes(totalUntrackedMinutes)}</p></div>
					</div>
				</div>

				<div className="p-5">
					<div className="mb-4 flex items-center gap-2"><CalendarRange className="size-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Hours by week</h2></div>
					<div className="space-y-4">
						{weeks.map((week) => <WeeklyHoursRow key={week.label} week={week} />)}
					</div>
				</div>
			</div>
		</section>
	);
}

function WeeklyHoursRow({ week }: { week: WeeklyHours }) {
	const coverage = percentage(week.presenceMinutes, week.expectedMinutes);

	return (
		<div>
			<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
				<div><p className="text-sm font-medium">{week.label}</p><p className="text-xs text-muted-foreground">{week.range}</p></div>
				<div className="text-left sm:text-right">
					<p className="text-sm tabular-nums"><span className="font-semibold">{fmtMinutes(week.presenceMinutes)}</span><span className="text-muted-foreground"> / {fmtMinutes(week.expectedMinutes)} attendance</span></p>
					<p className="text-xs text-muted-foreground">{fmtMinutes(week.trackedMinutes)} on tasks · {fmtMinutes(week.untrackedMinutes)} not on timers</p>
				</div>
			</div>
			<Progress value={coverage} className="mt-2 h-1.5" />
		</div>
	);
}

function monthlyWeekHours(report: EmployeeReport): WeeklyHours[] {
	const monthStart = new Date(report.period.year, report.period.month - 1, 1);
	const monthEnd = endOfMonth(monthStart);
	const weeks: WeeklyHours[] = [];
	let weekStart = monthStart;

	while (weekStart <= monthEnd) {
		const weekEnd = earlierDate(endOfWeek(weekStart, { weekStartsOn: 1 }), monthEnd);
		weeks.push(buildWeeklyHours(report.attendanceDays, weekStart, weekEnd, weeks.length + 1));
		weekStart = addDays(weekEnd, 1);
	}

	return weeks;
}

function buildWeeklyHours(days: ReportAttendanceDay[], weekStart: Date, weekEnd: Date, weekNumber: number): WeeklyHours {
	const weekDays = days.filter((day) => {
		const date = new Date(`${day.date}T00:00:00`);
		return date >= weekStart && date <= weekEnd;
	});

	return {
		label: `Week ${weekNumber}`,
		range: `${formatDate(weekStart, "MMM d")} – ${formatDate(weekEnd, "MMM d")}`,
		presenceMinutes: weekDays.reduce((total, day) => total + day.actualWorkedMinutes, 0),
		trackedMinutes: weekDays.reduce((total, day) => total + day.trackedWorkMinutes, 0),
		untrackedMinutes: weekDays.reduce((total, day) => total + day.untrackedMinutes, 0),
		expectedMinutes: weekDays.reduce((total, day) => total + day.expectedWorkedMinutes, 0),
	};
}

function earlierDate(left: Date, right: Date) {
	return left <= right ? left : right;
}

function percentage(numerator: number, denominator: number) {
	if (denominator <= 0) return 0;
	return Math.max(0, Math.min(100, Math.round((numerator / denominator) * 100)));
}

// ─────────────────────────────────────────────────────────────────────────────
// Column definitions
// ─────────────────────────────────────────────────────────────────────────────

const pointLedgerColumns: Column<ReportPointEntry>[] = [
	{
		key: "date",
		header: "Date",
		render: (e) => <span className="text-xs tabular-nums text-muted-foreground">{e.date}</span>,
	},
	{
		key: "source",
		header: "Source",
		render: (e) => (
			<Badge
				variant="outline"
				className="text-xs capitalize"
			>
				{e.sourceType ?? "system"}
			</Badge>
		),
	},
	{
		key: "reason",
		header: "Reason",
		render: (e) => <span className="text-sm">{e.reason}</span>,
	},
	{
		key: "points",
		header: "Points",
		className: "text-right",
		render: (e) => <span className={cn("text-sm font-semibold tabular-nums", e.points > 0 ? "text-green-600" : "text-destructive")}>{e.points > 0 ? `+${e.points}` : e.points}</span>,
	},
];

const attendanceColumns: Column<ReportAttendanceDay>[] = [
	{
		key: "day",
		header: "Day",
		render: (d) => <span className="text-xs font-medium tabular-nums">{d.dayLabel}</span>,
	},
	{
		key: "status",
		header: "Status",
		render: (d) => {
			const cfg = ATTENDANCE_STATUS_CONFIG[d.status];
			return <span className={cn("text-xs font-semibold", cfg.className)}>{cfg.label}</span>;
		},
	},
	{
		key: "clockIn",
		header: "Clock In",
		render: (d) => <span className="text-xs tabular-nums text-muted-foreground">{d.clockIn ?? "—"}</span>,
	},
	{
		key: "clockOut",
		header: "Clock Out",
		render: (d) => <span className="text-xs tabular-nums text-muted-foreground">{d.clockOut ?? "—"}</span>,
	},
	{
		key: "worked",
		header: "Attendance",
		className: "text-right",
		render: (d) => <span className="text-xs tabular-nums font-medium">{d.workedHours > 0 ? fmtHours(d.workedHours) : "—"}</span>,
	},
	{
		key: "expected",
		header: "Expected",
		className: "text-right",
		render: (d) => <span className="text-xs tabular-nums text-muted-foreground">{fmtMinutes(d.expectedWorkedMinutes)}</span>,
	},
	{
		key: "stopped",
		header: "Task tracking",
		className: "text-right",
		render: (d) => <div className="text-right text-xs tabular-nums"><p className="font-medium">{fmtMinutes(d.trackedWorkMinutes)}</p><p className="text-muted-foreground">{fmtMinutes(d.untrackedMinutes)} untracked</p></div>,
	},
	{
		key: "late",
		header: "Late",
		className: "text-right",
		render: (d) => <span className={cn("text-xs tabular-nums", d.lateMinutes > 0 ? "text-amber-600 font-semibold" : "text-muted-foreground")}>{d.lateMinutes > 0 ? `${d.lateMinutes}m` : "—"}</span>,
	},
	{
		key: "grace",
		header: "Grace",
		render: (d) =>
			d.usedGraceDay ? (
				<Badge
					variant="secondary"
					className="text-xs"
				>
					Used
				</Badge>
			) : (
				<span className="text-xs text-muted-foreground">—</span>
			),
	},
];

const deliverableColumns: Column<ReportDeliverableDay>[] = [
	{
		key: "date",
		header: "Date",
		render: (d) => <span className="text-xs tabular-nums text-muted-foreground">{d.date}</span>,
	},
	{
		key: "work",
		header: "Work Delivered",
		render: (day) => (
			<div className="min-w-52 space-y-1">
				{day.tasks.slice(0, 3).map((task) => (
					<div key={`${task.source}-${task.title}`} className="flex items-center gap-2 text-xs">
						<span className={cn("size-1.5 shrink-0 rounded-full", task.completed ? "bg-emerald-500" : "bg-amber-500")} />
						<span className="truncate">{task.title}</span>
						{task.projectTitle ? <span className="truncate text-muted-foreground">· {task.projectTitle}</span> : null}
					</div>
				))}
				{day.tasks.length > 3 ? <p className="text-xs text-muted-foreground">+{day.tasks.length - 3} more</p> : null}
			</div>
		),
	},
	{
		key: "submitted",
		header: "Submitted",
		render: (d) => (d.submitted ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-destructive" />),
	},
	{
		key: "tasks",
		header: "Tasks",
		render: (d) => (
			<span className="text-xs tabular-nums">
				<span className={cn("font-semibold", d.completedTaskCount === d.taskCount && d.taskCount > 0 ? "text-green-600" : "text-amber-600")}>{d.completedTaskCount}</span>
				<span className="text-muted-foreground"> / {d.taskCount}</span>
			</span>
		),
	},
	{
		key: "qa",
		header: "QA / PM Notes",
		render: (d) =>
			d.qaIssues.length > 0 ? (
				<ul className="space-y-0.5">
					{d.qaIssues.map((note) => (
						<li
							key={note}
							className="flex items-start gap-1 text-xs text-destructive"
						>
							<AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
							{note}
						</li>
					))}
				</ul>
			) : (
				<span className="text-xs text-green-600 font-medium">No issues</span>
			),
	},
];

// ─────────────────────────────────────────────────────────────────────────────
// Financial Breakdown Table
// ─────────────────────────────────────────────────────────────────────────────

interface FinancialRowProps {
	label: string;
	value: number;
	sign?: "+" | "-" | "=";
	highlight?: boolean;
	muted?: boolean;
}

function FinancialRow({ label, value, sign, highlight, muted }: FinancialRowProps) {
	const isPositive = sign === "+";
	const isNegative = sign === "-";
	const isTotal = sign === "=";

	return (
		<div className={cn("flex items-center justify-between py-2 px-3 rounded-md", highlight && "bg-primary/5 font-semibold", muted && "opacity-60")}>
			<div className="flex items-center gap-2">
				{sign && (
					<span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold", isPositive && "bg-green-100 text-green-700", isNegative && "bg-red-100 text-destructive", isTotal && "bg-primary/10 text-primary")}>
						{sign}
					</span>
				)}
				<span className={cn("text-sm", highlight && "font-semibold")}>{label}</span>
			</div>
			<span className={cn("tabular-nums text-sm", isPositive && "text-green-600 font-semibold", isNegative && "text-destructive font-semibold", isTotal && "text-lg font-bold")}>{fmt(value)}</span>
		</div>
	);
}

const adminTaskSchema = z.object({
	title: z.string().trim().min(1, "Title is required").max(255),
	description: z.string().optional(),
	status: z.enum(["todo", "in_progress", "done"]),
	priority: z.enum(["low", "medium", "high", "urgent"]),
	dueDate: z.string().optional(),
	estimatedMinutes: z.string().optional(),
});

const timeEntrySchema = z.object({
	startTime: z.string().min(1, "Start time is required"),
	endTime: z.string().min(1, "End time is required"),
	note: z.string().optional(),
});

const pointAdjustmentSchema = z.object({
	direction: z.enum(["add", "deduct"]),
	points: z.string().trim().min(1, "Points are required").regex(/^[1-9]\d*$/, "Enter a positive whole number"),
	reason: z.string().trim().min(3, "Reason is required").max(1000),
});

type AdminTaskFormData = z.infer<typeof adminTaskSchema>;
type TimeEntryFormData = z.infer<typeof timeEntrySchema>;
type PointAdjustmentFormData = z.infer<typeof pointAdjustmentSchema>;

const PERSONAL_TASK_STATUS_LABELS: Record<PersonalTaskStatus, string> = {
	todo: "To Do",
	in_progress: "In Progress",
	done: "Done",
};

function AdminPersonalTasksCard({ userId, month, year }: { userId: number; month: number; year: number }) {
	const queryClient = useQueryClient();
	const tasksQuery = useEmployeePersonalTasks(userId);
	const updateTask = useUpdatePersonalTask();
	const updateEntry = useUpdatePersonalTimeEntry();
	const [editingTask, setEditingTask] = useState<PersonalTask | null>(null);
	const [editingEntry, setEditingEntry] = useState<{ task: PersonalTask; entry: PersonalTimeEntry } | null>(null);

	const taskForm = useForm<AdminTaskFormData>({
		resolver: zodResolver(adminTaskSchema),
		defaultValues: {
			title: "",
			description: "",
			status: "todo",
			priority: "medium",
			dueDate: "",
			estimatedMinutes: "",
		},
	});
	const entryForm = useForm<TimeEntryFormData>({
		resolver: zodResolver(timeEntrySchema),
		defaultValues: {
			startTime: "",
			endTime: "",
			note: "",
		},
	});

	const openTaskEditor = (task: PersonalTask) => {
		setEditingTask(task);
		taskForm.reset({
			title: task.title,
			description: task.description ?? "",
			status: task.status,
			priority: task.priority,
			dueDate: task.dueDate ?? "",
			estimatedMinutes: task.estimatedMinutes ? String(task.estimatedMinutes) : "",
		});
	};

	const openEntryEditor = (task: PersonalTask, entry: PersonalTimeEntry) => {
		setEditingEntry({ task, entry });
		entryForm.reset({
			startTime: toDateTimeLocal(entry.startTime),
			endTime: toDateTimeLocal(entry.endTime),
			note: entry.note ?? "",
		});
	};

	const refreshReport = () => {
		queryClient.invalidateQueries({ queryKey: hrAdminKeys.employeeReport(userId, month, year) });
	};

	const submitTask = taskForm.handleSubmit((data) => {
		if (!editingTask) return;

		updateTask.mutate(
			{
				taskId: editingTask.taskId,
				payload: {
					title: data.title,
					description: data.description?.trim() || null,
					status: data.status,
					priority: data.priority,
					dueDate: data.dueDate || null,
					estimatedMinutes: data.estimatedMinutes ? Number(data.estimatedMinutes) : null,
				},
			},
			{
				onSuccess: () => {
					setEditingTask(null);
					refreshReport();
					toast.success("Personal task updated");
				},
				onError: () => toast.error("Failed to update personal task"),
			},
		);
	});

	const submitEntry = entryForm.handleSubmit((data) => {
		if (!editingEntry) return;

		updateEntry.mutate(
			{
				taskId: editingEntry.task.taskId,
				entryId: editingEntry.entry.entryId,
				payload: {
					startTime: new Date(data.startTime).toISOString(),
					endTime: new Date(data.endTime).toISOString(),
					note: data.note?.trim() || null,
				},
			},
			{
				onSuccess: () => {
					setEditingEntry(null);
					refreshReport();
					toast.success("Time log updated");
				},
				onError: () => toast.error("Failed to update time log"),
			},
		);
	});

	const tasks = (tasksQuery.data ?? []).filter((task) => taskFallsInPeriod(task, month, year));

	return (
		<Card className="print-avoid-break">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Clock className="h-4 w-4 text-cyan-600" />
					Personal Tasks &amp; Time Logs
					<Badge variant="outline" className="ml-auto text-xs">
						{tasks.length} tasks
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{tasksQuery.isLoading ? (
					<p className="py-6 text-center text-sm text-muted-foreground">Loading personal tasks...</p>
				) : tasksQuery.error ? (
					<p className="py-6 text-center text-sm text-destructive">Failed to load personal tasks.</p>
				) : tasks.length === 0 ? (
					<p className="py-6 text-center text-sm text-muted-foreground">No personal tasks or time logs in the selected period.</p>
				) : (
					<div className="divide-y rounded-md border">
						{tasks.map((task) => (
							<div key={task.taskId} className="space-y-3 p-3">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
									<div className="min-w-0">
										<p className="truncate text-sm font-medium">{task.title}</p>
										<div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
											<Badge variant={task.status === "done" ? "secondary" : "outline"}>{PERSONAL_TASK_STATUS_LABELS[task.status]}</Badge>
											<Badge variant="outline">{TaskPriorityLabels[task.priority]}</Badge>
											<span>{task.dueDate ?? "No due date"}</span>
											<span>{fmtMinutes(task.totalLoggedMinutes)} logged</span>
										</div>
									</div>
									<Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => openTaskEditor(task)}>
										<Pencil className="h-3.5 w-3.5" />
										Edit Task
									</Button>
								</div>

								{task.timeEntries?.length ? (
									<div className="space-y-2">
										{task.timeEntries.map((entry) => (
											<div key={entry.entryId} className="flex flex-col gap-2 rounded-md bg-muted/40 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between">
												<div className="min-w-0">
													<p className="font-medium tabular-nums">
														{toDateTimeLocal(entry.startTime).replace("T", " ")} - {entry.endTime ? toDateTimeLocal(entry.endTime).replace("T", " ") : "Running"}
													</p>
													<p className="truncate text-muted-foreground">
														{fmtMinutes(entry.durationMinutes)}
														{entry.note ? ` · ${entry.note}` : ""}
													</p>
												</div>
												<Button type="button" variant="ghost" size="sm" className="gap-2" disabled={!entry.endTime} onClick={() => openEntryEditor(task, entry)}>
													<Pencil className="h-3.5 w-3.5" />
													Edit Log
												</Button>
											</div>
										))}
									</div>
								) : (
									<p className="text-xs text-muted-foreground">No time logs for this task.</p>
								)}
							</div>
						))}
					</div>
				)}
			</CardContent>

			<FormDialog open={Boolean(editingTask)} onOpenChange={(open) => !open && setEditingTask(null)} title="Edit Personal Task" submitLabel="Save Task" isLoading={updateTask.isPending} onSubmit={submitTask} size="md">
				<Form {...taskForm}>
					<div className="flex flex-col gap-4">
						<FormInput control={taskForm.control} name="title" label="Task title" />
						<FormTextarea control={taskForm.control} name="description" label="Description" rows={3} />
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<FormSelect
								control={taskForm.control}
								name="status"
								label="Status"
								options={[
									{ value: "todo", label: "To Do" },
									{ value: "in_progress", label: "In Progress" },
									{ value: "done", label: "Done" },
								]}
							/>
							<FormSelect
								control={taskForm.control}
								name="priority"
								label="Priority"
								options={[
									{ value: TaskPriority.LOW, label: TaskPriorityLabels[TaskPriority.LOW] },
									{ value: TaskPriority.MEDIUM, label: TaskPriorityLabels[TaskPriority.MEDIUM] },
									{ value: TaskPriority.HIGH, label: TaskPriorityLabels[TaskPriority.HIGH] },
									{ value: TaskPriority.URGENT, label: TaskPriorityLabels[TaskPriority.URGENT] },
								]}
							/>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<FormDatePicker control={taskForm.control} name="dueDate" label="Due date" />
							<FormInput control={taskForm.control} name="estimatedMinutes" label="Estimated minutes" type="number" min={1} />
						</div>
					</div>
				</Form>
			</FormDialog>

			<FormDialog open={Boolean(editingEntry)} onOpenChange={(open) => !open && setEditingEntry(null)} title="Edit Time Log" submitLabel="Save Log" isLoading={updateEntry.isPending} onSubmit={submitEntry} size="md">
				<Form {...entryForm}>
					<div className="flex flex-col gap-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<FormInput control={entryForm.control} name="startTime" label="Start time" type="datetime-local" />
							<FormInput control={entryForm.control} name="endTime" label="End time" type="datetime-local" />
						</div>
						<FormTextarea control={entryForm.control} name="note" label="Note" rows={3} />
					</div>
				</Form>
			</FormDialog>
		</Card>
	);
}

function taskFallsInPeriod(task: PersonalTask, month: number, year: number) {
	const matchesPeriod = (value: string | null | undefined) => {
		if (!value) return false;
		const date = new Date(value);
		return !Number.isNaN(date.getTime()) && date.getMonth() + 1 === month && date.getFullYear() === year;
	};

	return matchesPeriod(task.dueDate) || matchesPeriod(task.completedAt) || matchesPeriod(task.createdAt) || Boolean(task.timeEntries?.some((entry) => matchesPeriod(entry.startTime)));
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

function ReportSkeleton() {
	return (
		<div className="flex flex-col gap-6 animate-pulse">
			<div className="h-20 rounded-xl bg-muted" />
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<div
						key={i}
						className="h-24 rounded-xl bg-muted"
					/>
				))}
			</div>
			<div className="h-64 rounded-xl bg-muted" />
			<div className="h-64 rounded-xl bg-muted" />
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface EmployeeReportWidgetProps {
	userId: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget
// ─────────────────────────────────────────────────────────────────────────────

export function EmployeeReportWidget({ userId }: EmployeeReportWidgetProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const now = new Date();
	const [month, setMonth] = useState(now.getMonth() + 1);
	const [year, setYear] = useState(now.getFullYear());
	const [pointDialogOpen, setPointDialogOpen] = useState(false);
	const { canAwardPoints, canDeductPoints } = usePointPermissions();
	const { canViewEmployeeSalary } = useEmployeePermissions();

	const { data: report, isLoading, error } = useEmployeeReport(userId, month, year);
	const createPointAdjustment = useCreatePointAdjustment();
	const pointForm = useForm<PointAdjustmentFormData>({
		resolver: zodResolver(pointAdjustmentSchema),
		defaultValues: {
			direction: "add",
			points: "",
			reason: "",
		},
	});

	// Running point total for the ledger
	const runningTotal = useMemo(() => {
		if (!report) return 0;
		return report.pointLedger.reduce((sum, e) => sum + e.points, 0);
	}, [report]);

	const handlePrint = () => window.print();

	const openPointDialog = () => {
		pointForm.reset({
			direction: canAwardPoints ? "add" : "deduct",
			points: "",
			reason: "",
		});
		setPointDialogOpen(true);
	};

	const submitPointAdjustment = pointForm.handleSubmit((data) => {
		if ((data.direction === "add" && !canAwardPoints) || (data.direction === "deduct" && !canDeductPoints)) {
			toast.error("You do not have permission for this point adjustment");
			return;
		}

		const absolutePoints = Number(data.points);
		const signedPoints = data.direction === "deduct" ? -absolutePoints : absolutePoints;

		createPointAdjustment.mutate(
			{
				userId,
				points: signedPoints,
				reason: data.reason.trim(),
			},
			{
				onSuccess: () => {
					setPointDialogOpen(false);
					queryClient.invalidateQueries({ queryKey: hrAdminKeys.employeeReport(userId, month, year) });
					toast.success("Point adjustment saved");
				},
				onError: () => toast.error("Failed to save point adjustment"),
			},
		);
	});

	// ── Error state ────────────────────────────────────────────────────────────
	if (error) {
		return (
			<div className="flex flex-col items-center gap-4 py-20 text-center">
				<AlertTriangle className="h-10 w-10 text-destructive" />
				<p className="text-sm text-muted-foreground">Failed to load the employee report. The backend endpoint may not be available yet.</p>
				<Button
					variant="outline"
					onClick={() => router.back()}
				>
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<>
			{/* ── Print styles injected inline ─────────────────────────────────── */}
			<style>{`
				@media print {
					.no-print { display: none !important; }
					body { background: white !important; }
					.print-break { page-break-before: always; }
					.print-avoid-break { page-break-inside: avoid; }
				}
			`}</style>

			<section className="flex flex-col gap-6 pb-12">
				{/* ── HEADER ──────────────────────────────────────────────────── */}
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between no-print">
					<Button
						variant="ghost"
						size="sm"
						className="w-fit gap-2"
						onClick={() => router.back()}
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Profiles
					</Button>

					<div className="flex items-center gap-2">
						{/* Month picker */}
						<Select
							value={String(month)}
							onValueChange={(v) => setMonth(Number(v))}
						>
							<SelectTrigger className="w-36">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{MONTHS.map((m) => (
									<SelectItem
										key={m.value}
										value={m.value}
									>
										{m.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Year picker */}
						<Select
							value={String(year)}
							onValueChange={(v) => setYear(Number(v))}
						>
							<SelectTrigger className="w-24">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{YEAR_OPTIONS.map((y) => (
									<SelectItem
										key={y.value}
										value={y.value}
									>
										{y.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Button
							variant="outline"
							size="sm"
							className="gap-2"
							onClick={handlePrint}
						>
							<Printer className="h-4 w-4" />
							Print
						</Button>
						{(canAwardPoints || canDeductPoints) && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="gap-2"
								onClick={openPointDialog}
							>
								<PlusCircle className="h-4 w-4" />
								Adjust Points
							</Button>
						)}
					</div>
				</div>

				{/* ── Loading ──────────────────────────────────────────────────── */}
				{isLoading && <ReportSkeleton />}

				{/* ── Report body ──────────────────────────────────────────────── */}
				{report && (
					<>
						{/* ── Employee identity header ─────────────────────────── */}
						<div className="flex items-center gap-4 rounded-xl border bg-card px-6 py-4 shadow-sm print-avoid-break">
							<Avatar className="h-14 w-14 shrink-0">
								<AvatarImage src={report.employee.avatar ?? undefined} />
								<AvatarFallback className="text-lg">{report.employee.name.slice(0, 2).toUpperCase()}</AvatarFallback>
							</Avatar>
							<div className="min-w-0 flex-1">
								<h1 className="text-xl font-bold">{report.employee.name}</h1>
								<p className="text-sm text-muted-foreground">{report.employee.email}</p>
								<div className="mt-1 flex flex-wrap gap-1">
									{report.employee.roles.map((r) => (
										<Badge
											key={r}
											variant="secondary"
											className="text-xs capitalize"
										>
											{r}
										</Badge>
									))}
								</div>
							</div>
							<div className="shrink-0 text-right">
								<p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Period</p>
								<p className="text-lg font-bold">{report.period.label}</p>
							</div>
						</div>

						{/* ── CARD 1: KPI Summary ──────────────────────────────── */}
						<div className={cn("grid grid-cols-2 divide-x divide-y overflow-hidden rounded-xl border bg-card md:divide-y-0 print-avoid-break", canViewEmployeeSalary ? "md:grid-cols-4" : "md:grid-cols-3")}>
							<KpiCell
								icon={Clock}
								label="Task Hours"
								value={fmtHours(report.summary.totalTaskHours)}
								sub={`${report.summary.completedTaskCount} tasks completed`}
								trend="neutral"
							/>
							<KpiCell
								icon={runningTotal >= 0 ? TrendingUp : TrendingDown}
								label="Points Balance"
								value={runningTotal >= 0 ? `+${runningTotal}` : String(runningTotal)}
								sub="Selected month"
								trend={runningTotal >= 0 ? "positive" : "negative"}
							/>
							<KpiCell
								icon={CalendarDays}
								label="Late Days"
								value={String(report.summary.lateDays)}
								sub={`${report.summary.absentDays} absent · ${report.summary.presentDays} present`}
								trend={report.summary.lateDays > 0 ? "negative" : "positive"}
							/>
							{canViewEmployeeSalary && (
								<KpiCell
									icon={DollarSign}
									label="Net Salary"
									value={fmt(report.summary.netSalary)}
									sub={report.financialBreakdown.payslipStatus ? `Payslip: ${report.financialBreakdown.payslipStatus}` : "No payslip yet"}
									trend="neutral"
								/>
							)}
						</div>

						<PerformanceOverview report={report} />

						<WorkHoursBreakdown report={report} />

						{/* ── CARD 2: Point Ledger ─────────────────────────────── */}
						<Card className="print-avoid-break">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Star className="h-4 w-4 text-amber-500" />
									Point Ledger
									<Badge
										variant={runningTotal >= 0 ? "default" : "destructive"}
										className="ml-auto text-xs"
									>
										Net: {runningTotal >= 0 ? `+${runningTotal}` : runningTotal} pts
									</Badge>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{report.pointLedger.length === 0 ? (
									<p className="py-8 text-center text-sm text-muted-foreground">No point transactions for this period.</p>
								) : (
									<DataTable<ReportPointEntry>
										columns={pointLedgerColumns}
										data={report.pointLedger}
										keyExtractor={(e) => e.id}
									/>
								)}
							</CardContent>
						</Card>

						{/* ── CARD 3: Attendance Log ───────────────────────────── */}
						<Card className="print-break print-avoid-break">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CalendarDays className="h-4 w-4 text-blue-500" />
									Attendance & Hours
									<div className="ml-auto flex gap-2">
										<Badge
											variant="outline"
											className="text-xs text-green-600"
										>
											{report.summary.presentDays} present
										</Badge>
										{report.summary.lateDays > 0 && (
											<Badge
												variant="outline"
												className="text-xs text-amber-600"
											>
												{report.summary.lateDays} late
											</Badge>
										)}
										{report.summary.absentDays > 0 && (
											<Badge
												variant="destructive"
												className="text-xs"
											>
												{report.summary.absentDays} absent
											</Badge>
										)}
									</div>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{report.attendanceDays.length === 0 ? (
									<p className="py-8 text-center text-sm text-muted-foreground">No attendance records for this period.</p>
								) : (
									<DataTable<ReportAttendanceDay>
										columns={attendanceColumns}
										data={report.attendanceDays}
										keyExtractor={(d) => d.date}
									/>
								)}
							</CardContent>
						</Card>

						<AdminPersonalTasksCard
							userId={userId}
							month={month}
							year={year}
						/>

						{/* ── CARD 4: Deliverables & QA ────────────────────────── */}
						<Card className="print-avoid-break">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CheckCircle2 className="h-4 w-4 text-green-500" />
									Deliverables &amp; QA Feedback
								</CardTitle>
							</CardHeader>
							<CardContent>
								{report.deliverableDays.length === 0 ? (
									<p className="py-8 text-center text-sm text-muted-foreground">No deliverable data for this period.</p>
								) : (
									<DataTable<ReportDeliverableDay>
										columns={deliverableColumns}
										data={report.deliverableDays}
										keyExtractor={(d) => d.date}
									/>
								)}
							</CardContent>
						</Card>

						{/* ── CARD 5: Financial Breakdown ──────────────────────── */}
						{canViewEmployeeSalary && (
							<Card className="print-break print-avoid-break">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<DollarSign className="h-4 w-4 text-emerald-500" />
										Financial Breakdown
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex flex-col gap-1 max-w-lg">
										<FinancialRow
											label="Base Salary"
											value={report.financialBreakdown.baseSalary}
											sign="+"
										/>
										<FinancialRow
											label="Points Bonus"
											value={report.financialBreakdown.pointsBonusAmount}
											sign="+"
											muted={report.financialBreakdown.pointsBonusAmount === 0}
										/>
										{report.financialBreakdown.manualBonusTotal > 0 && (
											<FinancialRow
												label="Manual Bonuses"
												value={report.financialBreakdown.manualBonusTotal}
												sign="+"
											/>
										)}
										<Separator className="my-1" />
										<FinancialRow
											label="Lateness Deduction"
											value={report.financialBreakdown.latenessDeductionAmount}
											sign="-"
											muted={report.financialBreakdown.latenessDeductionAmount === 0}
										/>
										{report.financialBreakdown.manualDeductionTotal > 0 && (
											<FinancialRow
												label="Manual Deductions"
												value={report.financialBreakdown.manualDeductionTotal}
												sign="-"
											/>
										)}
										{report.financialBreakdown.unpaidLeaveDeduction > 0 && (
											<FinancialRow
												label="Unpaid Leave"
												value={report.financialBreakdown.unpaidLeaveDeduction}
												sign="-"
											/>
										)}
										<Separator className="my-1" />
										<FinancialRow
											label="Net Salary"
											value={report.financialBreakdown.netSalary}
											sign="="
											highlight
										/>
									</div>

									{report.manualTransactions.length > 0 && (
										<>
											<Separator className="my-4" />
											<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Manual Transaction Detail</p>
											<div className="flex flex-col gap-1">
												{report.manualTransactions.map((tx) => (
													<div
														key={tx.id}
														className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm hover:bg-muted/40"
													>
														<div className="flex items-center gap-2">
															{tx.type === "manual_bonus" ? <TrendingUp className="h-3.5 w-3.5 text-green-600" /> : <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
															<span className="text-muted-foreground">{tx.transactionDate}</span>
															<span>{tx.reason}</span>
														</div>
														<span className={cn("tabular-nums font-semibold", tx.type === "manual_bonus" ? "text-green-600" : "text-destructive")}>
															{tx.type === "manual_bonus" ? "+" : "-"}
															{fmt(tx.amount)}
														</span>
													</div>
												))}
											</div>
										</>
									)}
								</CardContent>
							</Card>
						)}

						{/* ── Print footer ─────────────────────────────────────── */}
						<div className="hidden print:block mt-8 border-t pt-4 text-center text-xs text-muted-foreground">
							Generated on {new Date().toLocaleDateString()} · {report.employee.name} · {report.period.label}
						</div>
					</>
				)}
			</section>

			<FormDialog
				open={pointDialogOpen}
				onOpenChange={setPointDialogOpen}
				title="Adjust Points"
				submitLabel="Save Adjustment"
				isLoading={createPointAdjustment.isPending}
				onSubmit={submitPointAdjustment}
				size="md"
			>
				<Form {...pointForm}>
					<div className="flex flex-col gap-4">
						<FormSelect
							control={pointForm.control}
							name="direction"
							label="Adjustment"
							options={[
								...(canAwardPoints ? [{ value: "add", label: "Add points" }] : []),
								...(canDeductPoints ? [{ value: "deduct", label: "Deduct points" }] : []),
							]}
						/>
						<FormInput
							control={pointForm.control}
							name="points"
							label="Points"
							type="number"
							min={1}
							step={1}
						/>
						<FormTextarea
							control={pointForm.control}
							name="reason"
							label="Reason"
							rows={3}
						/>
					</div>
				</Form>
			</FormDialog>
		</>
	);
}
