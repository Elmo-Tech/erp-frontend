"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { AlertCircle, Filter, Clock, User, ArrowRight, FileText } from "lucide-react";
import { useProjectHistory } from "../hooks/useProjectHistory";
import { ProjectHistory } from "../types/projectHistory";
import { formatDistanceToNow } from "date-fns";

interface HistoryLogProps {
	projectId: number;
	className?: string;
}

// Critical fields that should be highlighted
const CRITICAL_FIELDS = ["deadline", "budget", "status"];

// Field display names
const FIELD_DISPLAY_NAMES: Record<string, string> = {
	title: "Title",
	description: "Description",
	status: "Status",
	budget: "Budget",
	deadline: "Deadline",
	ui_approved_at: "UI Approved",
	previous_status: "Previous Status",
};

/**
 * HistoryLog component for displaying project change history
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 */
export const HistoryLog: React.FC<HistoryLogProps> = ({ projectId, className = "" }) => {
	const [fieldFilter, setFieldFilter] = useState<string>("all");

	// Fetch history data with optional field filter
	const { data: historyResponse, isLoading, error } = useProjectHistory(projectId, fieldFilter === "all" ? undefined : fieldFilter);

	// Handle field filter change
	const handleFieldFilterChange = (value: string) => {
		setFieldFilter(value);
	};

	// Format timestamp in human-readable format
	const formatTimestamp = (dateString: string) => {
		const date = new Date(dateString);
		return {
			relative: formatDistanceToNow(date, { addSuffix: true }),
			absolute: date.toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			}),
		};
	};

	// Format field value for display
	const formatValue = (fieldName: string, value: string | null) => {
		if (value === null || value === undefined) {
			return <span className="text-muted-foreground italic">Not set</span>;
		}

		// Format specific field types
		switch (fieldName) {
			case "budget":
				const numValue = parseFloat(value);
				if (!isNaN(numValue)) {
					return new Intl.NumberFormat("en-US", {
						style: "currency",
						currency: "USD",
					}).format(numValue);
				}
				break;
			case "deadline":
			case "ui_approved_at":
				try {
					const date = new Date(value);
					return date.toLocaleDateString("en-US", {
						year: "numeric",
						month: "short",
						day: "numeric",
					});
				} catch {
					return value;
				}
			case "status":
			case "previous_status":
				return (
					<Badge
						variant="secondary"
						className="text-xs"
					>
						{value.replace("_", " ")}
					</Badge>
				);
			default:
				return value;
		}

		return value;
	};

	// Check if field is critical
	const isCriticalField = (fieldName: string) => {
		return CRITICAL_FIELDS.includes(fieldName);
	};

	// Loading state
	if (isLoading) {
		return (
			<div className={`space-y-4 ${className}`}>
				<div className="flex items-center justify-between">
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-10 w-40" />
				</div>
				<div className="space-y-3">
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton
							key={i}
							className="h-20 w-full"
						/>
					))}
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className={`flex items-center justify-center h-64 ${className}`}>
				<div className="text-center space-y-2">
					<AlertCircle className="h-8 w-8 text-destructive mx-auto" />
					<p className="text-sm text-muted-foreground">Failed to load project history</p>
					<p className="text-xs text-muted-foreground">{error.message}</p>
				</div>
			</div>
		);
	}

	const histories = historyResponse?.histories || [];
	const uniqueFields = Array.from(new Set(histories.map((history) => history.fieldName))).sort();

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h3 className="text-lg font-semibold">Project History</h3>
					<p className="text-sm text-muted-foreground">Track all changes made to this project</p>
				</div>

				{/* Field Filter */}
				<Select
					value={fieldFilter}
					onValueChange={handleFieldFilterChange}
				>
					<SelectTrigger className="w-40">
						<Filter className="h-4 w-4 mr-2" />
						<SelectValue placeholder="All Fields" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Fields</SelectItem>
						{uniqueFields.map((field) => (
							<SelectItem
								key={field}
								value={field}
							>
								{FIELD_DISPLAY_NAMES[field] || field}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* History List */}
			{histories.length === 0 ? (
				<Card>
					<CardContent className="flex items-center justify-center h-64">
						<div className="text-center space-y-2">
							<Clock className="h-8 w-8 text-muted-foreground mx-auto" />
							<p className="text-sm text-muted-foreground">{fieldFilter === "all" ? "No history entries yet" : `No changes to ${FIELD_DISPLAY_NAMES[fieldFilter] || fieldFilter} field`}</p>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{histories.map((history) => {
						const timestamp = formatTimestamp(history.createdAt);
						const isCritical = isCriticalField(history.fieldName);

						return (
							<Card
								key={history.historyId}
								className={`transition-colors ${isCritical ? "border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20" : ""}`}
							>
								<CardContent className="p-4">
									<div className="flex items-start justify-between">
										<div className="space-y-2 flex-1">
											{/* Header */}
											<div className="flex items-center gap-2">
												<Badge
													variant={isCritical ? "destructive" : "secondary"}
													className="text-xs"
												>
													{FIELD_DISPLAY_NAMES[history.fieldName] || history.fieldName}
												</Badge>

												{isCritical && (
													<Badge
														variant="outline"
														className="text-xs text-amber-600"
													>
														Critical Change
													</Badge>
												)}
											</div>

											{/* Change Details */}
											<div className="flex items-center gap-3 text-sm">
												<div className="flex items-center gap-2">
													<span className="text-muted-foreground">From:</span>
													<div className="font-mono">{formatValue(history.fieldName, history.oldValue)}</div>
												</div>

												<ArrowRight className="h-4 w-4 text-muted-foreground" />

												<div className="flex items-center gap-2">
													<span className="text-muted-foreground">To:</span>
													<div className="font-mono">{formatValue(history.fieldName, history.newValue)}</div>
												</div>
											</div>

											{/* Reason */}
											{history.reason && (
												<div className="flex items-start gap-2 text-sm">
													<FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
													<div>
														<span className="text-muted-foreground">Reason:</span>
														<p className="text-foreground mt-1">{history.reason}</p>
													</div>
												</div>
											)}
										</div>

										{/* Metadata */}
										<div className="text-right space-y-1 text-sm text-muted-foreground ml-4">
											<div className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												<span title={timestamp.absolute}>{timestamp.relative}</span>
											</div>

											{history.changedByUser && (
												<div className="flex items-center gap-1">
													<User className="h-3 w-3" />
													<span>{history.changedByUser.name}</span>
												</div>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
};
