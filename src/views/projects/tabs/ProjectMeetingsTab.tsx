"use client";

/**
 * ProjectMeetingsTab
 *
 * FIX: Meetings scheduled under the parent Client were not visible here.
 *
 * We now fetch BOTH:
 *   1. Meetings scoped to the project   (modelType="project", modelId=projectId)
 *   2. Meetings scoped to the client    (modelType="client",  modelId=clientId)
 *
 * The two arrays are merged, de-duplicated by meeting id, and sorted by
 * scheduledAt descending so the user sees all relevant meetings in one list.
 *
 * The PolyMeetingForm still creates meetings under the project scope.
 */

import { useMemo } from "react";
import { format } from "date-fns";
import { CalendarClock, MapPin, Users } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { useGetMeetings } from "@/entities/meetings/api/meetings.api";
import { PolyMeetingForm } from "@/features/meetings/ui/PolyMeetingForm";
import { MEETING_STATUS_LABELS, MEETING_TYPE_LABELS, LOCATION_TYPE_LABELS, type PolyMeeting, type MeetingStatus } from "@/entities/meetings/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Status badge colours (mirrors MeetingsList)
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CLASS: Record<MeetingStatus, string> = {
	scheduled: "bg-blue-50 text-blue-700 border-blue-200",
	held: "bg-emerald-50 text-emerald-700 border-emerald-200",
	cancelled: "bg-red-50 text-red-700 border-red-200",
	no_show: "bg-amber-50 text-amber-700 border-amber-200",
};

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectMeetingsTabProps {
	projectId: number;
	/** clientId is required to also surface meetings booked under the parent client */
	clientId: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Merged meeting card (read-only — status updates handled by MeetingsList)
// ─────────────────────────────────────────────────────────────────────────────

function MeetingCard({ meeting }: { meeting: PolyMeeting }) {
	const statusClass = STATUS_CLASS[meeting.status] ?? "";

	return (
		<div className="rounded-xl border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow">
			{/* Header */}
			<div className="flex items-start justify-between gap-2">
				<div className="flex-1 min-w-0">
					<p className="font-semibold text-sm truncate">{meeting.title}</p>
					<p className="text-xs text-muted-foreground mt-0.5">
						{MEETING_TYPE_LABELS[meeting.meetingType]}
						{meeting.modelType === "client" && <span className="ml-2 rounded bg-muted px-1 py-0.5 text-[10px] font-medium text-muted-foreground">Client meeting</span>}
					</p>
				</div>
				<Badge
					variant="outline"
					className={cn("text-xs shrink-0", statusClass)}
				>
					{MEETING_STATUS_LABELS[meeting.status]}
				</Badge>
			</div>

			{/* Details */}
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
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProjectMeetingsTab({ projectId, clientId }: ProjectMeetingsTabProps) {
	// 1. Fetch project-scoped meetings
	const projectMeetingsQuery = useGetMeetings("project", projectId);

	// 2. Fetch client-scoped meetings (only when clientId is valid)
	const clientMeetingsQuery = useGetMeetings("client", clientId, clientId > 0);

	const isLoading = projectMeetingsQuery.isLoading || clientMeetingsQuery.isLoading;
	const isError = projectMeetingsQuery.isError || clientMeetingsQuery.isError;

	// 3. Merge + de-duplicate + sort by scheduledAt desc
	const mergedMeetings = useMemo<PolyMeeting[]>(() => {
		const projectList = projectMeetingsQuery.data ?? [];
		const clientList = clientMeetingsQuery.data ?? [];

		// De-duplicate: project meetings take precedence (they already have the
		// correct modelType="project"); client meetings are appended only if their
		// id doesn't already appear in the project list.
		const seen = new Set(projectList.map((m) => m.id));
		const unique = [...projectList, ...clientList.filter((m) => !seen.has(m.id))];

		// Sort newest first
		return unique.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
	}, [projectMeetingsQuery.data, clientMeetingsQuery.data]);

	return (
		<div className="flex flex-col gap-4">
			{/* Schedule a new meeting under the project */}
			<PolyMeetingForm
				modelType="project"
				modelId={projectId}
			/>

			{/* Loading */}
			{isLoading && (
				<div className="space-y-3">
					{[1, 2].map((i) => (
						<Skeleton
							key={i}
							className="h-24 w-full rounded-xl"
						/>
					))}
				</div>
			)}

			{/* Error */}
			{!isLoading && isError && <div className="flex items-center justify-center h-24 rounded-xl border bg-muted/20 text-muted-foreground text-sm">Failed to load meetings.</div>}

			{/* Empty */}
			{!isLoading && !isError && mergedMeetings.length === 0 && <div className="flex items-center justify-center h-24 rounded-xl border border-dashed bg-muted/10 text-muted-foreground text-sm">No meetings yet. Schedule one above.</div>}

			{/* Merged list */}
			{!isLoading && !isError && mergedMeetings.length > 0 && (
				<div className="space-y-3">
					{mergedMeetings.map((meeting) => (
						<MeetingCard
							key={`${meeting.modelType}-${meeting.id}`}
							meeting={meeting}
						/>
					))}
				</div>
			)}
		</div>
	);
}
