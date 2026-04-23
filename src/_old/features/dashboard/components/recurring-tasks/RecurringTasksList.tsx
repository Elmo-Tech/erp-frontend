/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { RecurringTaskConfig, RecurringFrequency } from "../../types";
import { useRecurringTasks, useDeleteRecurringTask, useUpdateRecurringTask, useGenerateNextTask } from "../../hooks";
import { RecurringTaskCard } from "./RecurringTaskCard";
import { RecurringTaskFormDialog } from "./RecurringTaskFormDialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { AlertCircle } from "lucide-react";

export function RecurringTasksList() {
	const [search, setSearch] = useState("");
	const [frequencyFilter, setFrequencyFilter] = useState<RecurringFrequency | "all">("all");
	const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedConfig, setSelectedConfig] = useState<RecurringTaskConfig | null>(null);

	// Build filters
	const filters = {
		...(frequencyFilter !== "all" && { frequency: frequencyFilter }),
		...(activeFilter === "active" && { isActive: true }),
		...(activeFilter === "inactive" && { isActive: false }),
	};

	const { data, isLoading } = useRecurringTasks(filters);
	const deleteMutation = useDeleteRecurringTask();
	const updateMutation = useUpdateRecurringTask(selectedConfig?.id || 0);
	const generateMutation = useGenerateNextTask();

	const configs = data?.items || [];

	// Filter by search locally
	const filteredConfigs = configs.filter((config) => {
		if (!search) return true;
		const searchLower = search.toLowerCase();
		return config.templateTask?.title?.toLowerCase().includes(searchLower) || config.frequency.toLowerCase().includes(searchLower);
	});

	const handleEdit = (config: RecurringTaskConfig) => {
		setSelectedConfig(config);
		setIsFormOpen(true);
	};

	const handleDelete = async (config: RecurringTaskConfig) => {
		if (confirm("Are you sure you want to delete this recurring task configuration?")) {
			await deleteMutation.mutateAsync(config.id);
		}
	};

	const handleToggleActive = async (config: RecurringTaskConfig) => {
		await updateMutation.mutateAsync({
			isActive: !config.isActive,
		});
	};

	const handleGenerateNow = async (config: RecurringTaskConfig) => {
		if (confirm("Generate the next task now?")) {
			await generateMutation.mutateAsync(config.id);
		}
	};

	const handleCreateNew = () => {
		setSelectedConfig(null);
		setIsFormOpen(true);
	};

	const handleCloseForm = () => {
		setIsFormOpen(false);
		setSelectedConfig(null);
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Recurring Tasks</h2>
					<p className="text-muted-foreground">Manage automatic task generation schedules</p>
				</div>
				<Button onClick={handleCreateNew}>
					<Plus className="mr-2 h-4 w-4" />
					New Recurring Task
				</Button>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by task name or frequency..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9"
					/>
				</div>

				<Select
					value={frequencyFilter}
					onValueChange={(v) => setFrequencyFilter(v as any)}
				>
					<SelectTrigger className="w-full sm:w-[180px]">
						<SelectValue placeholder="Frequency" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Frequencies</SelectItem>
						<SelectItem value="daily">Daily</SelectItem>
						<SelectItem value="weekly">Weekly</SelectItem>
						<SelectItem value="biweekly">Bi-weekly</SelectItem>
						<SelectItem value="monthly">Monthly</SelectItem>
						<SelectItem value="quarterly">Quarterly</SelectItem>
						<SelectItem value="yearly">Yearly</SelectItem>
					</SelectContent>
				</Select>

				<Select
					value={activeFilter}
					onValueChange={(v) => setActiveFilter(v as any)}
				>
					<SelectTrigger className="w-full sm:w-[150px]">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="active">Active</SelectItem>
						<SelectItem value="inactive">Inactive</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Content */}
			{isLoading ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Skeleton
							key={i}
							className="h-[280px]"
						/>
					))}
				</div>
			) : filteredConfigs.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">No recurring tasks found</h3>
					<p className="text-muted-foreground mb-4">{search || frequencyFilter !== "all" || activeFilter !== "all" ? "Try adjusting your filters" : "Create your first recurring task to get started"}</p>
					{!search && frequencyFilter === "all" && activeFilter === "all" && (
						<Button onClick={handleCreateNew}>
							<Plus className="mr-2 h-4 w-4" />
							Create Recurring Task
						</Button>
					)}
				</div>
			) : (
				<>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filteredConfigs.map((config) => (
							<RecurringTaskCard
								key={config.id}
								config={config}
								onEdit={handleEdit}
								onDelete={handleDelete}
								onToggleActive={handleToggleActive}
								onGenerateNow={handleGenerateNow}
							/>
						))}
					</div>

					{/* Pagination Info */}
					{data?.pagination && (
						<div className="text-sm text-muted-foreground text-center">
							Showing {filteredConfigs.length} of {data.pagination.total} configurations
						</div>
					)}
				</>
			)}

			{/* Form Dialog */}
			<RecurringTaskFormDialog
				open={isFormOpen}
				onOpenChange={handleCloseForm}
				config={selectedConfig}
			/>
		</div>
	);
}
