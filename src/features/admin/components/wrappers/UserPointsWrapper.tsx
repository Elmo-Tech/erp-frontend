"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPointsFilters } from "../../types/userPoints";
import { UserPointsStats } from "../user-points/UserPointsStats";
import { UserPointsLeaderboard } from "../user-points/UserPointsLeaderboard";
import { UserPointsFilters as UserPointsFiltersComponent } from "../user-points/UserPointsFilters";
import { UserPointsTable } from "../user-points/UserPointsTable";

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

					<Card>
						<CardHeader>
							<CardTitle>Employee Points</CardTitle>
						</CardHeader>
						<CardContent>
							<UserPointsTable
								filters={filters}
								onFiltersChange={setFilters}
							/>
						</CardContent>
					</Card>
				</div>

				{/* Leaderboard Sidebar */}
				<div className="space-y-4">
					<UserPointsLeaderboard />
				</div>
			</div>
		</div>
	);
}
