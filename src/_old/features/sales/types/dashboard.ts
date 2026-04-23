/**
 * Sales Dashboard Types
 * Manager dashboard for pipeline health, team performance, and alerts
 */

// Alert severity levels
export type AlertSeverity = "error" | "warning" | "info";

// Alert types
export type AlertType = "proposal_expiring" | "quotation_expiring" | "activity_overdue" | "meeting_needs_minutes" | "stale_leads" | "hot_leads_attention";

// Entity types for alerts
export type AlertEntityType = "proposal" | "quotation" | "activity" | "meeting";

// Pipeline status counts
export interface StatusCount {
	count: number;
	totalValue?: number;
}

// Pipeline health data
export interface PipelineHealth {
	leads: {
		byStatus: Record<string, number>;
		total: number;
	};
	proposals: {
		byStatus: Record<string, number>;
		total: number;
	};
	quotations: {
		byStatus: Record<string, StatusCount>;
		total: number;
		totalPendingValue: number;
	};
	conversionRate: number;
	lossRate: number;
}

// Sales rep performance
export interface SalesRepPerformance {
	userId: number;
	name: string;
	leadsCreated: number;
	leadsWon: number;
	leadsLost: number;
	winRate: number;
}

// Tech lead performance
export interface TechLeadPerformance {
	userId: number;
	name: string;
	leadsEvaluated: number;
	successfulProposals: number;
	successRate: number;
}

// Team performance data
export interface TeamPerformance {
	salesReps: SalesRepPerformance[];
	techLeads: TechLeadPerformance[];
	period: {
		startDate: string;
		endDate: string;
	};
}

// Stage metrics for bottleneck analysis
export interface StageMetric {
	stage: string;
	status: string;
	count: number;
	type: "lead" | "proposal" | "quotation";
}

// Reason count for analysis
export interface ReasonCount {
	reason: string;
	count: number;
}

// Bottleneck analysis data
export interface BottleneckAnalysis {
	stageMetrics: StageMetric[];
	lossReasons: ReasonCount[];
	proposalRejections: ReasonCount[];
	quotationRejections: ReasonCount[];
	staleLeads: number;
}

// Individual alert item
export interface Alert {
	type: AlertType;
	severity: AlertSeverity;
	title: string;
	message: string;
	entityType?: AlertEntityType;
	entityId?: number;
	expiresAt?: string;
	scheduledAt?: string;
	count?: number;
}

// Alerts summary
export interface AlertsSummary {
	totalAlerts: number;
	critical: number;
	warnings: number;
}

// Alerts data
export interface AlertsData {
	expiringProposals: Alert[];
	expiringQuotations: Alert[];
	overdueActivities: Alert[];
	meetingsNeedingMinutes: Alert[];
	generalAlerts: Alert[];
	summary: AlertsSummary;
}

// Today's schedule
export interface TodaySchedule {
	activities: number;
	meetings: number;
	total: number;
}

// Dashboard summary (main response)
export interface DashboardSummary {
	pipeline: PipelineHealth;
	alerts: AlertsData;
	todaySchedule: TodaySchedule;
}

// API Response types
export interface DashboardSummaryResponse {
	success: boolean;
	message: string;
	data: DashboardSummary;
}

export interface PipelineHealthResponse {
	success: boolean;
	message: string;
	data: PipelineHealth;
}

export interface TeamPerformanceResponse {
	success: boolean;
	message: string;
	data: TeamPerformance;
}

export interface BottleneckAnalysisResponse {
	success: boolean;
	message: string;
	data: BottleneckAnalysis;
}

export interface AlertsResponse {
	success: boolean;
	message: string;
	data: AlertsData;
}

// Query params for team performance
export interface TeamPerformanceParams {
	startDate?: string;
	endDate?: string;
}
