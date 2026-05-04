import { ProjectDetailsView } from "@/views/projects/ProjectDetailsView";

interface ProjectDetailsPageProps {
	params: Promise<{ id: string }>;
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
	const { id } = await params;
	const projectId = Number(id);

	return <ProjectDetailsView projectId={projectId} />;
}
