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
import { ArrowLeft, Printer, Clock, Star, AlertTriangle, DollarSign, CheckCircle2, XCircle, TrendingUp, TrendingDown, CalendarDays, Minus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { useEmployeeReport } from "@/features/hr/model/use-hr-actions";
import type { AttendanceStatus, ReportAttendanceDay, ReportDeliverableDay, ReportPointEntry } from "@/entities/hr/model/types";
import { cn } from "@/shared/lib/utils";

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

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface KpiCardProps {
	icon: React.ElementType;
	label: string;
	value: string;
	sub?: string;
	trend?: "positive" | "negative" | "neutral";
}

function KpiCard({ icon: Icon, label, value, sub, trend = "neutral" }: KpiCardProps) {
	return (
		<div className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm print:shadow-none print:border">
			<div className="flex items-center justify-between">
				<span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
				<Icon className={cn("h-4 w-4", trend === "positive" && "text-green-500", trend === "negative" && "text-destructive", trend === "neutral" && "text-muted-foreground")} />
			</div>
			<p className={cn("text-2xl font-bold tabular-nums", trend === "positive" && "text-green-600", trend === "negative" && "text-destructive")}>{value}</p>
			{sub && <p className="text-xs text-muted-foreground">{sub}</p>}
		</div>
	);
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
		header: "Worked",
		className: "text-right",
		render: (d) => <span className="text-xs tabular-nums font-medium">{d.workedHours > 0 ? fmtHours(d.workedHours) : "—"}</span>,
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
					{d.qaIssues.map((note, i) => (
						<li
							key={i}
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
	const now = new Date();
	const [month, setMonth] = useState(now.getMonth() + 1);
	const [year, setYear] = useState(now.getFullYear());

	const { data: report, isLoading, error } = useEmployeeReport(userId, month, year);

	// Running point total for the ledger
	const runningTotal = useMemo(() => {
		if (!report) return 0;
		return report.pointLedger.reduce((sum, e) => sum + e.points, 0);
	}, [report]);

	const handlePrint = () => window.print();

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
						<div className="grid grid-cols-2 gap-4 md:grid-cols-4 print-avoid-break">
							<KpiCard
								icon={Clock}
								label="Task Hours"
								value={fmtHours(report.summary.totalTaskHours)}
								sub={`${report.summary.completedTaskCount} tasks completed`}
								trend="neutral"
							/>
							<KpiCard
								icon={runningTotal >= 0 ? TrendingUp : TrendingDown}
								label="Points Balance"
								value={runningTotal >= 0 ? `+${runningTotal}` : String(runningTotal)}
								sub="2-month cycle"
								trend={runningTotal >= 0 ? "positive" : "negative"}
							/>
							<KpiCard
								icon={CalendarDays}
								label="Late Days"
								value={String(report.summary.lateDays)}
								sub={`${report.summary.absentDays} absent · ${report.summary.presentDays} present`}
								trend={report.summary.lateDays > 0 ? "negative" : "positive"}
							/>
							<KpiCard
								icon={DollarSign}
								label="Net Salary"
								value={fmt(report.summary.netSalary)}
								sub={report.financialBreakdown.payslipStatus ? `Payslip: ${report.financialBreakdown.payslipStatus}` : "No payslip yet"}
								trend="neutral"
							/>
						</div>

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
						<Card className="print-break print-avoid-break">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<DollarSign className="h-4 w-4 text-emerald-500" />
									Financial Breakdown
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-col gap-1 max-w-lg">
									{/* Base */}
									<FinancialRow
										label="Base Salary"
										value={report.financialBreakdown.baseSalary}
										sign="+"
									/>

									{/* Points bonus */}
									<FinancialRow
										label="Points Bonus"
										value={report.financialBreakdown.pointsBonusAmount}
										sign="+"
										muted={report.financialBreakdown.pointsBonusAmount === 0}
									/>

									{/* Manual bonuses */}
									{report.financialBreakdown.manualBonusTotal > 0 && (
										<FinancialRow
											label="Manual Bonuses"
											value={report.financialBreakdown.manualBonusTotal}
											sign="+"
										/>
									)}

									<Separator className="my-1" />

									{/* Lateness deduction */}
									<FinancialRow
										label="Lateness Deduction"
										value={report.financialBreakdown.latenessDeductionAmount}
										sign="-"
										muted={report.financialBreakdown.latenessDeductionAmount === 0}
									/>

									{/* Manual deductions */}
									{report.financialBreakdown.manualDeductionTotal > 0 && (
										<FinancialRow
											label="Manual Deductions"
											value={report.financialBreakdown.manualDeductionTotal}
											sign="-"
										/>
									)}

									<Separator className="my-1" />

									{/* Net total */}
									<FinancialRow
										label="Net Salary"
										value={report.financialBreakdown.netSalary}
										sign="="
										highlight
									/>
								</div>

								{/* Manual transactions detail */}
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

						{/* ── Print footer ─────────────────────────────────────── */}
						<div className="hidden print:block mt-8 border-t pt-4 text-center text-xs text-muted-foreground">
							Generated on {new Date().toLocaleDateString()} · {report.employee.name} · {report.period.label}
						</div>
					</>
				)}
			</section>
		</>
	);
}
