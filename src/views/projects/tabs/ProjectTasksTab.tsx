"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, FolderKanban } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { TaskExecutionSheet } from "@/features/projects/ui/TaskExecutionSheet";
import { useMilestones, useProjectTasks, useProjectMembers, useProjectWorkflow } from "@/features/projects/api/execution.api";
import type { ProjectTask, ProjectTaskFilters } from "@/features/projects/api/execution.api";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { useGetInternalUsers } from "@/entities/user/api/user.api";
import { useTaskPermissions } from "@/entities/user/model/permissions";
import { resolveProjectTaskForSheet } from "./model/project-tasks-board";
import { buildProjectTaskFilterOptions } from "./model/project-tasks-filters";
import { getTaskMetadataPermissions } from "./model/project-task-permissions";
import { useProjectTaskCreationDialogs } from "./model/use-project-task-creation-dialogs";
import { useProjectTaskMetadataActions } from "./model/use-project-task-metadata-actions";
import { ProjectTaskCreationDialogs } from "./ui/ProjectTaskCreationDialogs";
import { ProjectTaskMetadataDialogs } from "./ui/ProjectTaskMetadataDialogs";
import { ProjectTaskFiltersBar } from "./ui/ProjectTaskFiltersBar";
import { ProjectTasksActionHeader } from "./ui/ProjectTasksActions";
import { ProjectTasksBoard } from "./ui/ProjectTasksBoard";
import { ProjectTasksLoadingState } from "./ui/ProjectTasksLoadingState";
import { ProjectWorkflowSettingsDialog } from "./ui/ProjectWorkflowSettingsDialog";
import { projectApi } from "@/entities/project/api/project.api";
import { projectKeys } from "@/entities/project/model/query-keys";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

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
	const [dismissedInitialTask, setDismissedInitialTask] = useState(false);
	const [taskFilters, setTaskFilters] = useState<ProjectTaskFilters>({});
	const router = useRouter();
	const canManageAllProjects = useAuthStore((s) => s.hasPermission("manage_all_projects"));
	const canManageProjects = useAuthStore((s) => s.hasPermission("manage_projects"));
	const { canManageTasks, canCreateTasks, canEditTasks, canDeleteTasks, canAssignTasks } = useTaskPermissions();
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
	const workflowQuery = useProjectWorkflow(projectId);
	const membersQuery = useProjectMembers(projectId);
	const employeesQuery = useGetInternalUsers(canAssignTasks);
	const projectsQuery = useQuery({
		queryKey: [...projectKeys.all, "pipeline-switcher"],
		queryFn: () => projectApi.getProjects({ perPage: 100 }),
		staleTime: 5 * 60 * 1000,
	});
	const creationDialogs = useProjectTaskCreationDialogs(projectId);
	const metadataActions = useProjectTaskMetadataActions({
		projectId,
		canAssignTasks,
		onTaskDeleted: handleDeletedTask,
	});

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
	if (milestonesQuery.isLoading || tasksQuery.isLoading || workflowQuery.isLoading) {
		return <ProjectTasksLoadingState />;
	}

	// ── Error ────────────────────────────────────────────────────────────────
	if (milestonesQuery.error || tasksQuery.error || workflowQuery.error) {
		const message = (milestonesQuery.error ?? tasksQuery.error ?? workflowQuery.error)?.message ?? "Failed to load project tasks.";
		return (
			<Alert variant="destructive">
				<AlertCircle className="size-4" />
				<AlertDescription>{message}</AlertDescription>
			</Alert>
		);
	}

	const milestones = milestonesQuery.data ?? [];
	const workflow = workflowQuery.data;
	const filterOptions = buildProjectTaskFilterOptions({
		milestones,
		members: membersQuery.data ?? [],
	});
	const assigneeOptions = (employeesQuery.data?.users ?? []).map((employee) => ({
		value: String(employee.id),
		label: employee.name,
		description: [employee.email, employee.role].filter(Boolean).join(" · "),
	}));

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

	return (
		<>
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-3">
				<div className="flex items-center gap-2">
					<FolderKanban className="size-4 text-muted-foreground" />
					<Select
						value={String(projectId)}
						onValueChange={(value) => router.push(`/dashboard/projects/${value}`)}
					>
						<SelectTrigger className="min-w-64">
							<SelectValue placeholder={projectsQuery.isLoading ? "Loading projects…" : "Switch project"} />
						</SelectTrigger>
						<SelectContent>
							{(projectsQuery.data?.projects ?? []).map((project) => (
								<SelectItem
									key={project.projectId}
									value={String(project.projectId)}
								>
									{project.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				{workflow && (
					<ProjectWorkflowSettingsDialog
						projectId={projectId}
						stages={workflow.stages}
						canManage={workflow.allowedActions.manage}
						canManageTemplates={workflow.allowedActions.manageTemplates}
					/>
				)}
			</div>

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

			{workflow && (
				<ProjectTasksBoard
					projectId={projectId}
					stages={workflow.stages}
					tasks={allTasks}
					permissions={taskMetadataPermissions}
					onTaskClick={handleTaskClick}
					onTaskEdit={metadataActions.openEditTaskDialog}
					onTaskDelete={metadataActions.setDeletingTask}
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
				isMembersLoading={employeesQuery.isLoading}
				milestoneOptions={filterOptions.milestones}
				assigneeOptions={assigneeOptions}
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
				isMembersLoading={employeesQuery.isLoading}
				milestoneOptions={filterOptions.milestones}
				assigneeOptions={assigneeOptions}
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
