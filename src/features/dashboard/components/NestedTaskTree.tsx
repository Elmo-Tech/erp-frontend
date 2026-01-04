/**
 * NestedTaskTree Component
 * Displays tasks in a collapsible tree structure with lazy loading
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

"use client";

import React, { useState, useCallback } from "react";
import { ChevronRightIcon, ChevronDownIcon, ClockIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Task, TaskStatus, TaskStatusLabels, TaskStatusColors, TaskChildrenResponse } from "../types/task";
import { useTaskTree, useTaskChildren } from "../hooks/useTaskTree";
import { useTimerStore } from "@/store/timerStore";

interface NestedTaskTreeProps {
	projectId: number;
	onTaskSelect: (task: Task) => void;
	selectedTaskId?: number;
	highlightedTaskId?: number | null;
	className?: string;
}

interface TaskNodeProps {
	task: Task;
	level: number;
	onTaskSelect: (task: Task) => void;
	selectedTaskId?: number;
	highlightedTaskId?: number | null;
	expandedTasks: Set<number>;
	onToggleExpand: (taskId: number) => void;
}

/**
 * TaskStatusBadge component for displaying task status with appropriate colors
 * Requirement 9.4: Display task title, status badge, assigned user
 */
const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
	const colorClass = TaskStatusColors[status];
	const label = TaskStatusLabels[status];

	return (
		<Badge
			variant="outline"
			className={cn("text-xs font-medium", colorClass)}
		>
			{label}
		</Badge>
	);
};

/**
 * TimeSpentIndicator component for showing total time spent
 * Requirement 9.6: Show total time spent indicator
 */
const TimeSpentIndicator: React.FC<{ minutes: number }> = ({ minutes }) => {
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	const formatTime = () => {
		if (hours > 0) {
			return `${hours}h ${remainingMinutes}m`;
		}
		return `${remainingMinutes}m`;
	};

	return (
		<div className="flex items-center gap-1 text-xs text-muted-foreground">
			<ClockIcon className="size-3" />
			<span>{formatTime()}</span>
		</div>
	);
};

/**
 * TaskNode component for rendering individual task items
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */
const TaskNode: React.FC<TaskNodeProps> = ({ task, level, onTaskSelect, selectedTaskId, highlightedTaskId, expandedTasks, onToggleExpand }) => {
	const isExpanded = expandedTasks.has(task.taskId);
	const isSelected = selectedTaskId === task.taskId;
	const isHighlighted = highlightedTaskId === task.taskId;
	const { activeTimer } = useTimerStore();
	const isTimerActive = activeTimer?.isActive && activeTimer?.trackableType === "task" && activeTimer?.trackableId === task.taskId;

	// Check if task has preloaded children or API says it has children
	const hasPreloadedChildren = task.children && task.children.length > 0;
	const apiSaysHasChildren = task.hasChildren === true;

	// Use lazy loading hook for children - fetch when expanded
	const {
		data: childrenData,
		isLoading: isLoadingChildren,
		error: childrenError,
	} = useTaskChildren(task.taskId, isExpanded && !hasPreloadedChildren) as {
		data: TaskChildrenResponse | undefined;
		isLoading: boolean;
		error: Error | null;
	};

	// Get children from either preloaded data or lazy-loaded data
	const children = hasPreloadedChildren ? task.children || [] : childrenData?.children || [];
	const hasAnyChildren = children.length > 0;

	// Check if task could potentially have children
	// Use API hasChildren flag, or check task type
	const canHaveChildren = apiSaysHasChildren || task.type === "main" || task.type === "weekly";

	const handleToggleExpand = useCallback(() => {
		// Allow toggle if task can have children (even if not loaded yet)
		if (canHaveChildren || hasAnyChildren || isLoadingChildren) {
			onToggleExpand(task.taskId);
		}
	}, [canHaveChildren, hasAnyChildren, isLoadingChildren, onToggleExpand, task.taskId]);

	const handleTaskClick = useCallback(() => {
		onTaskSelect(task);
	}, [onTaskSelect, task]);

	return (
		<div className="select-none">
			{/* Task Item */}
			<div
				id={`task-${task.taskId}`}
				className={cn(
					"group flex items-center gap-2 rounded-md p-2 hover:bg-accent/50 transition-colors cursor-pointer",
					isSelected && "bg-accent",
					isTimerActive && "ring-2 ring-blue-500/50 bg-blue-50 dark:bg-blue-950/20",
					isHighlighted && "ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 animate-pulse"
				)}
				style={{ paddingLeft: `${level * 20 + 8}px` }}
				onClick={handleTaskClick}
			>
				{/* Expand/Collapse Toggle */}
				{/* Requirement 9.2: Show expand/collapse toggle for tasks with children */}
				<Button
					variant="ghost"
					size="icon-sm"
					className="size-6 p-0 hover:bg-accent"
					onClick={(e) => {
						e.stopPropagation();
						handleToggleExpand();
					}}
					disabled={!canHaveChildren && !hasAnyChildren && !isLoadingChildren}
				>
					{isLoadingChildren ? (
						<div className="size-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
					) : canHaveChildren || hasAnyChildren ? (
						isExpanded ? (
							<ChevronDownIcon className="size-4" />
						) : (
							<ChevronRightIcon className="size-4" />
						)
					) : (
						<div className="size-4" />
					)}
				</Button>

				{/* Task Content */}
				<div className="flex-1 flex items-center justify-between gap-3 min-w-0">
					<div className="flex items-center gap-3 min-w-0 flex-1">
						{/* Task Title */}
						{/* Requirement 9.4: Display task title */}
						<span
							className={cn("font-medium text-sm truncate", isTimerActive && "text-blue-700 dark:text-blue-300")}
							title={task.title}
						>
							{task.title}
						</span>

						{/* Status Badge */}
						{/* Requirement 9.4: Display status badge */}
						<TaskStatusBadge status={task.status} />

						{/* Timer Indicator */}
						{isTimerActive && (
							<div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
								<div className="size-2 bg-blue-500 rounded-full animate-pulse" />
								<span className="font-medium">Active</span>
							</div>
						)}
					</div>

					<div className="flex items-center gap-3 shrink-0">
						{/* Assigned User */}
						{/* Requirement 9.4: Display assigned user */}
						{task.assignee && (
							<div className="flex items-center gap-1 text-xs text-muted-foreground">
								<UserIcon className="size-3" />
								<span
									className="truncate max-w-20"
									title={task.assignee.name}
								>
									{task.assignee.name}
								</span>
							</div>
						)}

						{/* Time Spent Indicator */}
						{/* Requirement 9.6: Show total time spent indicator */}
						{task.totalTimeSpent > 0 && <TimeSpentIndicator minutes={task.totalTimeSpent} />}
					</div>
				</div>
			</div>

			{/* Children */}
			{/* Requirement 9.3: Show or hide child tasks based on expand/collapse state */}
			{isExpanded && hasAnyChildren && (
				<div className="ml-2">
					{children.map((child) => (
						<TaskNode
							key={child.taskId}
							task={child}
							level={level + 1}
							onTaskSelect={onTaskSelect}
							selectedTaskId={selectedTaskId}
							highlightedTaskId={highlightedTaskId}
							expandedTasks={expandedTasks}
							onToggleExpand={onToggleExpand}
						/>
					))}
				</div>
			)}

			{/* Error State */}
			{isExpanded && childrenError && <div className="ml-8 p-2 text-xs text-destructive">Failed to load children: {childrenError.message}</div>}
		</div>
	);
};

/**
 * NestedTaskTree component for displaying hierarchical task structure
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */
export const NestedTaskTree: React.FC<NestedTaskTreeProps> = ({ projectId, onTaskSelect, selectedTaskId, highlightedTaskId, className }) => {
	const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());

	const { rootTasks, isLoadingRootTasks, rootTasksError, prefetchChildren } = useTaskTree(projectId);

	// Auto-scroll to highlighted task
	React.useEffect(() => {
		if (highlightedTaskId) {
			const element = document.getElementById(`task-${highlightedTaskId}`);
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}
	}, [highlightedTaskId]);

	const handleToggleExpand = useCallback(
		(taskId: number) => {
			setExpandedTasks((prev) => {
				const newSet = new Set(prev);
				if (newSet.has(taskId)) {
					newSet.delete(taskId);
				} else {
					newSet.add(taskId);
					// Prefetch children when expanding
					// Requirement 9.5: Support lazy loading of children for performance optimization
					prefetchChildren(taskId);
				}
				return newSet;
			});
		},
		[prefetchChildren]
	);

	const handleExpandAll = useCallback(() => {
		const allTaskIds = new Set<number>();

		const collectTaskIds = (tasks: Task[]) => {
			tasks.forEach((task) => {
				allTaskIds.add(task.taskId);
				if (task.children) {
					collectTaskIds(task.children);
				}
			});
		};

		collectTaskIds(rootTasks);
		setExpandedTasks(allTaskIds);

		// Prefetch all children
		allTaskIds.forEach((taskId) => {
			prefetchChildren(taskId);
		});
	}, [rootTasks, prefetchChildren]);

	const handleCollapseAll = useCallback(() => {
		setExpandedTasks(new Set());
	}, []);

	if (isLoadingRootTasks) {
		return (
			<div className={cn("space-y-2", className)}>
				{/* Loading skeleton */}
				{Array.from({ length: 3 }).map((_, index) => (
					<div
						key={index}
						className="flex items-center gap-2 p-2"
					>
						<div className="size-6 bg-muted animate-pulse rounded" />
						<div className="h-4 bg-muted animate-pulse rounded flex-1" />
						<div className="h-4 w-16 bg-muted animate-pulse rounded" />
					</div>
				))}
			</div>
		);
	}

	if (rootTasksError) {
		return (
			<div className={cn("p-4 text-center text-destructive", className)}>
				<p className="text-sm">Failed to load tasks</p>
				<p className="text-xs text-muted-foreground mt-1">{rootTasksError.message}</p>
			</div>
		);
	}

	if (rootTasks.length === 0) {
		return (
			<div className={cn("p-4 text-center text-muted-foreground", className)}>
				<p className="text-sm">No tasks found for this project</p>
				<p className="text-xs mt-1">Create a task to get started</p>
			</div>
		);
	}

	return (
		<div className={cn("space-y-1", className)}>
			{/* Tree Controls */}
			<div className="flex items-center justify-between p-2 border-b">
				<h3 className="text-sm font-medium">Tasks</h3>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleExpandAll}
						className="text-xs"
					>
						Expand All
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleCollapseAll}
						className="text-xs"
					>
						Collapse All
					</Button>
				</div>
			</div>

			{/* Task Tree */}
			{/* Requirement 9.1: Display tasks in hierarchical tree structure */}
			<div className="space-y-1">
				{rootTasks.map((task) => (
					<TaskNode
						key={task.taskId}
						task={task}
						level={0}
						onTaskSelect={onTaskSelect}
						selectedTaskId={selectedTaskId}
						highlightedTaskId={highlightedTaskId}
						expandedTasks={expandedTasks}
						onToggleExpand={handleToggleExpand}
					/>
				))}
			</div>
		</div>
	);
};

export default NestedTaskTree;
