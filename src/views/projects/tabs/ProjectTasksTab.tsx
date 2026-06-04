"use client";

/**
 * ProjectTasksTab
 *
 * Assembles the full task execution board for a project:
 *
 *  1. Fetches milestones and all tasks in parallel.
 *  2. Renders a MilestoneSwimlane for each milestone, passing only
 *     the tasks that belong to it.
 *  3. Renders a "Backlog" section at the bottom for tasks with no
 *     milestone (milestoneId === null).
 *  4. Clicking any task card opens the TaskExecutionSheet.
 *  5. Header action buttons: "Add Milestone" and "Add Task".
 */

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Inbox, AlertCircle, Layers, Plus, ListTodo, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/Can";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FilterSelect } from "@/shared/ui/filters/FilterSelect";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormCombobox } from "@/shared/ui/forms/FormCombobox";
import { SearchInput } from "@/shared/ui/filters/SearchInput";
import { Input } from "@/shared/ui/input";
import { MilestoneSwimlane } from "@/features/projects/ui/MilestoneSwimlane";
import { ProjectTaskCard } from "@/features/projects/ui/ProjectTaskCard";
import { TaskExecutionSheet } from "@/features/projects/ui/TaskExecutionSheet";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { optionalNumberInput } from "@/shared/lib/zod-number";
import { ExecutionTaskStatus, ExecutionTaskStatusLabels, useMilestones, useProjectTasks, useProjectMembers, useCreateMilestone, useCreateTask } from "@/features/projects/api/execution.api";
import type { ProjectTask, ProjectTaskFilters } from "@/features/projects/api/execution.api";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { useTaskPermissions } from "@/entities/user/model/permissions";

// ─────────────────────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────────────────────

const addMilestoneSchema = z.object({
	title: z.string().trim().min(1, "Title is required").max(255),
});
type AddMilestoneFormData = z.infer<typeof addMilestoneSchema>;

const addTaskSchema = z.object({
	title: z.string().trim().min(1, "Title is required").max(255),
	description: z.string().optional(),
	milestoneId: z.string().optional(),
	assigneeId: z.string().optional(),
	estimatedHours: optionalNumberInput().optional().pipe(z.number().min(0).optional()),
	startDate: z.string().optional(),
	dueDate: z.string().optional(),
});
type AddTaskFormData = z.infer<typeof addTaskSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectTasksTabProps {
	projectId: number;
	initialTaskId?: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

function TasksBoardSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			{[1, 2].map((i) => (
				<div
					key={i}
					className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4"
				>
					{/* Swimlane header */}
					<div className="flex items-center justify-between">
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-5 w-16" />
					</div>
					<Skeleton className="h-1.5 w-full" />
					{/* Task cards */}
					<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
						{[1, 2, 3].map((j) => (
							<Skeleton
								key={j}
								className="h-36 rounded-xl"
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProjectTasksTab({ projectId, initialTaskId = null }: ProjectTasksTabProps) {
	const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
	const [taskDialogOpen, setTaskDialogOpen] = useState(false);
	const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
	const [dismissedInitialTask, setDismissedInitialTask] = useState(false);
	const [taskFilters, setTaskFilters] = useState<ProjectTaskFilters>({});

	const milestonesQuery = useMilestones(projectId);
	const tasksQuery = useProjectTasks(projectId, taskFilters);
	const membersQuery = useProjectMembers(projectId);
	const createMilestone = useCreateMilestone();
	const createTask = useCreateTask();

	// ── ABAC: Determine if the current user can manage tasks/milestones ───────
	// Priority order:
	//   1. manage_all_projects → full access (global bypass).
	//   2. manage_tasks → full access.
	//   3. create_tasks + project manager/tech_lead role → can add tasks/milestones.
	//   4. Everyone else (developers, QA, designers) → read-only view.
	const currentUserId = useAuthStore((s) => s.user?.userId);
	const canManageAllProjects = useAuthStore((s) => s.hasPermission("manage_all_projects"));
	const canManageProjects = useAuthStore((s) => s.hasPermission("manage_projects"));
	const { canManageTasks, canCreateTasks } = useTaskPermissions();

	// Derive the user's project-level role from the members list
	const currentMember = membersQuery.data?.find((m) => m.userId === currentUserId);
	const projectRole = currentMember?.role ?? null;
	const isProjectManagerLevel = projectRole === "manager" || projectRole === "tech_lead";

	// The user can add tasks/milestones if they are a global admin, have manage_tasks,
	// or have create_tasks AND are a project manager/tech_lead.
	const canAddMilestones = canManageAllProjects || canManageProjects;
	const canAddTasks = canManageAllProjects || canManageTasks || (canCreateTasks && isProjectManagerLevel);

	const milestoneForm = useForm<AddMilestoneFormData>({
		resolver: zodResolver(addMilestoneSchema),
		defaultValues: { title: "" },
	});

	const taskForm = useForm<AddTaskFormData>({
		resolver: zodResolver(addTaskSchema),
		defaultValues: { title: "", description: "", milestoneId: "", assigneeId: "", estimatedHours: undefined, startDate: "", dueDate: "" },
	});

	const handleOpenMilestoneDialog = useCallback(() => {
		milestoneForm.reset({ title: "" });
		setMilestoneDialogOpen(true);
	}, [milestoneForm]);

	const handleOpenTaskDialog = useCallback(() => {
		taskForm.reset({ title: "", description: "", milestoneId: "", assigneeId: "", estimatedHours: undefined, startDate: "", dueDate: "" });
		setTaskDialogOpen(true);
	}, [taskForm]);

	const handleMilestoneSubmit = milestoneForm.handleSubmit(async (data) => {
		try {
			await createMilestone.mutateAsync({ projectId, payload: { title: data.title } });
			toast.success("Milestone created.");
			setMilestoneDialogOpen(false);
			milestoneForm.reset();
		} catch {
			toast.error("Failed to create milestone.");
		}
	});

	const handleTaskSubmit = taskForm.handleSubmit(async (data) => {
		try {
			await createTask.mutateAsync({
				projectId,
				payload: {
					title: data.title,
					description: data.description?.trim() || undefined,
					milestoneId: data.milestoneId ? Number(data.milestoneId) : null,
					assigneeId: data.assigneeId ? Number(data.assigneeId) : null,
					estimatedHours: data.estimatedHours ?? null,
					startDate: data.startDate || null,
					dueDate: data.dueDate || null,
				},
			});
			toast.success("Task created.");
			setTaskDialogOpen(false);
			taskForm.reset();
		} catch {
			toast.error("Failed to create task.");
		}
	});

	const allTasks = tasksQuery.data ?? [];

	// ── Loading ──────────────────────────────────────────────────────────────
	if (milestonesQuery.isLoading || tasksQuery.isLoading) {
		return <TasksBoardSkeleton />;
	}

	// ── Error ────────────────────────────────────────────────────────────────
	if (milestonesQuery.error || tasksQuery.error) {
		const message = (milestonesQuery.error ?? tasksQuery.error)?.message ?? "Failed to load project tasks.";
		return (
			<Alert variant="destructive">
				<AlertCircle className="size-4" />
				<AlertDescription>{message}</AlertDescription>
			</Alert>
		);
	}

	const milestones = milestonesQuery.data ?? [];

	// Build a lookup: milestoneId → tasks[]
	const tasksByMilestone = new Map<number, ProjectTask[]>();
	const backlogTasks: ProjectTask[] = [];

	for (const task of allTasks) {
		if (task.milestoneId === null) {
			backlogTasks.push(task);
		} else {
			const existing = tasksByMilestone.get(task.milestoneId) ?? [];
			existing.push(task);
			tasksByMilestone.set(task.milestoneId, existing);
		}
	}

	const milestoneOptions = milestones.map((m) => ({
		value: String(m.milestoneId),
		label: m.title,
	}));

	const assigneeOptions = (membersQuery.data ?? [])
		.filter((m) => m.user)
		.map((m) => ({
			value: String(m.userId),
			label: m.user!.name,
		}));

	const taskStatusOptions = Object.values(ExecutionTaskStatus).map((status) => ({
		value: status,
		label: ExecutionTaskStatusLabels[status],
	}));

	// ── Live task derivation ─────────────────────────────────────────────────
	// `selectedTask` is a frozen snapshot captured at click time. After a cache
	// invalidation + refetch, `allTasks` contains the fresh data but the sheet
	// is still holding the stale object. We derive `liveSelectedTask` by looking
	// up the matching task in the freshly-fetched `allTasks` array so the sheet
	// always receives the latest server state without needing to close/reopen.
	const initialTask = !dismissedInitialTask && initialTaskId ? (allTasks.find((task) => task.taskId === initialTaskId) ?? null) : null;
	const taskForSheet = selectedTask ?? initialTask;
	const liveSelectedTask = taskForSheet ? (allTasks.find((t) => t.taskId === taskForSheet.taskId) ?? taskForSheet) : null;

	const handleTaskClick = (task: ProjectTask) => {
		setSelectedTask(task);
		setSheetOpen(true);
	};

	const handleSheetOpenChange = (open: boolean) => {
		setSheetOpen(open);
		if (!open) {
			setSelectedTask(null);
			setDismissedInitialTask(true);
		}
	};

	const toggleSection = (key: string) => {
		setCollapsedSections((current) => ({ ...current, [key]: !current[key] }));
	};

	return (
		<>
			{/* ── Tab action header ────────────────────────────────────────────── */}
			<div className="mb-4 flex items-center justify-between gap-3">
				<p className="text-sm text-muted-foreground">
					{milestones.length} {milestones.length === 1 ? "milestone" : "milestones"} · {allTasks.length} {allTasks.length === 1 ? "task" : "tasks"}
				</p>
				{(canAddMilestones || canAddTasks) && (
					<div className="flex items-center gap-2">
						{canAddMilestones && (
							<Can permission={["manage_projects", "manage_all_projects"]}>
								<Button
									size="sm"
									variant="outline"
									onClick={handleOpenMilestoneDialog}
								>
									<Layers className="size-4" />
									Add Milestone
								</Button>
							</Can>
						)}
						{canAddTasks && (
							<Can permission={["create_tasks", "manage_tasks"]}>
								<Button
									size="sm"
									onClick={handleOpenTaskDialog}
								>
									<Plus className="size-4" />
									Add Task
								</Button>
							</Can>
						)}
					</div>
				)}
			</div>

			<div className="mb-4 grid gap-3 border-y py-3 md:grid-cols-2 xl:grid-cols-7">
				<SearchInput
					value={taskFilters.search}
					onChange={(search) => setTaskFilters((current) => ({ ...current, search: search || undefined }))}
					placeholder="Search tasks"
					className="w-full"
					autoSearch={false}
				/>
				<FilterSelect
					value={taskFilters.status}
					onChange={(status) => setTaskFilters((current) => ({ ...current, status }))}
					options={taskStatusOptions}
					allLabel="All statuses"
					className="w-full"
				/>
				<FilterSelect
					value={taskFilters.milestoneId ? String(taskFilters.milestoneId) : undefined}
					onChange={(milestoneId) => setTaskFilters((current) => ({ ...current, milestoneId: milestoneId ? Number(milestoneId) : undefined, isInBacklog: undefined }))}
					options={milestoneOptions}
					allLabel="All milestones"
					className="w-full"
				/>
				<FilterSelect
					value={taskFilters.assigneeId ? String(taskFilters.assigneeId) : undefined}
					onChange={(assigneeId) => setTaskFilters((current) => ({ ...current, assigneeId: assigneeId ? Number(assigneeId) : undefined }))}
					options={assigneeOptions}
					allLabel="All assignees"
					className="w-full"
				/>
				<Input
					type="date"
					value={taskFilters.dueFrom ?? ""}
					onChange={(event) => setTaskFilters((current) => ({ ...current, dueFrom: event.target.value || undefined }))}
					aria-label="Task due from"
				/>
				<Input
					type="date"
					value={taskFilters.dueTo ?? ""}
					onChange={(event) => setTaskFilters((current) => ({ ...current, dueTo: event.target.value || undefined }))}
					aria-label="Task due to"
				/>
				<Button
					variant={taskFilters.isInBacklog ? "default" : "outline"}
					size="sm"
					onClick={() => setTaskFilters((current) => ({ ...current, isInBacklog: current.isInBacklog ? undefined : true, milestoneId: undefined }))}
				>
					Backlog
				</Button>
			</div>

			{/* ── Empty state ──────────────────────────────────────────────────── */}
			{milestones.length === 0 && allTasks.length === 0 ? (
				<div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-md border border-dashed text-center">
					<Inbox className="size-8 text-muted-foreground/40" />
					<div className="text-sm font-medium text-muted-foreground">No tasks yet</div>
					<p className="max-w-xs text-xs text-muted-foreground/70">Create a milestone to group tasks, or add a task directly to the backlog.</p>
					{(canAddMilestones || canAddTasks) && (
						<div className="flex items-center gap-2">
							{canAddMilestones && (
								<Can permission={["manage_projects", "manage_all_projects"]}>
									<Button
										size="sm"
										variant="outline"
										onClick={handleOpenMilestoneDialog}
									>
										<Layers className="size-4" />
										Add Milestone
									</Button>
								</Can>
							)}
							{canAddTasks && (
								<Can permission={["create_tasks", "manage_tasks"]}>
									<Button
										size="sm"
										onClick={handleOpenTaskDialog}
									>
										<ListTodo className="size-4" />
										Add Task
									</Button>
								</Can>
							)}
						</div>
					)}
				</div>
			) : (
				<div className="flex flex-col gap-5">
					{/* ── Milestone swimlanes ──────────────────────────────────────── */}
					{milestones.map((milestone) => (
						<MilestoneSwimlane
							key={milestone.milestoneId}
							milestone={milestone}
							tasks={tasksByMilestone.get(milestone.milestoneId) ?? []}
							projectId={projectId}
							onTaskClick={handleTaskClick}
							isCollapsed={collapsedSections[`milestone-${milestone.milestoneId}`] ?? false}
							onToggleCollapse={() => toggleSection(`milestone-${milestone.milestoneId}`)}
						/>
					))}

					{/* ── Backlog section ──────────────────────────────────────────── */}
					{backlogTasks.length > 0 && (
						<div className="flex flex-col gap-3 rounded-lg border border-dashed bg-muted/10 p-4">
							<div className="flex items-center gap-2">
								<button
									type="button"
									className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
									onClick={() => toggleSection("backlog")}
									aria-label={collapsedSections.backlog ? "Expand backlog" : "Collapse backlog"}
								>
									{collapsedSections.backlog ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
								</button>
								<Inbox className="size-4 text-muted-foreground" />
								<h3 className="text-sm font-semibold text-muted-foreground">Backlog</h3>
								<span className="text-xs text-muted-foreground/60">({backlogTasks.length})</span>
							</div>
							{!collapsedSections.backlog && (
								<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
									{backlogTasks.map((task) => (
										<ProjectTaskCard
											key={task.taskId}
											task={task}
											projectId={projectId}
											onClick={handleTaskClick}
										/>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			)}

			{/* ── Task execution sheet ─────────────────────────────────────────── */}
			<TaskExecutionSheet
				task={liveSelectedTask}
				projectId={projectId}
				open={sheetOpen || Boolean(initialTask)}
				onOpenChange={handleSheetOpenChange}
			/>

			{/* ── Add Milestone dialog ─────────────────────────────────────────── */}
			{canAddMilestones && (
				<FormDialog
					open={milestoneDialogOpen}
					onOpenChange={setMilestoneDialogOpen}
					title="New Milestone"
					description="Group related tasks under a milestone to track delivery phases."
					submitLabel="Create Milestone"
					isLoading={createMilestone.isPending}
					onSubmit={handleMilestoneSubmit}
					size="sm"
				>
					<Form {...milestoneForm}>
						<FormInput
							control={milestoneForm.control}
							name="title"
							label="Milestone title"
							placeholder="e.g. Phase 1 — Design"
						/>
					</Form>
				</FormDialog>
			)}

			{/* ── Add Task dialog ──────────────────────────────────────────────── */}
			{canAddTasks && (
				<FormDialog
					open={taskDialogOpen}
					onOpenChange={setTaskDialogOpen}
					title="New Task"
					description="Add a task to this project. Optionally assign it to a milestone."
					submitLabel="Create Task"
					isLoading={createTask.isPending}
					onSubmit={handleTaskSubmit}
					size="md"
				>
					<Form {...taskForm}>
						<div className="flex flex-col gap-4">
							{/* Title */}
							<FormInput
								control={taskForm.control}
								name="title"
								label="Task title"
								placeholder="e.g. Build login page"
							/>

							{/* Description */}
							<FormTextarea
								control={taskForm.control}
								name="description"
								label="Description (optional)"
								placeholder="What needs to be done, acceptance criteria, notes…"
								rows={3}
							/>

							{/* Milestone + Assignee — 2-col grid */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<FormCombobox
									control={taskForm.control}
									name="milestoneId"
									label="Milestone (optional)"
									placeholder="Backlog — no milestone"
									searchPlaceholder="Search milestones…"
									emptyText="No milestone found."
									options={milestoneOptions}
								/>
								<FormCombobox
									control={taskForm.control}
									name="assigneeId"
									label="Assignee (optional)"
									placeholder={membersQuery.isLoading ? "Loading members…" : "Unassigned"}
									searchPlaceholder="Search team members…"
									emptyText="No member found."
									options={assigneeOptions}
									disabled={membersQuery.isLoading}
								/>
							</div>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
								<FormInput
									control={taskForm.control}
									name="estimatedHours"
									label="Estimated hours"
									type="number"
									placeholder="0"
									min={0}
									step={0.5}
								/>
								<FormInput
									control={taskForm.control}
									name="startDate"
									label="Start date"
									type="date"
								/>
								<FormInput
									control={taskForm.control}
									name="dueDate"
									label="Due date"
									type="date"
								/>
							</div>
						</div>
					</Form>
				</FormDialog>
			)}
		</>
	);
}
