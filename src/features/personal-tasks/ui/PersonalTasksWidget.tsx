"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Check, Play, Plus, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useActivePersonalTimeEntry, useCompletePersonalTask, useCreatePersonalTask, useDeletePersonalTask, usePersonalTasks, useTogglePersonalTaskTimer, type PersonalTask } from "@/features/personal-tasks/api/personal-tasks.api";
import { mapPersonalTaskFormToPayload, personalTaskFormDefaults, personalTaskSchema, type PersonalTaskFormData } from "@/features/personal-tasks/model/personal-task-forms";
import { elapsedSecondsSince, formatElapsedTime } from "@/features/time-tracking/model/timer-format";
import { cn } from "@/shared/lib/utils";
import { TaskPriority, TaskPriorityColors, TaskPriorityLabels } from "@/shared/lib/statusHelpers";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { Skeleton } from "@/shared/ui/skeleton";

function formatLoggedMinutes(minutes: number) {
	if (minutes <= 0) return "0m";
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function statusLabel(task: PersonalTask) {
	if (task.status === "done") return "Done";
	if (task.status === "in_progress") return "In Progress";
	return "To Do";
}

function formatDueDate(value: string | null | undefined) {
	if (!value) return "No due date";
	return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface PersonalTasksWidgetProps {
	className?: string;
}

export function PersonalTasksWidget({ className }: PersonalTasksWidgetProps) {
	const [createOpen, setCreateOpen] = useState(false);
	const tasksQuery = usePersonalTasks();
	const activeQuery = useActivePersonalTimeEntry();
	const createTask = useCreatePersonalTask();
	const completeTask = useCompletePersonalTask();
	const deleteTask = useDeletePersonalTask();
	const toggleTimer = useTogglePersonalTaskTimer();
	const form = useForm<PersonalTaskFormData>({
		resolver: zodResolver(personalTaskSchema),
		defaultValues: personalTaskFormDefaults,
	});

	const activeEntry = activeQuery.data;
	const activeTaskId = activeEntry?.personalTaskId ?? null;
	const activeTask = useMemo(() => (tasksQuery.data ?? []).find((task) => task.taskId === activeTaskId) ?? null, [activeTaskId, tasksQuery.data]);

	const handleSubmit = form.handleSubmit((data) => {
		createTask.mutate(
			mapPersonalTaskFormToPayload(data),
			{
				onSuccess: () => {
					form.reset(personalTaskFormDefaults);
					setCreateOpen(false);
					toast.success("Personal task created.");
				},
				onError: () => toast.error("Failed to create personal task."),
			},
		);
	});

	const handleToggleTimer = (taskId: number) => {
		toggleTimer.mutate(taskId, {
			onError: () => toast.error("Failed to toggle personal timer."),
		});
	};

	const handleComplete = (taskId: number) => {
		completeTask.mutate(taskId, {
			onSuccess: () => toast.success("Personal task completed."),
			onError: () => toast.error("Failed to complete personal task."),
		});
	};

	const handleDelete = (taskId: number) => {
		deleteTask.mutate(taskId, {
			onSuccess: () => toast.success("Personal task deleted."),
			onError: () => toast.error("Failed to delete personal task."),
		});
	};

	const tasks = tasksQuery.data ?? [];
	const openTasks = tasks.filter((task) => task.status !== "done");
	const doneTasks = tasks.filter((task) => task.status === "done").slice(0, 4);

	return (
		<Card className={cn("lg:col-span-2", className)}>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between gap-3">
					<CardTitle className="flex items-center gap-2 text-base">
						<Plus className="size-4 text-muted-foreground" />
						Personal Tasks
					</CardTitle>
					<Button type="button" size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
						<Plus className="size-4" />
						New
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{activeEntry?.startTime && (
					<div className="flex items-center justify-between gap-3 rounded-md border border-emerald-400/30 bg-emerald-500/8 px-3 py-2">
						<div className="min-w-0">
							<p className="truncate text-sm font-medium">{activeTask?.title ?? activeEntry.task?.title ?? "Personal task"}</p>
							<p className="text-xs text-emerald-700 dark:text-emerald-300">{formatElapsedTime(elapsedSecondsSince(activeEntry.startTime))}</p>
						</div>
						<Button type="button" variant="destructive" size="sm" className="gap-2" disabled={toggleTimer.isPending} onClick={() => handleToggleTimer(activeEntry.personalTaskId)}>
							<Square className="size-3.5" />
							Stop
						</Button>
					</div>
				)}

				{tasksQuery.isLoading ? (
					<div className="space-y-2">
						<Skeleton className="h-14 w-full" />
						<Skeleton className="h-14 w-full" />
					</div>
				) : openTasks.length || doneTasks.length ? (
					<div className="max-h-[520px] divide-y overflow-y-auto rounded-md border">
						{[...openTasks, ...doneTasks].map((task) => {
							const running = activeTaskId === task.taskId;
							return (
								<div key={task.taskId} className="flex min-w-0 flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
									<div className="min-w-0">
										<p className="truncate text-sm font-medium">{task.title}</p>
										<div className="mt-1 flex flex-wrap items-center gap-2">
											<Badge variant={task.status === "done" ? "secondary" : "outline"} className="capitalize">
												{statusLabel(task)}
											</Badge>
											<Badge variant="outline" className={cn("capitalize", TaskPriorityColors[task.priority])}>
												{TaskPriorityLabels[task.priority]}
											</Badge>
											<span className="text-xs text-muted-foreground">{formatDueDate(task.dueDate)}</span>
											<span className="text-xs tabular-nums text-muted-foreground">{formatLoggedMinutes(task.totalLoggedMinutes)}</span>
										</div>
									</div>
									<div className="flex shrink-0 items-center gap-1">
										{task.status !== "done" && (
											<Button type="button" variant={running ? "destructive" : "outline"} size="icon-sm" disabled={toggleTimer.isPending} onClick={() => handleToggleTimer(task.taskId)} aria-label={running ? "Stop personal timer" : "Start personal timer"}>
												{running ? <Square className="size-3.5" /> : <Play className="size-3.5" />}
											</Button>
										)}
										{task.status !== "done" && (
											<Button type="button" variant="ghost" size="icon-sm" disabled={completeTask.isPending} onClick={() => handleComplete(task.taskId)} aria-label="Complete personal task">
												<Check className="size-3.5" />
											</Button>
										)}
										<Button type="button" variant="ghost" size="icon-sm" disabled={deleteTask.isPending} onClick={() => handleDelete(task.taskId)} aria-label="Delete personal task">
											<Trash2 className="size-3.5" />
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="flex min-h-28 items-center justify-center rounded-md border border-dashed text-center text-sm text-muted-foreground">No personal tasks yet.</div>
				)}
			</CardContent>
			<FormDialog
				open={createOpen}
				onOpenChange={(open) => {
					setCreateOpen(open);
					if (!open) form.reset(personalTaskFormDefaults);
				}}
				title="New Personal Task"
				description="Create a task for your own workload."
				submitLabel="Create Task"
				isLoading={createTask.isPending}
				onSubmit={handleSubmit}
				size="md"
			>
				<Form {...form}>
					<div className="flex flex-col gap-4">
						<FormInput
							control={form.control}
							name="title"
							label="Task title"
							placeholder="e.g. Prepare weekly notes"
						/>
						<FormTextarea
							control={form.control}
							name="description"
							label="Description"
							placeholder="What needs to be done?"
							rows={3}
						/>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<FormInput
								control={form.control}
								name="dueDate"
								label="Due date"
								type="date"
							/>
							<FormSelect
								control={form.control}
								name="priority"
								label="Priority"
								options={[
									{ value: TaskPriority.LOW, label: TaskPriorityLabels[TaskPriority.LOW] },
									{ value: TaskPriority.MEDIUM, label: TaskPriorityLabels[TaskPriority.MEDIUM] },
									{ value: TaskPriority.HIGH, label: TaskPriorityLabels[TaskPriority.HIGH] },
									{ value: TaskPriority.URGENT, label: TaskPriorityLabels[TaskPriority.URGENT] },
								]}
							/>
						</div>
					</div>
				</Form>
			</FormDialog>
		</Card>
	);
}
