"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, CircleDashed, Clock, ListTodo, Search } from "lucide-react";
import {
	ExecutionTaskStatus,
	ExecutionTaskStatusLabels,
	useTaskControlTasks,
	type ExecutionTaskStatusValue,
	type ProjectTask,
} from "@/features/projects/api/execution.api";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { formatDateDisplay } from "@/shared/lib/dateUtils";
import { cn } from "@/shared/lib/utils";

type TaskControlStatus = "all" | "unassigned" | "active" | ExecutionTaskStatusValue;

interface EnrichedProjectTask extends ProjectTask {
	projectTitle: string;
	clientName: string;
	deadline: string | null;
}

const activeStatuses = new Set<string>([ExecutionTaskStatus.TO_DO, ExecutionTaskStatus.IN_PROGRESS, ExecutionTaskStatus.IN_REVIEW, ExecutionTaskStatus.QA]);

function normalizeStatus(status: string) {
	return ExecutionTaskStatusLabels[status as ExecutionTaskStatusValue] ?? status.replaceAll("_", " ");
}

function formatDueDate(value: string | null | undefined) {
	if (!value) return "No due date";
	return formatDateDisplay(value);
}

function buildTaskRows(tasks: ProjectTask[]): EnrichedProjectTask[] {
	return tasks.map((task) => ({
		...task,
		projectTitle: task.project?.title ?? "Project",
		clientName: task.project?.client?.name ?? "No client",
		deadline: task.dueDate ?? null,
	}));
}

export default function TaskControlPage() {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<TaskControlStatus>("active");

	const tasksQuery = useTaskControlTasks();
	const tasks = useMemo(() => buildTaskRows(tasksQuery.data ?? []), [tasksQuery.data]);
	const isLoading = tasksQuery.isLoading;
	const error = tasksQuery.error;

	const filteredTasks = useMemo(() => {
		const query = search.trim().toLowerCase();

		return tasks.filter((task) => {
			const matchesSearch =
				!query ||
				task.title.toLowerCase().includes(query) ||
				task.projectTitle.toLowerCase().includes(query) ||
				task.clientName.toLowerCase().includes(query) ||
				(task.assignee?.name ?? "unassigned").toLowerCase().includes(query);

			const matchesStatus =
				statusFilter === "all" ||
				(statusFilter === "unassigned" && !task.assigneeId) ||
				(statusFilter === "active" && activeStatuses.has(task.status)) ||
				task.status === statusFilter;

			return matchesSearch && matchesStatus;
		});
	}, [search, statusFilter, tasks]);

	const activeCount = tasks.filter((task) => activeStatuses.has(task.status)).length;
	const inProgressCount = tasks.filter((task) => task.status === ExecutionTaskStatus.IN_PROGRESS).length;
	const unassignedCount = tasks.filter((task) => !task.assigneeId).length;
	const doneCount = tasks.filter((task) => task.status === ExecutionTaskStatus.DONE).length;

	return (
		<section className="flex flex-col gap-5">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Task Control</h1>
				<p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, dd MMM yyyy")}</p>
			</div>

			<div className="grid gap-3 md:grid-cols-4">
				<TaskMetric label="Active" value={activeCount} icon={ListTodo} />
				<TaskMetric label="In progress" value={inProgressCount} icon={Clock} />
				<TaskMetric label="Unassigned" value={unassignedCount} icon={CircleDashed} />
				<TaskMetric label="Done" value={doneCount} icon={CheckCircle2} />
			</div>

			<Card>
				<CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
					<CardTitle className="text-base">All Project Tasks</CardTitle>
					<div className="flex flex-col gap-2 sm:flex-row">
						<div className="relative min-w-64">
							<Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search task, client, project, assignee" className="pl-8" />
						</div>
						<Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskControlStatus)}>
							<SelectTrigger className="w-full sm:w-44">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="unassigned">Unassigned</SelectItem>
								<SelectItem value={ExecutionTaskStatus.TO_DO}>To Do</SelectItem>
								<SelectItem value={ExecutionTaskStatus.IN_PROGRESS}>In Progress</SelectItem>
								<SelectItem value={ExecutionTaskStatus.IN_REVIEW}>In Review</SelectItem>
								<SelectItem value={ExecutionTaskStatus.QA}>QA</SelectItem>
								<SelectItem value={ExecutionTaskStatus.DONE}>Done</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-2">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</div>
					) : error ? (
						<div className="flex min-h-40 items-center justify-center gap-2 rounded-md border text-sm text-destructive">
							<AlertCircle className="size-4" />
							{error.message}
						</div>
					) : filteredTasks.length === 0 ? (
						<div className="flex min-h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">No tasks match the current filters.</div>
					) : (
						<div className="overflow-x-auto rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Task</TableHead>
										<TableHead>Client</TableHead>
										<TableHead>Project</TableHead>
										<TableHead>Assignee</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Delivery</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredTasks.map((task) => (
										<TableRow key={task.taskId}>
											<TableCell className="min-w-64">
												<div className="font-medium">{task.title}</div>
												{task.description && <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{task.description}</div>}
											</TableCell>
											<TableCell className="whitespace-nowrap text-sm">{task.clientName}</TableCell>
											<TableCell className="min-w-44 text-sm text-muted-foreground">{task.projectTitle}</TableCell>
											<TableCell className={cn("whitespace-nowrap text-sm", !task.assignee && "text-amber-700")}>{task.assignee?.name ?? "Unassigned"}</TableCell>
											<TableCell>
												<Badge variant="outline" className="rounded-sm capitalize">
													{normalizeStatus(task.status)}
												</Badge>
											</TableCell>
											<TableCell className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{formatDueDate(task.deadline)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</section>
	);
}

function TaskMetric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof ListTodo }) {
	return (
		<div className="rounded-md border bg-background px-3 py-2.5">
			<div className="flex items-center gap-2 text-xs text-muted-foreground">
				<Icon className="size-4" />
				{label}
			</div>
			<div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
		</div>
	);
}
