/**
 * Task Detail Dialog Component
 * Shows full task details with subtasks
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar, Clock, Play } from "lucide-react";
import { Task, TaskStatus, TaskStatusLabels, TaskPriorityLabels } from "../../types/task";
import { PriorityColors } from "./constants";
import { StatusIcons } from "./StatusIcons";

interface TaskDetailDialogProps {
	task: Task | null;
	onClose: () => void;
	onStatusChange: (task: Task, status: TaskStatus) => void;
}

export function TaskDetailDialog({ task, onClose, onStatusChange }: TaskDetailDialogProps) {
	if (!task) return null;

	const hasSubtasks = task.hasChildren || (task.children && task.children.length > 0);

	return (
		<Dialog
			open={!!task}
			onOpenChange={() => onClose()}
		>
			<DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-start gap-3">
						<div className={cn("w-1 h-8 rounded-full shrink-0", PriorityColors[task.priority])} />
						<div className="flex-1">
							<DialogTitle className="text-xl">{task.title}</DialogTitle>
							{task.project && <p className="text-sm text-muted-foreground mt-1">{task.project.title}</p>}
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<TaskMetaSection
						task={task}
						onStatusChange={onStatusChange}
					/>
					{task.description && <TaskDescriptionSection description={task.description} />}
					{task.tags && task.tags.length > 0 && <TaskTagsSection tags={task.tags} />}
					{hasSubtasks && task.children && <TaskSubtasksSection subtasks={task.children} />}
					{task.assignees && task.assignees.length > 0 && <TaskAssigneesSection assignees={task.assignees} />}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={onClose}
					>
						Close
					</Button>
					{task.canStartTimer && task.status !== TaskStatus.COMPLETED && (
						<Button className="gap-2">
							<Play className="h-4 w-4" />
							Start Timer
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// Meta section with status, priority, dates
function TaskMetaSection({ task, onStatusChange }: { task: Task; onStatusChange: (task: Task, status: TaskStatus) => void }) {
	return (
		<div className="flex flex-wrap gap-4">
			<div className="space-y-1">
				<Label className="text-xs text-muted-foreground">Status</Label>
				<Select
					value={task.status}
					onValueChange={(v) => onStatusChange(task, v as TaskStatus)}
				>
					<SelectTrigger className="w-40">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{Object.values(TaskStatus).map((status) => (
							<SelectItem
								key={status}
								value={status}
							>
								<div className="flex items-center gap-2">
									{StatusIcons[status]}
									{TaskStatusLabels[status]}
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="space-y-1">
				<Label className="text-xs text-muted-foreground">Priority</Label>
				<Badge className={cn("h-9 px-3", PriorityColors[task.priority], "text-white")}>{TaskPriorityLabels[task.priority]}</Badge>
			</div>
			{task.dueDate && (
				<div className="space-y-1">
					<Label className="text-xs text-muted-foreground">Due Date</Label>
					<div className="flex items-center gap-2 h-9 px-3 border rounded-md">
						<Calendar className="h-4 w-4" />
						{format(new Date(task.dueDate), "MMM d, yyyy")}
					</div>
				</div>
			)}
			<div className="space-y-1">
				<Label className="text-xs text-muted-foreground">Time Spent</Label>
				<div className="flex items-center gap-2 h-9 px-3 border rounded-md">
					<Clock className="h-4 w-4" />
					{Math.floor(task.totalTimeSpent / 60)}h {task.totalTimeSpent % 60}m
				</div>
			</div>
		</div>
	);
}

// Description section
function TaskDescriptionSection({ description }: { description: string }) {
	return (
		<div className="space-y-2">
			<Label className="text-xs text-muted-foreground">Description</Label>
			<p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">{description}</p>
		</div>
	);
}

// Tags section
function TaskTagsSection({ tags }: { tags: Array<{ tagId: number; name: string; color: string }> }) {
	return (
		<div className="space-y-2">
			<Label className="text-xs text-muted-foreground">Tags</Label>
			<div className="flex flex-wrap gap-2">
				{tags.map((tag) => (
					<Badge
						key={tag.tagId}
						style={{ backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color }}
					>
						{tag.name}
					</Badge>
				))}
			</div>
		</div>
	);
}

// Subtasks section
function TaskSubtasksSection({ subtasks }: { subtasks: Task[] }) {
	return (
		<div className="space-y-2">
			<Label className="text-xs text-muted-foreground">Subtasks ({subtasks.length})</Label>
			<div className="border rounded-lg divide-y">
				{subtasks.map((child) => (
					<div
						key={child.taskId}
						className="flex items-center gap-3 p-3"
					>
						{StatusIcons[child.status]}
						<span className={cn("flex-1", child.status === TaskStatus.COMPLETED && "line-through text-muted-foreground")}>{child.title}</span>
						<Badge
							variant="outline"
							className="text-xs"
						>
							{TaskStatusLabels[child.status]}
						</Badge>
					</div>
				))}
			</div>
		</div>
	);
}

// Assignees section
function TaskAssigneesSection({ assignees }: { assignees: Task["assignees"] }) {
	if (!assignees) return null;

	return (
		<div className="space-y-2">
			<Label className="text-xs text-muted-foreground">Assignees</Label>
			<div className="flex flex-wrap gap-2">
				{assignees.map((assignee) => (
					<Badge
						key={assignee.assigneeId}
						variant="secondary"
						className="gap-1"
					>
						{assignee.user?.name || `User ${assignee.userId}`}
						<span className="text-muted-foreground">({assignee.role})</span>
						{assignee.isPrimary && <span className="text-amber-500">★</span>}
					</Badge>
				))}
			</div>
		</div>
	);
}
