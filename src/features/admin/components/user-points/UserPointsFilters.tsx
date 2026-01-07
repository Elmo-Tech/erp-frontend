"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { type UserPointsFilters } from "../../types/userPoints";

interface UserPointsFiltersProps {
	filters: UserPointsFilters;
	onFiltersChange: (filters: UserPointsFilters) => void;
}

export function UserPointsFilters({ filters, onFiltersChange }: UserPointsFiltersProps) {
	const handleSearchChange = (value: string) => {
		onFiltersChange({
			...filters,
			search: value || undefined,
		});
	};

	const handleStatusChange = (value: string) => {
		onFiltersChange({
			...filters,
			isActive: value === "all" ? undefined : value === "active",
		});
	};

	const handleSortByChange = (value: string) => {
		onFiltersChange({
			...filters,
			sortBy: value as UserPointsFilters["sortBy"],
		});
	};

	const handleSortOrderChange = (value: string) => {
		onFiltersChange({
			...filters,
			sortOrder: value as UserPointsFilters["sortOrder"],
		});
	};

	const clearFilters = () => {
		onFiltersChange({
			sortBy: "total_points",
			sortOrder: "desc",
		});
	};

	const hasActiveFilters = filters.search || filters.isActive !== undefined;

	return (
		<div className="flex flex-col gap-4 p-4 bg-card rounded-lg border">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium">Filters</h3>
				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						onClick={clearFilters}
						className="h-8 px-2 text-xs"
					>
						<X className="h-3 w-3 mr-1" />
						Clear
					</Button>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Search */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search employees..."
						value={filters.search || ""}
						onChange={(e) => handleSearchChange(e.target.value)}
						className="pl-9"
					/>
				</div>

				{/* Status Filter */}
				<Select
					value={filters.isActive === undefined ? "all" : filters.isActive ? "active" : "inactive"}
					onValueChange={handleStatusChange}
				>
					<SelectTrigger>
						<SelectValue placeholder="All Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="active">Active Only</SelectItem>
						<SelectItem value="inactive">Inactive Only</SelectItem>
					</SelectContent>
				</Select>

				{/* Sort By */}
				<Select
					value={filters.sortBy || "total_points"}
					onValueChange={handleSortByChange}
				>
					<SelectTrigger>
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="total_points">Total Points</SelectItem>
						<SelectItem value="name">Name</SelectItem>
						<SelectItem value="created_at">Join Date</SelectItem>
					</SelectContent>
				</Select>

				{/* Sort Order */}
				<Select
					value={filters.sortOrder || "desc"}
					onValueChange={handleSortOrderChange}
				>
					<SelectTrigger>
						<SelectValue placeholder="Order" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="desc">Highest First</SelectItem>
						<SelectItem value="asc">Lowest First</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
