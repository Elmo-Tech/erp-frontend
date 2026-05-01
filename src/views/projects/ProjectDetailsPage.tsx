"use client";

import { ProjectDetailsComposite } from "@/widgets/project-management/ui/ProjectDetailsComposite";

interface ProjectDetailsPageProps {
	projectId: number;
}

export default function ProjectDetailsPage({ projectId }: ProjectDetailsPageProps) {
	return <ProjectDetailsComposite projectId={projectId} />;
}
