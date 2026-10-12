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
import { useApproveEmployeeLeave, useCancelEmployeeLeave, useCreateEmployeeLeave, useEmployeeLeaves, useLeaveTypes, useRejectEmployeeLeave } from "../hooks/useEmployeeLeaves";
import { buildEmployeeLeavePayload, getDefaultLeaveRequestFormValues, isValidLeaveDate, leaveRequestSchema } from "../lib/leave-management";
import type { EmployeeLeave, EmployeeLeaveStatus, LeaveRequestFormValues } from "../types/leave-management";

interface EmployeeLeavesPanelProps {
	employeeId: number;
	employeeName: string;
	canManage: boolean;
	isActive: boolean;
}

type LeaveReviewAction = "approve" | "reject" | "cancel";

interface PendingLeaveReview {
	leave: EmployeeLeave;
	action: LeaveReviewAction;
}

const statusLabels: Record<EmployeeLeaveStatus, string> = {
	pending: "Pending",
	approved: "Approved",
	rejected: "Rejected",
	cancelled: "Cancelled",
};

const statusVariants: Record<EmployeeLeaveStatus, BadgeProps["variant"]> = {
	pending: "secondary",
	approved: "default",
	rejected: "destructive",
	cancelled: "outline",
};

const reviewActionLabels: Record<LeaveReviewAction, string> = {
	approve: "Approve",
	reject: "Reject",
	cancel: "Cancel",
};

function formatLeaveDate(value: string): string {
	if (!isValidLeaveDate(value)) return value;

	return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatLeaveDateTime(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;

	return date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function getAvailableReviewActions(status: EmployeeLeaveStatus): LeaveReviewAction[] {
	if (status === "pending") return ["approve", "reject", "cancel"];
	if (status === "approved") return ["cancel"];
	return [];
}

function LeaveRequestSummary({ leave, canManage, isReviewing, onReview }: { leave: EmployeeLeave; canManage: boolean; isReviewing: boolean; onReview: (leave: EmployeeLeave, action: LeaveReviewAction) => void }) {
	const actions = getAvailableReviewActions(leave.status);

	return (
		<div className="rounded-lg border bg-muted/20 p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<h4 className="font-medium">{leave.leaveType.name}</h4>
						<Badge variant={statusVariants[leave.status]}>{statusLabels[leave.status]}</Badge>
						<Badge variant="outline">{leave.isPaid ? "Paid" : "Unpaid"}</Badge>
					</div>
					<p className="text-sm text-muted-foreground">
						{formatLeaveDate(leave.startDate)} to {formatLeaveDate(leave.endDate)}
					</p>
				</div>
				{canManage && actions.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{actions.map((action) => (
							<Button
								key={action}
								type="button"
								size="sm"
								variant={action === "approve" ? "default" : action === "reject" ? "destructive" : "outline"}
								disabled={isReviewing}
								onClick={() => onReview(leave, action)}
							>
								{action === "approve" ? <Check /> : action === "reject" ? <X /> : <Ban />}
								{reviewActionLabels[action]}
							</Button>
						))}
					</div>
				)}
			</div>

			<dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
				<div>
					<dt className="text-muted-foreground">Server-confirmed duration</dt>
					<dd className="font-medium">
						{leave.workingDays} working {leave.workingDays === 1 ? "day" : "days"}
					</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Submitted</dt>
					<dd className="font-medium">{formatLeaveDateTime(leave.createdAt)}</dd>
				</div>
				{leave.reviewedAt && (
					<div>
						<dt className="text-muted-foreground">Reviewed</dt>
						<dd className="font-medium">{formatLeaveDateTime(leave.reviewedAt)}</dd>
					</div>
				)}
			</dl>

			{leave.reason && <p className="mt-4 border-t pt-3 text-sm text-muted-foreground">Reason: {leave.reason}</p>}
			{leave.reviewNote && <p className="mt-2 text-sm text-muted-foreground">Review note: {leave.reviewNote}</p>}
		</div>
	);
}

export function EmployeeLeavesPanel({ employeeId, employeeName, canManage, isActive }: EmployeeLeavesPanelProps) {
	const currentYear = new Date().getFullYear();
	const [year, setYear] = useState(currentYear);
	const [pendingReview, setPendingReview] = useState<PendingLeaveReview | null>(null);
	const [reviewNote, setReviewNote] = useState("");
	const leavesQuery = useEmployeeLeaves(employeeId, year, isActive && canManage);
	const leaveTypesQuery = useLeaveTypes(isActive && canManage);
	const createLeave = useCreateEmployeeLeave();
	const approveLeave = useApproveEmployeeLeave();
	const rejectLeave = useRejectEmployeeLeave();
	const cancelLeave = useCancelEmployeeLeave();
	const form = useForm<LeaveRequestFormValues>({
		resolver: zodResolver(leaveRequestSchema),
		mode: "onChange",
		defaultValues: getDefaultLeaveRequestFormValues(),
	});
	const leaveTypes = [...(leaveTypesQuery.data ?? [])].sort((left, right) => left.displayOrder - right.displayOrder || left.name.localeCompare(right.name));
	const leaves = [...(leavesQuery.data?.leaves ?? [])].sort((left, right) => right.startDate.localeCompare(left.startDate));
	const balances = leavesQuery.data?.balances ?? [];
	const pendingLeaves = leaves.filter((leave) => leave.status === "pending");
	const historicalLeaves = leaves.filter((leave) => leave.status !== "pending");
	const isReviewing = approveLeave.isPending || rejectLeave.isPending || cancelLeave.isPending;
	const isRequesting = createLeave.isPending;
	const isRequestDisabled = isRequesting || leaveTypesQuery.isLoading || leaveTypesQuery.isError || leaveTypes.length === 0;
	const yearOptions = Array.from({ length: 11 }, (_, index) => currentYear - 5 + index);

	const handleRequestSubmit = async (values: LeaveRequestFormValues) => {
		try {
			await createLeave.mutateAsync({ employeeId, payload: buildEmployeeLeavePayload(values) });
			// Success toast comes from the backend message via the axios interceptor.
			form.reset(getDefaultLeaveRequestFormValues());
		} catch (error) {
			toast.error(handleApiError(error));
		}
	};

	const handleReviewSubmit = async () => {
		const review = pendingReview;
		if (!review) return;

		const payload = reviewNote.trim() ? { reviewNote: reviewNote.trim() } : undefined;

		try {
			if (review.action === "approve") {
				await approveLeave.mutateAsync({ id: review.leave.id, employeeId, payload });
			} else if (review.action === "reject") {
				await rejectLeave.mutateAsync({ id: review.leave.id, employeeId, payload });
			} else {
				await cancelLeave.mutateAsync({ id: review.leave.id, employeeId, payload });
			}
			// Success toast comes from the backend message via the axios interceptor.
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
					<h2 className="text-lg font-semibold">Leave requests for {employeeName}</h2>
					<p className="text-sm text-muted-foreground">Register leave for the employee. Administrative entries are approved immediately when saved.</p>
				</div>

					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h3 className="font-semibold">Leave overview</h3>
							<p className="text-sm text-muted-foreground">Balances and request history are shown for the selected year.</p>
						</div>
						<Select
							value={String(year)}
							onValueChange={(value) => setYear(Number(value))}
						>
							<SelectTrigger
								className="w-full sm:w-32"
								aria-label="Leave year"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{yearOptions.map((option) => (
									<SelectItem
										key={option}
										value={String(option)}
									>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Alert>
						<Info />
						<AlertTitle>How balances work</AlertTitle>
						<AlertDescription>Saving paid leave consumes its balance immediately. Unpaid leave creates a salary deduction. Cancelling restores the balance or cancels the unprocessed deduction.</AlertDescription>
					</Alert>

					<section className="space-y-3">
						<div>
							<h3 className="font-semibold">Register leave</h3>
							<p className="text-sm text-muted-foreground">The server confirms working-day duration after submission.</p>
						</div>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(handleRequestSubmit)}
								className="space-y-4 rounded-lg border p-4"
							>
								{leaveTypesQuery.isLoading ? (
									<div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
										<Loader2 className="animate-spin" />
										Loading available leave types...
									</div>
								) : leaveTypesQuery.isError ? (
									<Alert variant="destructive">
										<AlertCircle />
										<AlertTitle>Unable to load leave types</AlertTitle>
										<AlertDescription className="flex flex-wrap items-center gap-2">
											<span>{handleApiError(leaveTypesQuery.error)}</span>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => leaveTypesQuery.refetch()}
											>
												Try again
											</Button>
										</AlertDescription>
									</Alert>
								) : leaveTypes.length === 0 ? (
									<Alert>
										<Info />
										<AlertTitle>No leave types available</AlertTitle>
										<AlertDescription>A request cannot be submitted until active leave types are available.</AlertDescription>
									</Alert>
								) : (
									<FormSelect
										control={form.control}
										name="leaveTypeId"
										label="Leave type"
										placeholder="Select a leave type"
										options={leaveTypes.map((type) => ({
											value: String(type.id),
											label: `${type.name} (${type.isPaid ? "paid" : "unpaid"})`,
										}))}
										disabled={isRequesting}
									/>
								)}

								<div className="grid gap-4 sm:grid-cols-2">
									<FormInput
										control={form.control}
										name="startDate"
										label="Start date"
										type="date"
										disabled={isRequesting}
									/>
									<FormInput
										control={form.control}
										name="endDate"
										label="End date"
										type="date"
										disabled={isRequesting}
									/>
								</div>
								<FormTextarea
									control={form.control}
									name="reason"
									label="Reason (optional)"
									placeholder="Add context for this request"
									rows={3}
									disabled={isRequesting}
								/>
								<DialogFooter>
									<Button
										type="submit"
										disabled={isRequestDisabled || !form.formState.isValid}
									>
										{isRequesting && <Loader2 className="animate-spin" />}
										Save leave
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</section>

					{leavesQuery.isLoading ? (
						<div className="space-y-3">
							<Skeleton className="h-28 w-full" />
							<Skeleton className="h-40 w-full" />
						</div>
					) : leavesQuery.isError ? (
						<Alert variant="destructive">
							<AlertCircle />
							<AlertTitle>Unable to load leave requests</AlertTitle>
							<AlertDescription className="flex flex-wrap items-center gap-2">
								<span>{handleApiError(leavesQuery.error)}</span>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => leavesQuery.refetch()}
								>
									Try again
								</Button>
							</AlertDescription>
						</Alert>
					) : (
						<div className="space-y-6">
							<section className="space-y-3">
								<div>
									<h3 className="font-semibold">Balance summary</h3>
									<p className="text-sm text-muted-foreground">Remaining balance reflects approved paid leave.</p>
								</div>
								{balances.length > 0 ? (
									<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
										{balances.map((balance) => (
											<div
												key={balance.leaveTypeId}
												className="rounded-lg border p-4"
											>
												<div className="flex items-center justify-between gap-2">
													<p className="font-medium">{balance.leaveType.name}</p>
													<Badge variant="outline">{balance.leaveType.isPaid ? "Paid" : "Unpaid"}</Badge>
												</div>
												<p className="mt-3 text-2xl font-semibold">{balance.remainingDays} days</p>
												<p className="text-sm text-muted-foreground">{balance.usedDays} used of {balance.allocatedDays} allocated</p>
											</div>
										))}
									</div>
								) : (
									<p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">No leave balances are available for {year}.</p>
								)}
							</section>

							{pendingLeaves.length > 0 && <section className="space-y-3 border-t pt-5">
								<div>
									<h3 className="font-semibold">Pending requests</h3>
									<p className="text-sm text-muted-foreground">Requests awaiting a decision.</p>
								</div>
								{pendingLeaves.length > 0 ? (
									<div className="space-y-3">
										{pendingLeaves.map((leave) => (
											<LeaveRequestSummary
												key={leave.id}
												leave={leave}
												canManage={canManage}
												isReviewing={isReviewing}
												onReview={(selectedLeave, action) => {
													setPendingReview({ leave: selectedLeave, action });
													setReviewNote("");
												}}
											/>
										))}
									</div>
								) : (
									<p className="py-2 text-sm text-muted-foreground">No pending leave requests.</p>
								)}
							</section>}

							<section className="space-y-3 border-t pt-5">
								<div>
									<h3 className="font-semibold">Request history</h3>
									<p className="text-sm text-muted-foreground">Approved, rejected, and cancelled leave requests.</p>
								</div>
								{historicalLeaves.length > 0 ? (
									<div className="space-y-3">
										{historicalLeaves.map((leave) => (
											<LeaveRequestSummary
												key={leave.id}
												leave={leave}
												canManage={canManage}
												isReviewing={isReviewing}
												onReview={(selectedLeave, action) => {
													setPendingReview({ leave: selectedLeave, action });
													setReviewNote("");
												}}
											/>
										))}
									</div>
								) : leaves.length === 0 ? (
									<div className="rounded-lg border border-dashed px-4 py-10 text-center">
										<FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
										<p className="font-medium">No leave requests for {year}</p>
										<p className="mt-1 text-sm text-muted-foreground">Submitted requests will appear here.</p>
									</div>
								) : (
									<p className="py-2 text-sm text-muted-foreground">No resolved leave requests.</p>
								)}
							</section>
						</div>
					)}
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
						<AlertDialogTitle>{pendingReview ? `${reviewActionLabels[pendingReview.action]} leave request?` : "Review leave request"}</AlertDialogTitle>
						<AlertDialogDescription>
							{pendingReview
								? `${reviewActionLabels[pendingReview.action]} ${pendingReview.leave.leaveType.name} from ${formatLeaveDate(pendingReview.leave.startDate)} to ${formatLeaveDate(pendingReview.leave.endDate)}. You can include an optional note.`
								: "Confirm the leave request action."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="grid gap-2">
						<Label htmlFor="leave-review-note">Review note (optional)</Label>
						<Textarea
							id="leave-review-note"
							value={reviewNote}
							onChange={(event) => setReviewNote(event.target.value)}
							placeholder="Add context for this decision"
							rows={3}
							disabled={isReviewing}
						/>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isReviewing}>Keep request</AlertDialogCancel>
						<AlertDialogAction
							disabled={isReviewing}
							className={pendingReview?.action === "reject" ? "bg-destructive text-white hover:bg-destructive/90" : undefined}
							onClick={() => void handleReviewSubmit()}
						>
							{isReviewing && <Loader2 className="animate-spin" />}
							{pendingReview ? reviewActionLabels[pendingReview.action] : "Confirm"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
