"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectList } from "@/features/projects/components/ProjectList";
import { ProjectFormDialog } from "@/features/projects/components/ProjectFormDialog";
import { Project } from "@/features/projects/types/project";

export default function ProjectsPage() {
	const router = useRouter();
	const [showCreateDialog, setShowCreateDialog] = useState(false);

	const handleProjectClick = (project: Project) => {
		router.push(`/dashboard/projects/${project.projectId}`);
	};

	const handleCreateProject = () => {
		setShowCreateDialog(true);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Projects</h1>
				<p className="text-muted-foreground">Manage projects and contracts</p>
			</div>

			<ProjectList
				onProjectClick={handleProjectClick}
				onCreateProject={handleCreateProject}
			/>

			<ProjectFormDialog
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
			/>
		</div>
	);
}
