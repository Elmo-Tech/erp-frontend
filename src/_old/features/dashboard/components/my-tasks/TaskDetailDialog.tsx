/**
 * Task Detail Dialog Component
 * Shows full task details with subtasks
 */

import { FormDialog } from "@/shared/ui";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";
import { format } from "date-fns";
import { Calendar, CalendarClock, Clock, Play, Square, Loader2, Timer } from "lucide-react";
import { Task, TaskStatus, TaskStatusLabels, TaskPriorityLabels } from "../../types/task";
import { PriorityColors } from "./constants";
import { StatusIcons } from "./StatusIcons";
import { useStartTimer, useStopTimer } from "@/_old/features/sales/hooks";
import { useTimerStore } from "@/_old/store/timerStore";
import { TrackableType } from "@/_old/features/sales/types";
import { toast } from "sonner";

interface TaskDetailDialogProps {
	task: Task | null;
	onClose: () => void;
	onStatusChange: (task: Task, status: TaskStatus) => void;
}

export function TaskDetailDialog({ task, onClose, onStatusChange }: TaskDetailDialogProps) {
	const { activeTimer } = useTimerStore();
	const startTimer = useStartTimer();
	const stopTimer = useStopTimer();

	if (!task) return null;

	const hasSubtasks = task.hasChildren || (task.children && task.children.length > 0);

	// Check if active timer is for a task using global store (real-time)
	const activeTaskId = activeTimer ? Number(activeTimer.trackableId) : null;
	const isTaskTimer = activeTimer?.trackableType?.toLowerCase().includes("task");
	const isTimerRunningOnThis = isTaskTimer && activeTaskId === task.taskId;
	const isTimerRunningOnOther = !!activeTimer && !isTimerRunningOnThis;
	const isTimerLoading = startTimer.isPending || stopTimer.isPending;

	const handleStartTimer = async () => {
		if (activeTimer) {
			toast.error("Please stop the current timer first");
			return;
		}
		try {
			await startTimer.mutateAsync({
				trackableType: "task" as TrackableType,
				trackableId: task.taskId,
			});
			toast.success(`Timer started for "${task.title}"`);
		} catch {
			toast.error("Failed to start timer");
		}
	};

	const handleStopTimer = async () => {
		try {
			await stopTimer.mutateAsync();
			toast.success("Timer stopped");
		} catch {
			toast.error("Failed to stop timer");
		}
	};

	return (
		<FormDialog
			open={!!task}
			onOpenChange={() => onClose()}
			title={
				<div className="flex items-start gap-3">
					<div className={cn("w-1 h-8 rounded-full shrink-0", PriorityColors[task.priority])} />
					<div className="flex-1">
						<div className="flex items-center gap-2">
							{isTimerRunningOnThis && (
								<div className="flex items-center gap-1">
									<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
									<Timer className="h-4 w-4 text-green-600" />
								</div>
							)}
							<span className="text-xl">{task.title}</span>
						</div>
						{task.project && <p className="text-sm text-muted-foreground mt-1 font-normal">{task.project.title}</p>}
					</div>
				</div>
			}
			showFooter={false}
			size="xxl"
		>
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

			<div className="flex justify-end gap-2 pt-4 border-t">
				<Button
					variant="outline"
					onClick={onClose}
				>
					Close
				</Button>
				{task.canStartTimer &&
					task.status !== TaskStatus.COMPLETED &&
					(isTimerRunningOnThis ? (
						<Button
							variant="destructive"
							className="gap-2"
							onClick={handleStopTimer}
							disabled={isTimerLoading}
						>
							{isTimerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
							Stop Timer
						</Button>
					) : (
						<Button
							className="gap-2"
							onClick={handleStartTimer}
							disabled={isTimerLoading || isTimerRunningOnOther}
						>
							{isTimerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
							{isTimerRunningOnOther ? "Stop other timer first" : "Start Timer"}
						</Button>
					))}
			</div>
		</FormDialog>
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
			{task.expectedResolutionDate && (
				<div className="space-y-1">
					<Label className="text-xs text-muted-foreground">Expected Resolution</Label>
					<div className="flex items-center gap-2 h-9 px-3 border rounded-md">
						<CalendarClock className="h-4 w-4" />
						{format(new Date(task.expectedResolutionDate), "MMM d, yyyy")}
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
