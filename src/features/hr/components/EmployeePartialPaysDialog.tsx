"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { AlertCircle, Ban, Check, FileText, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/shared";
import { handleApiError } from "@/lib/errorHandling";
import { useEmploymentContracts } from "../hooks/useEmploymentContracts";
import { useApproveEmployeePartialPay, useCancelEmployeePartialPay, useCreateEmployeePartialPay, useEmployeePartialPays, usePreviewEmployeePartialPay } from "../hooks/useEmployeePartialPays";
import { buildEmployeePartialPayPayload, employeePartialPayFormSchema, formatEmployeePartialPayAmount, getCurrentEmployeePartialPayPeriod, getDefaultEmployeePartialPayFormValues, getEmployeePartialPayKindLabel, getEmployeePartialPayPolicySnapshotValue, getEmployeePartialPayStatusLabel } from "../lib/employee-partial-pays";
import type { EmploymentContract, EmploymentContractWorkDay } from "../types/employment-contract";
import type { EmployeePartialPay, EmployeePartialPayCalculation, EmployeePartialPayFormValues, EmployeePartialPayKind, EmployeePartialPayStatus, EmployeePartialPaySummary } from "../types/employee-partial-pays";

interface EmployeePartialPaysDialogProps {
	employeeId: number;
	employeeName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	canManage: boolean;
}

type EmployeePartialPayAction = "approve" | "cancel";

interface PendingEmployeePartialPayAction {
	partialPay: EmployeePartialPay;
	action: EmployeePartialPayAction;
}

const statusVariants: Record<EmployeePartialPayStatus, BadgeProps["variant"]> = {
	draft: "secondary",
	approved: "default",
	cancelled: "outline",
};

const actionLabels: Record<EmployeePartialPayAction, string> = {
	approve: "Approve",
	cancel: "Cancel",
};

const workDayLabels: Record<EmploymentContractWorkDay, string> = {
	sunday: "Sunday",
	monday: "Monday",
	tuesday: "Tuesday",
	wednesday: "Wednesday",
	thursday: "Thursday",
	friday: "Friday",
	saturday: "Saturday",
};

const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "long" });

function formatPartialPayDate(value: string): string {
	const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
	if (Number.isNaN(date.getTime())) return value;

	return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatPartialPayDateTime(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;

	return date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function getContractLabel(contract: EmploymentContract): string {
	const term = `${formatPartialPayDate(contract.startDate)} to ${formatPartialPayDate(contract.endDate)}`;
	const termination = contract.terminatedOn ? `; terminated ${formatPartialPayDate(contract.terminatedOn)}` : "";
	return `Contract #${contract.id}: ${term}${termination}`;
}

function PartialPaySummaryCards({ summary }: { summary: EmployeePartialPaySummary }) {
	const cards = [
		{ label: "Draft", value: summary.draftCount },
		{ label: "Approved", value: summary.approvedCount },
		{ label: "Cancelled", value: summary.cancelledCount },
		{ label: "Gross total", value: formatEmployeePartialPayAmount(summary.grossAmount) },
		{ label: "Approved gross", value: formatEmployeePartialPayAmount(summary.approvedGrossAmount) },
	];

	return (
		<section className="space-y-3">
			<div>
				<h3 className="font-semibold">Period summary</h3>
				<p className="text-sm text-muted-foreground">Totals are based on the server-created partial-pay records for the selected payroll period.</p>
			</div>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
				{cards.map((card) => (
					<div key={card.label} className="rounded-lg border p-4">
						<p className="text-sm text-muted-foreground">{card.label}</p>
						<p className="mt-1 text-xl font-semibold">{card.value}</p>
					</div>
				))}
			</div>
		</section>
	);
}

function PartialPayCalculationDetails({ calculation }: { calculation: EmployeePartialPayCalculation }) {
	const fixedFirstMonthDays = getEmployeePartialPayPolicySnapshotValue(calculation.policySnapshot, "midMonthHirePaidDays");
	const dailyRateDivisor = getEmployeePartialPayPolicySnapshotValue(calculation.policySnapshot, "dailyRateDivisor");

	return (
		<div className="rounded-lg border bg-muted/20 p-4">
			<dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
				<div>
					<dt className="text-muted-foreground">Service period</dt>
					<dd className="font-medium">{formatPartialPayDate(calculation.serviceStartDate)} to {formatPartialPayDate(calculation.serviceEndDate)}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Payable days</dt>
					<dd className="font-medium">{calculation.payableDays}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Base salary snapshot</dt>
					<dd className="font-medium">{formatEmployeePartialPayAmount(calculation.baseSalarySnapshot)}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Daily-rate snapshot</dt>
					<dd className="font-medium">{formatEmployeePartialPayAmount(calculation.dailyRateSnapshot)}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Gross partial pay</dt>
					<dd className="font-medium">{formatEmployeePartialPayAmount(calculation.grossAmount)}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Contract work days</dt>
					<dd className="font-medium">{calculation.contractWorkDays.map((day) => workDayLabels[day]).join(", ") || "Not recorded"}</dd>
				</div>
				{calculation.policyVersionId !== null && (
					<div>
						<dt className="text-muted-foreground">Policy version</dt>
						<dd className="font-medium">#{calculation.policyVersionId}</dd>
					</div>
				)}
				{typeof fixedFirstMonthDays === "number" && (
					<div>
						<dt className="text-muted-foreground">First-month policy days</dt>
						<dd className="font-medium">{fixedFirstMonthDays}</dd>
					</div>
				)}
				{typeof dailyRateDivisor === "number" && (
					<div>
						<dt className="text-muted-foreground">Daily-rate policy divisor</dt>
						<dd className="font-medium">{dailyRateDivisor}</dd>
					</div>
				)}
			</dl>
			<div className="mt-4 space-y-1 border-t pt-3 text-sm text-muted-foreground">
				<p>These are immutable server calculations and snapshots. Salary, daily rate, payable days, and gross amount cannot be edited here.</p>
				{calculation.policySnapshot && <p>The policy snapshot used for this calculation is retained with the record.</p>}
			</div>
		</div>
	);
}

function PartialPayRecordDetails({ partialPay, canManage, isActioning, onAction }: { partialPay: EmployeePartialPay; canManage: boolean; isActioning: boolean; onAction: (partialPay: EmployeePartialPay, action: EmployeePartialPayAction) => void }) {
	return (
		<div className="rounded-lg border bg-muted/20 p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<h4 className="font-medium">{getEmployeePartialPayKindLabel(partialPay.kind)} #{partialPay.id}</h4>
						<Badge variant={statusVariants[partialPay.status]}>{getEmployeePartialPayStatusLabel(partialPay.status)}</Badge>
					</div>
					<p className="text-sm text-muted-foreground">Payroll period: {monthFormatter.format(new Date(partialPay.payrollYear, partialPay.payrollMonth - 1, 1))} {partialPay.payrollYear}</p>
				</div>
				{canManage && partialPay.status === "draft" && (
					<div className="flex flex-wrap gap-2">
						<Button type="button" size="sm" disabled={isActioning} onClick={() => onAction(partialPay, "approve")}>
							<Check />
							Approve
						</Button>
						<Button type="button" size="sm" variant="outline" disabled={isActioning} onClick={() => onAction(partialPay, "cancel")}>
							<Ban />
							Cancel
						</Button>
					</div>
				)}
			</div>

			<div className="mt-4">
				<PartialPayCalculationDetails calculation={partialPay} />
			</div>

			<div className="mt-4 space-y-1 border-t pt-3 text-sm text-muted-foreground">
				<p>Created {formatPartialPayDateTime(partialPay.createdAt)}</p>
				{partialPay.approvedAt && <p>Approved {formatPartialPayDateTime(partialPay.approvedAt)}</p>}
				{partialPay.salaryAdjustmentId !== null && <p>Salary adjustment #{partialPay.salaryAdjustmentId}</p>}
				{partialPay.reviewNote && <p>Review note: {partialPay.reviewNote}</p>}
			</div>
		</div>
	);
}

export function EmployeePartialPaysDialog({ employeeId, employeeName, open, onOpenChange, canManage }: EmployeePartialPaysDialogProps) {
	const currentPeriod = getCurrentEmployeePartialPayPeriod();
	const [year, setYear] = useState(currentPeriod.year);
	const [month, setMonth] = useState(currentPeriod.month);
	const [preview, setPreview] = useState<EmployeePartialPayCalculation | null>(null);
	const [requestError, setRequestError] = useState<string | null>(null);
	const [pendingAction, setPendingAction] = useState<PendingEmployeePartialPayAction | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [reviewNote, setReviewNote] = useState("");
	const partialPaysQuery = useEmployeePartialPays(employeeId, year, month, open && canManage);
	const contractsQuery = useEmploymentContracts(employeeId, open && canManage);
	const previewPartialPay = usePreviewEmployeePartialPay();
	const createPartialPay = useCreateEmployeePartialPay();
	const approvePartialPay = useApproveEmployeePartialPay();
	const cancelPartialPay = useCancelEmployeePartialPay();
	const form = useForm<EmployeePartialPayFormValues>({
		resolver: zodResolver(employeePartialPayFormSchema),
		mode: "onChange",
		defaultValues: getDefaultEmployeePartialPayFormValues(),
	});
	const contractId = useWatch({ control: form.control, name: "contractId" });
	const kind = useWatch({ control: form.control, name: "kind" });
	const contracts = contractsQuery.data ?? [];
	const records = [...(partialPaysQuery.data?.records ?? [])].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
	const draftRecords = records.filter((record) => record.status === "draft");
	const historicalRecords = records.filter((record) => record.status !== "draft");
	const isPreviewing = previewPartialPay.isPending;
	const isCreating = createPartialPay.isPending;
	const isActioning = approvePartialPay.isPending || cancelPartialPay.isPending;
	const yearOptions = Array.from({ length: 11 }, (_, index) => currentPeriod.year - 5 + index);

	useEffect(() => {
		if (contractId || contracts.length === 0) return;

		const defaultContract = contracts.find((contract) => contract.isCurrent) ?? contracts.find((contract) => contract.status === "active") ?? contracts[0];
		form.setValue("contractId", defaultContract.id, { shouldValidate: true });
	}, [contractId, contracts, form]);

	useEffect(() => {
		setPreview(null);
		setRequestError(null);
	}, [contractId, kind, month, year]);

	const resetAction = () => {
		setPendingAction(null);
		setActionError(null);
		setReviewNote("");
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setPreview(null);
			setRequestError(null);
			resetAction();
		}
		onOpenChange(isOpen);
	};

	const handlePreview = async (values: EmployeePartialPayFormValues) => {
		setRequestError(null);
		setPreview(null);

		try {
			const serverPreview = await previewPartialPay.mutateAsync({
				employeeId,
				payload: buildEmployeePartialPayPayload(values, year, month),
			});
			setPreview(serverPreview);
		} catch (error) {
			const message = handleApiError(error);
			setRequestError(message);
			toast.error(message);
		}
	};

	const handleCreate = async () => {
		if (!preview || !(await form.trigger())) return;

		setRequestError(null);
		try {
			await createPartialPay.mutateAsync({
				employeeId,
				payload: buildEmployeePartialPayPayload(form.getValues(), year, month),
			});
			setPreview(null);
			toast.success("Partial pay created as a draft");
		} catch (error) {
			const message = handleApiError(error);
			setRequestError(message);
			toast.error(message);
		}
	};

	const openActionDialog = (partialPay: EmployeePartialPay, action: EmployeePartialPayAction) => {
		setPendingAction({ partialPay, action });
		setActionError(null);
		setReviewNote("");
	};

	const handleAction = async () => {
		if (!pendingAction) return;

		setActionError(null);
		const payload = reviewNote.trim() ? { reviewNote: reviewNote.trim() } : {};
		try {
			if (pendingAction.action === "approve") {
				await approvePartialPay.mutateAsync({ id: pendingAction.partialPay.id, employeeId, payload });
			} else {
				await cancelPartialPay.mutateAsync({ id: pendingAction.partialPay.id, employeeId, payload });
			}
			toast.success(`Partial pay ${pendingAction.action === "approve" ? "approved" : "cancelled"}`);
			resetAction();
		} catch (error) {
			const message = handleApiError(error);
			setActionError(message);
			toast.error(message);
		}
	};

	if (!canManage) return null;

	const kindExplanation = kind === "first_month"
		? "First-month automation is only available for contracts that start on day 15. The server applies the policy's fixed mid-month paid days, 15 by default; another start day returns a server validation error."
		: "Termination pay uses the selected contract's recorded termination date and calculates service through its last working day. Set the termination date on the contract first.";
	const actionDescription = pendingAction
		? `${actionLabels[pendingAction.action]} ${getEmployeePartialPayKindLabel(pendingAction.partialPay.kind).toLowerCase()} #${pendingAction.partialPay.id} for ${formatEmployeePartialPayAmount(pendingAction.partialPay.grossAmount)}. The server calculation and snapshots cannot be edited.`
		: "Confirm the partial-pay action.";

	return (
		<>
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
					<DialogHeader>
						<DialogTitle>Partial pay: {employeeName}</DialogTitle>
						<DialogDescription>Preview, create, and review first-month or termination partial-pay records for the selected payroll period.</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h3 className="font-semibold">Payroll period</h3>
							<p className="text-sm text-muted-foreground">The period filters the history and is submitted with each preview and new draft.</p>
						</div>
						<div className="grid grid-cols-2 gap-2 sm:w-64">
							<Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
								<SelectTrigger aria-label="Partial pay year"><SelectValue /></SelectTrigger>
								<SelectContent>
									{yearOptions.map((option) => <SelectItem key={option} value={String(option)}>{option}</SelectItem>)}
								</SelectContent>
							</Select>
							<Select value={String(month)} onValueChange={(value) => setMonth(Number(value))}>
								<SelectTrigger aria-label="Partial pay month"><SelectValue /></SelectTrigger>
								<SelectContent>
									{Array.from({ length: 12 }, (_, index) => index + 1).map((option) => <SelectItem key={option} value={String(option)}>{monthFormatter.format(new Date(2000, option - 1, 1))}</SelectItem>)}
								</SelectContent>
							</Select>
						</div>
					</div>

					<Alert>
						<Info />
						<AlertTitle>Calculation and financial fields are server-owned</AlertTitle>
						<AlertDescription>The preview and saved record retain the server-derived service dates, payable days, salary, rate, amount, work days, and policy snapshot. None of those values are editable in this dialog.</AlertDescription>
					</Alert>

					<section className="space-y-3">
						<div>
							<h3 className="font-semibold">Create partial pay</h3>
							<p className="text-sm text-muted-foreground">Select an existing employment contract and partial-pay kind, then request a server preview before creating the draft.</p>
						</div>

						{contractsQuery.isLoading ? (
							<div className="flex items-center justify-center gap-2 rounded-lg border py-8 text-sm text-muted-foreground"><Loader2 className="animate-spin" />Loading employment contracts...</div>
						) : contractsQuery.isError ? (
							<Alert variant="destructive">
								<AlertCircle />
								<AlertTitle>Unable to load employment contracts</AlertTitle>
								<AlertDescription className="flex flex-wrap items-center gap-2"><span>{handleApiError(contractsQuery.error)}</span><Button type="button" variant="outline" size="sm" onClick={() => contractsQuery.refetch()}>Try again</Button></AlertDescription>
							</Alert>
						) : contracts.length === 0 ? (
							<div className="rounded-lg border border-dashed px-4 py-10 text-center">
								<FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
								<p className="font-medium">No employment contracts</p>
								<p className="mt-1 text-sm text-muted-foreground">Add an employment contract before creating a partial-pay record.</p>
							</div>
						) : (
							<Form {...form}>
								<form onSubmit={form.handleSubmit(handlePreview)} className="space-y-4 rounded-lg border p-4">
									{requestError && (
										<Alert variant="destructive">
											<AlertCircle />
											<AlertTitle>Unable to prepare partial pay</AlertTitle>
											<AlertDescription>{requestError}</AlertDescription>
										</Alert>
									)}
									<div className="grid gap-4 sm:grid-cols-2">
										<FormSelect control={form.control} name="contractId" label="Employment contract" placeholder="Select a contract" options={contracts.map((contract) => ({ value: String(contract.id), label: getContractLabel(contract) }))} parseValue={(value) => Number(value)} disabled={isPreviewing || isCreating} />
										<FormSelect control={form.control} name="kind" label="Partial-pay kind" options={[{ value: "first_month", label: "First-month pay" }, { value: "termination", label: "Termination pay" }]} disabled={isPreviewing || isCreating} />
									</div>
									<Alert>
										<Info />
										<AlertTitle>{kind === "first_month" ? "First-month policy rule" : "Termination calculation rule"}</AlertTitle>
										<AlertDescription>{kindExplanation}</AlertDescription>
									</Alert>
									<DialogFooter>
										<Button type="submit" disabled={isPreviewing || isCreating || !form.formState.isValid}>
											{isPreviewing && <Loader2 className="animate-spin" />}
											Get server preview
										</Button>
									</DialogFooter>
								</form>
							</Form>
						)}

						{preview && (
							<section className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
								<div>
									<h4 className="font-semibold">Server preview</h4>
									<p className="text-sm text-muted-foreground">Review the immutable server calculation before creating the draft.</p>
								</div>
								<PartialPayCalculationDetails calculation={preview} />
								<DialogFooter className="gap-2">
									<Button type="button" variant="outline" onClick={() => setPreview(null)} disabled={isCreating}>Change details</Button>
									<Button type="button" onClick={() => void handleCreate()} disabled={isCreating}>
										{isCreating && <Loader2 className="animate-spin" />}
										Create draft
									</Button>
								</DialogFooter>
							</section>
						)}
					</section>

					{partialPaysQuery.isLoading ? (
						<div className="space-y-3"><Skeleton className="h-36 w-full" /><Skeleton className="h-48 w-full" /></div>
					) : partialPaysQuery.isError ? (
						<Alert variant="destructive">
							<AlertCircle />
							<AlertTitle>Unable to load partial pays</AlertTitle>
							<AlertDescription className="flex flex-wrap items-center gap-2"><span>{handleApiError(partialPaysQuery.error)}</span><Button type="button" variant="outline" size="sm" onClick={() => partialPaysQuery.refetch()}>Try again</Button></AlertDescription>
						</Alert>
					) : partialPaysQuery.data ? (
						<div className="space-y-6">
							<PartialPaySummaryCards summary={partialPaysQuery.data.summary} />

							<section className="space-y-3 border-t pt-5">
								<div>
									<h3 className="font-semibold">Draft records{` (${partialPaysQuery.data.summary.draftCount})`}</h3>
									<p className="text-sm text-muted-foreground">Draft calculations can be approved into payroll or cancelled with an optional review note.</p>
								</div>
								{draftRecords.length > 0 ? <div className="space-y-3">{draftRecords.map((partialPay) => <PartialPayRecordDetails key={partialPay.id} partialPay={partialPay} canManage={canManage} isActioning={isActioning} onAction={openActionDialog} />)}</div> : <p className="py-2 text-sm text-muted-foreground">No draft partial-pay records.</p>}
							</section>

							<section className="space-y-3 border-t pt-5">
								<div>
									<h3 className="font-semibold">Partial-pay history</h3>
									<p className="text-sm text-muted-foreground">Approved and cancelled records retain their financial and policy snapshots.</p>
								</div>
								{historicalRecords.length > 0 ? <div className="space-y-3">{historicalRecords.map((partialPay) => <PartialPayRecordDetails key={partialPay.id} partialPay={partialPay} canManage={canManage} isActioning={isActioning} onAction={openActionDialog} />)}</div> : records.length === 0 ? (
									<div className="rounded-lg border border-dashed px-4 py-10 text-center">
										<FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
										<p className="font-medium">No partial pays for {monthFormatter.format(new Date(year, month - 1, 1))} {year}</p>
										<p className="mt-1 text-sm text-muted-foreground">Server-created partial-pay records will appear here.</p>
									</div>
								) : <p className="py-2 text-sm text-muted-foreground">No approved or cancelled partial-pay records.</p>}
							</section>
						</div>
					) : null}
				</DialogContent>
			</Dialog>

			<AlertDialog open={Boolean(pendingAction)} onOpenChange={(isOpen) => !isOpen && resetAction()}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{pendingAction ? `${actionLabels[pendingAction.action]} partial pay?` : "Confirm partial-pay action"}</AlertDialogTitle>
						<AlertDialogDescription>{actionDescription}</AlertDialogDescription>
					</AlertDialogHeader>
					{actionError && (
						<Alert variant="destructive">
							<AlertCircle />
							<AlertTitle>Unable to update partial pay</AlertTitle>
							<AlertDescription>{actionError}</AlertDescription>
						</Alert>
					)}
					<div className="grid gap-2">
						<Label htmlFor="partial-pay-review-note">Review note (optional)</Label>
						<Textarea id="partial-pay-review-note" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Add context for this action" rows={3} disabled={isActioning} />
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isActioning}>Keep draft</AlertDialogCancel>
						<AlertDialogAction disabled={isActioning} className={pendingAction?.action === "cancel" ? "bg-destructive text-white hover:bg-destructive/90" : undefined} onClick={(event) => { event.preventDefault(); void handleAction(); }}>
							{isActioning && <Loader2 className="animate-spin" />}
							{pendingAction ? actionLabels[pendingAction.action] : "Confirm"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
