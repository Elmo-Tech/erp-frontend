"use client";

import { NotesPanel } from "@/entities/notes";

interface ProjectNotesTabProps {
	projectId: number;
}

export function ProjectNotesTab({ projectId }: ProjectNotesTabProps) {
	return (
		<NotesPanel
			modelType="project"
			modelId={projectId}
		/>
	);
}
