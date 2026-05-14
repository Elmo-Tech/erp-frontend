"use client";

/**
 * MeetingsList — Polymorphic meetings list component.
 *
 * Accepts `modelType` and `modelId` so it can be embedded in:
 *  - Lead Details page   (modelType="lead")
 *  - Client Details page (modelType="client")
 *  - Project Details page (modelType="project")
 *
 * Business rule: Transitioning to any status other than "scheduled"
 * requires a `completion_note`. This is enforced by the Zod schema and
 * the UpdateStatusDialog below.
 */

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarClock, MapPin, Users, MoreHorizontal, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Textarea } from "@/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";
import { useSettingsDictionary } from "@/shared/api/settings.api";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { useGetMeetings, useUpdateMeetingStatus } from "../api/meetings.api";
import { updateMeetingStatusSchema, type UpdateMeetingStatusFormData } from "../model/meeting.schema";
import { MEETING_STATUS_LABELS, MEETING_TYPE_LABELS, LOCATION_TYPE_LABELS, MEETING_STATUSES, STATUSES_REQUIRING_NOTE, type MeetingModelType, type PolyMeeting, type MeetingStatus } from "../model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Status badge config
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { className: string; icon: React.ElementType }> = {
	scheduled: {
		className: "bg-blue-50 text-blue-700 border-blue-200",
		icon: Clock,
	},
	in_progress: {
		className: "bg-amber-50 text-amber-700 border-amber-200",
		icon: AlertCircle,
	},
	completed: {
		className: "bg-emerald-50 text-emerald-700 border-emerald-200",
		icon: CheckCircle2,
	},
	cancelled: {
		className: "bg-red-50 text-red-700 border-red-200",
		icon: XCircle,
	},
	no_show: {
		className: "bg-amber-50 text-amber-700 border-amber-200",
		icon: AlertCircle,
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// Update status dialog
// ─────────────────────────────────────────────────────────────────────────────

interface UpdateStatusDialogProps {
	meeting: PolyMeeting;
	modelType: MeetingModelType;
	modelId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function UpdateStatusDialog({ meeting, modelType, modelId, open, onOpenChange }: UpdateStatusDialogProps) {
	const { mutateAsync, isPending } = useUpdateMeetingStatus(modelType, modelId);
	const statusesDict = useSettingsDictionary("meeting-statuses", open);
	const statusOptions = statusesDict.options.length > 0 ? statusesDict.options : MEETING_STATUSES.map((status) => ({ value: status, label: MEETING_STATUS_LABELS[status] ?? status }));

	const form = useForm<UpdateMeetingStatusFormData>({
		resolver: zodResolver(updateMeetingStatusSchema),
		defaultValues: {
			status: meeting.status,
			completionNote: meeting.completionNote ?? "",
		},
	});

	const watchedStatus = useWatch({
		control: form.control,
		name: "status",
	}) as MeetingStatus;
	const requiresNote = STATUSES_REQUIRING_NOTE.includes(watchedStatus);

	const handleSubmit = form.handleSubmit(async (data) => {
		try {
			await mutateAsync({
				meetingId: meeting.id,
				payload: {
					status: data.status as MeetingStatus,
					completion_note: data.completionNote ?? "",
				},
			});
			toast.success("Meeting status updated.");
			onOpenChange(false);
		} catch (error) {
			toast.error(getApiErrorMessage(error, "Failed to update meeting status."));
		}
	});

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Update Meeting Status</DialogTitle>
					<DialogDescription>
						{`"${meeting.title}"`} — changing status from <strong>{MEETING_STATUS_LABELS[meeting.status] ?? meeting.status}</strong>.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={handleSubmit}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem>
									<FormLabel>New Status</FormLabel>
									<Select
										value={field.value}
										onValueChange={field.onChange}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select status" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{statusOptions.map((status) => (
												<SelectItem
													key={status.value}
													value={status.value}
												>
													{status.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="completionNote"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Completion Note
										{requiresNote && <span className="text-destructive ml-1">*</span>}
									</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder={requiresNote ? "Required — describe the outcome of this meeting…" : "Optional notes about this meeting…"}
											rows={3}
										/>
									</FormControl>
									{requiresNote && (
										<p className="text-xs text-muted-foreground">
											A completion note is required when marking a meeting as <strong>{MEETING_STATUS_LABELS[watchedStatus] ?? watchedStatus}</strong>.
										</p>
									)}
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isPending}
							>
								{isPending ? "Saving…" : "Save Status"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Meeting card
// ─────────────────────────────────────────────────────────────────────────────

interface MeetingCardProps {
	meeting: PolyMeeting;
	modelType: MeetingModelType;
	modelId: number;
}

function MeetingCard({ meeting, modelType, modelId }: MeetingCardProps) {
	const [statusDialogOpen, setStatusDialogOpen] = useState(false);
	const config = STATUS_CONFIG[meeting.status] ?? STATUS_CONFIG.scheduled;
	const StatusIcon = config.icon;

	return (
		<>
			<div className="rounded-xl border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow">
				{/* Header row */}
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1 min-w-0">
						<p className="font-semibold text-sm truncate">{meeting.title}</p>
						<p className="text-xs text-muted-foreground mt-0.5">{MEETING_TYPE_LABELS[meeting.meetingType] ?? meeting.meetingType}</p>
					</div>
					<div className="flex items-center gap-2 shrink-0">
						<Badge
							variant="outline"
							className={cn("text-xs flex items-center gap-1", config.className)}
						>
							<StatusIcon className="size-3" />
							{MEETING_STATUS_LABELS[meeting.status] ?? meeting.status}
						</Badge>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="size-7"
								>
									<MoreHorizontal className="size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => setStatusDialogOpen(true)}>Update Status</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Details row */}
				<div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
					<span className="flex items-center gap-1.5">
						<CalendarClock className="size-3.5 shrink-0" />
						{format(new Date(meeting.scheduledAt), "MMM d, yyyy 'at' h:mm a")}
					</span>
					<span className="flex items-center gap-1.5">
						<MapPin className="size-3.5 shrink-0" />
						{LOCATION_TYPE_LABELS[meeting.locationType]}
						{meeting.locationDetails && ` — ${meeting.locationDetails}`}
					</span>
					{meeting.internalAttendees.length > 0 && (
						<span className="flex items-center gap-1.5">
							<Users className="size-3.5 shrink-0" />
							{meeting.internalAttendees.length} attendee
							{meeting.internalAttendees.length !== 1 ? "s" : ""}
						</span>
					)}
				</div>

				{/* Completion note */}
				{meeting.completionNote && (
					<div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
						<span className="font-medium text-foreground">Note: </span>
						{meeting.completionNote}
					</div>
				)}
			</div>

			<UpdateStatusDialog
				meeting={meeting}
				modelType={modelType}
				modelId={modelId}
				open={statusDialogOpen}
				onOpenChange={setStatusDialogOpen}
			/>
		</>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────────────────────────────────────

export interface MeetingsListProps {
	/** The type of the parent model (lead | client | project) */
	modelType: MeetingModelType;
	/** The ID of the parent model */
	modelId: number;
}

export function MeetingsList({ modelType, modelId }: MeetingsListProps) {
	const { data: meetings, isLoading, isError } = useGetMeetings(modelType, modelId);

	if (isLoading) {
		return (
			<div className="space-y-3">
				{[1, 2].map((i) => (
					<Skeleton
						key={i}
						className="h-24 w-full rounded-xl"
					/>
				))}
			</div>
		);
	}

	if (isError) {
		return <div className="flex items-center justify-center h-24 rounded-xl border bg-muted/20 text-muted-foreground text-sm">Failed to load meetings.</div>;
	}

	if (!meetings || meetings.length === 0) {
		return <div className="flex items-center justify-center h-24 rounded-xl border border-dashed bg-muted/10 text-muted-foreground text-sm">No meetings yet. Schedule one above.</div>;
	}

	return (
		<div className="space-y-3">
			{meetings.map((meeting) => (
				<MeetingCard
					key={meeting.id}
					meeting={meeting}
					modelType={modelType}
					modelId={modelId}
				/>
			))}
		</div>
	);
}
