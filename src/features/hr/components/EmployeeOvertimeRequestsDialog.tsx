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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FormInput, FormTextarea } from "@/components/shared";
import { handleApiError } from "@/lib/errorHandling";
import { useApproveEmployeeOvertimeRequest, useCancelEmployeeOvertimeRequest, useCreateEmployeeOvertimeRequest, useEmployeeOvertimeRequests, useRejectEmployeeOvertimeRequest } from "../hooks/useEmployeeOvertimeRequests";
import { buildEmployeeOvertimeRequestPayload, calculateOvertimeDurationMinutes, formatOvertimeCurrency, formatOvertimeMinutes, getCurrentOvertimePeriod, getDefaultOvertimeRequestFormValues, getOvertimeStatusLabel, isValidOvertimeDate, overtimeRequestSchema } from "../lib/overtime-requests";
import type { EmployeeOvertimeRequest, EmployeeOvertimeRequestStatus, EmployeeOvertimeSummary, OvertimeRequestFormValues } from "../types/overtime-requests";

interface EmployeeOvertimeRequestsDialogProps {
	employeeId: number;
	employeeName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	canManage: boolean;
}

type OvertimeReviewAction = "approve" | "reject" | "cancel";

interface PendingOvertimeReview {
	request: EmployeeOvertimeRequest;
	action: OvertimeReviewAction;
}

const statusVariants: Record<EmployeeOvertimeRequestStatus, BadgeProps["variant"]> = {
	pending: "secondary",
	approved: "default",
	rejected: "destructive",
	cancelled: "outline",
};

const reviewActionLabels: Record<OvertimeReviewAction, string> = {
	approve: "Approve",
	reject: "Reject",
	cancel: "Cancel",
};

const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "long" });

function formatOvertimeDate(value: string): string {
	if (!isValidOvertimeDate(value)) return value;

	return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatOvertimeDateTime(value: string): string {
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

function formatOvertimeTime(value: string): string {
	const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(value);
	if (!match) return value;

	const hour = Number(match[1]);
	if (!Number.isInteger(hour) || hour < 0 || hour > 23) return value;

	return `${hour % 12 || 12}:${match[2]} ${hour >= 12 ? "PM" : "AM"}`;
}

function OvertimeSummary({ summary }: { summary: EmployeeOvertimeSummary }) {
	const cards = [
		{ label: "Requested", value: formatOvertimeMinutes(summary.requestedMinutes) },
		{ label: "Actual time", value: formatOvertimeMinutes(summary.actualMinutes) },
		{ label: "Approved authorization", value: formatOvertimeMinutes(summary.approvedMinutes) },
		{ label: "Unapproved actual time", value: formatOvertimeMinutes(summary.unapprovedMinutes) },
		{ label: "Payable amount", value: formatOvertimeCurrency(summary.payableAmount) },
	];

	return (
		<section className="space-y-3">
			<div>
				<h3 className="font-semibold">Period summary</h3>
				<p className="text-sm text-muted-foreground">Totals reflect requests and recorded actual time for the selected period.</p>
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

function OvertimeRequestDetails({ request, canManage, isReviewing, onReview }: { request: EmployeeOvertimeRequest; canManage: boolean; isReviewing: boolean; onReview: (request: EmployeeOvertimeRequest, action: OvertimeReviewAction) => void }) {
	return (
		<div className="rounded-lg border bg-muted/20 p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<h4 className="font-medium">{formatOvertimeDate(request.overtimeDate)}</h4>
						<Badge variant={statusVariants[request.status]}>{getOvertimeStatusLabel(request.status)}</Badge>
					</div>
					<p className="text-sm text-muted-foreground">{formatOvertimeTime(request.startTime)} to {formatOvertimeTime(request.endTime)}</p>
				</div>
				{canManage && request.status === "pending" && (
					<div className="flex flex-wrap gap-2">
						<Button type="button" size="sm" disabled={isReviewing} onClick={() => onReview(request, "approve")}>
							<Check />
							Approve
						</Button>
						<Button type="button" size="sm" variant="destructive" disabled={isReviewing} onClick={() => onReview(request, "reject")}>
							<X />
							Reject
						</Button>
						<Button type="button" size="sm" variant="outline" disabled={isReviewing} onClick={() => onReview(request, "cancel")}>
							<Ban />
							Cancel
						</Button>
					</div>
				)}
			</div>

			<dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
				<div>
					<dt className="text-muted-foreground">Requested time</dt>
					<dd className="font-medium">{formatOvertimeMinutes(request.requestedMinutes)}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Actual time</dt>
					<dd className="font-medium">{formatOvertimeMinutes(request.actualMinutes)}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Approved authorization</dt>
					<dd className="font-medium">{formatOvertimeMinutes(request.approvedMinutes)}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Unapproved actual time</dt>
					<dd className="font-medium">{formatOvertimeMinutes(request.unapprovedMinutes)}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Payable amount</dt>
					<dd className="font-medium">{formatOvertimeCurrency(request.payableAmount)}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Submitted</dt>
					<dd className="font-medium">{formatOvertimeDateTime(request.createdAt)}</dd>
				</div>
				{request.reviewedAt && (
					<div>
						<dt className="text-muted-foreground">Reviewed</dt>
						<dd className="font-medium">{formatOvertimeDateTime(request.reviewedAt)}</dd>
					</div>
				)}
				{request.hourlyRate !== null && (
					<div>
						<dt className="text-muted-foreground">Hourly rate</dt>
						<dd className="font-medium">{formatOvertimeCurrency(request.hourlyRate)}</dd>
					</div>
				)}
				{request.overtimeMultiplier !== null && (
					<div>
						<dt className="text-muted-foreground">Overtime multiplier</dt>
						<dd className="font-medium">{request.overtimeMultiplier}x</dd>
					</div>
				)}
			</dl>

			<div className="mt-4 space-y-2 border-t pt-3 text-sm text-muted-foreground">
				<p>Reason: {request.reason}</p>
				{request.reviewNote && <p>Review note: {request.reviewNote}</p>}
				{request.policyVersionId !== null && <p>Policy snapshot #{request.policyVersionId}</p>}
			</div>
		</div>
	);
}

export function EmployeeOvertimeRequestsDialog({ employeeId, employeeName, open, onOpenChange, canManage }: EmployeeOvertimeRequestsDialogProps) {
	const currentPeriod = getCurrentOvertimePeriod();
	const [year, setYear] = useState(currentPeriod.year);
	const [month, setMonth] = useState(currentPeriod.month);
	const [pendingReview, setPendingReview] = useState<PendingOvertimeReview | null>(null);
	const [reviewNote, setReviewNote] = useState("");
	const [requestError, setRequestError] = useState<string | null>(null);
	const [reviewError, setReviewError] = useState<string | null>(null);
	const overtimeQuery = useEmployeeOvertimeRequests(employeeId, year, month, open && canManage);
	const createOvertime = useCreateEmployeeOvertimeRequest();
	const approveOvertime = useApproveEmployeeOvertimeRequest();
	const rejectOvertime = useRejectEmployeeOvertimeRequest();
	const cancelOvertime = useCancelEmployeeOvertimeRequest();
	const form = useForm<OvertimeRequestFormValues>({
		resolver: zodResolver(overtimeRequestSchema),
		mode: "onChange",
		defaultValues: getDefaultOvertimeRequestFormValues(),
	});
	const startTime = useWatch({ control: form.control, name: "startTime" });
	const endTime = useWatch({ control: form.control, name: "endTime" });
	const durationPreview = calculateOvertimeDurationMinutes(startTime, endTime);
	const requests = [...(overtimeQuery.data?.requests ?? [])].sort((left, right) => right.overtimeDate.localeCompare(left.overtimeDate) || right.createdAt.localeCompare(left.createdAt));
	const pendingRequests = requests.filter((request) => request.status === "pending");
	const historicalRequests = requests.filter((request) => request.status !== "pending");
	const isReviewing = approveOvertime.isPending || rejectOvertime.isPending || cancelOvertime.isPending;
	const isRequesting = createOvertime.isPending;
	const yearOptions = Array.from({ length: 11 }, (_, index) => currentPeriod.year - 5 + index);
	const tomorrow = new Date();
	tomorrow.setHours(0, 0, 0, 0);
	tomorrow.setDate(tomorrow.getDate() + 1);

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setPendingReview(null);
			setReviewNote("");
			setRequestError(null);
			setReviewError(null);
		}
		onOpenChange(isOpen);
	};

	const openReviewDialog = (request: EmployeeOvertimeRequest, action: OvertimeReviewAction) => {
		setPendingReview({ request, action });
		setReviewNote("");
		setReviewError(null);
	};

	const handleRequestSubmit = async (values: OvertimeRequestFormValues) => {
		setRequestError(null);
		try {
			await createOvertime.mutateAsync({ employeeId, payload: buildEmployeeOvertimeRequestPayload(values) });
			toast.success("Overtime request submitted");
			form.reset(getDefaultOvertimeRequestFormValues());
		} catch (error) {
			const message = handleApiError(error);
			setRequestError(message);
			toast.error(message);
		}
	};

	const handleReviewSubmit = async () => {
		const review = pendingReview;
		if (!review) return;

		setReviewError(null);
		const payload = reviewNote.trim() ? { reviewNote: reviewNote.trim() } : undefined;

		try {
			if (review.action === "approve") {
				await approveOvertime.mutateAsync({ id: review.request.id, employeeId, payload });
			} else if (review.action === "reject") {
				await rejectOvertime.mutateAsync({ id: review.request.id, employeeId, payload });
			} else {
				await cancelOvertime.mutateAsync({ id: review.request.id, employeeId, payload });
			}
			toast.success(`Overtime request ${review.action === "approve" ? "approved" : review.action === "reject" ? "rejected" : "cancelled"}`);
			setPendingReview(null);
			setReviewNote("");
		} catch (error) {
			const message = handleApiError(error);
			setReviewError(message);
			toast.error(message);
		}
	};

	if (!canManage) return null;

	return (
		<>
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
					<DialogHeader>
						<DialogTitle>Overtime: {employeeName}</DialogTitle>
						<DialogDescription>Submit and review overtime preapproval requests for the selected period.</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h3 className="font-semibold">Period overview</h3>
							<p className="text-sm text-muted-foreground">Requests, authorizations, actual time, and payroll amounts are shown for the selected month.</p>
						</div>
						<div className="grid grid-cols-2 gap-2 sm:flex">
							<Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
								<SelectTrigger className="w-full sm:w-28" aria-label="Overtime year">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{yearOptions.map((option) => (
										<SelectItem key={option} value={String(option)}>{option}</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select value={String(month)} onValueChange={(value) => setMonth(Number(value))}>
								<SelectTrigger className="w-full sm:w-36" aria-label="Overtime month">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Array.from({ length: 12 }, (_, index) => index + 1).map((option) => (
										<SelectItem key={option} value={String(option)}>{monthFormatter.format(new Date(2000, option - 1, 1))}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<Alert>
						<Info />
						<AlertTitle>Authorization is not payroll</AlertTitle>
						<AlertDescription>Approval authorizes requested overtime. Actual time is recorded separately, and unapproved actual time is not payable.</AlertDescription>
					</Alert>

					<section className="space-y-3">
						<div>
							<h3 className="font-semibold">Request overtime</h3>
							<p className="text-sm text-muted-foreground">Overtime must be requested for a future date. The duration below is a local preview; the server determines the saved request.</p>
						</div>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(handleRequestSubmit)} onChange={() => setRequestError(null)} className="space-y-4 rounded-lg border p-4">
								{requestError && (
									<Alert variant="destructive">
										<AlertCircle />
										<AlertTitle>Unable to submit overtime request</AlertTitle>
										<AlertDescription>{requestError}</AlertDescription>
									</Alert>
								)}
								<div className="grid gap-4 sm:grid-cols-3">
									<FormInput control={form.control} name="overtimeDate" label="Overtime date" type="date" minDate={tomorrow} disabled={isRequesting} />
									<FormInput control={form.control} name="startTime" label="Start time" type="time" disabled={isRequesting} />
									<FormInput control={form.control} name="endTime" label="End time" type="time" disabled={isRequesting} />
								</div>
								<Alert>
									<Clock3 />
									<AlertTitle>Duration preview: {durationPreview === null ? "Enter an end time after the start time" : formatOvertimeMinutes(durationPreview)}</AlertTitle>
									<AlertDescription>This preview is not authorization, actual time, or a payroll calculation.</AlertDescription>
								</Alert>
								<FormTextarea control={form.control} name="reason" label="Reason" placeholder="Describe the work requiring preapproval" rows={3} disabled={isRequesting} />
								<DialogFooter>
									<Button type="submit" disabled={isRequesting || !form.formState.isValid}>
										{isRequesting && <Loader2 className="animate-spin" />}
										Submit request
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</section>

					{overtimeQuery.isLoading ? (
						<div className="space-y-3">
							<Skeleton className="h-40 w-full" />
							<Skeleton className="h-48 w-full" />
						</div>
					) : overtimeQuery.isError ? (
						<Alert variant="destructive">
							<AlertCircle />
							<AlertTitle>Unable to load overtime requests</AlertTitle>
							<AlertDescription className="flex flex-wrap items-center gap-2">
								<span>{handleApiError(overtimeQuery.error)}</span>
								<Button type="button" variant="outline" size="sm" onClick={() => overtimeQuery.refetch()}>Try again</Button>
							</AlertDescription>
						</Alert>
					) : overtimeQuery.data ? (
						<div className="space-y-6">
							<OvertimeSummary summary={overtimeQuery.data.summary} />

							<section className="space-y-3 border-t pt-5">
								<div>
									<h3 className="font-semibold">Pending requests{` (${overtimeQuery.data.summary.pendingCount})`}</h3>
									<p className="text-sm text-muted-foreground">Requests awaiting a manager decision.</p>
								</div>
								{pendingRequests.length > 0 ? (
									<div className="space-y-3">
										{pendingRequests.map((request) => <OvertimeRequestDetails key={request.id} request={request} canManage={canManage} isReviewing={isReviewing} onReview={openReviewDialog} />)}
									</div>
								) : (
									<p className="py-2 text-sm text-muted-foreground">No pending overtime requests.</p>
								)}
							</section>

							<section className="space-y-3 border-t pt-5">
								<div>
									<h3 className="font-semibold">Request history</h3>
									<p className="text-sm text-muted-foreground">Approved, rejected, and cancelled overtime requests.</p>
								</div>
								{historicalRequests.length > 0 ? (
									<div className="space-y-3">
										{historicalRequests.map((request) => <OvertimeRequestDetails key={request.id} request={request} canManage={canManage} isReviewing={isReviewing} onReview={openReviewDialog} />)}
									</div>
								) : requests.length === 0 ? (
									<div className="rounded-lg border border-dashed px-4 py-10 text-center">
										<FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
										<p className="font-medium">No overtime requests for {monthFormatter.format(new Date(year, month - 1, 1))} {year}</p>
										<p className="mt-1 text-sm text-muted-foreground">Submitted requests will appear here.</p>
									</div>
								) : (
									<p className="py-2 text-sm text-muted-foreground">No resolved overtime requests.</p>
								)}
							</section>
						</div>
					) : null}
				</DialogContent>
			</Dialog>

			<AlertDialog open={Boolean(pendingReview)} onOpenChange={(isOpen) => {
				if (!isOpen) {
					setPendingReview(null);
					setReviewNote("");
					setReviewError(null);
				}
			}}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{pendingReview ? `${reviewActionLabels[pendingReview.action]} overtime request?` : "Review overtime request"}</AlertDialogTitle>
						<AlertDialogDescription>
							{pendingReview
								? `${reviewActionLabels[pendingReview.action]} the ${formatOvertimeMinutes(pendingReview.request.requestedMinutes)} request on ${formatOvertimeDate(pendingReview.request.overtimeDate)}. You can include an optional note.`
								: "Confirm the overtime request action."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					{reviewError && (
						<Alert variant="destructive">
							<AlertCircle />
							<AlertTitle>Unable to update overtime request</AlertTitle>
							<AlertDescription>{reviewError}</AlertDescription>
						</Alert>
					)}
					<div className="grid gap-2">
						<Label htmlFor="overtime-review-note">Review note (optional)</Label>
						<Textarea id="overtime-review-note" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Add context for this decision" rows={3} disabled={isReviewing} />
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isReviewing}>Keep request</AlertDialogCancel>
						<AlertDialogAction
							disabled={isReviewing}
							className={pendingReview?.action === "reject" ? "bg-destructive text-white hover:bg-destructive/90" : undefined}
							onClick={(event) => {
								event.preventDefault();
								void handleReviewSubmit();
							}}
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
