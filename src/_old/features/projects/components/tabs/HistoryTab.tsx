"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Skeleton } from "@/shared/ui/skeleton";
import { useProjectHistory } from "../../hooks/useProjectHistory";
import { History, ArrowRight, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface HistoryTabProps {
	projectId: number;
}

export function HistoryTab({ projectId }: HistoryTabProps) {
	const { data, isLoading, error } = useProjectHistory(projectId);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Project History</CardTitle>
					<CardDescription>Audit trail of changes</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="flex gap-4"
						>
							<Skeleton className="h-10 w-10 rounded-full" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-48" />
								<Skeleton className="h-3 w-32" />
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-12">
					<AlertCircle className="h-8 w-8 text-destructive mb-2" />
					<p className="text-muted-foreground">Failed to load history</p>
				</CardContent>
			</Card>
		);
	}

	const histories = data?.histories || [];

	const getFieldLabel = (fieldName: string) => {
		const labels: Record<string, string> = {
			status: "Status",
			budget: "Budget",
			deadline: "Deadline",
			title: "Title",
			description: "Description",
			ui_approved_at: "UI Approval",
		};
		return labels[fieldName] || fieldName;
	};

	const formatValue = (fieldName: string, value: string | null) => {
		if (!value) return "Not set";
		if (fieldName === "budget") return `$${Number(value).toLocaleString()}`;
		if (fieldName === "deadline" || fieldName === "ui_approved_at") {
			return format(new Date(value), "MMM d, yyyy");
		}
		if (fieldName === "status") {
			return value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
		}
		return value;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<History className="h-5 w-5" />
					Project History
				</CardTitle>
				<CardDescription>
					{histories.length} {histories.length === 1 ? "change" : "changes"} recorded
				</CardDescription>
			</CardHeader>
			<CardContent>
				{histories.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<History className="h-12 w-12 text-muted-foreground/50 mb-4" />
						<p className="text-muted-foreground">No changes recorded yet</p>
						<p className="text-sm text-muted-foreground">Changes to project details will appear here</p>
					</div>
				) : (
					<div className="relative">
						{/* Timeline line */}
						<div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

						<div className="space-y-6">
							{histories.map((history) => (
								<div
									key={history.historyId}
									className="relative flex gap-4"
								>
									{/* Timeline dot */}
									<div className="relative z-10">
										<Avatar className="h-10 w-10 border-2 border-background">
											<AvatarFallback className="text-xs">{history.changedByUser?.name?.charAt(0) || "?"}</AvatarFallback>
										</Avatar>
									</div>

									{/* Content */}
									<div className="flex-1 pb-6">
										<div className="flex items-center gap-2 mb-1">
											<span className="font-medium">{history.changedByUser?.name || "System"}</span>
											<span className="text-muted-foreground">changed</span>
											<Badge variant="outline">{getFieldLabel(history.fieldName)}</Badge>
										</div>

										<div className="flex items-center gap-2 text-sm mb-2">
											<span className="text-muted-foreground line-through">{formatValue(history.fieldName, history.oldValue)}</span>
											<ArrowRight className="h-3 w-3 text-muted-foreground" />
											<span className="font-medium">{formatValue(history.fieldName, history.newValue)}</span>
										</div>

										{history.reason && <p className="text-sm text-muted-foreground bg-muted p-2 rounded">Reason: {history.reason}</p>}

										<p className="text-xs text-muted-foreground mt-2">{format(new Date(history.createdAt), "MMM d, yyyy 'at' HH:mm")}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
