"use client";

import { Award, Trophy } from "lucide-react";
import type { LeaderboardUser } from "@/entities/performance/model/types";
import { usePointsLeaderboard } from "@/features/performance/model/use-performance-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export function UserPointsLeaderboardWidget() {
	const leaderboardQuery = usePointsLeaderboard(50);
	const users = leaderboardQuery.data ?? [];

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">User points</h1>
				<p className="text-sm text-muted-foreground">Leaderboard ranked by current contribution points.</p>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-sm">
						<Trophy className="size-4" />
						Leaderboard
					</CardTitle>
				</CardHeader>
				<CardContent>
					{leaderboardQuery.isLoading ? (
						<div className="space-y-2">
							<Skeleton className="h-11 w-full" />
							<Skeleton className="h-11 w-full" />
							<Skeleton className="h-11 w-full" />
						</div>
					) : (
						<div className="divide-y rounded-md border">
							{users.map((user, index) => <LeaderboardRow key={user.userId} user={user} rank={index + 1} />)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function LeaderboardRow({ user, rank }: { user: LeaderboardUser; rank: number }) {
	return (
		<div className="grid grid-cols-[44px_1fr_auto] items-center gap-3 px-3 py-2 text-sm">
			<div className="flex size-7 items-center justify-center rounded-md bg-muted text-xs font-medium tabular-nums">{rank}</div>
			<div className="min-w-0">
				<p className="truncate font-medium">{user.name}</p>
				<p className="text-xs text-muted-foreground">Rank #{user.rank}</p>
			</div>
			<div className="flex items-center gap-2 font-semibold tabular-nums">
				<Award className="size-4 text-muted-foreground" />
			{user.totalPoints.toLocaleString()}
			</div>
		</div>
	);
}
