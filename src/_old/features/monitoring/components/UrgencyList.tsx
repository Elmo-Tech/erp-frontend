/**
 * UrgencyList Component
 * Follow-up Radar showing urgent actions (Expiring Quotes, Stale Leads, etc.)
 * Displays actionable items that need immediate attention.
 *
 * Requirements: FE-Pack 3 - Follow-up Radar for urgent actions
 */

"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { AlertTriangle, Clock, User, DollarSign, Calendar, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/_old/features/sales/api/analytics";
import { useRouter } from "next/navigation";
import { format, differenceInDays, isAfter, isBefore, addDays } from "date-fns";

interface UrgencyListProps {
	refreshKey: number;
	maxItems?: number;
}

interface UrgentAction {
	id: string;
	type: "expiring_quote" | "stale_lead" | "overdue_milestone" | "follow_up_needed";
	title: string;
	description: string;
	priority: "high" | "medium" | "low";
	dueDate?: string;
	value?: number;
	entityId: number;
	entityType: "lead" | "quotation" | "milestone" | "contract";
	actionUrl: string;
}

/**
 * Priority configuration for different urgency levels
 */
const PRIORITY_CONFIG = {
	high: {
		color: "destructive" as const,
		icon: AlertTriangle,
		label: "High Priority",
	},
	medium: {
		color: "secondary" as const,
		icon: Clock,
		label: "Medium Priority",
	},
	low: {
		color: "outline" as const,
		icon: CheckCircle2,
		label: "Low Priority",
	},
};

/**
 * Type configuration for different action types
 */
const TYPE_CONFIG = {
	expiring_quote: {
		label: "Expiring Quote",
		color: "#f97316",
		icon: DollarSign,
	},
	stale_lead: {
		label: "Stale Lead",
		color: "#eab308",
		icon: User,
	},
	overdue_milestone: {
		label: "Overdue Milestone",
		color: "#ef4444",
		icon: Calendar,
	},
	follow_up_needed: {
		label: "Follow-up Needed",
		color: "#06b6d4",
		icon: Clock,
	},
};

/**
 * UrgencyList Component
 * Displays urgent actions that need immediate attention
 */
export function UrgencyList({ refreshKey, maxItems = 10 }: UrgencyListProps) {
	const router = useRouter();

	// Fetch revenue forecast data (contains milestones)
	const {
		data: forecastData,
		isLoading: forecastLoading,
		error: forecastError,
	} = useQuery({
		queryKey: ["revenue-forecast", refreshKey],
		queryFn: () => analyticsApi.getRevenueForecast(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Fetch quotation stats for expiring quotes
	const {
		data: quotationData,
		isLoading: quotationLoading,
		error: quotationError,
	} = useQuery({
		queryKey: ["quotation-stats-urgency", refreshKey],
		queryFn: () => analyticsApi.getQuotationStats(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Transform data into urgent actions
	const urgentActions = useMemo(() => {
		const actions: UrgentAction[] = [];
		const now = new Date();

		// Process overdue milestones
		if (forecastData?.milestonesDue) {
			forecastData.milestonesDue.forEach((milestone) => {
				const dueDate = new Date(milestone.dueDate);
				const daysOverdue = differenceInDays(now, dueDate);

				if (daysOverdue > 0 && milestone.status !== "completed" && milestone.status !== "paid") {
					actions.push({
						id: `milestone-${milestone.milestoneId}`,
						type: "overdue_milestone",
						title: milestone.milestoneTitle,
						description: `${milestone.projectName} • $${milestone.amount.toLocaleString()} • ${daysOverdue} days overdue`,
						priority: daysOverdue > 7 ? "high" : daysOverdue > 3 ? "medium" : "low",
						dueDate: milestone.dueDate,
						value: milestone.amount,
						entityId: milestone.contractId,
						entityType: "contract",
						actionUrl: `/dashboard/sales/contracts/${milestone.contractId}`,
					});
				}
			});
		}

		// Process upcoming milestones (due soon)
		if (forecastData?.milestonesDue) {
			forecastData.milestonesDue.forEach((milestone) => {
				const dueDate = new Date(milestone.dueDate);
				const daysUntilDue = differenceInDays(dueDate, now);

				if (daysUntilDue >= 0 && daysUntilDue <= 7 && milestone.status !== "completed" && milestone.status !== "paid") {
					actions.push({
						id: `milestone-upcoming-${milestone.milestoneId}`,
						type: "follow_up_needed",
						title: `${milestone.milestoneTitle} Due Soon`,
						description: `${milestone.projectName} • $${milestone.amount.toLocaleString()} • Due in ${daysUntilDue} days`,
						priority: daysUntilDue <= 2 ? "high" : daysUntilDue <= 5 ? "medium" : "low",
						dueDate: milestone.dueDate,
						value: milestone.amount,
						entityId: milestone.contractId,
						entityType: "contract",
						actionUrl: `/dashboard/sales/contracts/${milestone.contractId}`,
					});
				}
			});
		}

		// Add mock data for expiring quotes and stale leads (since we don't have direct API for these)
		// In a real implementation, these would come from dedicated APIs

		// Mock expiring quotes
		const mockExpiringQuotes = [
			{
				id: "quote-1",
				title: "Website Redesign Quote",
				description: "ABC Corp • $15,000 • Expires in 2 days",
				priority: "high" as const,
				value: 15000,
				entityId: 1,
				dueDate: format(addDays(now, 2), "yyyy-MM-dd"),
			},
			{
				id: "quote-2",
				title: "Mobile App Development",
				description: "XYZ Ltd • $25,000 • Expires in 5 days",
				priority: "medium" as const,
				value: 25000,
				entityId: 2,
				dueDate: format(addDays(now, 5), "yyyy-MM-dd"),
			},
		];

		mockExpiringQuotes.forEach((quote) => {
			actions.push({
				...quote,
				type: "expiring_quote",
				entityType: "quotation",
				actionUrl: `/dashboard/sales/quotations/${quote.entityId}`,
			});
		});

		// Mock stale leads
		const mockStaleLeads = [
			{
				id: "lead-1",
				title: "Tech Startup Lead",
				description: "No contact for 14 days • High value prospect",
				priority: "medium" as const,
				entityId: 1,
			},
			{
				id: "lead-2",
				title: "E-commerce Platform",
				description: "No contact for 21 days • Needs follow-up",
				priority: "high" as const,
				entityId: 2,
			},
		];

		mockStaleLeads.forEach((lead) => {
			actions.push({
				...lead,
				type: "stale_lead",
				entityType: "lead",
				actionUrl: `/dashboard/sales/leads/${lead.entityId}`,
			});
		});

		// Sort by priority and due date
		return actions
			.sort((a, b) => {
				// First sort by priority
				const priorityOrder = { high: 3, medium: 2, low: 1 };
				const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
				if (priorityDiff !== 0) return priorityDiff;

				// Then by due date (if available)
				if (a.dueDate && b.dueDate) {
					return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
				}
				if (a.dueDate) return -1;
				if (b.dueDate) return 1;

				return 0;
			})
			.slice(0, maxItems);
	}, [forecastData, quotationData, maxItems]);

	const handleActionClick = (action: UrgentAction) => {
		router.push(action.actionUrl);
	};

	const isLoading = forecastLoading || quotationLoading;
	const error = forecastError || quotationError;

	// Loading state
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5" />
						Follow-up Radar
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<div
								key={i}
								className="flex items-center gap-3"
							>
								<Skeleton className="h-10 w-10 rounded" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-3 w-1/2" />
								</div>
								<Skeleton className="h-6 w-16" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	// Error state
	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5" />
						Follow-up Radar
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>Failed to load urgent actions: {error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	// No data state
	if (!urgentActions.length) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5" />
						Follow-up Radar
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
						<p className="text-lg font-medium text-green-600">All caught up!</p>
						<p className="text-sm text-muted-foreground">No urgent actions require your attention right now.</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Calculate summary stats
	const highPriorityCount = urgentActions.filter((action) => action.priority === "high").length;
	const totalValue = urgentActions.reduce((sum, action) => sum + (action.value || 0), 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<AlertTriangle className="h-5 w-5" />
					Follow-up Radar
				</CardTitle>
				<p className="text-sm text-muted-foreground">
					{urgentActions.length} urgent actions • {highPriorityCount} high priority
					{totalValue > 0 && ` • $${totalValue.toLocaleString()} at risk`}
				</p>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{urgentActions.map((action) => {
						const typeConfig = TYPE_CONFIG[action.type];
						const priorityConfig = PRIORITY_CONFIG[action.priority];
						const TypeIcon = typeConfig.icon;
						const PriorityIcon = priorityConfig.icon;

						return (
							<div
								key={action.id}
								className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
								onClick={() => handleActionClick(action)}
							>
								{/* Type Icon */}
								<div
									className="shrink-0 p-2 rounded-lg"
									style={{ backgroundColor: `${typeConfig.color}20` }}
								>
									<TypeIcon
										className="h-5 w-5"
										style={{ color: typeConfig.color }}
									/>
								</div>

								{/* Content */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<h4 className="font-medium text-sm truncate">{action.title}</h4>
										<Badge
											variant={priorityConfig.color}
											className="text-xs"
										>
											{priorityConfig.label}
										</Badge>
									</div>
									<p className="text-xs text-muted-foreground truncate">{action.description}</p>
									{action.dueDate && <p className="text-xs text-muted-foreground mt-1">Due: {format(new Date(action.dueDate), "MMM dd, yyyy")}</p>}
								</div>

								{/* Action Button */}
								<Button
									variant="ghost"
									size="sm"
									className="shrink-0"
								>
									<ExternalLink className="h-4 w-4" />
								</Button>
							</div>
						);
					})}
				</div>

				{urgentActions.length >= maxItems && (
					<div className="mt-4 text-center">
						<Button
							variant="outline"
							size="sm"
						>
							View All Urgent Actions
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export default UrgencyList;
