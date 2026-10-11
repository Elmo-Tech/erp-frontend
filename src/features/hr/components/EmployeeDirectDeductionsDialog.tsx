"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertCircle, Ban, Check, FileText, Info, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FormInput, FormSelect, FormTextarea } from "@/components/shared";
import { handleApiError } from "@/lib/errorHandling";
import { useAuthStore } from "@/store/authStore";
import { useActiveDirectDeductionTypes, useApproveEmployeeDirectDeduction, useCancelEmployeeDirectDeduction, useCreateEmployeeDirectDeduction, useEmployeeDirectDeductions, useRejectEmployeeDirectDeduction } from "../hooks/useDirectEmployeeDeductions";
import { buildDirectEmployeeDeductionPayload, directEmployeeDeductionFormSchema, getDefaultDirectEmployeeDeductionFormValues, isValidDirectDeductionDate } from "../lib/direct-employee-deductions";
import type { DirectEmployeeDeduction, DirectEmployeeDeductionFormValues, DirectEmployeeDeductionStatus } from "../types/direct-employee-deductions";

interface EmployeeDirectDeductionsPanelProps {
	employeeId: number;
	employeeName: string;
	canManage: boolean;
	isActive: boolean;
}

type DirectDeductionReviewAction = "approve" | "reject" | "cancel";

interface PendingDirectDeductionReview {
	deduction: DirectEmployeeDeduction;
	action: DirectDeductionReviewAction;
}

const statusLabels: Record<DirectEmployeeDeductionStatus, string> = {
	pending: "Pending",
	approved: "Approved",
	rejected: "Rejected",
	cancelled: "Cancelled",
};

const statusVariants: Record<DirectEmployeeDeductionStatus, BadgeProps["variant"]> = {
	pending: "secondary",
	approved: "default",
	rejected: "destructive",
	cancelled: "outline",
};

const reviewActionLabels: Record<DirectDeductionReviewAction, string> = {
	approve: "Approve",
	reject: "Reject",
	cancel: "Cancel",
};

const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "long" });

function formatDeductionDate(value: string): string {
	if (!isValidDirectDeductionDate(value)) return value;

	return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatDeductionDateTime(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;

	return date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatDeductionAmount(amount: number): string {
	return Number.isFinite(amount) ? amount.toFixed(2) : String(amount);
}

function DirectDeductionSummary({ approvedAmount, pendingCount, approvedCount }: { approvedAmount: number; pendingCount: number; approvedCount: number }) {
	return (
		<section className="space-y-3">
			<div>
				<h3 className="font-semibold">Monthly summary</h3>
				<p className="text-sm text-muted-foreground">Approved amounts are payroll adjustments for the selected month.</p>
			</div>
			<div className="grid gap-3 sm:grid-cols-3">
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Approved amount</p>
					<p className="mt-1 text-xl font-semibold">{formatDeductionAmount(approvedAmount)}</p>
				</div>
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Pending</p>
					<p className="mt-1 text-xl font-semibold">{pendingCount}</p>
				</div>
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Approved</p>
					<p className="mt-1 text-xl font-semibold">{approvedCount}</p>
				</div>
			</div>
		</section>
	);
}

function DirectDeductionDetails({ deduction, canReview, isReviewing, onReview }: { deduction: DirectEmployeeDeduction; canReview: boolean; isReviewing: boolean; onReview: (deduction: DirectEmployeeDeduction, action: DirectDeductionReviewAction) => void }) {
	return (
		<div className="rounded-lg border bg-muted/20 p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<h4 className="font-medium">{deduction.deductionType.name}</h4>
						<Badge variant={statusVariants[deduction.status]}>{statusLabels[deduction.status]}</Badge>
					</div>
					<p className="text-sm text-muted-foreground">{formatDeductionDate(deduction.deductionDate)}</p>
				</div>
				<div className="flex flex-col items-start gap-2 sm:items-end">
					<p className="text-lg font-semibold">{formatDeductionAmount(deduction.amount)}</p>
					{deduction.status === "pending" && canReview && (
						<div className="flex flex-wrap gap-2">
							<Button type="button" size="sm" disabled={isReviewing} onClick={() => onReview(deduction, "approve")}>
								<Check />
								Approve
							</Button>
							<Button type="button" size="sm" variant="destructive" disabled={isReviewing} onClick={() => onReview(deduction, "reject")}>
								<X />
								Reject
							</Button>
							<Button type="button" size="sm" variant="outline" disabled={isReviewing} onClick={() => onReview(deduction, "cancel")}>
								<Ban />
								Cancel
							</Button>
						</div>
					)}
				</div>
			</div>

			<dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
				<div>
					<dt className="text-muted-foreground">Submitted</dt>
					<dd className="font-medium">{formatDeductionDateTime(deduction.createdAt)}</dd>
				</div>
				{deduction.approvedAt && (
					<div>
						<dt className="text-muted-foreground">Approved</dt>
						<dd className="font-medium">{formatDeductionDateTime(deduction.approvedAt)}</dd>
					</div>
				)}
				{deduction.approvedBy != null && (
					<div>
						<dt className="text-muted-foreground">Approved by</dt>
						<dd className="font-medium">User #{deduction.approvedBy}</dd>
					</div>
				)}
			</dl>

			<p className="mt-4 border-t pt-3 text-sm text-muted-foreground">Reason: {deduction.reason}</p>
			{deduction.rejectionReason && <p className="mt-2 text-sm text-muted-foreground">Rejection reason: {deduction.rejectionReason}</p>}
			{deduction.salaryAdjustmentId != null && <p className="mt-2 text-sm font-medium">Linked payroll adjustment: #{deduction.salaryAdjustmentId}</p>}
		</div>
	);
}

export function EmployeeDirectDeductionsPanel({ employeeId, employeeName, canManage, isActive }: EmployeeDirectDeductionsPanelProps) {
	const today = new Date();
	const [year, setYear] = useState(today.getFullYear());
	const [month, setMonth] = useState(today.getMonth() + 1);
	const [pendingReview, setPendingReview] = useState<PendingDirectDeductionReview | null>(null);
	const [reviewNote, setReviewNote] = useState("");
	const deductionsQuery = useEmployeeDirectDeductions(employeeId, year, month, isActive && canManage);
	const deductionTypesQuery = useActiveDirectDeductionTypes(isActive && canManage);
	const createDeduction = useCreateEmployeeDirectDeduction();
	const approveDeduction = useApproveEmployeeDirectDeduction();
	const rejectDeduction = useRejectEmployeeDirectDeduction();
	const cancelDeduction = useCancelEmployeeDirectDeduction();
	const form = useForm<DirectEmployeeDeductionFormValues>({
		resolver: zodResolver(directEmployeeDeductionFormSchema),
		mode: "onChange",
		defaultValues: getDefaultDirectEmployeeDeductionFormValues(today),
	});
	const deductionTypes = [...(deductionTypesQuery.data ?? [])].sort((left, right) => left.name.localeCompare(right.name));
	const deductions = [...(deductionsQuery.data?.deductions ?? [])].sort((left, right) => right.deductionDate.localeCompare(left.deductionDate) || right.createdAt.localeCompare(left.createdAt));
	const pendingDeductions = deductions.filter((deduction) => deduction.status === "pending");
	const historicalDeductions = deductions.filter((deduction) => deduction.status !== "pending");
	const summary = deductionsQuery.data?.summary;
	const currentUserId = useAuthStore((state) => state.user?.userId ?? 0);
	// Nobody reviews their own deductions, not even managers: the backend
	// rejects self-approval, so hide the actions instead of showing 403s.
	const isOwnProfile = currentUserId !== 0 && currentUserId === employeeId;
	const canReview = canManage && !isOwnProfile;
	const isReviewing = approveDeduction.isPending || rejectDeduction.isPending || cancelDeduction.isPending;
	const isRequesting = createDeduction.isPending;
	const isRequestDisabled = isRequesting || deductionTypesQuery.isLoading || deductionTypesQuery.isError || deductionTypes.length === 0;
	const yearOptions = Array.from({ length: 11 }, (_, index) => today.getFullYear() - 5 + index);

	const openReviewDialog = (deduction: DirectEmployeeDeduction, action: DirectDeductionReviewAction) => {
		setPendingReview({ deduction, action });
		setReviewNote("");
	};

	const handleRequestSubmit = async (values: DirectEmployeeDeductionFormValues) => {
		try {
			await createDeduction.mutateAsync({ employeeId, payload: buildDirectEmployeeDeductionPayload(values) });
			toast.success("Direct deduction submitted for approval");
			form.reset(getDefaultDirectEmployeeDeductionFormValues());
		} catch (error) {
			toast.error(handleApiError(error));
		}
	};

	const handleReviewSubmit = async () => {
		const review = pendingReview;
		if (!review) return;

		const trimmedReviewNote = reviewNote.trim();
		if (review.action === "reject" && !trimmedReviewNote) return;

		try {
			if (review.action === "approve") {
				const approvedDeduction = await approveDeduction.mutateAsync({ id: review.deduction.id, employeeId, payload: trimmedReviewNote ? { reviewNote: trimmedReviewNote } : undefined });
				toast.success(approvedDeduction.salaryAdjustmentId != null ? `Deduction approved. Payroll adjustment #${approvedDeduction.salaryAdjustmentId} is linked.` : "Deduction approved and payroll adjustment created");
			} else if (review.action === "reject") {
				await rejectDeduction.mutateAsync({ id: review.deduction.id, employeeId, payload: { reviewNote: trimmedReviewNote } });
				toast.success("Direct deduction rejected");
			} else {
				await cancelDeduction.mutateAsync({ id: review.deduction.id, employeeId, payload: trimmedReviewNote ? { reviewNote: trimmedReviewNote } : undefined });
				toast.success("Direct deduction cancelled");
			}
			setPendingReview(null);
			setReviewNote("");
		} catch (error) {
			toast.error(handleApiError(error));
		}
	};

	if (!canManage) return null;

	return (
		<>
			<div className="space-y-5">
				<div>
					<h2 className="text-lg font-semibold">Direct deductions for {employeeName}</h2>
					<p className="text-sm text-muted-foreground">Create and review fixed employee deductions for a selected payroll month.</p>
				</div>

					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h3 className="font-semibold">Payroll period</h3>
							<p className="text-sm text-muted-foreground">Summary and deduction history are filtered by year and month.</p>
						</div>
						<div className="grid grid-cols-2 gap-2 sm:w-64">
							<Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
								<SelectTrigger aria-label="Direct deductions year">
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
								<SelectTrigger aria-label="Direct deductions month">
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
						</div>
					</div>

					<Alert>
						<Info />
						<AlertTitle>Approval is required</AlertTitle>
						<AlertDescription>New direct deductions await approval. Approving one creates exactly one linked payroll adjustment.</AlertDescription>
					</Alert>

					{isOwnProfile && (
						<Alert>
							<Info />
							<AlertTitle>Your own profile</AlertTitle>
							<AlertDescription>Creating or reviewing deductions on your own record requires another manager. History below is read-only.</AlertDescription>
						</Alert>
					)}

					{!isOwnProfile && (
					<section className="space-y-3">
						<div>
							<h3 className="font-semibold">Create direct deduction</h3>
							<p className="text-sm text-muted-foreground">Use a fixed amount and explain why the deduction is needed.</p>
						</div>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(handleRequestSubmit)} className="space-y-4 rounded-lg border p-4">
								{deductionTypesQuery.isLoading ? (
									<div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
										<Loader2 className="animate-spin" />
										Loading available deduction types...
									</div>
								) : deductionTypesQuery.isError ? (
									<Alert variant="destructive">
										<AlertCircle />
										<AlertTitle>Unable to load deduction types</AlertTitle>
										<AlertDescription className="flex flex-wrap items-center gap-2">
											<span>{handleApiError(deductionTypesQuery.error)}</span>
											<Button type="button" variant="outline" size="sm" onClick={() => deductionTypesQuery.refetch()}>
												Try again
											</Button>
										</AlertDescription>
									</Alert>
								) : deductionTypes.length === 0 ? (
									<Alert>
										<Info />
										<AlertTitle>No active deduction types</AlertTitle>
										<AlertDescription>A deduction cannot be submitted until an active type is available.</AlertDescription>
									</Alert>
								) : (
									<FormSelect control={form.control} name="deductionTypeId" label="Deduction type" placeholder="Select a deduction type" options={deductionTypes.map((type) => ({ value: String(type.id), label: type.name }))} disabled={isRequesting} />
								)}

								<div className="grid gap-4 sm:grid-cols-2">
									<FormInput control={form.control} name="deductionDate" label="Deduction date" type="date" disabled={isRequesting} />
									<FormInput control={form.control} name="amount" label="Fixed amount" type="number" min={0.01} step="0.01" placeholder="0.00" disabled={isRequesting} />
								</div>
								<FormTextarea control={form.control} name="reason" label="Reason" placeholder="Explain the deduction" rows={3} disabled={isRequesting} />
								<DialogFooter>
									<Button type="submit" disabled={isRequestDisabled || !form.formState.isValid}>
										{isRequesting && <Loader2 className="animate-spin" />}
										Submit for approval
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</section>
					)}

					{deductionsQuery.isLoading ? (
						<div className="space-y-3">
							<Skeleton className="h-32 w-full" />
							<Skeleton className="h-44 w-full" />
						</div>
					) : deductionsQuery.isError ? (
						<Alert variant="destructive">
							<AlertCircle />
							<AlertTitle>Unable to load direct deductions</AlertTitle>
							<AlertDescription className="flex flex-wrap items-center gap-2">
								<span>{handleApiError(deductionsQuery.error)}</span>
								<Button type="button" variant="outline" size="sm" onClick={() => deductionsQuery.refetch()}>
									Try again
								</Button>
							</AlertDescription>
						</Alert>
					) : summary ? (
						<div className="space-y-6">
							<DirectDeductionSummary {...summary} />

							<section className="space-y-3 border-t pt-5">
								<div>
									<h3 className="font-semibold">Pending deductions</h3>
									<p className="text-sm text-muted-foreground">Deductions awaiting a manager decision.</p>
								</div>
								{pendingDeductions.length > 0 ? (
									<div className="space-y-3">
										{pendingDeductions.map((deduction) => (
											<DirectDeductionDetails key={deduction.id} deduction={deduction} canReview={canReview} isReviewing={isReviewing} onReview={openReviewDialog} />
										))}
									</div>
								) : (
									<p className="py-2 text-sm text-muted-foreground">No pending direct deductions.</p>
								)}
							</section>

							<section className="space-y-3 border-t pt-5">
								<div>
									<h3 className="font-semibold">Deduction history</h3>
									<p className="text-sm text-muted-foreground">Approved, rejected, and cancelled deductions.</p>
								</div>
								{historicalDeductions.length > 0 ? (
									<div className="space-y-3">
										{historicalDeductions.map((deduction) => (
											<DirectDeductionDetails key={deduction.id} deduction={deduction} canReview={canReview} isReviewing={isReviewing} onReview={openReviewDialog} />
										))}
									</div>
								) : deductions.length === 0 ? (
									<div className="rounded-lg border border-dashed px-4 py-10 text-center">
										<FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
										<p className="font-medium">No direct deductions for {monthFormatter.format(new Date(2000, month - 1, 1))} {year}</p>
										<p className="mt-1 text-sm text-muted-foreground">Submitted deductions will appear here.</p>
									</div>
								) : (
									<p className="py-2 text-sm text-muted-foreground">No resolved direct deductions.</p>
								)}
							</section>
						</div>
					) : null}
			</div>

			<AlertDialog
				open={Boolean(pendingReview)}
				onOpenChange={(isOpen) => {
					if (!isOpen) {
						setPendingReview(null);
						setReviewNote("");
					}
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{pendingReview ? `${reviewActionLabels[pendingReview.action]} direct deduction?` : "Review direct deduction"}</AlertDialogTitle>
						<AlertDialogDescription>
							{pendingReview
								? `${reviewActionLabels[pendingReview.action]} the ${formatDeductionAmount(pendingReview.deduction.amount)} ${pendingReview.deduction.deductionType.name} deduction dated ${formatDeductionDate(pendingReview.deduction.deductionDate)}.${pendingReview.action === "approve" ? " This will create one linked payroll adjustment." : ""}`
								: "Confirm the direct deduction action."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="grid gap-2">
						<Label htmlFor="direct-deduction-review-note">Review note {pendingReview?.action === "reject" ? "(required)" : "(optional)"}</Label>
						<Textarea id="direct-deduction-review-note" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder={pendingReview?.action === "reject" ? "Explain why this deduction is rejected" : "Add context for this decision"} rows={3} disabled={isReviewing} />
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isReviewing}>Keep deduction</AlertDialogCancel>
						<AlertDialogAction disabled={isReviewing || (pendingReview?.action === "reject" && !reviewNote.trim())} className={pendingReview?.action === "reject" ? "bg-destructive text-white hover:bg-destructive/90" : undefined} onClick={() => void handleReviewSubmit()}>
							{isReviewing && <Loader2 className="animate-spin" />}
							{pendingReview ? reviewActionLabels[pendingReview.action] : "Confirm"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
