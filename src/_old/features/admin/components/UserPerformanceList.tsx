/**
 * UserPerformanceList Component
 * Example usage of UserPerformanceCard component to display a list of user performance metrics.
 * This demonstrates how to integrate the UserPerformanceCard with the useUserPerformance hook.
 *
 * Requirements: 13.1-13.5
 */

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { AlertCircle, Users } from "lucide-react";
import { UserPerformanceCard } from "./UserPerformanceCard";
import { useUserPerformance } from "../hooks/useAdminStats";
import { usePermissions } from "../hooks/usePermissions";
import { UserPerformanceFilters } from "../types";

/**
 * Props for UserPerformanceList component
 */
interface UserPerformanceListProps {
	filters?: UserPerformanceFilters;
	className?: string;
	maxUsers?: number;
	showDetailLinks?: boolean;
}

/**
 * Loading skeleton for user performance cards
 */
const UserPerformanceCardSkeleton: React.FC = () => (
	<Card>
		<CardHeader className="pb-3">
			<div className="flex items-center space-x-3">
				<Skeleton className="h-10 w-10 rounded-full" />
				<div className="space-y-2">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-3 w-32" />
				</div>
			</div>
		</CardHeader>
		<CardContent className="space-y-4">
			<div className="space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-2 w-full" />
				<Skeleton className="h-3 w-full" />
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Skeleton className="h-3 w-16" />
					<Skeleton className="h-6 w-12" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-3 w-16" />
					<Skeleton className="h-6 w-12" />
				</div>
			</div>
		</CardContent>
	</Card>
);

/**
 * UserPerformanceList Component
 * Displays a list of user performance cards with loading and error states
 */
export const UserPerformanceList: React.FC<UserPerformanceListProps> = ({ filters, className, maxUsers = 12, showDetailLinks = true }) => {
	const { canViewAdminStats } = usePermissions();
	const { data, isLoading, error } = useUserPerformance(filters, canViewAdminStats);

	// Check permissions
	if (!canViewAdminStats) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>You don&apos;t have permission to view user performance data.</AlertDescription>
			</Alert>
		);
	}

	// Loading state
	if (isLoading) {
		return (
			<div className={className}>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Team Performance
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: 6 }).map((_, i) => (
								<UserPerformanceCardSkeleton key={i} />
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<Alert
				variant="destructive"
				className={className}
			>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>Failed to load user performance data: {error.message}</AlertDescription>
			</Alert>
		);
	}

	// No data state
	if (!data || !data.users || (data.users || []).length === 0) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Team Performance
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-32 text-muted-foreground">No user performance data available</div>
				</CardContent>
			</Card>
		);
	}

	// Limit the number of users displayed
	const displayUsers = data.users.slice(0, maxUsers);

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Users className="h-5 w-5" />
					Team Performance
				</CardTitle>
				{data.users.length > maxUsers && (
					<p className="text-sm text-muted-foreground">
						Showing {maxUsers} of {data.users.length} team members
					</p>
				)}
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{displayUsers.map((user) => (
						<UserPerformanceCard
							key={user.userId}
							user={user}
							showDetailLink={showDetailLinks}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
};

export default UserPerformanceList;
