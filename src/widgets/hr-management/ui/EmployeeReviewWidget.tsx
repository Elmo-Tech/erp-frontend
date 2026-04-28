"use client";

import { useMemo, useState } from "react";
import { ClipboardList, Target, TrendingUp, UserRound } from "lucide-react";
import { useEmployeeReview } from "@/features/performance/model/use-performance-actions";
import { useUsers } from "@/features/users/model/use-user-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";

export function EmployeeReviewWidget() {
	const usersQuery = useUsers({ perPage: 100, isActive: true });
	const users = usersQuery.data?.users ?? [];
	const [selectedUserId, setSelectedUserId] = useState<string>("");
	const activeUserId = Number(selectedUserId || users[0]?.userId || 0);
	const reviewQuery = useEmployeeReview(activeUserId || undefined);
	const review = reviewQuery.data;

	const score = useMemo(() => {
		if (!review) return "0.0";
		const parts = [
			Number(review.overview?.productivityScore ?? 0),
			Number.parseFloat(String(review.overview?.taskCompletionRate ?? 0)),
			Number.parseFloat(String(review.overview?.averageBounceRate ?? 0)),
		].filter((value) => Number.isFinite(value));
		return parts.length ? (parts.reduce((total, item) => total + item, 0) / parts.length).toFixed(1) : "0.0";
	}, [review]);

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Employee review</h1>
					<p className="text-sm text-muted-foreground">Compact performance, attendance, and task health view.</p>
				</div>
				<Select value={selectedUserId || String(users[0]?.userId ?? "")} onValueChange={setSelectedUserId} disabled={usersQuery.isLoading || !users.length}>
					<SelectTrigger className="h-9 w-full sm:w-72">
						<SelectValue placeholder="Select employee" />
					</SelectTrigger>
					<SelectContent>
						{users.map((user) => (
							<SelectItem key={user.userId} value={String(user.userId)}>
								{user.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="grid gap-3 md:grid-cols-4">
				<Metric title="Review score" value={score} icon={TrendingUp} />
				<Metric title="Tasks" value={review?.tasks?.completed ?? 0} icon={ClipboardList} />
				<Metric title="Attendance days" value={review?.overview?.attendanceDays ?? 0} icon={Target} />
				<Metric title="Points" value={review?.employee?.totalPoints ?? 0} icon={UserRound} />
			</div>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm">Signals</CardTitle>
				</CardHeader>
				<CardContent>
					{reviewQuery.isLoading ? (
						<div className="space-y-2">
							<Skeleton className="h-9 w-full" />
							<Skeleton className="h-9 w-full" />
							<Skeleton className="h-9 w-full" />
						</div>
					) : (
						<div className="divide-y rounded-md border">
							<Signal label="Tracked hours" value={review?.overview?.totalTrackedHours ?? 0} />
							<Signal label="Task completion" value={review?.overview?.taskCompletionRate ?? "0%"} />
							<Signal label="Task bounces" value={review?.tasks?.totalBounces ?? 0} />
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function Metric({ title, value, icon: Icon }: { title: string; value: string | number; icon: typeof TrendingUp }) {
	return (
		<Card>
			<CardContent className="flex items-center justify-between p-4">
				<div className="min-w-0">
					<p className="text-xs text-muted-foreground">{title}</p>
					<p className="truncate text-xl font-semibold tabular-nums">{value}</p>
				</div>
				<Icon className="size-4 shrink-0 text-muted-foreground" />
			</CardContent>
		</Card>
	);
}

function Signal({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="flex items-center justify-between px-3 py-2 text-sm">
			<span className="text-muted-foreground">{label}</span>
			<span className="font-medium tabular-nums">{value}</span>
		</div>
	);
}
