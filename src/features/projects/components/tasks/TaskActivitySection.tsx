"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Task, TaskActivity } from "@/features/dashboard/types/task";
import { useAddComment } from "@/features/dashboard/hooks/useTasks";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { MessageSquare, Clock, UserPlus, UserMinus, CheckCircle2, XCircle, Play, Square, Tag, AlertCircle, Send, Lock, Info } from "lucide-react";
import { notifyApiError } from "@/lib/errorHandling";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface TaskActivitySectionProps {
	task: Task;
	activities: TaskActivity[];
}

const activityIcons: Record<string, typeof MessageSquare> = {
	created: CheckCircle2,
	updated: AlertCircle,
	status_change: Clock,
	assignee_added: UserPlus,
	assignee_removed: UserMinus,
	timer_start: Play,
	timer_stop: Square,
	test_completed: CheckCircle2,
	test_verified: CheckCircle2,
	test_failed: XCircle,
	comment: MessageSquare,
	internal_note: Lock,
	tag_added: Tag,
	tag_removed: Tag,
	priority_change: AlertCircle,
	due_date_change: Clock,
};

const activityColors: Record<string, string> = {
	created: "text-green-600",
	status_change: "text-blue-600",
	assignee_added: "text-purple-600",
	assignee_removed: "text-orange-600",
	timer_start: "text-green-600",
	timer_stop: "text-red-600",
	test_completed: "text-blue-600",
	test_verified: "text-green-600",
	test_failed: "text-red-600",
	comment: "text-gray-600",
	internal_note: "text-yellow-600",
};

export function TaskActivitySection({ task, activities }: TaskActivitySectionProps) {
	const [comment, setComment] = useState("");
	const [isInternal, setIsInternal] = useState(false);

	const addComment = useAddComment();
	const { canViewInternalNotes } = usePermissions();

	// Only users with view_internal_notes permission can see activity log
	if (!canViewInternalNotes) {
		return (
			<div className="space-y-4">
				<Alert>
					<Info className="h-4 w-4" />
					<AlertDescription>Activity log is only visible to team leads and reviewers.</AlertDescription>
				</Alert>
			</div>
		);
	}

	const handleSubmitComment = async () => {
		if (!comment.trim()) return;

		try {
			await addComment.mutateAsync({
				taskId: task.taskId,
				payload: { comment: comment.trim(), isInternal },
			});
			setComment("");
		} catch (error) {
			notifyApiError(error);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
			handleSubmitComment();
		}
	};

	return (
		<div className="space-y-4">
			{/* Comment Input */}
			<div className="space-y-3">
				<Textarea
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Add a comment... (Cmd+Enter to submit)"
					rows={3}
					className="resize-none"
				/>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Switch
							id="internal"
							checked={isInternal}
							onCheckedChange={setIsInternal}
						/>
						<Label
							htmlFor="internal"
							className="text-sm text-muted-foreground flex items-center gap-1"
						>
							<Lock className="h-3 w-3" />
							Internal note (admin only)
						</Label>
					</div>
					<Button
						onClick={handleSubmitComment}
						disabled={!comment.trim() || addComment.isPending}
						size="sm"
					>
						<Send className="h-4 w-4 mr-1" />
						{addComment.isPending ? "Sending..." : "Send"}
					</Button>
				</div>
			</div>

			{/* Activity Timeline */}
			<div className="space-y-1">
				<h4 className="text-sm font-medium mb-3">Activity</h4>
				{activities.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
						<p className="text-sm">No activity yet</p>
					</div>
				) : (
					<div className="space-y-4">
						{activities.map((activity) => (
							<ActivityItem
								key={activity.activityId}
								activity={activity}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function ActivityItem({ activity }: { activity: TaskActivity }) {
	const Icon = activityIcons[activity.type] || MessageSquare;
	const color = activityColors[activity.type] || "text-gray-600";
	const isComment = activity.type === "comment" || activity.type === "internal_note";

	return (
		<div className="flex gap-3">
			<div className={cn("mt-1 p-1.5 rounded-full bg-muted", color)}>
				<Icon className="h-3.5 w-3.5" />
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 flex-wrap">
					<Avatar className="h-5 w-5">
						<AvatarFallback className="text-[10px]">{activity.user?.name?.charAt(0) || "?"}</AvatarFallback>
					</Avatar>
					<span className="text-sm font-medium">{activity.user?.name || "Unknown"}</span>
					{activity.isInternal && (
						<Badge
							variant="outline"
							className="text-xs text-yellow-600"
						>
							<Lock className="h-3 w-3 mr-1" />
							Internal
						</Badge>
					)}
					<span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
				</div>

				{isComment && activity.comment ? (
					<div className={cn("mt-2 p-3 rounded-lg text-sm whitespace-pre-wrap", activity.isInternal ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800" : "bg-muted")}>{activity.comment}</div>
				) : (
					<p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
				)}
			</div>
		</div>
	);
}
