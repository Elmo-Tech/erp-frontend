"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { TaskDetailSheet } from "@/features/projects/components/tasks/TaskDetailSheet";
import { TaskStatusSections } from "@/features/projects/components/pipeline/TaskStatusSections";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";

interface DashboardTask {
	taskId: number; title: string; project: string | null; projectId: number | null;
	status: string; statusColor: string | null; priority: string | null; dueDate: string | null; assignees: string[];
}

export function CompanyTasksList({ variant = "dashboard" }: { variant?: "dashboard" | "page" }) {
	const { hasPermission, user } = useAuthStore();
	const enabled = Boolean(hasPermission?.("view_tasks") || hasPermission?.("manage_tasks"));
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<number | null>(null);
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
		return [...result.entries()].sort(([left], [right]) => left.localeCompare(right));
	}, [query.data, search]);
	if (!enabled) return null;
	const visibleCount = groups.reduce((count, [, tasks]) => count + tasks.length, 0);
	return <Card>
		<CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div><CardTitle>Tasks by status</CardTitle><CardDescription>All tasks in projects you can access, grouped by their actual status. Select a task for details.</CardDescription></div>
			<div className="relative w-full sm:max-w-sm"><Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" aria-label={variant === "page" ? "Search tasks" : "Search dashboard tasks"} placeholder="Search tasks, projects or people" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
		</CardHeader>
		<CardContent>
			{query.isLoading ? <p className="text-sm text-muted-foreground">Loading tasks...</p> : query.isError ? <div className="text-sm" role="alert">Could not load tasks. <Button size="sm" variant="outline" onClick={() => void query.refetch()}>Retry</Button></div> : <>
				<p className="mb-3 text-sm text-muted-foreground">{visibleCount} {visibleCount === 1 ? "task" : "tasks"}{search && ` matching “${search}”`}</p>
				<div className={variant === "dashboard" ? "max-h-[65vh] overflow-auto pr-1" : undefined}>
					<TaskStatusSections showProject groups={groups.map(([status, tasks]) => ({
						id: status, name: status, color: tasks[0].statusColor,
						tasks: tasks.map((task) => ({ id: task.taskId, title: task.title, project: task.project, assignees: task.assignees, dueDate: task.dueDate, priority: task.priority, onOpen: () => setSelected(task.taskId) })),
					}))} />
					{groups.length === 0 && <p className="py-4 text-sm text-muted-foreground">No tasks found.</p>}
				</div>
			</>}
		</CardContent>
		{selected !== null && <TaskDetailSheet taskId={selected} open onOpenChange={(open) => { if (!open) setSelected(null); }} />}
	</Card>;
}
