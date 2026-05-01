"use client";

import { useState } from "react";
import { CalendarClock, CalendarPlus, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { useGetClientMeetings } from "@/entities/meeting/api/meeting.api";
import { useMeetingPermissions } from "@/entities/user/model/permissions";
import { ScheduleMeetingModal } from "@/features/meetings/ui/ScheduleMeetingModal";
import { useClientProfile } from "@/widgets/client-management/model/client-profile.context";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/ui/data-display/EmptyState";
import { Skeleton } from "@/shared/ui/skeleton";

export default function ClientMeetingsPage() {
	const client = useClientProfile();
	const [meetingModalOpen, setMeetingModalOpen] = useState(false);
	const { canScheduleMeetings } = useMeetingPermissions();
	const meetingsQuery = useGetClientMeetings(client.clientId);
	const meetings = meetingsQuery.data ?? [];

	const clientName = client.displayName || client.name;
	const handleScheduleMeeting = () => {
		if (!canScheduleMeetings) {
			toast.error("You do not have permission to schedule meetings");
			return;
		}

		setMeetingModalOpen(true);
	};

	return (
		<section className="flex flex-col gap-4">
			<div className="flex items-center justify-end">
				<Button
					size="sm"
					onClick={handleScheduleMeeting}
				>
					<CalendarPlus data-icon="inline-start" />
					Schedule Meeting
				</Button>
			</div>
			{meetingsQuery.isLoading ? (
				<div className="flex flex-col gap-3">
					<Skeleton className="h-28 rounded-md" />
					<Skeleton className="h-28 rounded-md" />
				</div>
			) : meetingsQuery.isError ? (
				<div className="rounded-md border bg-background px-5 py-8 text-sm text-muted-foreground">Meetings could not be loaded.</div>
			) : meetings.length === 0 ? (
				<Empty className="min-h-80 rounded-md border bg-background">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<CalendarPlus />
						</EmptyMedia>
						<EmptyTitle>No meetings yet</EmptyTitle>
						<EmptyDescription>Schedule a discovery, kickoff, or account review meeting.</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button
							variant="outline"
							size="sm"
							onClick={handleScheduleMeeting}
						>
							<Plus data-icon="inline-start" />
							Schedule Meeting
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<div className="flex flex-col gap-3">
					{meetings.map((meeting, index) => (
						<article
							key={meeting.activityId ?? `meeting-${index}`}
							className="rounded-md border bg-background p-4 transition-colors hover:bg-muted/30"
						>
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div className="min-w-0">
									<h3 className="truncate text-sm font-medium">{meeting.title}</h3>
									<p className="mt-1 text-xs text-muted-foreground">{formatDateTime(meeting.scheduledAt)}</p>
								</div>
								<Badge
									variant="outline"
									className="shrink-0 bg-blue-50 text-blue-700"
								>
									{meeting.statusLabel ?? formatStatus(meeting.status)}
								</Badge>
							</div>
							<div className="mt-4 grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-2">
								<div className="flex items-center gap-2">
									<CalendarClock className="size-4" />
									<span>{meeting.typeLabel ?? "Meeting"}</span>
								</div>
								<div className="flex items-center gap-2">
									<MapPin className="size-4" />
									<span>{getLocationType(meeting.description)}</span>
								</div>
							</div>
						</article>
					))}
				</div>
			)}
			<ScheduleMeetingModal
				clientId={client.clientId}
				clientName={clientName}
				open={meetingModalOpen}
				onOpenChange={setMeetingModalOpen}
			/>
		</section>
	);
}

function formatStatus(status: string) {
	if (status.startsWith("enums.")) {
		const raw = status.split(".").pop() ?? status;
		return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
	}
	return status;
}

function getLocationType(description: string | null | undefined) {
	const match = description?.match(/^Location Type:\s*(.+)$/m);
	return match?.[1] ?? "Location not set";
}

function formatDateTime(value: string | null | undefined) {
	if (!value) {
		return "Time not set";
	}

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(value));
}
