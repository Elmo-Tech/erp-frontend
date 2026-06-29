"use client";

import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/shared/ui/button";
import { FilterSelect } from "@/shared/ui/filters/FilterSelect";
import { SearchInput } from "@/shared/ui/filters/SearchInput";
import { DatePicker } from "@/shared/ui/forms";
import type { ProjectTaskFilters } from "@/features/projects/api/execution.api";
import { type ProjectTaskFilterChange, type ProjectTaskFilterOptions, updateProjectTaskFilters } from "../model/project-tasks-filters";

interface ProjectTaskFiltersBarProps {
	filters: ProjectTaskFilters;
	options: ProjectTaskFilterOptions;
	onFiltersChange: Dispatch<SetStateAction<ProjectTaskFilters>>;
}

export function ProjectTaskFiltersBar({ filters, options, onFiltersChange }: ProjectTaskFiltersBarProps) {
	const updateFilters = (change: ProjectTaskFilterChange) => {
		onFiltersChange((current) => updateProjectTaskFilters(current, change));
	};

	return (
		<div className="mb-4 grid gap-3 border-y py-3 md:grid-cols-2 xl:grid-cols-7">
			<SearchInput
				value={filters.search}
				onChange={(search) => updateFilters({ type: "search", value: search })}
				placeholder="Search tasks"
				className="w-full"
				autoSearch={false}
			/>
			<FilterSelect
				value={filters.status}
				onChange={(status) => updateFilters({ type: "status", value: status })}
				options={options.statuses}
				allLabel="All statuses"
				className="w-full"
			/>
			<FilterSelect
				value={filters.milestoneId ? String(filters.milestoneId) : undefined}
				onChange={(milestoneId) => updateFilters({ type: "milestone", value: milestoneId })}
				options={options.milestones}
				allLabel="All milestones"
				className="w-full"
			/>
			<FilterSelect
				value={filters.assigneeId ? String(filters.assigneeId) : undefined}
				onChange={(assigneeId) => updateFilters({ type: "assignee", value: assigneeId })}
				options={options.assignees}
				allLabel="All assignees"
				className="w-full"
			/>
			<DatePicker
				value={filters.dueFrom ?? ""}
				onChange={(value) => updateFilters({ type: "dueFrom", value })}
				ariaLabel="Task due from"
			/>
			<DatePicker
				value={filters.dueTo ?? ""}
				onChange={(value) => updateFilters({ type: "dueTo", value })}
				ariaLabel="Task due to"
			/>
			<Button
				variant={filters.isInBacklog ? "default" : "outline"}
				size="sm"
				onClick={() => updateFilters({ type: "backlog" })}
			>
				Backlog
			</Button>
		</div>
	);
}
