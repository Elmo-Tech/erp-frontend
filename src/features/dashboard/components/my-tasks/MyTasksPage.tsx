/**
 * My Tasks Page Component
 * Main page for managing personal and project tasks
 */

"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { Plus, Folder, Circle, Timer, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { useMyAssignedTasks, useUpdateTask } from "../../hooks/useTasks";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useAuthStore } from "@/store/authStore";
import { Task, TaskFilters, TaskStatus, TaskStatusLabels } from "../../types/task";

import { useMyTaskAccess } from "./useMyTaskAccess";
import { StatsCard } from "./StatsCard";
import { TaskFiltersBar } from "./TaskFilters";
import { KanbanView, TaskCardOverlay } from "./KanbanView";
import { ListView } from "./ListView";
import { TaskDetailDialog } from "./TaskDetailDialog";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { EmptyState } from "./EmptyState";
import { LoadingSkeleton } from "./LoadingSkeleton";

export function MyTasksPage() {
	const { user } = useAuthStore();
	const access = useMyTaskAccess();
	const searchParams = useSearchParams();
	const highlightParam = searchParams.get("highlight");
	const [highlightedTaskId, setHighlightedTaskId] = useState<number | null>(null);
	const [view, setView] = useState<"kanban" | "list">("kanban");
	const [filters, setFilters] = useState<TaskFilters>({ page: 1, perPage: 100 });
	const [searchTerm, setSearchTerm] = useState("");
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [activeTask, setActiveTask] = useState<Task | null>(null);

	const { data: tasksData, isLoading } = useMyAssignedTasks(filters);
	const { data: projectsData } = useProjects({ page: 1, perPage: 100 }, access.canCreate);
	const updateTask = useUpdateTask();
	const projectOptions = useMemo(() => {
		const projects = new Map<number, { projectId: number; title: string }>();
		if (access.canCreate) projectsData?.projects.forEach(project => projects.set(project.projectId, project));
		const collect = (tasks: Task[]) => tasks.forEach(task => {
			if (task.project) projects.set(task.project.projectId, task.project);
			if (task.children?.length) collect(task.children);
		});
		collect(tasksData?.tasks || []);
		return [...projects.values()];
	}, [access.canCreate, projectsData?.projects, tasksData?.tasks]);

	// Handle highlight from URL
	useEffect(() => {
		if (highlightParam) {
			const taskId = parseInt(highlightParam, 10);
			if (!isNaN(taskId)) {
				// eslint-disable-next-line react-hooks/set-state-in-effect
				setHighlightedTaskId(taskId);
				// Clear highlight after 5 seconds
				const timer = setTimeout(() => setHighlightedTaskId(null), 5000);
				return () => clearTimeout(timer);
			}
		}
	}, [highlightParam]);

	// DnD sensors
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor));

	/**
	 * Extract structural leaf tasks regardless of timer eligibility
	 * Completed and otherwise non-timer tasks must remain visible on the board
	 */
	const extractAllLeafTasks = useCallback((tasks: Task[]): Task[] => {
		const leafTasks: Task[] = [];
		const seen = new Set<number>();

		function traverse(task: Task) {
			if (seen.has(task.taskId)) return;
			seen.add(task.taskId);
			if (!task.hasChildren && !task.children?.length) {
				leafTasks.push(task);
			}
			if (task.children && task.children.length > 0) {
				task.children.forEach(traverse);
			}
		}

		tasks.forEach(traverse);
		return leafTasks;
	}, []);

	// Filter tasks locally (for ListView - keeps hierarchy)
	const filteredTasks = useMemo(() => {
		let tasks = tasksData?.tasks || [];
		if (searchTerm) {
			tasks = tasks.filter((t) => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
		}
		if (filters.status) {
			tasks = tasks.filter((t) => t.status === filters.status);
		}
		if (filters.priority) {
			tasks = tasks.filter((t) => t.priority === filters.priority);
		}
		if (filters.projectId) {
			tasks = tasks.filter((t) => t.projectId === Number(filters.projectId));
		}
		return tasks;
	}, [tasksData?.tasks, searchTerm, filters.status, filters.priority, filters.projectId]);

	// All leaf tasks (flattened) - used for Kanban drag/drop
	const allLeafTasks = useMemo(() => {
		return extractAllLeafTasks(tasksData?.tasks || []);
	}, [tasksData?.tasks, extractAllLeafTasks]);

	// Filtered leaf tasks for Kanban
	const filteredLeafTasks = useMemo(() => {
		let leafTasks = allLeafTasks;
		if (searchTerm) {
			leafTasks = leafTasks.filter((t) => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
		}
		if (filters.status) {
			leafTasks = leafTasks.filter((t) => t.status === filters.status);
		}
		if (filters.priority) {
			leafTasks = leafTasks.filter((t) => t.priority === filters.priority);
		}
		if (filters.projectId) {
			leafTasks = leafTasks.filter((t) => t.projectId === Number(filters.projectId));
		}
		return leafTasks;
	}, [allLeafTasks, searchTerm, filters.status, filters.priority, filters.projectId]);

	// Group LEAF tasks by their own status for Kanban (not parent's status)
	const tasksByStatus = useMemo(() => {
		const grouped: Record<TaskStatus, Task[]> = {
			[TaskStatus.TODO]: [],
			[TaskStatus.IN_PROGRESS]: [],
			[TaskStatus.ON_HOLD]: [],
			[TaskStatus.REVIEW]: [],
			[TaskStatus.TESTING]: [],
			[TaskStatus.COMPLETED]: [],
		};

		// Group by each task's own status
		filteredLeafTasks.forEach((task) => {
			if (grouped[task.status]) {
				grouped[task.status].push(task);
			}
		});

		return grouped;
	}, [filteredLeafTasks]);

	// Stats
	const stats = useMemo(
		() => ({
			total: filteredLeafTasks.length,
			todo: tasksByStatus[TaskStatus.TODO].length,
			inProgress: tasksByStatus[TaskStatus.IN_PROGRESS].length,
			review: tasksByStatus[TaskStatus.REVIEW].length,
			testing: tasksByStatus[TaskStatus.TESTING].length,
			completed: tasksByStatus[TaskStatus.COMPLETED].length,
		}),
		[filteredLeafTasks, tasksByStatus],
	);

	const toggleExpand = useCallback((taskId: number) => {
		setExpandedTasks((prev) => {
			const next = new Set(prev);
			if (next.has(taskId)) next.delete(taskId);
			else next.add(taskId);
			return next;
		});
	}, []);

	const handleFilterChange = (key: keyof TaskFilters, value: string | undefined) => {
		setFilters((prev) => ({
			...prev,
			[key]: value === "all" ? undefined : value,
		}));
	};

	const clearFilters = () => {
		setFilters({ page: 1, perPage: 100 });
		setSearchTerm("");
	};

	const hasActiveFilters = searchTerm || filters.status || filters.priority || filters.projectId;

	// Drag handlers - use filteredLeafTasks for Kanban view
	const handleDragStart = (event: DragStartEvent) => {
		const task = filteredLeafTasks.find((t) => t.taskId === event.active.id);
		if (task) setActiveTask(task);
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveTask(null);
		if (!over) return;

		const taskId = active.id as number;
		const newStatus = over.id as TaskStatus;
		const task = filteredLeafTasks.find((t) => t.taskId === taskId);

		if (!task || !access.canEdit(task) || task.status === newStatus) return;

		try {
			await updateTask.mutateAsync({ id: taskId, payload: { status: newStatus } });
			toast.success(`Task moved to ${TaskStatusLabels[newStatus]}`);
		} catch {
			toast.error("Failed to update task status");
		}
	};

	const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
		if (!access.canEdit(task) || task.status === newStatus) return;
		try {
			await updateTask.mutateAsync({ id: task.taskId, payload: { status: newStatus } });
			toast.success(`Task moved to ${TaskStatusLabels[newStatus]}`);
		} catch {
			toast.error("Failed to update task status");
		}
	};

	return (
		<TooltipProvider>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
						<p className="text-muted-foreground">Manage your personal and project tasks</p>
					</div>
					{access.canCreate && <Button
						onClick={() => setShowCreateDialog(true)}
						className="gap-2"
					>
						<Plus className="h-4 w-4" />
						New Task
					</Button>}
				</div>

				{/* Stats Cards */}
				<div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
					<StatsCard
						label="Total"
						value={stats.total}
						icon={<Folder className="h-4 w-4" />}
					/>
					<StatsCard
						label="To Do"
						value={stats.todo}
						icon={<Circle className="h-4 w-4" />}
						color="text-slate-600"
					/>
					<StatsCard
						label="In Progress"
						value={stats.inProgress}
						icon={<Timer className="h-4 w-4" />}
						color="text-blue-600"
					/>
					<StatsCard
						label="Review"
						value={stats.review}
						icon={<AlertCircle className="h-4 w-4" />}
						color="text-amber-600"
					/>
					<StatsCard
						label="Testing"
						value={stats.testing}
						icon={<CheckCircle2 className="h-4 w-4" />}
						color="text-purple-600"
					/>
					<StatsCard
						label="Done"
						value={stats.completed}
						icon={<CheckCircle2 className="h-4 w-4" />}
						color="text-green-600"
					/>
				</div>

				{/* Filters */}
				<TaskFiltersBar
					filters={filters}
					searchTerm={searchTerm}
					view={view}
					projects={projectOptions}
					hasActiveFilters={!!hasActiveFilters}
					onSearchChange={setSearchTerm}
					onFilterChange={handleFilterChange}
					onClearFilters={clearFilters}
					onViewChange={setView}
				/>

				{/* Content */}
				{isLoading ? (
					<LoadingSkeleton view={view} />
				) : (view === "kanban" ? filteredLeafTasks.length : filteredTasks.length) === 0 ? (
					<EmptyState
						onCreateTask={access.canCreate ? () => setShowCreateDialog(true) : undefined}
						hasFilters={!!hasActiveFilters}
					/>
				) : view === "kanban" ? (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCorners}
						onDragStart={handleDragStart}
						onDragEnd={handleDragEnd}
					>
						<KanbanView
							tasksByStatus={tasksByStatus}
							currentUserId={user?.userId}
							highlightedTaskId={highlightedTaskId}
							onStatusChange={handleStatusChange}
							onViewTask={setSelectedTask}
						/>
						<DragOverlay>{activeTask && <TaskCardOverlay task={activeTask} />}</DragOverlay>
					</DndContext>
				) : (
					<ListView
						tasks={filteredTasks}
						expandedTasks={expandedTasks}
						currentUserId={user?.userId}
						highlightedTaskId={highlightedTaskId}
						onToggleExpand={toggleExpand}
						onStatusChange={handleStatusChange}
						onViewTask={setSelectedTask}
					/>
				)}

				{/* Dialogs */}
				{showCreateDialog && access.canCreate && <CreateTaskDialog
					open={showCreateDialog}
					onOpenChange={setShowCreateDialog}
					projects={projectOptions}
					currentUserId={user?.userId}
					allowedTypes={access.allowedTypes}
				/>}
				<TaskDetailDialog
					task={selectedTask}
					onClose={() => setSelectedTask(null)}
					onStatusChange={handleStatusChange}
				/>
			</div>
		</TooltipProvider>
	);
}
