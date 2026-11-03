"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TaskDetailSheet } from "@/features/projects/components/tasks/TaskDetailSheet";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";

interface DashboardTask {
	taskId: number; title: string; project: string | null; projectId: number | null;
	status: string; statusColor: string | null; priority: string | null; dueDate: string | null; assignees: string[];
}

export function CompanyTasksList() {
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
			<Input className="sm:max-w-64" aria-label="Search dashboard tasks" placeholder="Search tasks, projects or people" value={search} onChange={(event) => setSearch(event.target.value)} />
		</CardHeader>
		<CardContent>
			{query.isLoading ? <p className="text-sm text-muted-foreground">Loading tasks...</p> : query.isError ? <div className="text-sm" role="alert">Could not load tasks. <Button size="sm" variant="outline" onClick={() => void query.refetch()}>Retry</Button></div> : <>
				<p className="mb-3 text-sm text-muted-foreground">{visibleCount} {visibleCount === 1 ? "task" : "tasks"}{search && ` matching “${search}”`}</p>
				<div className="max-h-[65vh] space-y-3 overflow-auto pr-1">
					{groups.map(([status, tasks]) => <section key={status} className="overflow-hidden rounded-lg border" aria-label={`${status} tasks`}>
						<div className="flex items-center gap-2 bg-muted/60 px-4 py-2 font-semibold"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tasks[0].statusColor || "#64748b" }} />{status}<span className="text-sm font-normal text-muted-foreground">({tasks.length})</span></div>
						{tasks.map((task) => <button key={task.taskId} type="button" onClick={() => setSelected(task.taskId)} className="grid w-full gap-1 border-t px-4 py-3 text-left text-sm hover:bg-muted/40 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
							<span className="font-medium">{task.title}</span><span className="text-muted-foreground">{task.project ?? "No project"}</span><span className="text-muted-foreground">{task.assignees.join(", ") || "Unassigned"}</span><span className="text-muted-foreground">{task.dueDate ? `Due ${task.dueDate}` : "No deadline"}</span>
						</button>)}
					</section>)}
					{groups.length === 0 && <p className="py-4 text-sm text-muted-foreground">No tasks found.</p>}
				</div>
			</>}
		</CardContent>
		{selected !== null && <TaskDetailSheet taskId={selected} open onOpenChange={(open) => { if (!open) setSelected(null); }} />}
	</Card>;
}
