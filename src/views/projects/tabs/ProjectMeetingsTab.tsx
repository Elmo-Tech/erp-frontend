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
import { CalendarClock } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { useGetMeetings } from "@/entities/meetings/api/meetings.api";
import { PolyMeetingForm } from "@/features/meetings/ui/PolyMeetingForm";
import { MEETING_STATUS_LABELS, MEETING_TYPE_LABELS, LOCATION_TYPE_LABELS, type PolyMeeting, type MeetingStatus } from "@/entities/meetings/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Status badge colours (mirrors MeetingsList)
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CLASS: Record<MeetingStatus, string> = {
	scheduled: "bg-blue-50 text-blue-700 border-blue-200",
	in_progress: "bg-amber-50 text-amber-700 border-amber-200",
	completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
	cancelled: "bg-red-50 text-red-700 border-red-200",
	no_show: "bg-slate-100 text-slate-700 border-slate-200",
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
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getMeetingTypeLabel(meeting: PolyMeeting): string {
	return MEETING_TYPE_LABELS[meeting.meetingType] ?? meeting.meetingType;
}

function getMeetingStatusLabel(meeting: PolyMeeting): string {
	return MEETING_STATUS_LABELS[meeting.status] ?? meeting.status;
}

function getLocationLabel(meeting: PolyMeeting): string {
	const locationLabel = LOCATION_TYPE_LABELS[meeting.locationType] ?? meeting.locationType;

	if (!meeting.locationDetails) {
		return locationLabel;
	}

	return `${locationLabel} — ${meeting.locationDetails}`;
}

function getAttendeesLabel(meeting: PolyMeeting): string {
	const internalCount = meeting.internalAttendees.length;
	const externalCount = meeting.externalAttendees.length;
	const total = internalCount + externalCount;

	if (total === 0) {
		return "No attendees";
	}

	return `${total} attendee${total === 1 ? "" : "s"}`;
}

function getMeetingNote(meeting: PolyMeeting): string | null {
	return meeting.completionNote || meeting.description || null;
}

function getScopeConfig(meeting: PolyMeeting): { label: string; className: string } {
	if (meeting.modelType === "project") {
		return {
			label: "Project",
			className: "bg-blue-50 text-blue-700 border-blue-200",
		};
	}

	return {
		label: "Client",
		className: "bg-slate-100 text-slate-700 border-slate-200",
	};
}

// ─────────────────────────────────────────────────────────────────────────────
// Table columns
// ─────────────────────────────────────────────────────────────────────────────

const projectMeetingColumns: Column<PolyMeeting>[] = [
	{
		key: "meeting",
		header: "Meeting",
		render: (meeting) => {
			const note = getMeetingNote(meeting);

			return (
				<div className="min-w-64 max-w-md">
					<p className="truncate font-medium">{meeting.title}</p>
					<p className="mt-0.5 text-xs text-muted-foreground">{getMeetingTypeLabel(meeting)}</p>
					{note && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{note}</p>}
				</div>
			);
		},
	},
	{
		key: "scope",
		header: "Scope",
		render: (meeting) => {
			const scopeConfig = getScopeConfig(meeting);

			return (
				<Badge
					variant="outline"
					className={cn("rounded-sm border px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide", scopeConfig.className)}
				>
					{scopeConfig.label}
				</Badge>
			);
		},
	},
	{
		key: "scheduled",
		header: "Scheduled",
		render: (meeting) => <span className="text-sm text-muted-foreground">{format(new Date(meeting.scheduledAt), "MMM d, yyyy 'at' h:mm a")}</span>,
	},
	{
		key: "location",
		header: "Location",
		render: (meeting) => <span className="max-w-56 truncate text-sm text-muted-foreground">{getLocationLabel(meeting)}</span>,
	},
	{
		key: "attendees",
		header: "Attendees",
		render: (meeting) => <span className="text-sm text-muted-foreground">{getAttendeesLabel(meeting)}</span>,
	},
	{
		key: "status",
		header: "Status",
		render: (meeting) => (
			<Badge
				variant="outline"
				className={cn("rounded-sm border px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide", STATUS_CLASS[meeting.status])}
			>
				{getMeetingStatusLabel(meeting)}
			</Badge>
		),
	},
];

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
	const error = projectMeetingsQuery.error ?? clientMeetingsQuery.error ?? null;

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
			<PolyMeetingForm
				modelType="project"
				modelId={projectId}
			/>

			<DataTable
				title="Project Meetings"
				titleBadge={!isLoading && !isError ? String(mergedMeetings.length) : undefined}
				columns={projectMeetingColumns}
				data={mergedMeetings}
				keyExtractor={(meeting) => `${meeting.modelType}-${meeting.id}`}
				isLoading={isLoading}
				error={isError ? error || new Error("Failed to load meetings.") : null}
				emptyState={{
					icon: CalendarClock,
					title: "No meetings yet",
					description: "Schedule project and client meetings to keep delivery history visible.",
				}}
			/>
		</div>
	);
}
