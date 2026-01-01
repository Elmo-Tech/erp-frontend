/**
 * TaskDetails Component
 * Display full task information with timer integration and status management
 *
 * Requirements: 10.1, 10.2, 10.3, 10.6, 13.1, 13.2, 13.3
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Play, Square, Clock, User, Calendar, RotateCcw, AlertTriangle } from "lucide-react";
import { Task, TaskStatus, TaskStatusLabels, UpdateTaskPayload } from "../types/task";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { InternalNotes } from "./InternalNotes";
import { useUpdateTask } from "../hooks/useTasks";
import { useTimerStore } from "@/store/timerStore";
import { useStartTimer, useStopTimer } from "@/features/sales/hooks/useTimeEntries";
import { TrackableType } from "@/features/sales/types/timeEntry";
import { cn } from "@/lib/utils";

interface TaskDetailsProps {
	task: Task;
	onUpdate?: (task: Task) => void;
	className?: string;
}

/**
 * TaskDetails component for displaying and managing task information
 * Requirements:
 * - 10.1: Display full task information
 * - 10.2: Include timer start/stop button
 * - 10.3: Show status dropdown with all TaskStatus values
 * - 10.6: Display bounce warning on testing→in_progress
 * - 13.1, 13.2, 13.3: Show reopen_count for quality visibility
 */
export const TaskDetails: React.FC<TaskDetailsProps> = ({ task, onUpdate, className }) => {
	const [pendingStatusChange, setPendingStatusChange] = useState<TaskStatus | null>(null);

	// Hooks
	const updateTaskMutation = useUpdateTask();
	const { isRunning, entityType, entityId } = useTimerStore();
	const startTimerMutation = useStartTimer();
	const stopTimerMutation = useStopTimer();

	// Check if timer is running for this task
	const isTimerRunningForTask = isRunning && entityType === "task" && entityId === task.taskId;

	// Format time display
	const formatTime = (minutes: number): string => {
		if (minutes < 60) {
			return `${minutes}m`;
		}
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		if (remainingMinutes === 0) {
			return `${hours}h`;
		}
		return `${hours}h ${remainingMinutes}m`;
	};

	// Format date display
	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Handle status change
	const handleStatusChange = (newStatus: TaskStatus) => {
		// Check if this is a testing → in_progress transition (bounce)
		if (task.status === TaskStatus.TESTING && newStatus === TaskStatus.IN_PROGRESS) {
			setPendingStatusChange(newStatus);
			return;
		}

		// Direct status change
		updateStatus(newStatus);
	};

	// Confirm bounce status change
	const confirmBounceStatusChange = () => {
		if (pendingStatusChange) {
			updateStatus(pendingStatusChange);
			setPendingStatusChange(null);
		}
	};

	// Cancel bounce status change
	const cancelBounceStatusChange = () => {
		setPendingStatusChange(null);
	};

	// Update task status
	const updateStatus = (newStatus: TaskStatus) => {
		const payload: UpdateTaskPayload = { status: newStatus };

		updateTaskMutation.mutate(
			{ id: task.taskId, payload },
			{
				onSuccess: (updatedTask) => {
					onUpdate?.(updatedTask);
				},
			}
		);
	};

	// Handle internal notes update
	const handleNotesUpdate = (notes: string) => {
		const payload: UpdateTaskPayload = { internalReviewerNotes: notes };

		updateTaskMutation.mutate(
			{ id: task.taskId, payload },
			{
				onSuccess: (updatedTask) => {
					onUpdate?.(updatedTask);
				},
			}
		);
	};

	// Handle timer start
	const handleStartTimer = async () => {
		try {
			await startTimerMutation.mutateAsync({
				trackableId: task.taskId,
				trackableType: TrackableType.TASK,
			});
			// Timer store will be updated by the TimerWidget sync logic
		} catch (error) {
			console.error("Failed to start timer:", error);
		}
	};

	// Handle timer stop
	const handleStopTimer = async () => {
		try {
			await stopTimerMutation.mutateAsync();
			// Refresh task data to show updated totalTimeSpent
			// This will be handled by the parent component through onUpdate callback
			// or by invalidating the task query cache
			// Timer store will be updated by the TimerWidget sync logic
		} catch (error) {
			console.error("Failed to stop timer:", error);
		}
	};

	return (
		<div className={cn("space-y-6", className)}>
			{/* Main Task Information */}
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="space-y-2">
							<CardTitle className="text-xl">{task.title}</CardTitle>
							<div className="flex items-center gap-2">
								<TaskStatusBadge status={task.status} />
								{task.reopenCount > 0 && (
									<Badge
										variant="destructive"
										className="flex items-center gap-1"
									>
										<RotateCcw className="h-3 w-3" />
										Bounced {task.reopenCount}x
									</Badge>
								)}
							</div>
						</div>
						<CardAction>
							{isTimerRunningForTask ? (
								<Button
									variant="destructive"
									size="sm"
									onClick={handleStopTimer}
									disabled={stopTimerMutation.isPending}
									className="min-w-[100px]"
								>
									{stopTimerMutation.isPending ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" /> : <Square className="h-4 w-4 mr-2" />}
									Stop Timer
								</Button>
							) : (
								<Button
									variant="default"
									size="sm"
									onClick={handleStartTimer}
									disabled={startTimerMutation.isPending || isRunning}
									className="min-w-[100px]"
								>
									{startTimerMutation.isPending ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" /> : <Play className="h-4 w-4 mr-2" />}
									Start Timer
								</Button>
							)}
						</CardAction>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Description */}
					{task.description && (
						<div>
							<h4 className="text-sm font-medium mb-2">Description</h4>
							<p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{task.description}</p>
						</div>
					)}

					<Separator />

					{/* Task Metadata */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Status Management */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Status</label>
							<Select
								value={task.status}
								onValueChange={handleStatusChange}
								disabled={updateTaskMutation.isPending}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.values(TaskStatus).map((status) => (
										<SelectItem
											key={status}
											value={status}
										>
											{TaskStatusLabels[status]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Assignee */}
						<div className="space-y-2">
							<label className="text-sm font-medium flex items-center gap-2">
								<User className="h-4 w-4" />
								Assigned To
							</label>
							<div className="text-sm text-muted-foreground">{task.assignee ? task.assignee.name : "Unassigned"}</div>
						</div>

						{/* Time Information */}
						<div className="space-y-2">
							<label className="text-sm font-medium flex items-center gap-2">
								<Clock className="h-4 w-4" />
								Time Tracking
							</label>
							<div className="space-y-1">
								<div className="text-sm">
									<span className="text-muted-foreground">Estimated:</span> {task.estimatedHours > 0 ? `${task.estimatedHours}h` : "Not set"}
								</div>
								<div className="text-sm">
									<span className="text-muted-foreground">Spent:</span> {formatTime(task.totalTimeSpent)}
								</div>
								{task.estimatedHours > 0 && (
									<div className="text-sm">
										<span className="text-muted-foreground">Progress:</span> {Math.round((task.totalTimeSpent / (task.estimatedHours * 60)) * 100)}%
									</div>
								)}
							</div>
						</div>

						{/* Dates */}
						<div className="space-y-2">
							<label className="text-sm font-medium flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								Timeline
							</label>
							<div className="space-y-1">
								<div className="text-sm">
									<span className="text-muted-foreground">Created:</span> {formatDate(task.createdAt)}
								</div>
								<div className="text-sm">
									<span className="text-muted-foreground">Updated:</span> {formatDate(task.updatedAt)}
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Internal Notes - Only show if present in API response */}
			{task.internalReviewerNotes !== undefined && (
				<InternalNotes
					notes={task.internalReviewerNotes}
					onUpdate={handleNotesUpdate}
					isUpdating={updateTaskMutation.isPending}
				/>
			)}

			{/* Bounce Warning Dialog */}
			<AlertDialog open={!!pendingStatusChange}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-amber-500" />
							Bug Bounce Warning
						</AlertDialogTitle>
						<AlertDialogDescription>
							You are about to move this task from <strong>Testing</strong> back to <strong>In Progress</strong>. This will increment the bug bounce rate, which affects quality metrics.
							<br />
							<br />
							Current bounce count: <strong>{task.reopenCount}</strong>
							<br />
							New bounce count: <strong>{task.reopenCount + 1}</strong>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={cancelBounceStatusChange}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmBounceStatusChange}>Continue Anyway</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default TaskDetails;
