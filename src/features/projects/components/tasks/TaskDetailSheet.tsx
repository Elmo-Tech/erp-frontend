"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskStatusBadge, TaskTypeBadge, TaskPriorityBadge, TaskCategoryBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, TaskType, DeliveryStatus } from "@/features/dashboard/types/task";
import { useTask, useTaskActivities, useTestScenarios } from "@/features/dashboard/hooks/useTasks";
import { TaskAssigneesSection } from "./TaskAssigneesSection";
import { TaskTestScenariosSection } from "./TaskTestScenariosSection";
import { TaskActivitySection } from "./TaskActivitySection";
import { TaskTimerWidget } from "./TaskTimerWidget";
import { TaskTimeEntriesSection } from "./TaskTimeEntriesSection";
import { TaskDeliverablesSection } from "./TaskDeliverablesSection";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { Clock, AlertCircle, CheckCircle2, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TaskDetailSheetProps {
	taskId: number | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onEdit?: (task: Task) => void;
}

// Move DeliveryStatusCard outside the main component
const DeliveryStatusCard = ({ deliveryStatus }: { deliveryStatus: DeliveryStatus }) => {
	const getStatusIcon = () => {
		if (deliveryStatus.isCompleted) {
			if (deliveryStatus.isEarly) return <TrendingUp className="h-4 w-4 text-green-600" />;
			if (deliveryStatus.isOverdue) return <TrendingDown className="h-4 w-4 text-red-600" />;
			return <CheckCircle2 className="h-4 w-4 text-green-600" />;
		}
		if (deliveryStatus.isOverdue) return <AlertCircle className="h-4 w-4 text-red-600" />;
		return <Calendar className="h-4 w-4 text-blue-600" />;
	};

	const getStatusColor = () => {
		switch (deliveryStatus.statusColor) {
			case "success":
				return "bg-green-50 border-green-200 text-green-800";
			case "warning":
				return "bg-yellow-50 border-yellow-200 text-yellow-800";
			case "destructive":
				return "bg-red-50 border-red-200 text-red-800";
			default:
				return "bg-blue-50 border-blue-200 text-blue-800";
		}
	};

	// Show due date if:
	// 1. Task has a due date, AND
	// 2. Either task is not completed OR task is completed but we have delay information
	const shouldShowDueDate = deliveryStatus.dueDate && (!deliveryStatus.isCompleted || deliveryStatus.delayDays !== null || deliveryStatus.statusText !== "Completed (no due date)");

	return (
		<div className={cn("p-3 rounded-lg border", getStatusColor())}>
			<div className="flex items-center gap-2">
				{getStatusIcon()}
				<span className="text-sm font-medium">{deliveryStatus.statusText}</span>
			</div>
			{shouldShowDueDate && <div className="mt-1 text-xs opacity-75">Due: {format(new Date(deliveryStatus.dueDate as string), "MMM d, yyyy")}</div>}
			{deliveryStatus.completedAt && <div className="mt-1 text-xs opacity-75">Completed: {format(new Date(deliveryStatus.completedAt), "MMM d, yyyy 'at' HH:mm")}</div>}
		</div>
	);
};

export function TaskDetailSheet({ taskId, open, onOpenChange, onEdit }: TaskDetailSheetProps) {
	const [activeTab, setActiveTab] = useState("details");
	const { data: task, isLoading } = useTask(taskId ?? 0, !!taskId && open);
	const { data: activities } = useTaskActivities(taskId ?? 0, !!taskId && open);
	const { data: testScenarios } = useTestScenarios(taskId ?? 0, !!taskId && open);
	const { canEditMainTasks, canEditWeeklyTasks, canEditSubtasks } = usePermissions();

	if (!taskId) return null;

	// Determine if user can edit this specific task based on its type
	const canEditThisTask = task && onEdit && ((task.type === TaskType.MAIN && canEditMainTasks) || (task.type === TaskType.WEEKLY && canEditWeeklyTasks) || (task.type === TaskType.SUBTASK && canEditSubtasks));

	const formatTimeSpent = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}h ${mins}m`;
	};

	const getProgressPercentage = () => {
		if (!task || task.estimatedHours === 0) return 0;
		return Math.min((task.totalTimeSpent / 60 / task.estimatedHours) * 100, 100);
	};

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}
		>
			<SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col h-full overflow-hidden">
				{isLoading ? (
					<div className="flex items-center justify-center h-full">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
					</div>
				) : task ? (
					<div className="flex flex-col h-full overflow-hidden">
						<SheetHeader className="p-6 pb-0 shrink-0">
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-2">
										<TaskPriorityBadge
											priority={task.priority}
											size="sm"
										/>
										<TaskTypeBadge
											type={task.type}
											size="sm"
										/>
										<TaskStatusBadge
											status={task.status}
											size="sm"
										/>
										{task.taskCategory && (
											<TaskCategoryBadge
												category={task.taskCategory}
												size="sm"
											/>
										)}
									</div>
									<SheetTitle className="text-xl font-semibold line-clamp-2">{task.title}</SheetTitle>
									{task.parent && (
										<div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
											<span>Parent:</span>
											<span className="font-medium">{task.parent.title}</span>
										</div>
									)}
								</div>
								{canEditThisTask && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => onEdit(task)}
									>
										Edit
									</Button>
								)}
							</div>
						</SheetHeader>

						{/* Timer Widget - Only show for leaf tasks (no children) */}
						{task.canStartTimer && (
							<div className="px-6 py-4">
								<TaskTimerWidget task={task} />
							</div>
						)}

						{/* Quick Stats */}
						<div className="px-6 grid grid-cols-3 gap-4">
							<div className="bg-muted/50 rounded-lg p-3">
								<div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
									<Clock className="h-3 w-3" />
									Estimated
								</div>
								<p className="font-semibold">{task.estimatedHours}h</p>
							</div>
							<div className="bg-muted/50 rounded-lg p-3">
								<div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
									<Clock className="h-3 w-3" />
									Time Spent
								</div>
								<p className="font-semibold">{formatTimeSpent(task.totalTimeSpent)}</p>
							</div>
							<div className="bg-muted/50 rounded-lg p-3">
								<div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
									<CheckCircle2 className="h-3 w-3" />
									Tests
								</div>
								<p className="font-semibold">{task.testCompletionPercentage}%</p>
							</div>
						</div>

						{/* Delivery Status */}
						{(task.dueDate || task.deliveryStatus.isCompleted) && (
							<div className="px-6 py-2">
								<DeliveryStatusCard deliveryStatus={task.deliveryStatus} />
							</div>
						)}

						{/* Progress Bar */}
						<div className="px-6 py-2">
							<div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
								<span>Progress</span>
								<span>{Math.round(getProgressPercentage())}%</span>
							</div>
							<Progress
								value={getProgressPercentage()}
								className="h-2"
							/>
						</div>

						<Separator className="my-2" />

						{/* Tabs */}
						<Tabs
							value={activeTab}
							onValueChange={setActiveTab}
							className="flex-1 flex flex-col min-h-0 overflow-hidden"
						>
							<TabsList className={cn("mx-6 shrink-0", task.type === TaskType.WEEKLY ? "grid grid-cols-6" : "grid grid-cols-5")}>
								<TabsTrigger value="details">Details</TabsTrigger>
								<TabsTrigger value="assignees">Team ({task.assignees?.length || 0})</TabsTrigger>
								{/* Only show Deliverables tab for Weekly Tasks */}
								{task.type === TaskType.WEEKLY && <TabsTrigger value="deliverables">Deliverables ({task.deliverables?.length || 0})</TabsTrigger>}
								<TabsTrigger value="tests">Tests ({testScenarios?.length || 0})</TabsTrigger>
								<TabsTrigger value="time">Time</TabsTrigger>
								<TabsTrigger value="activity">Activity</TabsTrigger>
							</TabsList>

							<ScrollArea className="flex-1 h-full pb-[7%]!">
								<TabsContent
									value="details"
									className="p-6 pt-4 m-0"
								>
									<div className="space-y-4">
										{/* Description */}
										{task.description && (
											<div>
												<h4 className="text-sm font-medium mb-2">Description</h4>
												<p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
											</div>
										)}

										{/* Acceptance Criteria */}
										{task.acceptanceCriteria && (
											<div>
												<h4 className="text-sm font-medium mb-2">Acceptance Criteria</h4>
												<p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.acceptanceCriteria}</p>
											</div>
										)}

										{/* Tags */}
										{task.tags && task.tags.length > 0 && (
											<div>
												<h4 className="text-sm font-medium mb-2">Tags</h4>
												<div className="flex flex-wrap gap-2">
													{task.tags.map((tag) => (
														<Badge
															key={tag.tagId}
															variant="secondary"
															style={{ backgroundColor: tag.color + "20", color: tag.color }}
														>
															{tag.name}
														</Badge>
													))}
												</div>
											</div>
										)}

										{/* Dates */}
										<div className="grid grid-cols-2 gap-4">
											{task.startDate && (
												<div>
													<h4 className="text-sm font-medium mb-1">Start Date</h4>
													<p className="text-sm text-muted-foreground">{format(new Date(task.startDate), "MMM d, yyyy")}</p>
												</div>
											)}
											{task.dueDate && (
												<div>
													<h4 className="text-sm font-medium mb-1">Due Date</h4>
													<p className="text-sm text-muted-foreground">{format(new Date(task.dueDate), "MMM d, yyyy")}</p>
												</div>
											)}
										</div>

										{/* Sprint */}
										{task.sprintNumber && (
											<div>
												<h4 className="text-sm font-medium mb-1">Sprint</h4>
												<p className="text-sm text-muted-foreground">Sprint {task.sprintNumber}</p>
											</div>
										)}

										{/* Internal Notes (Admin Only) */}
										{task.internalReviewerNotes && (
											<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
												<h4 className="text-sm font-medium mb-1 flex items-center gap-2">
													<AlertCircle className="h-4 w-4 text-yellow-600" />
													Internal Notes
												</h4>
												<p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.internalReviewerNotes}</p>
											</div>
										)}

										{/* Reopen Count */}
										{task.reopenCount > 0 && (
											<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
												<p className="text-sm text-red-600 dark:text-red-400">This task has been reopened {task.reopenCount} time(s)</p>
											</div>
										)}
									</div>
								</TabsContent>

								<TabsContent
									value="assignees"
									className="p-6 pt-4 m-0"
								>
									<TaskAssigneesSection task={task} />
								</TabsContent>

								{/* Only render Deliverables tab content for Weekly Tasks */}
								{task.type === TaskType.WEEKLY && (
									<TabsContent
										value="deliverables"
										className="p-6 pt-4 m-0"
									>
										<TaskDeliverablesSection
											task={task}
											deliverables={task.deliverables || []}
										/>
									</TabsContent>
								)}

								<TabsContent
									value="tests"
									className="p-6 pt-4 m-0"
								>
									<TaskTestScenariosSection
										task={task}
										scenarios={testScenarios || []}
									/>
								</TabsContent>

								<TabsContent
									value="time"
									className="p-6 pt-4 m-0"
								>
									<TaskTimeEntriesSection task={task} />
								</TabsContent>

								<TabsContent
									value="activity"
									className="p-6 pt-4 m-0"
								>
									<TaskActivitySection
										task={task}
										activities={activities || []}
									/>
								</TabsContent>
							</ScrollArea>
						</Tabs>
					</div>
				) : (
					<div className="flex items-center justify-center h-full text-muted-foreground">Task not found</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
