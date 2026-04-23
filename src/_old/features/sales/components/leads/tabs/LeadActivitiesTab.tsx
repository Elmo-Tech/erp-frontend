"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Plus, Mail, Video, PhoneCall, StickyNote, FileText, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { LeadActivity } from "../../../types/lead";

const activityIcons = {
	call: PhoneCall,
	email: Mail,
	meeting: Video,
	note: StickyNote,
	status_change: FileText,
};

interface LeadActivitiesTabProps {
	activities: LeadActivity[] | undefined;
	isLoading: boolean;
	onAddActivity: () => void;
}

export function LeadActivitiesTab({ activities, isLoading, onAddActivity }: LeadActivitiesTabProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Activities</CardTitle>
					<CardDescription>Track all interactions with this lead</CardDescription>
				</div>
				<Button onClick={onAddActivity}>
					<Plus className="h-4 w-4 mr-2" />
					Add Activity
				</Button>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<Skeleton
								key={i}
								className="h-16 w-full"
							/>
						))}
					</div>
				) : activities && activities.length > 0 ? (
					<div className="space-y-3">
						{activities.map((activity) => {
							const Icon = activityIcons[activity.type] || MessageSquare;
							return (
								<div
									key={activity.activityId}
									className="flex gap-4 p-4 border rounded-lg"
								>
									<div className="shrink-0">
										<div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
											<Icon className="h-5 w-5 text-muted-foreground" />
										</div>
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between">
											<p className="font-medium">{activity.title}</p>
											<span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
										</div>
										{activity.description && <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>}
										{activity.outcome && (
											<Badge
												variant="outline"
												className="mt-2"
											>
												{activity.outcome}
											</Badge>
										)}
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<p className="text-center py-8 text-muted-foreground">No activities yet</p>
				)}
			</CardContent>
		</Card>
	);
}
