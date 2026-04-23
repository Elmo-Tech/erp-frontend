export enum AuditActionType {
	STATUS_CHANGE = "status_change",
	DATA_EDIT = "data_edit",
	UPLOAD = "upload",
	ACTIVITY_LOG = "activity_log",
	CREATED = "created",
	DELETED = "deleted",
	CONVERTED = "converted",
	SENT = "sent",
	APPROVED = "approved",
	REJECTED = "rejected",
}

export const AuditActionTypeLabels: Record<AuditActionType, string> = {
	[AuditActionType.STATUS_CHANGE]: "Status Change",
	[AuditActionType.DATA_EDIT]: "Data Edit",
	[AuditActionType.UPLOAD]: "File Upload",
	[AuditActionType.ACTIVITY_LOG]: "Activity Log",
	[AuditActionType.CREATED]: "Created",
	[AuditActionType.DELETED]: "Deleted",
	[AuditActionType.CONVERTED]: "Converted",
	[AuditActionType.SENT]: "Sent",
	[AuditActionType.APPROVED]: "Approved",
	[AuditActionType.REJECTED]: "Rejected",
};

export const AuditActionTypeColors: Record<AuditActionType, string> = {
	[AuditActionType.STATUS_CHANGE]: "blue",
	[AuditActionType.DATA_EDIT]: "yellow",
	[AuditActionType.UPLOAD]: "purple",
	[AuditActionType.ACTIVITY_LOG]: "gray",
	[AuditActionType.CREATED]: "green",
	[AuditActionType.DELETED]: "red",
	[AuditActionType.CONVERTED]: "indigo",
	[AuditActionType.SENT]: "cyan",
	[AuditActionType.APPROVED]: "emerald",
	[AuditActionType.REJECTED]: "rose",
};

export const AuditActionTypeIcons: Record<AuditActionType, string> = {
	[AuditActionType.STATUS_CHANGE]: "refresh-cw",
	[AuditActionType.DATA_EDIT]: "edit",
	[AuditActionType.UPLOAD]: "upload",
	[AuditActionType.ACTIVITY_LOG]: "activity",
	[AuditActionType.CREATED]: "plus-circle",
	[AuditActionType.DELETED]: "trash-2",
	[AuditActionType.CONVERTED]: "git-merge",
	[AuditActionType.SENT]: "send",
	[AuditActionType.APPROVED]: "check-circle",
	[AuditActionType.REJECTED]: "x-circle",
};

export interface AuditHistoryUser {
	userId: number;
	name: string;
	email: string;
	avatar?: string;
}

export interface AuditHistory {
	historyId: number;
	auditableType: "Lead" | "Proposal" | "Quotation";
	auditableId: number;
	actionType: AuditActionType;
	actionTypeLabel: string;
	actionTypeIcon: string;
	actionTypeColor: string;
	fieldName: string;
	fieldLabel: string;
	oldValue: string;
	newValue: string;
	description: string;
	reason: string;
	metadata: Record<string, unknown>;
	changedBy: number;
	changedByUser?: AuditHistoryUser;
	ipAddress: string;
	userAgent: string;
	createdAt: string;
	createdAtHuman: string;
}

export interface AuditHistoryStats {
	totalChanges: number;
	statusChanges: number;
	dataEdits: number;
	uploads: number;
	lastChange: string | null;
	uniqueEditors: number;
}

export interface AuditHistoryListResponse {
	histories: AuditHistory[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}

export interface AuditHistoryFilters {
	actionType?: AuditActionType;
	fieldName?: string;
	page?: number;
	perPage?: number;
}
