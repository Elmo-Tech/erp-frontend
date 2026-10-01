"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DatePicker } from "@/components/shared/forms/DatePicker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { useEmployees } from "@/features/hr/hooks/useEmployees";
import { useAuthStore } from "@/store/authStore";
import { handleApiError } from "@/lib/errorHandling";
import { getViableSupervisorCandidates } from "@/features/dashboard/lib/taskSupervision";
import { useProjectMembers } from "../../hooks/useProjectMembers";
import {
	useCreatePipelineTask,
	useDeletePipelineTaskCover,
	useUpdatePipelineTask,
	useUploadPipelineTaskCover,
} from "../../hooks/useProjectPipeline";
import type { PipelineTask, ProjectWorkflowStage } from "../../types/pipeline";
import { PipelineEmployeePicker } from "./PipelineEmployeePicker";
import { PipelineTaskCoverField } from "./PipelineTaskCoverField";

interface PipelineTaskDialogProps {
	projectId: number;
	stage: ProjectWorkflowStage | null;
	stages: ProjectWorkflowStage[];
	task?: PipelineTask | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PipelineTaskDialog({ projectId, stage, stages, task, open, onOpenChange }: PipelineTaskDialogProps) {
	const createTask = useCreatePipelineTask(projectId);
	const updateTask = useUpdatePipelineTask(projectId);
	const uploadCover = useUploadPipelineTaskCover(projectId);
	const deleteCover = useDeletePipelineTaskCover(projectId);
	const permissions = usePermissions();
	const canAssignEmployees = permissions.canAssignTasks || permissions.canManageTasks;
	const role = useAuthStore((state) => state.role);
	const canAssignSupervisor = permissions.canManageTaskTeam || role === "admin" || role === "super-admin";
	const employees = useEmployees({ isActive: true, perPage: 100 }, (canAssignEmployees || canAssignSupervisor) && open);
	const members = useProjectMembers(projectId, canAssignSupervisor && open);
	const [title, setTitle] = useState(task?.title ?? "");
	const [description, setDescription] = useState(task?.description ?? "");
	const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">(task?.priority ?? "medium");
	const [assignedUserIds, setAssignedUserIds] = useState<number[]>(task?.assignees.map((assignee) => assignee.userId) ?? []);
	const [supervisorId, setSupervisorId] = useState(task?.supervisorId ? String(task.supervisorId) : "none");
	const supervisorCandidates = getViableSupervisorCandidates([
		...(employees.data?.employees ?? []),
		...(members.data?.members.map((member) => member.user ?? { userId: member.userId, name: `User ${member.userId}` }) ?? []),
		task?.supervisor,
	]);
	const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
	const [estimatedHours, setEstimatedHours] = useState(task?.estimatedHours != null ? String(task.estimatedHours) : "");
	const [workflowStageId, setWorkflowStageId] = useState(String(task?.workflowStageId ?? stage?.stageId ?? ""));
	const [coverImage, setCoverImage] = useState<File | null>(null);
	const [removeExistingCover, setRemoveExistingCover] = useState(false);
	const isEditing = Boolean(task);
	const isPending = createTask.isPending || updateTask.isPending || uploadCover.isPending || deleteCover.isPending;

	const saveCoverImage = async (taskId: number) => {
		if (coverImage) {
			await uploadCover.mutateAsync({ taskId, coverImage });
		} else if (removeExistingCover) {
			await deleteCover.mutateAsync(taskId);
		}
	};

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		const selectedStageId = Number(workflowStageId);
		if (!selectedStageId) return;

		let savedTask: PipelineTask;
		try {
			if (task) {
				savedTask = await updateTask.mutateAsync({
					taskId: task.taskId,
					payload: {
						workflowStageId: selectedStageId,
						title: title.trim(),
						description: description.trim() || null,
						priority,
						...(canAssignEmployees ? { assignedUserIds } : {}),
						...(canAssignSupervisor ? { supervisorId: supervisorId === "none" ? null : Number(supervisorId) } : {}),
						dueDate: dueDate || null,
						estimatedHours: estimatedHours ? Number(estimatedHours) : null,
					},
				});
			} else {
				savedTask = await createTask.mutateAsync({
					workflowStageId: selectedStageId,
					title: title.trim(),
					description: description.trim() || undefined,
					priority,
					assignedUserIds: assignedUserIds.length > 0 ? assignedUserIds : undefined,
					...(canAssignSupervisor ? { supervisorId: supervisorId === "none" ? null : Number(supervisorId) } : {}),
					dueDate: dueDate || undefined,
					estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
				});
			}
		} catch (error) {
			toast.error(handleApiError(error));
			return;
		}

		try {
			await saveCoverImage(savedTask.taskId);
			toast.success(isEditing ? "Task updated" : "Task added to the pipeline");
		} catch {
			toast.warning("Task saved, but its cover image could not be updated");
		}

		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl!">
				<form onSubmit={submit} className="space-y-5">
					<DialogHeader>
						<DialogTitle>{isEditing ? "Edit task" : `Create task in ${stage?.name ?? "pipeline"}`}</DialogTitle>
						<DialogDescription>
							{isEditing
								? "Update the task fields, status, dates, and assignees."
								: "Create one flat delivery task and assign the employees who will work on it."}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-2">
						<Label htmlFor="pipeline-task-title">Title</Label>
						<Input id="pipeline-task-title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={255} />
					</div>

					<div className="space-y-2">
						<Label htmlFor="pipeline-task-description">Description</Label>
						<Textarea id="pipeline-task-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
					</div>

					<PipelineTaskCoverField
						currentCoverImageUrl={task?.coverImageUrl}
						disabled={isPending}
						onChange={(file, shouldRemoveExistingCover) => {
							setCoverImage(file);
							setRemoveExistingCover(shouldRemoveExistingCover);
						}}
					/>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label>Status</Label>
							<Select value={workflowStageId} onValueChange={setWorkflowStageId}>
								<SelectTrigger><SelectValue placeholder="Choose a status" /></SelectTrigger>
								<SelectContent>
									{stages.map((item) => (
										<SelectItem key={item.stageId} value={String(item.stageId)}>
											<span className="flex items-center gap-2">
												<span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
												{item.name}
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Priority</Label>
							<Select value={priority} onValueChange={(value) => setPriority(value as typeof priority)}>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent>
									<SelectItem value="low">Low</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="urgent">Urgent</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Due date</Label>
							<DatePicker value={dueDate} onChange={setDueDate} placeholder="Choose a due date" />
						</div>

						<div className="space-y-2">
							<Label htmlFor="pipeline-task-hours">Estimated hours</Label>
							<Input id="pipeline-task-hours" type="number" min="0" step="0.25" value={estimatedHours} onChange={(event) => setEstimatedHours(event.target.value)} />
						</div>
					</div>

					<div className="space-y-2">
						<Label>Assigned employees</Label>
						{canAssignEmployees ? (
							<>
								<PipelineEmployeePicker
									employees={employees.data?.employees ?? []}
									selectedUserIds={assignedUserIds}
									onSelectionChange={setAssignedUserIds}
									isLoading={employees.isLoading}
								/>
								<p className="text-xs text-muted-foreground">Selected employees are added to this project automatically, so they can see it and work on the task.</p>
							</>
						) : (
							<p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">You can create an unassigned task. Assigning employees requires task assignment permission.</p>
						)}
					</div>

					{canAssignSupervisor && (
						<div className="space-y-2">
							<Label htmlFor="pipeline-task-supervisor">Supervisor</Label>
							<Select value={supervisorId} onValueChange={setSupervisorId} disabled={isPending}>
								<SelectTrigger id="pipeline-task-supervisor"><SelectValue placeholder="Choose a supervisor" /></SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No supervisor</SelectItem>
									{supervisorCandidates.map((candidate) => <SelectItem key={candidate.userId} value={String(candidate.userId)}>{candidate.name}</SelectItem>)}
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground">Choose an active employee or project member. The supervisor is added to the project and tracks supervision separately from work.</p>
							{(employees.isError || members.isError) && <p className="text-xs text-destructive">Some supervisor candidates could not be loaded. <button type="button" className="underline" onClick={() => { employees.refetch(); members.refetch(); }}>Try again</button></p>}
						</div>
					)}

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
						<Button type="submit" disabled={!title.trim() || !workflowStageId || isPending}>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{isEditing ? "Save changes" : "Create task"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
