"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { PipelineTask, ProjectWorkflowStage } from "../../types/pipeline";
import { TaskStatusSections } from "./TaskStatusSections";

interface ProjectTaskListProps {
	stages: ProjectWorkflowStage[];
	onOpen: (task: PipelineTask) => void;
	onCreate: (stage: ProjectWorkflowStage) => void;
	canCreate: boolean;
}

export function ProjectTaskList({ stages, onOpen, onCreate, canCreate }: ProjectTaskListProps) {
	const [search, setSearch] = useState("");
	const query = search.trim().toLowerCase();
	return (
		<div className="space-y-4 rounded-2xl border bg-card p-4 sm:p-5">
			<div className="relative max-w-sm"><Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search project tasks" placeholder="Search tasks..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" /></div>
			<TaskStatusSections groups={stages.map((stage) => ({
				id: String(stage.stageId), name: stage.name, color: stage.color,
				onCreate: canCreate ? () => onCreate(stage) : undefined,
				tasks: stage.tasks.filter((task) => !query || task.title.toLowerCase().includes(query) || task.assignees.some((person) => person.name.toLowerCase().includes(query))).map((task) => ({ id: task.taskId, title: task.title, assignees: task.assignees.map((person) => person.name), dueDate: task.dueDate, priority: task.priority, onOpen: () => onOpen(task) })),
			}))} />
		</div>
	);
}
