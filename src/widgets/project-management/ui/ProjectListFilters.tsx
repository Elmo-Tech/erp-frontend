"use client";

import { UserRound } from "lucide-react";
import { ProjectStatus, ProjectStatusLabels, type ProjectFilters, type ProjectPagination } from "@/entities/project/model/types";
import { FilterSelect } from "@/shared/ui/filters/FilterSelect";
import { SearchInput } from "@/shared/ui/filters/SearchInput";
import { Input } from "@/shared/ui/input";

interface FilterOption {
	value: string;
	label: string;
}

interface ProjectListFiltersProps {
	filters: ProjectFilters;
	clientOptions: FilterOption[];
	isClientOptionsLoading: boolean;
	pagination?: ProjectPagination;
	onChange: (filters: Partial<ProjectFilters>) => void;
}

const STATUS_FILTER_OPTIONS = Object.values(ProjectStatus).map((status) => ({
	value: status,
	label: ProjectStatusLabels[status],
}));

export function ProjectListFilters({ filters, clientOptions, isClientOptionsLoading, pagination, onChange }: ProjectListFiltersProps) {
	return (
		<div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
			<SearchInput
				value={filters.search}
				onChange={(search) => onChange({ search: search || undefined })}
				placeholder="Search projects"
				className="w-full xl:max-w-sm"
				autoSearch={false}
			/>

			<div className="flex flex-col gap-2 md:flex-row md:items-center">
				<FilterSelect
					value={filters.status}
					onChange={(status) => onChange({ status: status as ProjectStatus | undefined })}
					options={STATUS_FILTER_OPTIONS}
					placeholder="Status"
					allLabel="All statuses"
					className="w-full md:w-44"
				/>

				<FilterSelect
					value={filters.clientId ? String(filters.clientId) : undefined}
					onChange={(clientId) => onChange({ clientId: clientId ? Number(clientId) : undefined })}
					options={clientOptions}
					placeholder="Client"
					allLabel="All clients"
					icon={UserRound}
					className="w-full md:w-56"
					disabled={isClientOptionsLoading}
				/>

				<Input
					type="date"
					value={filters.deadlineFrom ?? ""}
					onChange={(event) => onChange({ deadlineFrom: event.target.value || undefined })}
					className="w-full md:w-40"
					aria-label="Deadline from"
				/>

				<Input
					type="date"
					value={filters.deadlineTo ?? ""}
					onChange={(event) => onChange({ deadlineTo: event.target.value || undefined })}
					className="w-full md:w-40"
					aria-label="Deadline to"
				/>

				<p className="text-xs tabular-nums text-muted-foreground md:min-w-24 md:text-right">{pagination ? `${pagination.total} projects` : "Loading projects"}</p>
			</div>
		</div>
	);
}
