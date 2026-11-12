"use client";

import { toast } from "sonner";
import api from "@/lib/axios";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "@/features/dashboard/hooks/useTasks";
import { Loader2 } from "lucide-react";
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
import { notifyApiError } from "@/lib/errorHandling";
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
import { TaskTypesPicker } from "../tasks/TaskTypesPicker";
import { DescriptionChecklistEditor } from "../tasks/DescriptionChecklistEditor";
import type { ChecklistItem } from "@/features/dashboard/types/task";

interface PipelineTaskDialogProps {
	projectId: number;
	stage: ProjectWorkflowStage | null;
	stages: ProjectWorkflowStage[];
	task?: PipelineTask | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PipelineTaskDialog({ projectId, stage, stages, task, open, onOpenChange }: PipelineTaskDialogProps) {
	const queryClient = useQueryClient();
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
	const [checklist, setChecklist] = useState<ChecklistItem[]>(task?.checklist ?? []);
	const [projectTypeIds, setProjectTypeIds] = useState<number[]>(task?.projectTypes?.map((type) => type.id) ?? []);
	const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">(task?.priority ?? "medium");
	const [assignedUserIds, setAssignedUserIds] = useState<number[]>(task?.assignees.map((assignee) => assignee.userId) ?? []);
	const initialSupervisors = task?.supervisors ?? (task?.supervisor ? [task.supervisor] : []);
	const [supervisorId, setSupervisorId] = useState(initialSupervisors[0] ? String(initialSupervisors[0].userId) : "none");
	const [secondSupervisorId, setSecondSupervisorId] = useState(initialSupervisors[1] ? String(initialSupervisors[1].userId) : "none");
	const supervisorCandidates = getViableSupervisorCandidates([
		...(employees.data?.employees ?? []),
		...(members.data?.members.map((member) => member.user ?? { userId: member.userId, name: `User ${member.userId}` }) ?? []),
		...initialSupervisors,
	]);
	const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
	const [estimatedHours, setEstimatedHours] = useState(task?.estimatedHours != null ? String(task.estimatedHours) : "");
	const [workflowStageId, setWorkflowStageId] = useState(String(task?.workflowStageId ?? stage?.stageId ?? ""));
	const [coverImage, setCoverImage] = useState<File | null>(null);
	const [referenceImages, setReferenceImages] = useState<File[]>([]);
	const [documents, setDocuments] = useState<File[]>([]);
	const [uploadingReferences, setUploadingReferences] = useState(false);
	const [removeExistingCover, setRemoveExistingCover] = useState(false);
	const isEditing = Boolean(task);
	const isPending = createTask.isPending || updateTask.isPending || uploadCover.isPending || deleteCover.isPending || uploadingReferences;

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
						...(JSON.stringify(checklist) !== JSON.stringify(task.checklist ?? []) ? { checklist } : {}),
						priority,
						projectTypeIds,
						...(canAssignEmployees ? { assignedUserIds } : {}),
						...(canAssignSupervisor && JSON.stringify([supervisorId, secondSupervisorId].filter((id) => id !== "none").map(Number)) !== JSON.stringify(initialSupervisors.map((person) => person.userId)) ? { supervisorIds: [supervisorId, secondSupervisorId].filter((id) => id !== "none").map(Number) } : {}),
						dueDate: dueDate || null,
						estimatedHours: estimatedHours ? Number(estimatedHours) : null,
					},
				});
			} else {
				savedTask = await createTask.mutateAsync({
					workflowStageId: selectedStageId,
					title: title.trim(),
					description: description.trim() || undefined,
					checklist,
					priority,
					projectTypeIds,
					assignedUserIds: assignedUserIds.length > 0 ? assignedUserIds : undefined,
					...(canAssignSupervisor ? { supervisorIds: [supervisorId, secondSupervisorId].filter((id) => id !== "none").map(Number) } : {}),
					dueDate: dueDate || undefined,
					estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
				});
			}
		} catch (error) {
			notifyApiError(error);
			return;
		}

		try {
			await saveCoverImage(savedTask.taskId);
			// Success toast comes from the backend message via the axios interceptor.
		} catch {
			toast.warning("Task saved, but its cover image could not be updated");
		}

		if (referenceImages.length) {
			setUploadingReferences(true);
			try {
				for (const file of referenceImages) {
					const data = new FormData();
					data.append("images[]", file);
					await api.post(`/projects/${projectId}/pipeline/tasks/${savedTask.taskId}/references`, data, { skipSuccessToast: true });
				}
			} catch {
				toast.warning("Task saved, but reference images could not be uploaded. Add them from task details.");
			} finally {
				await queryClient.invalidateQueries({ queryKey: taskKeys.detail(savedTask.taskId) });
				setUploadingReferences(false);
			}
		}
		if (documents.length) {
			setUploadingReferences(true);
			try {
				for (const file of documents) {
					const data = new FormData();
					data.append("file", file);
					await api.post(`/tasks/${savedTask.taskId}/attachments`, data, { skipSuccessToast: true, skipErrorToast: true });
				}
				await queryClient.invalidateQueries({ queryKey: ["task-attachments", savedTask.taskId] });
			} catch {
				toast.warning("Task saved, but some documents could not be uploaded. Add them from task details.");
			} finally { setUploadingReferences(false); }
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

					<DescriptionChecklistEditor items={checklist} onChange={setChecklist} />

					<TaskTypesPicker selected={projectTypeIds} onChange={setProjectTypeIds} disabled={isPending} />

					<PipelineTaskCoverField
						currentCoverImageUrl={task?.coverImageUrl}
						disabled={isPending}
						onChange={(file, shouldRemoveExistingCover) => {
							setCoverImage(file);
							setRemoveExistingCover(shouldRemoveExistingCover);
						}}
					/>

					<div className="space-y-2">
						<Label htmlFor="pipeline-task-references">Reference images</Label>
						<Input id="pipeline-task-references" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={isPending} onChange={(event) => {
							const files = Array.from(event.target.files ?? []);
							if (files.length > 10 || files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 25 * 1024 * 1024)) { toast.error("Select up to 10 JPG, PNG or WebP images, up to 25 MB each"); event.target.value = ""; setReferenceImages([]); return; }
							setReferenceImages(files);
						}} />
						<p className="text-xs text-muted-foreground">Up to 10 images per task, JPG, PNG or WebP, 25 MB each. Existing images can be managed in task details.</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="pipeline-task-documents">Documents (PDF or PowerPoint)</Label>
						<Input id="pipeline-task-documents" type="file" multiple accept=".pdf,.ppt,.pptx" disabled={isPending} onChange={(event) => {
							const files = Array.from(event.target.files ?? []);
							if (files.length > 10 || files.some((file) => !/\.(pdf|ppt|pptx)$/i.test(file.name) || file.size > 25 * 1024 * 1024)) { toast.error("Select up to 10 PDF or PowerPoint files, up to 25 MB each"); event.target.value = ""; setDocuments([]); return; }
							setDocuments(files);
						}} />
						<p className="text-xs text-muted-foreground">Up to 10 documents per task, 25 MB each. Manage existing documents from task details.</p>
					</div>

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
									{supervisorCandidates.map((candidate) => <SelectItem disabled={String(candidate.userId) === secondSupervisorId} key={candidate.userId} value={String(candidate.userId)}>{candidate.name}</SelectItem>)}
								</SelectContent>
							</Select>
							<Label htmlFor="pipeline-task-second-supervisor">Second supervisor</Label>
							<Select value={secondSupervisorId} onValueChange={setSecondSupervisorId} disabled={isPending}>
								<SelectTrigger id="pipeline-task-second-supervisor"><SelectValue placeholder="Choose a second supervisor" /></SelectTrigger>
								<SelectContent><SelectItem value="none">No second supervisor</SelectItem>{supervisorCandidates.map((candidate) => <SelectItem disabled={String(candidate.userId) === supervisorId} key={candidate.userId} value={String(candidate.userId)}>{candidate.name}</SelectItem>)}</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground">Choose up to two active employees or project members.</p>
							{(employees.isError || members.isError) && <p className="text-xs text-destructive">Some supervisor candidates could not be loaded. <button type="button" className="underline" onClick={() => { employees.refetch(); members.refetch(); }}>Try again</button></p>}
						</div>
					)}

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
						<Button type="submit" disabled={!title.trim() || !workflowStageId || checklist.some((item) => !item.text.trim()) || isPending}>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{isEditing ? "Save changes" : "Create task"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
