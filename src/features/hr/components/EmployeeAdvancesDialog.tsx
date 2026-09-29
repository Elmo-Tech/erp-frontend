"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertCircle, Ban, BanknoteArrowUp, Check, FileText, Info, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FormInput, FormTextarea } from "@/components/shared";
import { handleApiError } from "@/lib/errorHandling";
import { useApproveEmployeeAdvance, useCancelEmployeeAdvance, useCreateEmployeeAdvance, useDisburseEmployeeAdvance, useEmployeeAdvances, useRejectEmployeeAdvance, useSettleEmployeeAdvanceSettlement } from "../hooks/useEmployeeAdvances";
import { buildEmployeeAdvancePayload, employeeAdvanceFormSchema, formatEmployeeAdvanceAmount, getCurrentEmployeeAdvancePeriod, getDefaultEmployeeAdvanceFormValues, getEmployeeAdvanceStatusLabel, isScheduledEmployeeAdvanceSettlement, isValidEmployeeAdvanceAmount } from "../lib/employee-advances";
import type { EmployeeAdvance, EmployeeAdvanceFormValues, EmployeeAdvancePolicySnapshot, EmployeeAdvanceSettlement, EmployeeAdvanceStatus, EmployeeAdvanceSummary } from "../types/employee-advances";

interface EmployeeAdvancesDialogProps {
	employeeId: number;
	employeeName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	canManage: boolean;
}

type EmployeeAdvanceAction = "approve" | "reject" | "cancel" | "disburse" | "settle";

interface PendingEmployeeAdvanceAction {
	advance: EmployeeAdvance;
	action: EmployeeAdvanceAction;
	settlement?: EmployeeAdvanceSettlement;
}

const statusVariants: Record<EmployeeAdvanceStatus, BadgeProps["variant"]> = {
	pending: "secondary",
	approved: "default",
	rejected: "destructive",
	cancelled: "outline",
	disbursed: "default",
	settled: "outline",
};

const actionLabels: Record<EmployeeAdvanceAction, string> = {
	approve: "Approve",
	reject: "Reject",
	cancel: "Cancel",
	disburse: "Record disbursement",
	settle: "Settle recovery",
};

const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "long" });

function formatAdvanceDate(value: string): string {
	const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
	if (Number.isNaN(date.getTime())) return value;

	return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatAdvanceDateTime(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;

	return date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function getPolicySnapshotValue(snapshot: EmployeeAdvancePolicySnapshot | null, key: string): unknown {
	if (!snapshot) return undefined;
	if (snapshot[key] !== undefined) return snapshot[key];
	return snapshot.settings?.[key];
}

function EmployeeAdvanceSummaryCards({ summary }: { summary: EmployeeAdvanceSummary }) {
	const cards = [
		{ label: "Requested", value: formatEmployeeAdvanceAmount(summary.requestedAmount) },
		{ label: "Approved", value: formatEmployeeAdvanceAmount(summary.approvedAmount) },
		{ label: "Disbursed", value: formatEmployeeAdvanceAmount(summary.disbursedAmount) },
		{ label: "Outstanding", value: formatEmployeeAdvanceAmount(summary.outstandingAmount) },
		{ label: "Scheduled recovery", value: formatEmployeeAdvanceAmount(summary.scheduledSettlementAmount) },
	];

	return (
		<section className="space-y-3">
			<div>
				<h3 className="font-semibold">Period summary</h3>
				<p className="text-sm text-muted-foreground">Requested, approved, disbursed, and scheduled payroll recoveries for the selected month.</p>
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

function EmployeeAdvanceDetails({ advance, canManage, isActioning, onAction }: { advance: EmployeeAdvance; canManage: boolean; isActioning: boolean; onAction: (advance: EmployeeAdvance, action: EmployeeAdvanceAction, settlement?: EmployeeAdvanceSettlement) => void }) {
	const settlementRule = getPolicySnapshotValue(advance.policySnapshot, "advanceSettlement");
	const installmentsAllowed = getPolicySnapshotValue(advance.policySnapshot, "allowAdvanceInstallments");

	return (
		<div className="rounded-lg border bg-muted/20 p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<h4 className="font-medium">Advance #{advance.id}</h4>
						<Badge variant={statusVariants[advance.status]}>{getEmployeeAdvanceStatusLabel(advance.status)}</Badge>
					</div>
					<p className="text-sm text-muted-foreground">Requested {formatAdvanceDateTime(advance.createdAt)}</p>
				</div>
				{canManage && advance.status === "pending" && (
					<div className="flex flex-wrap gap-2">
						<Button type="button" size="sm" disabled={isActioning} onClick={() => onAction(advance, "approve")}>
							<Check />
							Approve
						</Button>
						<Button type="button" size="sm" variant="destructive" disabled={isActioning} onClick={() => onAction(advance, "reject")}>
							<X />
							Reject
						</Button>
						<Button type="button" size="sm" variant="outline" disabled={isActioning} onClick={() => onAction(advance, "cancel")}>
							<Ban />
							Cancel
						</Button>
					</div>
				)}
				{canManage && advance.status === "approved" && (
					<div className="flex flex-wrap gap-2">
						<Button type="button" size="sm" disabled={isActioning} onClick={() => onAction(advance, "disburse")}>
							<BanknoteArrowUp />
							Record disbursement
						</Button>
						<Button type="button" size="sm" variant="outline" disabled={isActioning} onClick={() => onAction(advance, "cancel")}>
							<Ban />
							Cancel
						</Button>
					</div>
				)}
			</div>

			<dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
				<div>
					<dt className="text-muted-foreground">Requested amount</dt>
					<dd className="font-medium">{formatEmployeeAdvanceAmount(advance.requestedAmount)}</dd>
				</div>
				{advance.approvedAmount !== null && (
					<div>
						<dt className="text-muted-foreground">Approved amount</dt>
						<dd className="font-medium">{formatEmployeeAdvanceAmount(advance.approvedAmount)}</dd>
					</div>
				)}
				{advance.disbursedAmount !== null && (
					<div>
						<dt className="text-muted-foreground">Disbursed amount</dt>
						<dd className="font-medium">{formatEmployeeAdvanceAmount(advance.disbursedAmount)}</dd>
					</div>
				)}
				<div>
					<dt className="text-muted-foreground">Outstanding balance</dt>
					<dd className="font-medium">{formatEmployeeAdvanceAmount(advance.outstandingAmount)}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Installments</dt>
					<dd className="font-medium">{advance.installmentCount}</dd>
				</div>
				{advance.approvedAt && (
					<div>
						<dt className="text-muted-foreground">Approved</dt>
						<dd className="font-medium">{formatAdvanceDateTime(advance.approvedAt)}</dd>
					</div>
				)}
				{advance.disbursedAt && (
					<div>
						<dt className="text-muted-foreground">Disbursed</dt>
						<dd className="font-medium">{formatAdvanceDateTime(advance.disbursedAt)}</dd>
					</div>
				)}
				{advance.disbursementReference && (
					<div>
						<dt className="text-muted-foreground">Disbursement reference</dt>
						<dd className="font-medium">{advance.disbursementReference}</dd>
					</div>
				)}
			</dl>

			<div className="mt-4 space-y-2 border-t pt-3 text-sm text-muted-foreground">
				<p>Reason: {advance.reason}</p>
				{advance.reviewNote && <p>Review note: {advance.reviewNote}</p>}
				{advance.policyVersionId !== null && <p>Policy version at approval: #{advance.policyVersionId}</p>}
				{advance.salaryAtApproval !== null && <p>Salary at approval: {formatEmployeeAdvanceAmount(advance.salaryAtApproval)}</p>}
				{advance.advanceLimitAmount !== null && <p>Advance limit at approval: {formatEmployeeAdvanceAmount(advance.advanceLimitAmount)}</p>}
				{typeof settlementRule === "string" && <p>Snapshot settlement rule: {settlementRule}</p>}
				{typeof installmentsAllowed === "boolean" && <p>Snapshot installments: {installmentsAllowed ? "allowed" : "not allowed"}</p>}
				{advance.policySnapshot && <p>Policy snapshot retained with this advance.</p>}
			</div>

			{advance.settlements.length > 0 && (
				<section className="mt-4 space-y-3 border-t pt-4">
					<div>
						<h5 className="font-medium">Recovery schedule</h5>
						<p className="text-sm text-muted-foreground">Scheduled recovery is separate from the advance disbursement. Settled recovery is recorded per installment.</p>
					</div>
					<div className="space-y-2">
						{[...advance.settlements].sort((left, right) => left.sequence - right.sequence).map((settlement) => (
							<div key={settlement.id} className="flex flex-col gap-3 rounded-md border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
								<div className="grid gap-1 text-sm">
									<p className="font-medium">Recovery {settlement.sequence}: {formatEmployeeAdvanceAmount(settlement.scheduledAmount)}</p>
									<p className="text-muted-foreground">Due {formatAdvanceDate(settlement.dueOn)}. {settlement.status === "settled" ? "Settled recovery" : "Scheduled recovery"}.</p>
									{settlement.settledAt && <p className="text-muted-foreground">Settled {formatAdvanceDateTime(settlement.settledAt)}{settlement.settlementReference ? ` (${settlement.settlementReference})` : ""}</p>}
								</div>
								<div className="flex items-center gap-2">
									<Badge variant={settlement.status === "settled" ? "outline" : "secondary"}>{settlement.status === "settled" ? "Settled" : "Scheduled"}</Badge>
									{canManage && isScheduledEmployeeAdvanceSettlement(settlement) && (
										<Button type="button" size="sm" disabled={isActioning} onClick={() => onAction(advance, "settle", settlement)}>Settle recovery</Button>
									)}
								</div>
							</div>
						))}
					</div>
				</section>
			)}
		</div>
	);
}

export function EmployeeAdvancesDialog({ employeeId, employeeName, open, onOpenChange, canManage }: EmployeeAdvancesDialogProps) {
	const currentPeriod = getCurrentEmployeeAdvancePeriod();
	const [year, setYear] = useState(currentPeriod.year);
	const [month, setMonth] = useState(currentPeriod.month);
	const [pendingAction, setPendingAction] = useState<PendingEmployeeAdvanceAction | null>(null);
	const [requestError, setRequestError] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [reviewNote, setReviewNote] = useState("");
	const [approvedAmount, setApprovedAmount] = useState("");
	const [reference, setReference] = useState("");
	const advancesQuery = useEmployeeAdvances(employeeId, year, month, open && canManage);
	const createAdvance = useCreateEmployeeAdvance();
	const approveAdvance = useApproveEmployeeAdvance();
	const rejectAdvance = useRejectEmployeeAdvance();
	const cancelAdvance = useCancelEmployeeAdvance();
	const disburseAdvance = useDisburseEmployeeAdvance();
	const settleRecovery = useSettleEmployeeAdvanceSettlement();
	const form = useForm<EmployeeAdvanceFormValues>({
		resolver: zodResolver(employeeAdvanceFormSchema),
		mode: "onChange",
		defaultValues: getDefaultEmployeeAdvanceFormValues(),
	});
	const advances = [...(advancesQuery.data?.advances ?? [])].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
	const pendingAdvances = advances.filter((advance) => advance.status === "pending");
	const approvedAdvances = advances.filter((advance) => advance.status === "approved");
	const historicalAdvances = advances.filter((advance) => advance.status !== "pending" && advance.status !== "approved");
	const isRequesting = createAdvance.isPending;
	const isActioning = approveAdvance.isPending || rejectAdvance.isPending || cancelAdvance.isPending || disburseAdvance.isPending || settleRecovery.isPending;
	const approvedAmountInvalid = Boolean(approvedAmount.trim()) && !isValidEmployeeAdvanceAmount(Number(approvedAmount));
	const yearOptions = Array.from({ length: 11 }, (_, index) => currentPeriod.year - 5 + index);

	const resetAction = () => {
		setPendingAction(null);
		setActionError(null);
		setReviewNote("");
		setApprovedAmount("");
		setReference("");
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setRequestError(null);
			resetAction();
		}
		onOpenChange(isOpen);
	};

	const openActionDialog = (advance: EmployeeAdvance, action: EmployeeAdvanceAction, settlement?: EmployeeAdvanceSettlement) => {
		setPendingAction({ advance, action, settlement });
		setActionError(null);
		setReviewNote("");
		setApprovedAmount("");
		setReference("");
	};

	const handleRequestSubmit = async (values: EmployeeAdvanceFormValues) => {
		setRequestError(null);
		try {
			await createAdvance.mutateAsync({ employeeId, payload: buildEmployeeAdvancePayload(values) });
			toast.success("Advance request submitted for approval");
			form.reset(getDefaultEmployeeAdvanceFormValues());
		} catch (error) {
			const message = handleApiError(error);
			setRequestError(message);
			toast.error(message);
		}
	};

	const handleActionSubmit = async () => {
		const actionRequest = pendingAction;
		if (!actionRequest || approvedAmountInvalid) return;

		setActionError(null);
		const trimmedReviewNote = reviewNote.trim();
		const trimmedReference = reference.trim();

		try {
			if (actionRequest.action === "approve") {
				await approveAdvance.mutateAsync({
					id: actionRequest.advance.id,
					employeeId,
					payload: {
						...(approvedAmount.trim() ? { approvedAmount: Number(approvedAmount) } : {}),
						...(trimmedReviewNote ? { reviewNote: trimmedReviewNote } : {}),
					},
				});
			} else if (actionRequest.action === "reject") {
				await rejectAdvance.mutateAsync({ id: actionRequest.advance.id, employeeId, payload: trimmedReviewNote ? { reviewNote: trimmedReviewNote } : {} });
			} else if (actionRequest.action === "cancel") {
				await cancelAdvance.mutateAsync({ id: actionRequest.advance.id, employeeId, payload: trimmedReviewNote ? { reviewNote: trimmedReviewNote } : {} });
			} else if (actionRequest.action === "disburse") {
				await disburseAdvance.mutateAsync({ id: actionRequest.advance.id, employeeId, payload: trimmedReference ? { disbursementReference: trimmedReference } : {} });
			} else {
				if (!actionRequest.settlement) return;
				await settleRecovery.mutateAsync({ id: actionRequest.settlement.id, employeeId, payload: trimmedReference ? { settlementReference: trimmedReference } : {} });
			}

			toast.success(
				actionRequest.action === "approve"
					? "Advance approved"
					: actionRequest.action === "reject"
						? "Advance rejected"
						: actionRequest.action === "cancel"
							? "Advance cancelled"
							: actionRequest.action === "disburse"
								? "Advance disbursement recorded"
								: "Scheduled recovery settled",
			);
			resetAction();
		} catch (error) {
			const message = handleApiError(error);
			setActionError(message);
			toast.error(message);
		}
	};

	if (!canManage) return null;

	const actionDescription = pendingAction
		? pendingAction.action === "approve"
			? `Approve the ${formatEmployeeAdvanceAmount(pendingAction.advance.requestedAmount)} advance request. You may approve a lower amount and add a review note.`
			: pendingAction.action === "reject"
				? `Reject the ${formatEmployeeAdvanceAmount(pendingAction.advance.requestedAmount)} advance request. You can add an optional review note.`
				: pendingAction.action === "cancel"
					? `Cancel advance #${pendingAction.advance.id}. This is available before the advance is disbursed.`
					: pendingAction.action === "disburse"
						? `Record disbursement for advance #${pendingAction.advance.id}. Disbursement pays the advance; it does not settle the scheduled payroll recovery.`
						: `Settle recovery ${pendingAction.settlement?.sequence ?? ""} for ${formatEmployeeAdvanceAmount(pendingAction.settlement?.scheduledAmount)}. This records a scheduled recovery, not the advance disbursement.`
		: "Confirm the advance action.";

	return (
		<>
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
					<DialogHeader>
						<DialogTitle>Advances: {employeeName}</DialogTitle>
						<DialogDescription>Submit, approve, disburse, and track employee advance recovery for the selected period.</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h3 className="font-semibold">Period overview</h3>
							<p className="text-sm text-muted-foreground">Summary, requests, and scheduled recovery are filtered by year and month.</p>
						</div>
						<div className="grid grid-cols-2 gap-2 sm:w-64">
							<Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
								<SelectTrigger aria-label="Advances year"><SelectValue /></SelectTrigger>
								<SelectContent>
									{yearOptions.map((option) => <SelectItem key={option} value={String(option)}>{option}</SelectItem>)}
								</SelectContent>
							</Select>
							<Select value={String(month)} onValueChange={(value) => setMonth(Number(value))}>
								<SelectTrigger aria-label="Advances month"><SelectValue /></SelectTrigger>
								<SelectContent>
									{Array.from({ length: 12 }, (_, index) => index + 1).map((option) => <SelectItem key={option} value={String(option)}>{monthFormatter.format(new Date(2000, option - 1, 1))}</SelectItem>)}
								</SelectContent>
							</Select>
						</div>
					</div>

					<Alert>
						<Info />
						<AlertTitle>Disbursement and recovery are separate</AlertTitle>
						<AlertDescription>Recording a disbursement pays the approved advance. It does not settle it; each scheduled payroll recovery must be settled separately.</AlertDescription>
					</Alert>

					<section className="space-y-3">
						<div>
							<h3 className="font-semibold">Request advance</h3>
							<p className="text-sm text-muted-foreground">The server applies the policy cap and validates whether the selected installment count is allowed.</p>
						</div>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(handleRequestSubmit)} onChange={() => setRequestError(null)} className="space-y-4 rounded-lg border p-4">
								{requestError && (
									<Alert variant="destructive">
										<AlertCircle />
										<AlertTitle>Unable to submit advance request</AlertTitle>
										<AlertDescription>{requestError}</AlertDescription>
									</Alert>
								)}
								<div className="grid gap-4 sm:grid-cols-2">
									<FormInput control={form.control} name="requestedAmount" label="Requested amount" type="number" min={0.01} step="0.01" placeholder="0.00" disabled={isRequesting} />
									<FormInput control={form.control} name="installmentCount" label="Installments" type="number" min={1} max={12} step={1} disabled={isRequesting} />
								</div>
								<FormTextarea control={form.control} name="reason" label="Reason" placeholder="Explain why this advance is requested" rows={3} disabled={isRequesting} />
								<DialogFooter>
									<Button type="submit" disabled={isRequesting || !form.formState.isValid}>
										{isRequesting && <Loader2 className="animate-spin" />}
										Submit for approval
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</section>

					{advancesQuery.isLoading ? (
						<div className="space-y-3"><Skeleton className="h-36 w-full" /><Skeleton className="h-48 w-full" /></div>
					) : advancesQuery.isError ? (
						<Alert variant="destructive">
							<AlertCircle />
							<AlertTitle>Unable to load advances</AlertTitle>
							<AlertDescription className="flex flex-wrap items-center gap-2"><span>{handleApiError(advancesQuery.error)}</span><Button type="button" variant="outline" size="sm" onClick={() => advancesQuery.refetch()}>Try again</Button></AlertDescription>
						</Alert>
					) : advancesQuery.data ? (
						<div className="space-y-6">
							<EmployeeAdvanceSummaryCards summary={advancesQuery.data.summary} />

							<section className="space-y-3 border-t pt-5">
								<div>
									<h3 className="font-semibold">Pending requests{` (${advancesQuery.data.summary.pendingCount})`}</h3>
									<p className="text-sm text-muted-foreground">Requests awaiting a manager decision.</p>
								</div>
								{pendingAdvances.length > 0 ? <div className="space-y-3">{pendingAdvances.map((advance) => <EmployeeAdvanceDetails key={advance.id} advance={advance} canManage={canManage} isActioning={isActioning} onAction={openActionDialog} />)}</div> : <p className="py-2 text-sm text-muted-foreground">No pending advance requests.</p>}
							</section>

							<section className="space-y-3 border-t pt-5">
								<div>
									<h3 className="font-semibold">Approved advances</h3>
									<p className="text-sm text-muted-foreground">Approved advances that are ready to be disbursed or cancelled before disbursement.</p>
								</div>
								{approvedAdvances.length > 0 ? <div className="space-y-3">{approvedAdvances.map((advance) => <EmployeeAdvanceDetails key={advance.id} advance={advance} canManage={canManage} isActioning={isActioning} onAction={openActionDialog} />)}</div> : <p className="py-2 text-sm text-muted-foreground">No approved advances awaiting disbursement.</p>}
							</section>

							<section className="space-y-3 border-t pt-5">
								<div>
									<h3 className="font-semibold">Advance history</h3>
									<p className="text-sm text-muted-foreground">Disbursed, settled, rejected, and cancelled advances with their recovery status.</p>
								</div>
								{historicalAdvances.length > 0 ? <div className="space-y-3">{historicalAdvances.map((advance) => <EmployeeAdvanceDetails key={advance.id} advance={advance} canManage={canManage} isActioning={isActioning} onAction={openActionDialog} />)}</div> : advances.length === 0 ? (
									<div className="rounded-lg border border-dashed px-4 py-10 text-center">
										<FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
										<p className="font-medium">No advances for {monthFormatter.format(new Date(year, month - 1, 1))} {year}</p>
										<p className="mt-1 text-sm text-muted-foreground">Submitted advance requests will appear here.</p>
									</div>
								) : <p className="py-2 text-sm text-muted-foreground">No completed or closed advances for this period.</p>}
							</section>
						</div>
					) : null}
				</DialogContent>
			</Dialog>

			<AlertDialog open={Boolean(pendingAction)} onOpenChange={(isOpen) => !isOpen && resetAction()}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{pendingAction ? `${actionLabels[pendingAction.action]} advance?` : "Confirm advance action"}</AlertDialogTitle>
						<AlertDialogDescription>{actionDescription}</AlertDialogDescription>
					</AlertDialogHeader>
					{actionError && (
						<Alert variant="destructive">
							<AlertCircle />
							<AlertTitle>Unable to update advance</AlertTitle>
							<AlertDescription>{actionError}</AlertDescription>
						</Alert>
					)}
					{pendingAction?.action === "approve" && (
						<div className="grid gap-2">
							<Label htmlFor="advance-approved-amount">Approved amount (optional)</Label>
							<Input id="advance-approved-amount" type="number" min={0.01} step="0.01" value={approvedAmount} onChange={(event) => setApprovedAmount(event.target.value)} placeholder={`Requested: ${formatEmployeeAdvanceAmount(pendingAction.advance.requestedAmount)}`} disabled={isActioning} aria-invalid={approvedAmountInvalid} />
							{approvedAmountInvalid && <p className="text-sm text-destructive">Enter a positive amount with at most two decimal places.</p>}
						</div>
					)}
					{(pendingAction?.action === "approve" || pendingAction?.action === "reject" || pendingAction?.action === "cancel") && (
						<div className="grid gap-2">
							<Label htmlFor="advance-review-note">Review note (optional)</Label>
							<Textarea id="advance-review-note" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Add context for this action" rows={3} disabled={isActioning} />
						</div>
					)}
					{(pendingAction?.action === "disburse" || pendingAction?.action === "settle") && (
						<div className="grid gap-2">
							<Label htmlFor="advance-reference">{pendingAction.action === "disburse" ? "Disbursement reference" : "Settlement reference"} (optional)</Label>
							<Input id="advance-reference" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Bank, cash, or payroll reference" disabled={isActioning} />
						</div>
					)}
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isActioning}>Keep advance</AlertDialogCancel>
						<AlertDialogAction disabled={isActioning || approvedAmountInvalid} className={pendingAction?.action === "reject" || pendingAction?.action === "cancel" ? "bg-destructive text-white hover:bg-destructive/90" : undefined} onClick={(event) => { event.preventDefault(); void handleActionSubmit(); }}>
							{isActioning && <Loader2 className="animate-spin" />}
							{pendingAction ? actionLabels[pendingAction.action] : "Confirm"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
