"use client";

import { ProjectDetailsView } from "@/views/projects/ProjectDetailsView";

interface ProjectDetailsPageProps {
	projectId: number;
}

export default function ProjectDetailsPage({ projectId }: ProjectDetailsPageProps) {
	return <ProjectDetailsView projectId={projectId} />;
}
