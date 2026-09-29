"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { AlertCircle, Ban, Check, Clock3, FileText, Info, Loader2, X } from "lucide-react";
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
import { useApproveEmployeeShortPermission, useCancelEmployeeShortPermission, useCreateEmployeeShortPermission, useEmployeeShortPermissions, useRejectEmployeeShortPermission } from "../hooks/useEmployeeShortPermissions";
import { buildEmployeeShortPermissionPayload, calculatePermissionDurationMinutes, formatPermissionDuration, getCurrentPermissionMonth, getDefaultShortPermissionRequestFormValues, isValidPermissionDate, shortPermissionRequestSchema } from "../lib/short-permissions";
import type { EmployeeShortPermission, EmployeeShortPermissionStatus, PermissionAllowance, PermissionCompensationType, ShortPermissionRequestFormValues } from "../types/short-permissions";

interface EmployeeShortPermissionsDialogProps {
	employeeId: number;
	employeeName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	canManage: boolean;
}

type ShortPermissionReviewAction = "approve" | "reject" | "cancel";

interface PendingShortPermissionReview {
	permission: EmployeeShortPermission;
	action: ShortPermissionReviewAction;
}

const statusLabels: Record<EmployeeShortPermissionStatus, string> = {
	pending: "Pending",
	approved: "Approved",
	rejected: "Rejected",
	cancelled: "Cancelled",
};

const statusVariants: Record<EmployeeShortPermissionStatus, BadgeProps["variant"]> = {
	pending: "secondary",
	approved: "default",
	rejected: "destructive",
	cancelled: "outline",
};

const reviewActionLabels: Record<ShortPermissionReviewAction, string> = {
	approve: "Approve",
	reject: "Reject",
	cancel: "Cancel",
};

function formatPermissionDate(value: string): string {
	if (!isValidPermissionDate(value)) return value;

	return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatPermissionDateTime(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;

	return date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatPermissionTime(value: string): string {
	const [hourValue, minute = "00"] = value.split(":");
	const hour = Number(hourValue);

	if (!Number.isInteger(hour) || hour < 0 || hour > 23) return value;
	return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
}

function getAvailableReviewActions(status: EmployeeShortPermissionStatus): ShortPermissionReviewAction[] {
	if (status === "pending") return ["approve", "reject", "cancel"];
	if (status === "approved") return ["cancel"];
	return [];
}

function getCompensationLabel(permission: EmployeeShortPermission): string {
	if (permission.isPaid === true) return "Paid";
	if (permission.isPaid === false) return "Unpaid";
	return permission.status === "pending" ? "Compensation pending" : "Not paid";
}

function AllowanceSummary({ allowance }: { allowance: PermissionAllowance }) {
	return (
		<section className="space-y-3">
			<div>
				<h3 className="font-semibold">Allowance summary</h3>
				<p className="text-sm text-muted-foreground">Approved paid permissions count against the selected month.</p>
			</div>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Allocated</p>
					<p className="mt-1 text-xl font-semibold">{formatPermissionDuration(allowance.allocatedMinutes)}</p>
				</div>
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Paid used</p>
					<p className="mt-1 text-xl font-semibold">{formatPermissionDuration(allowance.usedPaidMinutes)}</p>
				</div>
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Remaining</p>
					<p className="mt-1 text-xl font-semibold">{formatPermissionDuration(allowance.remainingMinutes)}</p>
				</div>
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Overage</p>
					<p className="mt-1 text-xl font-semibold">{formatPermissionDuration(allowance.overageMinutes)}</p>
				</div>
			</div>
		</section>
	);
}

function ShortPermissionSummary({ permission, canManage, isReviewing, onReview }: { permission: EmployeeShortPermission; canManage: boolean; isReviewing: boolean; onReview: (permission: EmployeeShortPermission, action: ShortPermissionReviewAction) => void }) {
	const actions = getAvailableReviewActions(permission.status);

	return (
		<div className="rounded-lg border bg-muted/20 p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<h4 className="font-medium">{formatPermissionDate(permission.permissionDate)}</h4>
						<Badge variant={statusVariants[permission.status]}>{statusLabels[permission.status]}</Badge>
						<Badge variant="outline">{getCompensationLabel(permission)}</Badge>
					</div>
					<p className="text-sm text-muted-foreground">{formatPermissionTime(permission.startTime)} to {formatPermissionTime(permission.endTime)}</p>
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
								onClick={() => onReview(permission, action)}
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
					<dd className="font-medium">{formatPermissionDuration(permission.durationMinutes)}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Submitted</dt>
					<dd className="font-medium">{formatPermissionDateTime(permission.createdAt)}</dd>
				</div>
				{permission.reviewedAt && (
					<div>
						<dt className="text-muted-foreground">Reviewed</dt>
						<dd className="font-medium">{formatPermissionDateTime(permission.reviewedAt)}</dd>
					</div>
				)}
			</dl>

			{permission.reason && <p className="mt-4 border-t pt-3 text-sm text-muted-foreground">Reason: {permission.reason}</p>}
			{permission.reviewNote && <p className="mt-2 text-sm text-muted-foreground">Review note: {permission.reviewNote}</p>}
		</div>
	);
}

export function EmployeeShortPermissionsDialog({ employeeId, employeeName, open, onOpenChange, canManage }: EmployeeShortPermissionsDialogProps) {
	const [month, setMonth] = useState(() => getCurrentPermissionMonth());
	const [pendingReview, setPendingReview] = useState<PendingShortPermissionReview | null>(null);
	const [compensationType, setCompensationType] = useState<PermissionCompensationType | "">("");
	const [reviewNote, setReviewNote] = useState("");
	const shortPermissionsQuery = useEmployeeShortPermissions(employeeId, month, open && canManage);
	const createShortPermission = useCreateEmployeeShortPermission();
	const approveShortPermission = useApproveEmployeeShortPermission();
	const rejectShortPermission = useRejectEmployeeShortPermission();
	const cancelShortPermission = useCancelEmployeeShortPermission();
	const form = useForm<ShortPermissionRequestFormValues>({
		resolver: zodResolver(shortPermissionRequestSchema),
		mode: "onChange",
		defaultValues: getDefaultShortPermissionRequestFormValues(),
	});
	const startTime = useWatch({ control: form.control, name: "startTime" });
	const endTime = useWatch({ control: form.control, name: "endTime" });
	const durationPreview = calculatePermissionDurationMinutes(startTime, endTime);
	const permissions = [...(shortPermissionsQuery.data?.permissions ?? [])].sort((left, right) => right.permissionDate.localeCompare(left.permissionDate) || right.createdAt.localeCompare(left.createdAt));
	const pendingPermissions = permissions.filter((permission) => permission.status === "pending");
	const historicalPermissions = permissions.filter((permission) => permission.status !== "pending");
	const allowance = shortPermissionsQuery.data?.allowance;
	const isReviewing = approveShortPermission.isPending || rejectShortPermission.isPending || cancelShortPermission.isPending;
	const isRequesting = createShortPermission.isPending;
	const availableAllowanceMinutes = Math.max(allowance?.remainingMinutes ?? 0, 0);
	const paidApprovalOverageMinutes = pendingReview?.action === "approve" && allowance ? Math.max(0, pendingReview.permission.durationMinutes - availableAllowanceMinutes) : 0;

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setPendingReview(null);
			setCompensationType("");
			setReviewNote("");
		}
		onOpenChange(isOpen);
	};

	const openReviewDialog = (permission: EmployeeShortPermission, action: ShortPermissionReviewAction) => {
		setPendingReview({ permission, action });
		setCompensationType("");
		setReviewNote("");
	};

	const handleRequestSubmit = async (values: ShortPermissionRequestFormValues) => {
		try {
			await createShortPermission.mutateAsync({ employeeId, payload: buildEmployeeShortPermissionPayload(values) });
			toast.success("Short permission request submitted");
			form.reset(getDefaultShortPermissionRequestFormValues());
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
				if (!compensationType) return;
				await approveShortPermission.mutateAsync({
					id: review.permission.id,
					employeeId,
					payload: { compensationType, ...payload },
				});
			} else if (review.action === "reject") {
				await rejectShortPermission.mutateAsync({ id: review.permission.id, employeeId, payload });
			} else {
				await cancelShortPermission.mutateAsync({ id: review.permission.id, employeeId, payload });
			}
			toast.success(`Short permission ${review.action === "approve" ? "approved" : review.action === "reject" ? "rejected" : "cancelled"}`);
			setPendingReview(null);
			setCompensationType("");
			setReviewNote("");
		} catch (error) {
			toast.error(handleApiError(error));
		}
	};

	if (!canManage) return null;

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={handleOpenChange}
			>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
					<DialogHeader>
						<DialogTitle>Short permissions: {employeeName}</DialogTitle>
						<DialogDescription>Submit and review short time-away requests for the selected month.</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h3 className="font-semibold">Monthly overview</h3>
							<p className="text-sm text-muted-foreground">Allowance and request history are shown for the selected month.</p>
						</div>
						<Input
							type="month"
							value={month}
							onChange={(event) => setMonth(event.target.value)}
							className="w-full sm:w-44"
							aria-label="Short permissions month"
						/>
					</div>

					<Alert>
						<Info />
						<AlertTitle>How the policy allowance works</AlertTitle>
						<AlertDescription>Only approved paid short permissions use the policy allowance. Cancelling an approved paid permission restores its allowance.</AlertDescription>
					</Alert>

					<section className="space-y-3">
						<div>
							<h3 className="font-semibold">Request short permission</h3>
							<p className="text-sm text-muted-foreground">The duration below is a local preview; the server confirms the final duration after submission.</p>
						</div>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(handleRequestSubmit)}
								className="space-y-4 rounded-lg border p-4"
							>
								<div className="grid gap-4 sm:grid-cols-3">
									<FormInput
										control={form.control}
										name="permissionDate"
										label="Permission date"
										type="date"
										disabled={isRequesting}
									/>
									<FormInput
										control={form.control}
										name="startTime"
										label="Start time"
										type="time"
										disabled={isRequesting}
									/>
									<FormInput
										control={form.control}
										name="endTime"
										label="End time"
										type="time"
										disabled={isRequesting}
									/>
								</div>
								<Alert>
									<Clock3 />
									<AlertTitle>Duration preview: {durationPreview === null ? "Enter an end time after the start time" : formatPermissionDuration(durationPreview)}</AlertTitle>
									<AlertDescription>This preview does not determine the saved duration.</AlertDescription>
								</Alert>
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
										disabled={isRequesting || !form.formState.isValid}
									>
										{isRequesting && <Loader2 className="animate-spin" />}
										Submit request
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</section>

					{shortPermissionsQuery.isLoading ? (
						<div className="space-y-3">
							<Skeleton className="h-36 w-full" />
							<Skeleton className="h-44 w-full" />
						</div>
					) : shortPermissionsQuery.isError ? (
						<Alert variant="destructive">
							<AlertCircle />
							<AlertTitle>Unable to load short permissions</AlertTitle>
							<AlertDescription className="flex flex-wrap items-center gap-2">
								<span>{handleApiError(shortPermissionsQuery.error)}</span>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => shortPermissionsQuery.refetch()}
								>
									Try again
								</Button>
							</AlertDescription>
						</Alert>
					) : allowance ? (
						<div className="space-y-6">
							<AllowanceSummary allowance={allowance} />

							<section className="space-y-3 border-t pt-5">
								<div>
									<h3 className="font-semibold">Pending requests</h3>
									<p className="text-sm text-muted-foreground">Requests awaiting a manager decision.</p>
								</div>
								{pendingPermissions.length > 0 ? (
									<div className="space-y-3">
										{pendingPermissions.map((permission) => (
											<ShortPermissionSummary
												key={permission.id}
												permission={permission}
												canManage={canManage}
												isReviewing={isReviewing}
												onReview={openReviewDialog}
											/>
										))}
									</div>
								) : (
									<p className="py-2 text-sm text-muted-foreground">No pending short permission requests.</p>
								)}
							</section>

							<section className="space-y-3 border-t pt-5">
								<div>
									<h3 className="font-semibold">Request history</h3>
									<p className="text-sm text-muted-foreground">Approved, rejected, and cancelled short permission requests.</p>
								</div>
								{historicalPermissions.length > 0 ? (
									<div className="space-y-3">
										{historicalPermissions.map((permission) => (
											<ShortPermissionSummary
												key={permission.id}
												permission={permission}
												canManage={canManage}
												isReviewing={isReviewing}
												onReview={openReviewDialog}
											/>
										))}
									</div>
								) : permissions.length === 0 ? (
									<div className="rounded-lg border border-dashed px-4 py-10 text-center">
										<FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
										<p className="font-medium">No short permissions for {month}</p>
										<p className="mt-1 text-sm text-muted-foreground">Submitted requests will appear here.</p>
									</div>
								) : (
									<p className="py-2 text-sm text-muted-foreground">No resolved short permission requests.</p>
								)}
							</section>
						</div>
					) : null}
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={Boolean(pendingReview)}
				onOpenChange={(isOpen) => {
					if (!isOpen) {
						setPendingReview(null);
						setCompensationType("");
						setReviewNote("");
					}
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{pendingReview ? `${reviewActionLabels[pendingReview.action]} short permission?` : "Review short permission"}</AlertDialogTitle>
						<AlertDialogDescription>
							{pendingReview
								? `${reviewActionLabels[pendingReview.action]} the ${formatPermissionDuration(pendingReview.permission.durationMinutes)} request on ${formatPermissionDate(pendingReview.permission.permissionDate)}. You can include an optional note.`
								: "Confirm the short permission action."}
						</AlertDialogDescription>
					</AlertDialogHeader>

					{pendingReview?.action === "approve" && (
						<div className="grid gap-2">
							<Label htmlFor="short-permission-compensation">Compensation type</Label>
							<Select
								value={compensationType}
								onValueChange={(value) => setCompensationType(value as PermissionCompensationType)}
								disabled={isReviewing}
							>
								<SelectTrigger id="short-permission-compensation">
									<SelectValue placeholder="Choose paid or unpaid" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="paid">Paid</SelectItem>
									<SelectItem value="unpaid">Unpaid</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-sm text-muted-foreground">A compensation type is required to approve this request.</p>
						</div>
					)}

					{paidApprovalOverageMinutes > 0 && (
						<Alert variant="destructive">
							<AlertCircle />
							<AlertTitle>{compensationType === "paid" ? "Paid approval exceeds available allowance" : "Paid selection would exceed available allowance"}</AlertTitle>
							<AlertDescription>
								This {formatPermissionDuration(pendingReview?.permission.durationMinutes ?? 0)} request is {formatPermissionDuration(paidApprovalOverageMinutes)} beyond the {formatPermissionDuration(availableAllowanceMinutes)} remaining allowance. {compensationType === "paid" ? "You selected Paid; this over-allocation is permitted only because a manager explicitly selected Paid." : "A manager can approve this over-allocation only by explicitly selecting Paid."}
							</AlertDescription>
						</Alert>
					)}

					<div className="grid gap-2">
						<Label htmlFor="short-permission-review-note">Review note (optional)</Label>
						<Textarea
							id="short-permission-review-note"
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
							disabled={isReviewing || (pendingReview?.action === "approve" && !compensationType)}
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
