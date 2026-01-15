"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectsTable, CreateProjectForm, UpdateProjectForm } from "../projects";
import { Project } from "../../types/project";
import { usePermissions } from "@/features/admin/hooks/usePermissions";

export function ProjectsWrapper() {
	const router = useRouter();
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showUpdateDialog, setShowUpdateDialog] = useState(false);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const { canCreateProjects } = usePermissions();

	const handleProjectClick = (project: Project) => {
		router.push(`/dashboard/projects/${project.projectId}`);
	};

	const handleCreateProject = () => {
		setShowCreateDialog(true);
	};

	const handleUpdateClose = () => {
		setShowUpdateDialog(false);
		setSelectedProject(null);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Projects</h1>
				<p className="text-muted-foreground">Manage projects and contracts</p>
			</div>

			<ProjectsTable
				onProjectClick={handleProjectClick}
				onCreateProject={canCreateProjects ? handleCreateProject : undefined}
			/>

			{canCreateProjects && (
				<CreateProjectForm
					open={showCreateDialog}
					onOpenChange={setShowCreateDialog}
					clientId={0}
				/>
			)}

			{selectedProject && (
				<UpdateProjectForm
					open={showUpdateDialog}
					onOpenChange={handleUpdateClose}
					project={selectedProject}
				/>
			)}
		</div>
	);
}
