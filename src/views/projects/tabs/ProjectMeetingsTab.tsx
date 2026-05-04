"use client";

/**
 * ProjectMeetingsTab
 *
 * Reuses the polymorphic MeetingsList and PolyMeetingForm components
 * already built for Leads and Clients — just passes modelType="project".
 *
 * No new meeting logic needed here; the shared components handle
 * scheduling, status transitions, and completion notes automatically.
 */

import { MeetingsList } from "@/entities/meetings/ui/MeetingsList";
import { PolyMeetingForm } from "@/features/meetings/ui/PolyMeetingForm";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectMeetingsTabProps {
	projectId: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProjectMeetingsTab({ projectId }: ProjectMeetingsTabProps) {
	return (
		<div className="flex flex-col gap-4">
			<PolyMeetingForm
				modelType="project"
				modelId={projectId}
			/>
			<MeetingsList
				modelType="project"
				modelId={projectId}
			/>
		</div>
	);
}
