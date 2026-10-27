/**
 * Task Filters Component
 * Search and filter controls for tasks
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, LayoutGrid, List } from "lucide-react";
import { TaskFilters as TaskFiltersType, TaskStatus, TaskPriority, TaskStatusLabels, TaskPriorityLabels } from "../../types/task";

interface TaskFiltersProps {
	filters: TaskFiltersType;
	searchTerm: string;
	view: "kanban" | "list";
	projects: Array<{ projectId: number; title: string }>;
	hasActiveFilters: boolean;
	onSearchChange: (value: string) => void;
	onFilterChange: (key: keyof TaskFiltersType, value: string | undefined) => void;
	onClearFilters: () => void;
	onViewChange: (view: "kanban" | "list") => void;
}

export function TaskFiltersBar({ filters, searchTerm, view, projects, hasActiveFilters, onSearchChange, onFilterChange, onClearFilters, onViewChange }: TaskFiltersProps) {
	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex flex-1 flex-wrap items-center gap-3">
						{/* Search */}
						<div className="relative w-full sm:w-64">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search tasks..."
								value={searchTerm}
								onChange={(e) => onSearchChange(e.target.value)}
								className="pl-9"
							/>
						</div>

						{/* Status Filter */}
						<Select
							value={filters.status || "all"}
							onValueChange={(v) => onFilterChange("status", v)}
						>
							<SelectTrigger className="w-36">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
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

						{/* Priority Filter */}
						<Select
							value={filters.priority || "all"}
							onValueChange={(v) => onFilterChange("priority", v)}
						>
							<SelectTrigger className="w-36">
								<SelectValue placeholder="Priority" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Priority</SelectItem>
								{Object.values(TaskPriority).map((priority) => (
									<SelectItem
										key={priority}
										value={priority}
									>
										{TaskPriorityLabels[priority]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Project Filter */}
						<Select
							value={filters.projectId?.toString() || "all"}
							onValueChange={(v) => onFilterChange("projectId", v)}
						>
							<SelectTrigger className="w-44">
								<SelectValue placeholder="Project" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Projects</SelectItem>
								{projects.map((project) => (
									<SelectItem
										key={project.projectId}
										value={project.projectId.toString()}
									>
										{project.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{hasActiveFilters && (
							<Button
								variant="ghost"
								size="sm"
								onClick={onClearFilters}
								className="text-muted-foreground"
							>
								Clear filters
							</Button>
						)}
					</div>

					{/* View Toggle */}
					<Tabs
						value={view}
						onValueChange={(v) => onViewChange(v as "kanban" | "list")}
					>
						<TabsList>
							<TabsTrigger
								value="kanban"
								aria-label="Board"
								className="gap-2"
							>
								<LayoutGrid className="h-4 w-4" />
								<span className="hidden sm:inline">Board</span>
							</TabsTrigger>
							<TabsTrigger
								value="list"
								aria-label="List"
								className="gap-2"
							>
								<List className="h-4 w-4" />
								<span className="hidden sm:inline">List</span>
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</CardContent>
		</Card>
	);
}
