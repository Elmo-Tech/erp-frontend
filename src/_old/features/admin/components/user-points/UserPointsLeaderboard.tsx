"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";
import { useLeaderboard } from "../../hooks/useUserPoints";

export function UserPointsLeaderboard() {
	const { data: leaderboard, isLoading } = useLeaderboard(10);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Points Leaderboard</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<div
								key={i}
								className="flex items-center gap-3"
							>
								<div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
								<div className="flex-1">
									<div className="h-4 bg-muted animate-pulse rounded mb-1" />
									<div className="h-3 bg-muted animate-pulse rounded w-20" />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!leaderboard || leaderboard.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Points Leaderboard</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8 text-muted-foreground">No data available</div>
				</CardContent>
			</Card>
		);
	}

	const getRankIcon = (rank: number) => {
		switch (rank) {
			case 1:
				return <Trophy className="h-5 w-5 text-yellow-500" />;
			case 2:
				return <Medal className="h-5 w-5 text-gray-400" />;
			case 3:
				return <Award className="h-5 w-5 text-amber-600" />;
			default:
				return <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">{rank}</div>;
		}
	};

	const getRankBadgeVariant = (rank: number) => {
		switch (rank) {
			case 1:
				return "default";
			case 2:
				return "secondary";
			case 3:
				return "outline";
			default:
				return "outline";
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Points Leaderboard</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{leaderboard.map((user, index) => {
						const rank = index + 1;
						return (
							<div
								key={user.userId}
								className={`flex items-center gap-3 p-3 rounded-lg ${rank <= 3 ? "bg-muted/50" : ""}`}
							>
								<div className="shrink-0">{getRankIcon(rank)}</div>

								<Avatar className="h-8 w-8">
									<AvatarImage
										src={user.avatar}
										alt={user.name}
									/>
									<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
								</Avatar>

								<div className="flex-1 min-w-0">
									<div className="font-medium truncate">{user.name}</div>
									<div className="text-sm text-muted-foreground">Rank #{rank}</div>
								</div>

								<Badge
									variant={getRankBadgeVariant(rank)}
									className="text-sm"
								>
									{user.totalPoints} pts
								</Badge>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
