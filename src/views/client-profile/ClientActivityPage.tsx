"use client";

import { Activity, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useGetClientActivities } from "@/entities/client/api/client.api";
import { useClientProfile } from "@/widgets/client-management/model/client-profile.context";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/ui/data-display/EmptyState";
import { Skeleton } from "@/shared/ui/skeleton";

export default function ClientActivityPage() {
	const client = useClientProfile();
	const activitiesQuery = useGetClientActivities(client.clientId);
	const activities = activitiesQuery.data ?? [];

	return (
		<section className="rounded-md border bg-background">
			<div className="border-b px-5 py-4">
				<h2 className="text-base font-semibold tracking-tight">Activity Log</h2>
			</div>
			<div className="p-5">
				{activitiesQuery.isLoading ? (
					<div className="flex flex-col gap-4">
						<Skeleton className="h-16 rounded-md" />
						<Skeleton className="h-16 rounded-md" />
					</div>
				) : activitiesQuery.isError ? (
					<div className="py-8 text-sm text-muted-foreground">Activity could not be loaded.</div>
				) : activities.length === 0 ? (
					<Empty className="min-h-64">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Activity />
							</EmptyMedia>
							<EmptyTitle>No activity yet</EmptyTitle>
							<EmptyDescription>Project and meeting events will appear here as the relationship develops.</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<div className="flex flex-col">
						{activities.map((activity, index) => (
							<div
								key={activity.activityId}
								className="relative flex gap-4"
							>
								<div className="flex flex-col items-center">
									<div className="flex size-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
										<CheckCircle2 className="size-4" />
									</div>
									{index < activities.length - 1 ? <div className="mt-2 h-12 w-px bg-border" /> : null}
								</div>
								<div className="min-w-0 pb-8">
									<div className="flex flex-wrap items-center gap-2">
										<h3 className="text-sm font-medium">{activity.action}</h3>
										<span className="text-xs text-muted-foreground">{formatRelativeTime(activity.createdAt)}</span>
									</div>
									<p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}

function formatRelativeTime(value: string | null | undefined) {
	if (!value) {
		return "Just now";
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "Just now";
	}

	const diffInDays = Math.abs(Date.now() - date.getTime()) / 86_400_000;

	if (diffInDays < 7) {
		return formatDistanceToNow(date, { addSuffix: true });
	}

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}
