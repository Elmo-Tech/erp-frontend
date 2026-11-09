"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { TaskFormDialog } from "@/features/projects/components/tabs/TaskFormDialog";
import { PipelineTaskDialog } from "@/features/projects/components/pipeline/PipelineTaskDialog";
import { useProjectPipeline } from "@/features/projects/hooks/useProjectPipeline";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Task } from "@/features/dashboard/types/task";
import { TaskDetailSheet } from "@/features/projects/components/tasks/TaskDetailSheet";
import { TaskStatusSections } from "@/features/projects/components/pipeline/TaskStatusSections";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";

interface DashboardTask {
	taskId: number; title: string; project: string | null; projectId: number | null;
	status: string; statusColor: string | null; statusPosition?: number | null; priority: string | null; dueDate: string | null; assignees: string[];
}

export function CompanyTasksList({ variant = "dashboard" }: { variant?: "dashboard" | "page" }) {
	const { hasPermission, user } = useAuthStore();
	const enabled = Boolean(hasPermission?.("view_tasks") || hasPermission?.("manage_tasks") || hasPermission?.("view_all_tasks"));
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<number | null>(null);
	const [editing, setEditing] = useState<Task | null>(null);
	const query = useQuery({
		queryKey: ["tasks", "dashboard-list", user?.userId], enabled, staleTime: 30_000, refetchInterval: 60_000,
		queryFn: async () => (await api.get<{ data: DashboardTask[] }>("/tasks/dashboard-list")).data.data,
	});
	const groups = useMemo(() => {
		const result = new Map<string, DashboardTask[]>();
		const term = search.trim().toLocaleLowerCase();
		for (const task of query.data ?? []) {
			if (term && ![task.title, task.project ?? "", task.status, ...task.assignees].some((value) => value.toLocaleLowerCase().includes(term))) continue;
			const group = result.get(task.status) ?? [];
			group.push(task);
			result.set(task.status, group);
		}
		return [...result.entries()].sort(([left, leftTasks], [right, rightTasks]) => (leftTasks[0].statusPosition ?? Number.MAX_SAFE_INTEGER) - (rightTasks[0].statusPosition ?? Number.MAX_SAFE_INTEGER) || left.localeCompare(right));
	}, [query.data, search]);
	if (!enabled) return null;
	const visibleCount = groups.reduce((count, [, tasks]) => count + tasks.length, 0);
	return <Card>
		<CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div><CardTitle>Tasks by status</CardTitle><CardDescription>Tasks you can access, grouped by their actual status. Select a task for details.</CardDescription></div>
			<div className="relative w-full sm:max-w-sm"><Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" aria-label={variant === "page" ? "Search tasks" : "Search dashboard tasks"} placeholder="Search tasks, projects or people" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
		</CardHeader>
		<CardContent>
			{query.isLoading ? <p className="text-sm text-muted-foreground">Loading tasks...</p> : query.isError ? <div className="text-sm" role="alert">Could not load tasks. <Button size="sm" variant="outline" onClick={() => void query.refetch()}>Retry</Button></div> : <>
				<p className="mb-3 text-sm text-muted-foreground">{visibleCount} {visibleCount === 1 ? "task" : "tasks"}{search && ` matching “${search}”`}</p>
				<div className={variant === "dashboard" ? "max-h-[65vh] overflow-auto pr-1" : undefined}>
					<TaskStatusSections showProject storageKey={variant === "page" && user?.userId ? `task-status-collapse:v1:${user.userId}` : undefined} groups={groups.map(([status, tasks]) => ({
						id: status, name: status, color: tasks[0].statusColor,
						tasks: tasks.map((task) => ({ id: task.taskId, title: task.title, project: task.project, projectId: task.projectId, assignees: task.assignees, dueDate: task.dueDate, priority: task.priority, onOpen: () => setSelected(task.taskId) })),
					}))} />
					{groups.length === 0 && <p className="py-4 text-sm text-muted-foreground">No tasks found.</p>}
				</div>
			</>}
		</CardContent>
		{selected !== null && <TaskDetailSheet taskId={selected} open onOpenChange={(open) => { if (!open) setSelected(null); }} onEdit={(task) => { setSelected(null); setEditing(task); }} />}
		{editing && (editing.isPipelineTask && editing.projectId ? <PipelineTaskEditor task={editing} onClose={() => setEditing(null)} /> : <TaskFormDialog projectId={editing.projectId || 0} task={editing} defaultType={editing.type} open onOpenChange={(open) => { if (!open) setEditing(null); }} />)}
	</Card>;
}

function PipelineTaskEditor({ task, onClose }: { task: Task; onClose: () => void }) {
	const pipeline = useProjectPipeline(task.projectId);
	const stage = pipeline.data?.stages.find((item) => item.tasks.some((entry) => entry.taskId === task.taskId));
	const pipelineTask = stage?.tasks.find((entry) => entry.taskId === task.taskId);
	if (stage && pipelineTask && pipeline.data) return <PipelineTaskDialog projectId={task.projectId} stage={stage} stages={pipeline.data.stages} task={pipelineTask} open onOpenChange={(open) => { if (!open) onClose(); }} />;
	return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent><DialogHeader><DialogTitle>Edit task</DialogTitle><DialogDescription>{pipeline.isLoading ? "Loading task details…" : pipeline.isError ? "Could not load the project task. Try again." : "This task is no longer available in the project."}</DialogDescription></DialogHeader>{pipeline.isError && <Button variant="outline" onClick={() => void pipeline.refetch()}>Retry</Button>}</DialogContent></Dialog>;
}
