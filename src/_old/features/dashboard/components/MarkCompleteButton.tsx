/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Task, TaskStatus, TaskType } from "../types/task";
import { useMarkComplete } from "../hooks/useTasks";
import { useAuthStore } from "@/_old/store/authStore";
import { toast } from "sonner";

interface MarkCompleteButtonProps {
	task: Task;
	className?: string;
}

export function MarkCompleteButton({ task, className }: MarkCompleteButtonProps) {
	const [showDialog, setShowDialog] = useState(false);
	const [reason, setReason] = useState("");
	const { user } = useAuthStore();
	const markComplete = useMarkComplete();

	// Check if user is a primary assignee
	const isPrimaryAssignee = task.assignees?.some((assignee) => assignee.userId === user?.userId && assignee.isPrimary);
	const isNotSubTask = task.type !== TaskType.SUBTASK;
	// Don't show button if:
	// - Task is already completed
	// - User is not a primary assignee
	// - Task has active timer (will be validated on backend)
	if (task.status === TaskStatus.COMPLETED || !isPrimaryAssignee || isNotSubTask) {
		return null;
	}

	const handleMarkComplete = async () => {
		try {
			await markComplete.mutateAsync({
				id: task.taskId,
				reason: reason.trim() || undefined,
			});

			toast.success("Task marked as complete successfully");
			setShowDialog(false);
			setReason("");
		} catch (error: unknown) {
			const errorMessage = error instanceof Error && "response" in error ? (error as any).response?.data?.message : "Failed to mark task as complete";
			toast.error(errorMessage);
		}
	};

	return (
		<>
			<Button
				size="sm"
				variant="outline"
				className={`h-7 px-2 text-xs hover:bg-green-50 hover:text-green-700 hover:border-green-300 ${className}`}
				onClick={(e) => {
					e.stopPropagation();
					setShowDialog(true);
				}}
				disabled={markComplete.isPending}
			>
				{markComplete.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
			</Button>

			<Dialog
				open={showDialog}
				onOpenChange={setShowDialog}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Mark Task as Complete</DialogTitle>
						<DialogDescription>Are you sure you want to mark &quot;{task.title}&quot; as complete? Make sure you have stopped any active timers before proceeding.</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<Label htmlFor="reason">Completion Notes (Optional)</Label>
							<Textarea
								id="reason"
								placeholder="Add any notes about the completion..."
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								maxLength={500}
								className="mt-1"
							/>
							<p className="text-xs text-muted-foreground mt-1">{reason.length}/500 characters</p>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowDialog(false);
								setReason("");
							}}
							disabled={markComplete.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={handleMarkComplete}
							disabled={markComplete.isPending}
							className="bg-green-600 hover:bg-green-700"
						>
							{markComplete.isPending ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Marking Complete...
								</>
							) : (
								<>
									<CheckCircle2 className="h-4 w-4 mr-2" />
									Mark Complete
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
