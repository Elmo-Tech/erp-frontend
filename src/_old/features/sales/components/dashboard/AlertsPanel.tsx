"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { useAlerts } from "../../hooks/useSalesDashboard";
import { AlertTriangle, AlertCircle, Info, Clock, FileText, Receipt, MessageSquare, ChevronRight, Loader2 } from "lucide-react";
import type { Alert, AlertSeverity, AlertType } from "../../types/dashboard";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const severityConfig: Record<AlertSeverity, { icon: React.ReactNode; className: string }> = {
	error: {
		icon: <AlertCircle className="h-4 w-4" />,
		className: "bg-red-50 border-red-200 text-red-800",
	},
	warning: {
		icon: <AlertTriangle className="h-4 w-4" />,
		className: "bg-yellow-50 border-yellow-200 text-yellow-800",
	},
	info: {
		icon: <Info className="h-4 w-4" />,
		className: "bg-blue-50 border-blue-200 text-blue-800",
	},
};

const typeIcons: Record<AlertType, React.ReactNode> = {
	proposal_expiring: <FileText className="h-4 w-4" />,
	quotation_expiring: <Receipt className="h-4 w-4" />,
	activity_overdue: <Clock className="h-4 w-4" />,
	meeting_needs_minutes: <MessageSquare className="h-4 w-4" />,
	stale_leads: <AlertTriangle className="h-4 w-4" />,
	hot_leads_attention: <AlertCircle className="h-4 w-4" />,
};

function getAlertLink(alert: Alert): string | null {
	if (!alert.entityType || !alert.entityId) return null;

	const routes: Record<string, string> = {
		proposal: `/proposals/${alert.entityId}`,
		quotation: `/quotations/${alert.entityId}`,
		activity: `/leads?activity=${alert.entityId}`,
		meeting: `/leads?meeting=${alert.entityId}`,
	};

	return routes[alert.entityType] || null;
}

interface AlertItemProps {
	alert: Alert;
}

function AlertItem({ alert }: AlertItemProps) {
	const config = severityConfig[alert.severity];
	const link = getAlertLink(alert);

	const content = (
		<div className={`p-3 rounded-lg border ${config.className} flex items-start gap-3`}>
			<div className="mt-0.5">{typeIcons[alert.type] || config.icon}</div>
			<div className="flex-1 min-w-0">
				<p className="font-medium text-sm">{alert.title}</p>
				<p className="text-xs mt-0.5 opacity-80 line-clamp-2">{alert.message}</p>
				{alert.expiresAt && <p className="text-xs mt-1 opacity-60">Expires {formatDistanceToNow(new Date(alert.expiresAt), { addSuffix: true })}</p>}
			</div>
			{link && <ChevronRight className="h-4 w-4 opacity-50 shrink-0" />}
		</div>
	);

	if (link) {
		return (
			<Link
				href={link}
				className="block hover:opacity-80 transition-opacity"
			>
				{content}
			</Link>
		);
	}

	return content;
}

export function AlertsPanel() {
	const { data, isLoading, error } = useAlerts();

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5" />
						Alerts
					</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-center h-48">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				</CardContent>
			</Card>
		);
	}

	if (error || !data?.data) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5" />
						Alerts
					</CardTitle>
				</CardHeader>
				<CardContent className="text-center text-muted-foreground py-8">Failed to load alerts</CardContent>
			</Card>
		);
	}

	const alerts = data.data;
	const allAlerts: Alert[] = [...alerts.expiringProposals, ...alerts.expiringQuotations, ...alerts.overdueActivities, ...alerts.meetingsNeedingMinutes, ...alerts.generalAlerts];

	// Sort by severity (error first, then warning, then info)
	const severityOrder: Record<AlertSeverity, number> = { error: 0, warning: 1, info: 2 };
	allAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="flex items-center gap-2">
					<AlertTriangle className="h-5 w-5" />
					Alerts
				</CardTitle>
				<div className="flex items-center gap-2">
					{alerts.summary.critical > 0 && <Badge variant="destructive">{alerts.summary.critical} Critical</Badge>}
					{alerts.summary.warnings > 0 && (
						<Badge
							variant="outline"
							className="border-yellow-500 text-yellow-700"
						>
							{alerts.summary.warnings} Warnings
						</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{allAlerts.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
						<p>No alerts at this time</p>
					</div>
				) : (
					<ScrollArea className="h-[400px] pr-4">
						<div className="space-y-2">
							{allAlerts.map((alert, index) => (
								<AlertItem
									key={`${alert.type}-${alert.entityId || index}`}
									alert={alert}
								/>
							))}
						</div>
					</ScrollArea>
				)}
			</CardContent>
		</Card>
	);
}
