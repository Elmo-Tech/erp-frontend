"use client";

import { use } from "react";
import { ProjectDetailsTabs } from "@/features/projects/components/ProjectDetailsTabs";

interface ProjectDetailsPageProps {
	params: Promise<{ id: string }>;
}

export default function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
	const { id } = use(params);
	const projectId = parseInt(id, 10);

	return <ProjectDetailsTabs projectId={projectId} />;
}
