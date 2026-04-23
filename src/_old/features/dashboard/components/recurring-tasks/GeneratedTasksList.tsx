"use client";

import { format } from "date-fns";
import { Calendar, CheckCircle2, Clock, Circle } from "lucide-react";
import { RecurringTaskConfig } from "../../types";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ScrollArea } from "@/shared/ui/scroll-area";

interface GeneratedTasksListProps {
	config: RecurringTaskConfig;
}

export function GeneratedTasksList({ config }: GeneratedTasksListProps) {
	const generatedTasks = config.generatedTasks || [];

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), "MMM dd, yyyy HH:mm");
		} catch {
			return dateString;
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status.toLowerCase()) {
			case "done":
			case "completed":
				return <CheckCircle2 className="h-4 w-4 text-green-500" />;
			case "in_progress":
			case "in progress":
				return <Clock className="h-4 w-4 text-blue-500" />;
			default:
				return <Circle className="h-4 w-4 text-gray-400" />;
		}
	};

	const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
		switch (status.toLowerCase()) {
			case "done":
			case "completed":
				return "default";
			case "in_progress":
			case "in progress":
				return "secondary";
			default:
				return "outline";
		}
	};

	if (generatedTasks.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Generated Tasks</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<Calendar className="h-12 w-12 text-muted-foreground mb-3" />
						<p className="text-muted-foreground">No tasks have been generated yet</p>
						<p className="text-sm text-muted-foreground mt-1">Tasks will be created automatically based on the schedule</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Generated Tasks ({generatedTasks.length})</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-[400px] pr-4">
					<div className="space-y-3">
						{generatedTasks.map((task) => (
							<div
								key={task.id}
								className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
							>
								<div className="mt-0.5">{getStatusIcon(task.status)}</div>

								<div className="flex-1 min-w-0">
									<div className="flex items-start justify-between gap-2 mb-1">
										<h4 className="font-medium truncate">{task.title}</h4>
										<Badge
											variant={getStatusVariant(task.status)}
											className="shrink-0"
										>
											{task.status}
										</Badge>
									</div>

									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Calendar className="h-3 w-3" />
										<span>Created: {formatDate(task.createdAt)}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</ScrollArea>

				{/* Summary */}
				<div className="mt-4 pt-4 border-t">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Total Generated:</span>
						<span className="font-semibold">{config.occurrenceCount}</span>
					</div>
					{config.maxOccurrences && (
						<div className="flex items-center justify-between text-sm mt-1">
							<span className="text-muted-foreground">Remaining:</span>
							<span className="font-semibold">{config.maxOccurrences - config.occurrenceCount}</span>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
