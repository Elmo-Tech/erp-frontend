"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NestedTaskTree } from "@/features/dashboard/components/NestedTaskTree";
import { TaskDetails } from "@/features/dashboard/components/TaskDetails";
import { Task } from "@/features/dashboard/types/task";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { Skeleton } from "@/components/ui/skeleton";

export default function TasksPage() {
	const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);

	const { data: projectsData, isLoading: isLoadingProjects } = useProjects({ perPage: 100 });

	const handleTaskSelect = (task: Task) => {
		setSelectedTask(task);
	};

	const handleTaskUpdate = (updatedTask: Task) => {
		setSelectedTask(updatedTask);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Tasks</h1>
					<p className="text-muted-foreground">Manage tasks and daily work</p>
				</div>

				{/* Project Selector */}
				<div className="w-64">
					{isLoadingProjects ? (
						<Skeleton className="h-10 w-full" />
					) : (
						<Select
							value={selectedProjectId?.toString() || ""}
							onValueChange={(value) => {
								setSelectedProjectId(value ? parseInt(value) : null);
								setSelectedTask(null);
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a project" />
							</SelectTrigger>
							<SelectContent>
								{projectsData?.projects.map((project) => (
									<SelectItem
										key={project.projectId}
										value={project.projectId.toString()}
									>
										{project.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</div>
			</div>

			{selectedProjectId ? (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Task Tree */}
					<Card>
						<CardHeader>
							<CardTitle>Task Tree</CardTitle>
						</CardHeader>
						<CardContent>
							<NestedTaskTree
								projectId={selectedProjectId}
								onTaskSelect={handleTaskSelect}
								selectedTaskId={selectedTask?.taskId}
							/>
						</CardContent>
					</Card>

					{/* Task Details */}
					<div>
						{selectedTask ? (
							<TaskDetails
								task={selectedTask}
								onUpdate={handleTaskUpdate}
							/>
						) : (
							<Card>
								<CardContent className="flex items-center justify-center h-64 text-muted-foreground">Select a task to view details</CardContent>
							</Card>
						)}
					</div>
				</div>
			) : (
				<Card>
					<CardContent className="flex items-center justify-center h-64 text-muted-foreground">Select a project to view its tasks</CardContent>
				</Card>
			)}
		</div>
	);
}
