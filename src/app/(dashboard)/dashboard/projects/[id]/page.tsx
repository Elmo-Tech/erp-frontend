"use client";

import { use } from "react";
import { ProjectDetailsComposite } from "@/widgets/project-management/ui/ProjectDetailsComposite";

interface ProjectDetailsPageProps {
	params: Promise<{ id: string }>;
}

export default function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
	const { id } = use(params);
	const projectId = parseInt(id, 10);

	return <ProjectDetailsComposite projectId={projectId} />;
}
