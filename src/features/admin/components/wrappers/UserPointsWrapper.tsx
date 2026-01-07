"use client";

import { useState } from "react";
import { UserPointsFilters } from "../../types/userPoints";
import { UserPointsStats } from "./UserPointsStats";
import { UserPointsLeaderboard } from "./UserPointsLeaderboard";
import { UserPointsFilters as UserPointsFiltersComponent } from "./UserPointsFilters";
import { UserPointsTable } from "./tables/UserPointsTable";

export function UserPointsWrapper() {
	const [filters, setFilters] = useState<UserPointsFilters>({
		sortBy: "total_points",
		sortOrder: "desc",
	});

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-3xl font-bold">User Points Management</h1>
				<p className="text-muted-foreground">Manage employee points, track performance, and view leaderboards</p>
			</div>

			{/* Statistics */}
			<UserPointsStats />

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Points Management Table */}
				<div className="lg:col-span-2 space-y-4">
					<UserPointsFiltersComponent
						filters={filters}
						onFiltersChange={setFilters}
					/>

					<UserPointsTable
						filters={filters}
						onFiltersChange={setFilters}
					/>
				</div>

				{/* Leaderboard Sidebar */}
				<div className="space-y-4">
					<UserPointsLeaderboard />
				</div>
			</div>
		</div>
	);
}
