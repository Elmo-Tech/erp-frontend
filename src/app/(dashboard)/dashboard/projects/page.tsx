"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProjectList } from "@/features/projects/components/ProjectList";
import { ProjectDetails } from "@/features/projects/components/ProjectDetails";
import { Project } from "@/features/projects/types/project";

export default function ProjectsPage() {
	const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

	const handleProjectClick = (project: Project) => {
		setSelectedProjectId(project.projectId);
	};

	const handleCloseDetails = () => {
		setSelectedProjectId(null);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Projects</h1>
				<p className="text-muted-foreground">Manage projects and contracts</p>
			</div>

			<ProjectList onProjectClick={handleProjectClick} />

			{/* Project Details Dialog */}
			<Dialog
				open={!!selectedProjectId}
				onOpenChange={() => handleCloseDetails()}
			>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Project Details</DialogTitle>
					</DialogHeader>
					{selectedProjectId && (
						<ProjectDetails
							projectId={selectedProjectId}
							onProjectUpdate={() => {}}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
