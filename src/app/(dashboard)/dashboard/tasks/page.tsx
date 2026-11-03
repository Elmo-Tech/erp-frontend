"use client";

import { useState } from "react";
import { useTasks } from "@/features/dashboard/hooks/useTasks";
import { TaskDetailSheet } from "@/features/projects/components/tasks/TaskDetailSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TasksPage() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<number | null>(null);
	const { data, isLoading, isError } = useTasks({ page, perPage: 25, search });
	return <div className="space-y-5">
		<div><h1 className="text-2xl font-semibold">Tasks</h1><p className="text-muted-foreground">Browse tasks across the projects you can access. Select a task to see its details.</p></div>
		<Input aria-label="Search tasks" placeholder="Search tasks" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="max-w-sm" />
		{isLoading ? <p>Loading tasks...</p> : isError ? <p role="alert">Unable to load tasks.</p> : <div className="space-y-2">
			{data?.tasks.map((task) => <button key={task.taskId} type="button" onClick={() => setSelected(task.taskId)} className="block w-full rounded-lg border bg-card p-4 text-left hover:bg-muted/50">
				<span className="font-medium">{task.title}</span><span className="ml-2 text-sm text-muted-foreground">{task.project?.title ?? "No project"}</span>
				<p className="mt-1 text-sm text-muted-foreground">{task.workflowStage?.name ?? task.status} · {task.priority} · {task.dueDate ? `Due ${task.dueDate}` : "No deadline"}</p>
				{task.description && <p className="mt-2 line-clamp-2 text-sm">{task.description}</p>}
				<p className="mt-2 text-sm text-muted-foreground">Assigned: {task.assignees?.map((a) => a.user?.name).filter(Boolean).join(", ") || task.assignee?.name || "Unassigned"}</p>
			</button>)}
			{!data?.tasks.length && <p className="text-muted-foreground">No tasks found.</p>}
		</div>}
		{data && <div className="flex items-center gap-3"><Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><span className="text-sm">Page {data.pagination.currentPage} of {data.pagination.totalPages} · {data.pagination.total} tasks</span><Button variant="outline" disabled={page >= data.pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button></div>}
		<TaskDetailSheet taskId={selected} open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }} />
	</div>;
}
