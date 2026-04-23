// Lead types
export type {
	Lead,
	LeadActivity,
	LeadMeeting,
	CreateLeadPayload,
	UpdateLeadPayload,
	CreateActivityPayload,
	CreateMeetingPayload,
	CompleteActivityPayload,
	CancelActivityPayload,
	CompleteMeetingPayload,
	CancelMeetingPayload,
	ScheduleResponse,
	LeadListResponse,
	LeadKanbanResponse,
	LeadFilters,
} from "./lead";
export {
	LeadStatus,
	LeadSource,
	LeadPriority,
	ReferenceType,
	IndustrySector,
	IndustrySectorLabels,
	IndustrySectorIcons,
	LeadTemperature,
	LeadTemperatureLabels,
	LeadTemperatureColors,
	LeadTemperatureIcons,
	ActivityStatus,
	ActivityStatusLabels,
	ActivityStatusColors,
	MeetingStatus,
	MeetingStatusLabels,
	MeetingStatusColors,
} from "./lead";

// Audit Trail types
export type { AuditHistory, AuditHistoryUser, AuditHistoryStats, AuditHistoryListResponse, AuditHistoryFilters } from "./audit";
export { AuditActionType, AuditActionTypeLabels, AuditActionTypeColors, AuditActionTypeIcons } from "./audit";

// Proposal types (Technical Proposals)
export type { Proposal, CreateProposalPayload, UpdateProposalPayload, FastTrackProposalPayload, RejectProposalPayload, ProposalListResponse, ProposalFilters } from "./proposal";
export { ProposalStatus, ProposalStatusLabels, ProposalStatusColors } from "./proposal";

// Quotation types (Price Quotes)
export type { Quotation, QuotationItem, Estimations, PricingBreakdown, CreateQuotationPayload, UpdateQuotationPayload, UpdateStatusPayload, CalculatePricingPayload, QuotationListResponse, QuotationFilters } from "./quotation";
export { QuotationStatus, CommissionType, ResourceType, RejectionReason } from "./quotation";

// Contract types
export type { Contract, ContractMilestone, ContractParty, CreateContractPayload, UpdateContractPayload, SignContractPayload, ContractListResponse, ContractFilters } from "./contract";
export { ContractStatus, MilestoneStatus, MilestoneTriggerType } from "./contract";

// Template types
export type { ProposalTemplate, ContractTemplate, TemplatePlaceholder, CreateTemplatePayload, UpdateTemplatePayload, GenerateFromTemplatePayload } from "./template";
export { TemplateType, ContractTemplateType } from "./template";

// Time Entry types
export type { TimeEntry, StartTimerPayload, ActiveTimerResponse, TimeEntryListResponse, TimeEntryFilters, ActiveTimer } from "./timeEntry";
export { TrackableType } from "./timeEntry";

// Sales Dashboard types
export type {
	AlertSeverity,
	AlertType,
	AlertEntityType,
	StatusCount,
	PipelineHealth,
	SalesRepPerformance,
	TechLeadPerformance,
	TeamPerformance,
	StageMetric,
	ReasonCount,
	BottleneckAnalysis,
	Alert,
	AlertsSummary,
	AlertsData,
	TodaySchedule,
	DashboardSummary,
	DashboardSummaryResponse,
	PipelineHealthResponse,
	TeamPerformanceResponse,
	BottleneckAnalysisResponse,
	AlertsResponse,
	TeamPerformanceParams,
} from "./dashboard";

// Search & Export types
export type { SearchEntityType, SearchResult, SearchResults, GlobalSearchResponse, SearchParams, ExportFilters, ExportData, ExportResponse, SalesReportData, SalesReportResponse, ExportFormat } from "./search";
