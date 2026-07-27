"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { useEmployees } from "@/features/hr/hooks/useEmployees";
import { useCreatePipelineTask } from "../../hooks/useProjectPipeline";
import type { ProjectWorkflowStage } from "../../types/pipeline";
import { PipelineEmployeePicker } from "./PipelineEmployeePicker";

interface PipelineTaskDialogProps {
	projectId: number;
	stage: ProjectWorkflowStage | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PipelineTaskDialog({ projectId, stage, open, onOpenChange }: PipelineTaskDialogProps) {
	const mutation = useCreatePipelineTask(projectId);
	const permissions = usePermissions();
	const canAssignEmployees = permissions.canAssignTasks || permissions.canManageTasks;
	const employees = useEmployees({ isActive: true, perPage: 100 }, canAssignEmployees && open);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
	const [assignedUserIds, setAssignedUserIds] = useState<number[]>([]);
	const [dueDate, setDueDate] = useState("");
	const [estimatedHours, setEstimatedHours] = useState("");

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!stage) return;

		try {
			await mutation.mutateAsync({
				workflowStageId: stage.stageId,
				title,
				description: description || undefined,
				priority,
				assignedUserIds: assignedUserIds.length > 0 ? assignedUserIds : undefined,
				dueDate: dueDate || undefined,
				estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
			});
			toast.success("Task added to the pipeline");
			onOpenChange(false);
		} catch {
			toast.error("Could not create the pipeline task");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl!">
				<form onSubmit={submit} className="space-y-5">
					<DialogHeader>
						<DialogTitle>Create task in {stage?.name}</DialogTitle>
						<DialogDescription>This is a flat pipeline task. It does not create weekly tasks or subtasks.</DialogDescription>
					</DialogHeader>

					<div className="space-y-2">
						<Label htmlFor="pipeline-task-title">Title</Label>
						<Input id="pipeline-task-title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={255} />
					</div>

					<div className="space-y-2">
						<Label htmlFor="pipeline-task-description">Description</Label>
						<Textarea id="pipeline-task-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
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
							<Label htmlFor="pipeline-task-due-date">Due date</Label>
							<Input id="pipeline-task-due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
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

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
						<Button type="submit" disabled={!title.trim() || mutation.isPending}>
							{mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Create task
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
