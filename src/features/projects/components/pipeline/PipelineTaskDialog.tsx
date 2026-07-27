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
import { useCreatePipelineTask } from "../../hooks/useProjectPipeline";
import type { ProjectMember } from "../../types/project";
import type { ProjectWorkflowStage } from "../../types/pipeline";

interface PipelineTaskDialogProps {
	projectId: number;
	stage: ProjectWorkflowStage | null;
	members: ProjectMember[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PipelineTaskDialog({ projectId, stage, members, open, onOpenChange }: PipelineTaskDialogProps) {
	const mutation = useCreatePipelineTask(projectId);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
	const [assignedTo, setAssignedTo] = useState("unassigned");
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
				assignedTo: assignedTo === "unassigned" ? undefined : Number(assignedTo),
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
							<Label>Assignee</Label>
							<Select value={assignedTo} onValueChange={setAssignedTo}>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent>
									<SelectItem value="unassigned">Unassigned</SelectItem>
									{members.map((member) => (
										<SelectItem key={member.userId} value={String(member.userId)}>
											{member.user?.name ?? `User #${member.userId}`}
										</SelectItem>
									))}
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
