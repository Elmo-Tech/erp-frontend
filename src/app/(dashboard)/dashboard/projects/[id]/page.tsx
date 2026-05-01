import ProjectDetailsPageView from "@/views/projects/ProjectDetailsPage";

interface ProjectDetailsPageProps {
	params: Promise<{ id: string }>;
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
	const { id } = await params;

	return <ProjectDetailsPageView projectId={Number(id)} />;
}
