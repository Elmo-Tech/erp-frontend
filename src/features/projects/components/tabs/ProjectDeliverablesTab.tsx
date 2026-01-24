"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Eye, Users, AlertTriangle, ListTodo } from "lucide-react";
import { useProjectTasks } from "@/features/dashboard/hooks/useTasks";
import { useAuthStore } from "@/store/authStore";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { ReviewApprovalTab } from "./ReviewApprovalTab";

interface ProjectDeliverablesTabProps {
	projectId: number;
}

export function ProjectDeliverablesTab({ projectId }: ProjectDeliverablesTabProps) {
	const { role } = useAuthStore();
	const { data: tasksData, isLoading, error } = useProjectTasks(projectId, 1, 100); // Get all tasks
	const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

	// Get weekly tasks
	const weeklyTasks = tasksData?.tasks?.filter((task) => task.type === "weekly") || [];

	// Permission checks
	const { canEditTasks, canManageTasks } = usePermissions();
	const canManageDeliverables = role === "admin" || role === "super-admin" || canEditTasks;
	const canReviewDeliverables = role === "admin" || role === "super-admin" || canManageTasks;
	const isDeveloper = role === "developer" || role === "team-lead";

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Skeleton
							key={i}
							className="h-24"
						/>
					))}
				</div>
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<Skeleton
							key={i}
							className="h-32"
						/>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription>Failed to load project tasks. Please try again.</AlertDescription>
			</Alert>
		);
	}

	if (!tasksData?.tasks) {
		return (
			<Alert>
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription>No tasks found for this project.</AlertDescription>
			</Alert>
		);
	}

	if (weeklyTasks.length === 0) {
		return (
			<Alert>
				<ListTodo className="h-4 w-4" />
				<AlertDescription>No weekly tasks found in this project. Deliverables can only be added to weekly tasks.</AlertDescription>
			</Alert>
		);
	}

	// If a task is selected, show its deliverables
	if (selectedTaskId) {
		const selectedTask = weeklyTasks.find((task) => task.taskId === selectedTaskId);
		if (selectedTask) {
			return (
				<div className="space-y-4">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							onClick={() => setSelectedTaskId(null)}
						>
							← Back to Tasks
						</Button>
						<div>
							<h3 className="font-semibold">{selectedTask.title}</h3>
							<p className="text-sm text-muted-foreground">Weekly Task Deliverables</p>
						</div>
					</div>

					<ReviewApprovalTab
						taskId={selectedTask.taskId}
						taskTitle={selectedTask.title}
						taskType={selectedTask.type}
						canManageDeliverables={canManageDeliverables}
						canReviewDeliverables={canReviewDeliverables}
						isDeveloper={isDeveloper}
					/>
				</div>
			);
		}
	}

	// Show list of weekly tasks
	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h3 className="text-lg font-semibold">Deliverables Management</h3>
				<p className="text-sm text-muted-foreground">Manage deliverables for weekly tasks in this project</p>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<ListTodo className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Weekly Tasks</span>
						</div>
						<p className="text-2xl font-bold">{weeklyTasks.length}</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Assigned Developers</span>
						</div>
						<p className="text-2xl font-bold">{new Set(weeklyTasks.flatMap((task) => task.assignees?.map((a) => a.userId) || [])).size}</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<FileText className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Tasks with Deliverables</span>
						</div>
						<p className="text-2xl font-bold">{weeklyTasks.length}</p>
					</CardContent>
				</Card>
			</div>

			{/* Weekly Tasks List */}
			<div className="space-y-4">
				<h4 className="font-medium">Weekly Tasks</h4>
				<div className="grid gap-4">
					{weeklyTasks.map((task) => (
						<Card
							key={task.taskId}
							className="hover:shadow-md transition-shadow cursor-pointer"
							onClick={() => setSelectedTaskId(task.taskId)}
						>
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<h5 className="font-semibold">{task.title}</h5>
											<Badge variant="outline">{task.status}</Badge>
											{task.priority && (
												<Badge
													variant={task.priority === "high" ? "destructive" : "secondary"}
													className="text-xs"
												>
													{task.priority}
												</Badge>
											)}
										</div>

										{task.description && <p className="text-sm text-muted-foreground mb-2">{task.description}</p>}

										<div className="flex items-center gap-4 text-xs text-muted-foreground">
											{task.assignees && task.assignees.length > 0 && (
												<div className="flex items-center gap-1">
													<Users className="h-3 w-3" />
													<span>{task.assignees.length} assigned</span>
												</div>
											)}

											<div className="flex items-center gap-1">
												<FileText className="h-3 w-3" />
												<span>Click to view deliverables</span>
											</div>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Badge
											variant="secondary"
											className="text-xs"
										>
											Weekly Task
										</Badge>

										<Button
											variant="ghost"
											size="sm"
										>
											<Eye className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
