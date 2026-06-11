"use client";

import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface ProjectListHeaderProps {
	canCreateProjects: boolean;
	onCreateProject: () => void;
}

export function ProjectListHeader({ canCreateProjects, onCreateProject }: ProjectListHeaderProps) {
	return (
		<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
			<div className="min-w-0">
				<h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
				<p className="text-sm text-muted-foreground">Track client work, budgets, deadlines, and delivery status.</p>
			</div>

			{canCreateProjects && (
				<Button
					size="sm"
					onClick={onCreateProject}
				>
					<Plus data-icon="inline-start" />
					New project
				</Button>
			)}
		</div>
	);
}
