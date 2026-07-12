"use client";

import { useCallback, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { TaskExecutionSheet } from "@/features/projects/ui/TaskExecutionSheet";
import { useMilestones, useProjectTasks, useProjectMembers } from "@/features/projects/api/execution.api";
import type { ProjectTask, ProjectTaskFilters } from "@/features/projects/api/execution.api";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { useTaskPermissions } from "@/entities/user/model/permissions";
import { groupProjectTasksByMilestone, resolveProjectTaskForSheet, toggleCollapsedSection } from "./model/project-tasks-board";
import { buildProjectTaskFilterOptions } from "./model/project-tasks-filters";
import { getTaskMetadataPermissions } from "./model/project-task-permissions";
import { useProjectTaskCreationDialogs } from "./model/use-project-task-creation-dialogs";
import { useProjectTaskMetadataActions } from "./model/use-project-task-metadata-actions";
import { ProjectTaskCreationDialogs } from "./ui/ProjectTaskCreationDialogs";
import { ProjectTaskMetadataDialogs } from "./ui/ProjectTaskMetadataDialogs";
import { ProjectTaskFiltersBar } from "./ui/ProjectTaskFiltersBar";
import { ProjectTasksActionHeader, ProjectTasksEmptyState } from "./ui/ProjectTasksActions";
import { ProjectTasksBoard } from "./ui/ProjectTasksBoard";
import { ProjectTasksLoadingState } from "./ui/ProjectTasksLoadingState";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectTasksTabProps {
	projectId: number;
	initialTaskId?: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProjectTasksTab({ projectId, initialTaskId = null }: ProjectTasksTabProps) {
	const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
	const [dismissedInitialTask, setDismissedInitialTask] = useState(false);
	const [taskFilters, setTaskFilters] = useState<ProjectTaskFilters>({});
	const handleDeletedTask = useCallback(
		(task: ProjectTask) => {
			if (selectedTask?.taskId === task.taskId) {
				setSelectedTask(null);
				setSheetOpen(false);
			}
		},
		[selectedTask],
	);

	const milestonesQuery = useMilestones(projectId);
	const tasksQuery = useProjectTasks(projectId, taskFilters);
	const membersQuery = useProjectMembers(projectId);
	const creationDialogs = useProjectTaskCreationDialogs(projectId);
	const metadataActions = useProjectTaskMetadataActions({
		projectId,
		onTaskDeleted: handleDeletedTask,
	});

	const canManageAllProjects = useAuthStore((s) => s.hasPermission("manage_all_projects"));
	const canManageProjects = useAuthStore((s) => s.hasPermission("manage_projects"));
	const { canManageTasks, canCreateTasks, canEditTasks, canDeleteTasks } = useTaskPermissions();

	const canAddMilestones = canManageAllProjects || canManageProjects;
	const canAddTasks = canManageAllProjects || canManageTasks || canCreateTasks;
	const taskMetadataPermissions = getTaskMetadataPermissions({
		canManageAllProjects,
		canManageTasks,
		canEditTasks,
		canDeleteTasks,
	});

	const allTasks = tasksQuery.data ?? [];

	// ── Loading ──────────────────────────────────────────────────────────────
	if (milestonesQuery.isLoading || tasksQuery.isLoading) {
		return <ProjectTasksLoadingState />;
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
	const { tasksByMilestone, backlogTasks } = groupProjectTasksByMilestone(allTasks);
	const filterOptions = buildProjectTaskFilterOptions({
		milestones,
		members: membersQuery.data ?? [],
	});

	const liveSelectedTask = resolveProjectTaskForSheet({
		tasks: allTasks,
		selectedTask,
		initialTaskId,
		dismissedInitialTask,
	});

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
		setCollapsedSections((current) => toggleCollapsedSection(current, key));
	};

	return (
		<>
			<ProjectTasksActionHeader
				milestoneCount={milestones.length}
				taskCount={allTasks.length}
				canAddMilestones={canAddMilestones}
				canAddTasks={canAddTasks}
				onAddMilestone={creationDialogs.openMilestoneDialog}
				onAddTask={creationDialogs.openTaskDialog}
			/>

			<ProjectTaskFiltersBar
				filters={taskFilters}
				options={filterOptions}
				onFiltersChange={setTaskFilters}
			/>

			{milestones.length === 0 && allTasks.length === 0 ? (
				<ProjectTasksEmptyState
					canAddMilestones={canAddMilestones}
					canAddTasks={canAddTasks}
					onAddMilestone={creationDialogs.openMilestoneDialog}
					onAddTask={creationDialogs.openTaskDialog}
				/>
			) : (
				<ProjectTasksBoard
					projectId={projectId}
					milestones={milestones}
					tasksByMilestone={tasksByMilestone}
					backlogTasks={backlogTasks}
					collapsedSections={collapsedSections}
					permissions={taskMetadataPermissions}
					onTaskClick={handleTaskClick}
					onTaskEdit={metadataActions.openEditTaskDialog}
					onTaskDelete={metadataActions.setDeletingTask}
					onToggleSection={toggleSection}
				/>
			)}

			{/* ── Task execution sheet ─────────────────────────────────────────── */}
			<TaskExecutionSheet
				task={liveSelectedTask}
				projectId={projectId}
				open={sheetOpen || Boolean(liveSelectedTask)}
				onOpenChange={handleSheetOpenChange}
			/>

			<ProjectTaskCreationDialogs
				canAddMilestones={canAddMilestones}
				canAddTasks={canAddTasks}
				milestoneOpen={creationDialogs.milestoneOpen}
				taskOpen={creationDialogs.taskOpen}
				isCreatingMilestone={creationDialogs.isCreatingMilestone}
				isCreatingTask={creationDialogs.isCreatingTask}
				isMembersLoading={membersQuery.isLoading}
				milestoneOptions={filterOptions.milestones}
				assigneeOptions={filterOptions.assignees}
				milestoneForm={creationDialogs.milestoneForm}
				taskForm={creationDialogs.taskForm}
				onMilestoneOpenChange={creationDialogs.setMilestoneOpen}
				onTaskOpenChange={creationDialogs.setTaskOpen}
				onMilestoneSubmit={creationDialogs.submitMilestone}
				onTaskSubmit={creationDialogs.submitTask}
			/>
			<ProjectTaskMetadataDialogs
				editingTask={metadataActions.editingTask}
				deletingTask={metadataActions.deletingTask}
				editTaskForm={metadataActions.editTaskForm}
				isUpdatingTask={metadataActions.isUpdatingTask}
				isDeletingTask={metadataActions.isDeletingTask}
				isMembersLoading={membersQuery.isLoading}
				milestoneOptions={filterOptions.milestones}
				assigneeOptions={filterOptions.assignees}
				onEditOpenChange={(open) => {
					if (!open) metadataActions.closeEditTaskDialog();
				}}
				onDeleteOpenChange={(open) => {
					if (!open) metadataActions.setDeletingTask(null);
				}}
				onEditSubmit={metadataActions.submitEditTask}
				onDeleteConfirm={metadataActions.confirmDeleteTask}
			/>
		</>
	);
}
