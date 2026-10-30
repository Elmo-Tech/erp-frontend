"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PipelineTask, ProjectWorkflowStage } from "../../types/pipeline";

interface ProjectTaskListProps {
	stages: ProjectWorkflowStage[];
	onOpen: (task: PipelineTask) => void;
	onCreate: (stage: ProjectWorkflowStage) => void;
	canCreate: boolean;
}

export function ProjectTaskList({ stages, onOpen, onCreate, canCreate }: ProjectTaskListProps) {
	const [search, setSearch] = useState("");
	const [collapsed, setCollapsed] = useState<number[]>([]);
	const query = search.trim().toLowerCase();
	return (
		<div className="space-y-4 rounded-2xl border bg-card p-4 sm:p-5">
			<div className="relative max-w-sm"><Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search project tasks" placeholder="Search tasks..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" /></div>
			{stages.map((stage) => {
				const tasks = stage.tasks.filter((task) => !query || task.title.toLowerCase().includes(query) || task.assignees.some((person) => person.name.toLowerCase().includes(query)));
				const isCollapsed = collapsed.includes(stage.stageId);
				return (
					<section key={stage.stageId}>
						<div className="flex flex-wrap items-center gap-2 rounded-lg px-2 py-1" style={{ backgroundColor: `color-mix(in oklch, ${stage.color} 12%, transparent)` }}>
							<button type="button" aria-expanded={!isCollapsed} onClick={() => setCollapsed((old) => isCollapsed ? old.filter((id) => id !== stage.stageId) : [...old, stage.stageId])} className="inline-flex items-center gap-2 rounded-md p-1 text-left text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring">
								{isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}<span className="size-2 rounded-full" style={{ backgroundColor: stage.color }} />{stage.name}<span className="text-muted-foreground">({tasks.length})</span>
							</button>
							{canCreate && <Button variant="ghost" size="sm" onClick={() => onCreate(stage)}>+ Add task</Button>}
						</div>
						{!isCollapsed && <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="p-3 font-medium">Task</th><th className="p-3 font-medium">Assignee</th><th className="p-3 font-medium">Due date</th><th className="p-3 font-medium">Priority</th></tr></thead><tbody>{tasks.map((task) => <tr key={task.taskId} className="border-b last:border-0 hover:bg-muted/30"><td className="p-3"><button type="button" onClick={() => onOpen(task)} className="text-left font-medium hover:text-primary hover:underline">{task.title}</button></td><td className="p-3 text-muted-foreground">{task.assignees.map((person) => person.name).join(", ") || "Unassigned"}</td><td className="p-3 text-muted-foreground">{task.dueDate || "—"}</td><td className="p-3 capitalize">{task.priority}</td></tr>)}</tbody></table>{tasks.length === 0 && <p className="px-3 py-4 text-sm text-muted-foreground">No matching tasks</p>}</div>}
					</section>
				);
			})}
		</div>
	);
}
