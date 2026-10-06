"use client";

import { useState } from "react";
import { AlertCircle, FileText, Info, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { handleApiError } from "@/lib/errorHandling";
import { useEmployeeLateDeductions, useEvaluateEmployeeLateDeductions, useOverrideLateDeduction, useResetEmployeeLateDeductions } from "../hooks/useEmployeeLateDeductions";
import { buildLateDeductionOverridePayload, formatLateDeductionOccurrence, lateDeductionOverrideSchema } from "../lib/late-deductions";
import type { LateDeductionOverrideFormValues, LateDeductionRecord, LateDeductionStatus, LateDeductionsSummary } from "../types/late-deductions";

interface EmployeeLateDeductionsPanelProps {
	employeeId: number;
	employeeName: string;
	canManage: boolean;
	isActive: boolean;
}

const statusLabels: Record<LateDeductionStatus, string> = {
	calculated: "Calculated",
	waived: "Waived",
	overridden: "Overridden",
};

const statusVariants: Record<LateDeductionStatus, BadgeProps["variant"]> = {
	calculated: "secondary",
	waived: "default",
	overridden: "outline",
};

const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "long" });

function formatAmount(amount: number): string {
	return Number.isFinite(amount) ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(amount);
}

function formatMinutes(minutes: number): string {
	return `${Number.isFinite(minutes) ? Math.max(0, Math.round(minutes)) : minutes} min`;
}

function formatDate(value: string): string {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

	return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatDateTime(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;

	return date.toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

function formatTierRange(record: LateDeductionRecord): string {
	if (record.tierMinimumMinutes === null) return "No deduction tier";
	if (record.tierMaximumMinutes === null) return `${record.tierMinimumMinutes}+ min`;
	return `${record.tierMinimumMinutes}-${record.tierMaximumMinutes} min`;
}

function LateDeductionSummary({ summary }: { summary: LateDeductionsSummary }) {
	return (
		<section className="space-y-3">
			<div>
				<h3 className="font-semibold">Monthly summary</h3>
				<p className="text-sm text-muted-foreground">Totals reflect the selected evaluation period and its recorded overrides or waivers.</p>
			</div>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Calculated amount</p>
					<p className="mt-1 text-xl font-semibold">{formatAmount(summary.calculatedAmount)}</p>
				</div>
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Adjusted amount</p>
					<p className="mt-1 text-xl font-semibold">{formatAmount(summary.adjustedAmount)}</p>
				</div>
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Waived records</p>
					<p className="mt-1 text-xl font-semibold">{summary.waivedCount}</p>
				</div>
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Evaluated records</p>
					<p className="mt-1 text-xl font-semibold">{summary.evaluatedCount}</p>
				</div>
			</div>
		</section>
	);
}

function LateDeductionDetails({ record, canManage, isOverriding, onOverride }: { record: LateDeductionRecord; canManage: boolean; isOverriding: boolean; onOverride: (record: LateDeductionRecord) => void }) {
	return (
		<div className="rounded-lg border bg-muted/20 p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<h4 className="font-medium">{formatDate(record.attendanceDate)}</h4>
						<Badge variant={statusVariants[record.status]}>{statusLabels[record.status]}</Badge>
						<Badge variant="outline">{record.policyVersionId != null ? `Policy snapshot #${record.policyVersionId}` : "Policy snapshot unavailable"}</Badge>
					</div>
					<p className="text-sm text-muted-foreground">Attendance #{record.attendanceId}</p>
				</div>
				<div className="flex flex-col items-start gap-2 sm:items-end">
					<div className="text-left sm:text-right">
						<p className="text-sm text-muted-foreground">Final amount</p>
						<p className="text-lg font-semibold">{formatAmount(record.finalAmount)}</p>
					</div>
					{canManage && record.status !== "waived" && (
						<Button type="button" size="sm" variant="outline" disabled={isOverriding} onClick={() => onOverride(record)}>
							<Pencil />
							Override amount
						</Button>
					)}
				</div>
			</div>

			<dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
				<div>
					<dt className="text-muted-foreground">Original lateness</dt>
					<dd className="font-medium">{formatMinutes(record.originalLateMinutes)}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Eligible lateness</dt>
					<dd className="font-medium">{formatMinutes(record.eligibleLateMinutes)}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Monthly occurrence</dt>
					<dd className="font-medium">{formatLateDeductionOccurrence(record.occurrenceNumber)}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Tier</dt>
					<dd className="font-medium">{formatTierRange(record)} at {record.percentage}%</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Daily rate</dt>
					<dd className="font-medium">{formatAmount(record.dailyRate)}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Calculated amount</dt>
					<dd className="font-medium">{formatAmount(record.calculatedAmount)}</dd>
				</div>
				{record.overrideAmount !== null && (
					<div>
						<dt className="text-muted-foreground">Manual override</dt>
						<dd className="font-medium">{formatAmount(record.overrideAmount)}</dd>
					</div>
				)}
				<div>
					<dt className="text-muted-foreground">Evaluated</dt>
					<dd className="font-medium">{formatDateTime(record.evaluatedAt)}</dd>
				</div>
			</dl>

			{record.status === "waived" ? (
				<Alert className="mt-4">
					<Info />
					<AlertTitle>Paid short permission waiver</AlertTitle>
					<AlertDescription>{record.waiverReason ?? "An approved paid short permission covered enough of this actual late interval."} Paid short permissions waive only their overlapping lateness, and only when approved in advance.</AlertDescription>
				</Alert>
			) : (
				<div className="mt-4 space-y-2 border-t pt-3 text-sm text-muted-foreground">
					{record.overrideReason && <p>Override reason: {record.overrideReason}</p>}
					<p>{record.salaryAdjustmentId != null ? `Linked payroll adjustment: #${record.salaryAdjustmentId}` : "No linked payroll adjustment."}</p>
				</div>
			)}
		</div>
	);
}

export function EmployeeLateDeductionsPanel({ employeeId, employeeName, canManage, isActive }: EmployeeLateDeductionsPanelProps) {
	const today = new Date();
	const [year, setYear] = useState(today.getFullYear());
	const [month, setMonth] = useState(today.getMonth() + 1);
	const [pendingOverride, setPendingOverride] = useState<LateDeductionRecord | null>(null);
	const [overrideAmount, setOverrideAmount] = useState<number | "">("");
	const [overrideReason, setOverrideReason] = useState("");
	const [overrideAttempted, setOverrideAttempted] = useState(false);
	const lateDeductionsQuery = useEmployeeLateDeductions(employeeId, year, month, isActive && canManage);
	const evaluateLateDeductions = useEvaluateEmployeeLateDeductions();
	const overrideLateDeduction = useOverrideLateDeduction();
	const resetLateDeductions = useResetEmployeeLateDeductions();
	const records = [...(lateDeductionsQuery.data?.records ?? [])].sort((left, right) => right.attendanceDate.localeCompare(left.attendanceDate) || right.id - left.id);
	const summary = lateDeductionsQuery.data?.summary;
	const yearOptions = Array.from({ length: 11 }, (_, index) => today.getFullYear() - 5 + index);
	const overrideValues: LateDeductionOverrideFormValues = { amount: overrideAmount, reason: overrideReason };
	const overrideValidation = lateDeductionOverrideSchema.safeParse(overrideValues);
	const overrideAmountError = overrideAttempted && !overrideValidation.success ? overrideValidation.error.issues.find((issue) => issue.path[0] === "amount")?.message : undefined;
	const overrideReasonError = overrideAttempted && !overrideValidation.success ? overrideValidation.error.issues.find((issue) => issue.path[0] === "reason")?.message : undefined;

	const resetOverride = () => {
		setPendingOverride(null);
		setOverrideAmount("");
		setOverrideReason("");
		setOverrideAttempted(false);
	};

	const openOverrideDialog = (record: LateDeductionRecord) => {
		setPendingOverride(record);
		setOverrideAmount("");
		setOverrideReason("");
		setOverrideAttempted(false);
	};

	const handleEvaluate = async () => {
		try {
			await evaluateLateDeductions.mutateAsync({ employeeId, year, month });
			toast.success(`Late deductions evaluated for ${monthFormatter.format(new Date(2000, month - 1, 1))} ${year}`);
		} catch (error) {
			toast.error(handleApiError(error));
		}
	};

	const handleReset = async () => {
		const confirmed = window.confirm(`Reset late deductions for ${month}/${year}? Unprocessed records will be waived and counters restart. Processed payroll cannot be reset.`);
		if (!confirmed) return;
		try {
			await resetLateDeductions.mutateAsync({ employeeId, year, month, reason: "Manual monthly reset from HR panel." });
			toast.success("Late deductions reset for the month");
		} catch (error) {
			toast.error(handleApiError(error));
		}
	};

	const handleOverrideSubmit = async () => {
		if (!pendingOverride) return;
		setOverrideAttempted(true);
		if (!overrideValidation.success) return;

		try {
			await overrideLateDeduction.mutateAsync({
				id: pendingOverride.id,
				employeeId,
				payload: buildLateDeductionOverridePayload(overrideValues),
			});
			toast.success("Late deduction override saved");
			resetOverride();
		} catch (error) {
			toast.error(handleApiError(error));
		}
	};

	if (!canManage) return null;

	return (
		<>
			<div className="space-y-5">
				<div>
					<h2 className="text-lg font-semibold">Late deductions for {employeeName}</h2>
					<p className="text-sm text-muted-foreground">Evaluate attendance-based late deductions and review their payroll adjustments for a selected month.</p>
				</div>

					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h3 className="font-semibold">Payroll period</h3>
							<p className="text-sm text-muted-foreground">Evaluation only creates records that are missing, so it is safe to run again.</p>
						</div>
						<div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
							<Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
								<SelectTrigger aria-label="Late deductions year">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{yearOptions.map((option) => (
										<SelectItem key={option} value={String(option)}>
											{option}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select value={String(month)} onValueChange={(value) => setMonth(Number(value))}>
								<SelectTrigger aria-label="Late deductions month">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Array.from({ length: 12 }, (_, index) => index + 1).map((option) => (
										<SelectItem key={option} value={String(option)}>
											{monthFormatter.format(new Date(2000, option - 1, 1))}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button type="button" onClick={() => void handleEvaluate()} disabled={evaluateLateDeductions.isPending}>
								{evaluateLateDeductions.isPending && <Loader2 className="animate-spin" />}
								Evaluate
							</Button>
							<Button type="button" variant="outline" onClick={() => void handleReset()} disabled={resetLateDeductions.isPending}>
								{resetLateDeductions.isPending && <Loader2 className="animate-spin" />}
								Reset month
							</Button>
						</div>
					</div>

					<Alert>
						<Info />
						<AlertTitle>Paid short permission exceptions</AlertTitle>
						<AlertDescription>Only paid short permissions approved in advance can waive late deductions. They waive only the portion of actual lateness that overlaps the permission, not unrelated or uncovered late minutes.</AlertDescription>
					</Alert>

					{lateDeductionsQuery.isLoading ? (
						<div className="space-y-3">
							<Skeleton className="h-36 w-full" />
							<Skeleton className="h-52 w-full" />
						</div>
					) : lateDeductionsQuery.isError ? (
						<Alert variant="destructive">
							<AlertCircle />
							<AlertTitle>Unable to load late deductions</AlertTitle>
							<AlertDescription className="flex flex-wrap items-center gap-2">
								<span>{handleApiError(lateDeductionsQuery.error)}</span>
								<Button type="button" variant="outline" size="sm" onClick={() => lateDeductionsQuery.refetch()}>
									Try again
								</Button>
							</AlertDescription>
						</Alert>
					) : summary ? (
						<div className="space-y-6">
							<LateDeductionSummary summary={summary} />

							<section className="space-y-3 border-t pt-5">
								<div>
									<h3 className="font-semibold">Evaluation records</h3>
									<p className="text-sm text-muted-foreground">Each record retains the late interval, policy snapshot, and final payroll outcome used for evaluation.</p>
								</div>
								{records.length > 0 ? (
									<div className="space-y-3">
										{records.map((record) => (
											<LateDeductionDetails key={record.id} record={record} canManage={canManage} isOverriding={overrideLateDeduction.isPending} onOverride={openOverrideDialog} />
										))}
									</div>
								) : (
									<div className="rounded-lg border border-dashed px-4 py-10 text-center">
										<FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
										<p className="font-medium">No late deductions for {monthFormatter.format(new Date(2000, month - 1, 1))} {year}</p>
										<p className="mt-1 text-sm text-muted-foreground">Run the evaluator after attendance is available for this month.</p>
									</div>
								)}
							</section>
						</div>
					) : null}
			</div>

			<AlertDialog open={Boolean(pendingOverride)} onOpenChange={(isOpen) => !isOpen && resetOverride()}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Override late deduction</AlertDialogTitle>
						<AlertDialogDescription>
							{pendingOverride ? `Set the final deduction for ${formatDate(pendingOverride.attendanceDate)}. A value of 0 cancels an unprocessed payroll adjustment; processed payroll adjustments cannot be cancelled.` : "Set the final deduction amount and explain the correction."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="late-deduction-override-amount">Final amount</Label>
							<Input
								id="late-deduction-override-amount"
								type="number"
								min={0}
								step="0.01"
								value={overrideAmount}
								onChange={(event) => {
									const value = event.target.value;
									const parsedAmount = Number(value);
									setOverrideAmount(value === "" || !Number.isFinite(parsedAmount) ? "" : parsedAmount);
								}}
								disabled={overrideLateDeduction.isPending}
								aria-invalid={Boolean(overrideAmountError)}
								aria-describedby={overrideAmountError ? "late-deduction-override-amount-error" : undefined}
							/>
							{overrideAmountError && <p id="late-deduction-override-amount-error" className="text-sm text-destructive">{overrideAmountError}</p>}
						</div>
						<div className="grid gap-2">
							<Label htmlFor="late-deduction-override-reason">Reason</Label>
							<Textarea
								id="late-deduction-override-reason"
								value={overrideReason}
								onChange={(event) => setOverrideReason(event.target.value)}
								placeholder="Explain this manual correction"
								rows={3}
								disabled={overrideLateDeduction.isPending}
								aria-invalid={Boolean(overrideReasonError)}
								aria-describedby={overrideReasonError ? "late-deduction-override-reason-error" : undefined}
							/>
							{overrideReasonError && <p id="late-deduction-override-reason-error" className="text-sm text-destructive">{overrideReasonError}</p>}
						</div>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={overrideLateDeduction.isPending}>Cancel</AlertDialogCancel>
						<Button type="button" disabled={overrideLateDeduction.isPending} onClick={() => void handleOverrideSubmit()}>
							{overrideLateDeduction.isPending && <Loader2 className="animate-spin" />}
							Save override
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
