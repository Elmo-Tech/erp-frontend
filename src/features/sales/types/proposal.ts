// Proposal Types for Technical Proposals (separate from Price Quotations)

export enum ProposalStatus {
	DRAFT = "draft",
	SENT = "sent",
	VIEWED = "viewed",
	APPROVED = "approved",
	REJECTED = "rejected",
	EXPIRED = "expired",
}

export const ProposalStatusLabels: Record<ProposalStatus, string> = {
	[ProposalStatus.DRAFT]: "Draft",
	[ProposalStatus.SENT]: "Sent",
	[ProposalStatus.VIEWED]: "Viewed",
	[ProposalStatus.APPROVED]: "Approved",
	[ProposalStatus.REJECTED]: "Rejected",
	[ProposalStatus.EXPIRED]: "Expired",
};

export const ProposalStatusColors: Record<ProposalStatus, string> = {
	[ProposalStatus.DRAFT]: "gray",
	[ProposalStatus.SENT]: "blue",
	[ProposalStatus.VIEWED]: "cyan",
	[ProposalStatus.APPROVED]: "green",
	[ProposalStatus.REJECTED]: "red",
	[ProposalStatus.EXPIRED]: "orange",
};

export interface Proposal {
	proposalId: number;
	proposalNumber: string;
	leadId: number;
	templateId?: number;
	title: string;
	content?: string;
	filePath?: string;
	fileName?: string;
	fileUrl?: string;
	status: ProposalStatus;
	statusLabel?: string;
	statusColor?: string;
	submissionDate?: string;
	expiryDate?: string;
	sentAt?: string;
	viewedAt?: string;
	rejectionReason?: string;
	rejectionNotes?: string;
	isFastTrack: boolean;
	fastTrackReason?: string;
	internalNotes?: string;
	isExpired?: boolean;
	canBeEdited?: boolean;
	// Relations
	lead?: {
		leadId: number;
		name: string;
		email: string;
		company?: string;
		projectName?: string;
	};
	template?: {
		templateId: number;
		name: string;
		type: string;
	};
	quotationsCount?: number;
	// Audit
	createdAt: string;
	updatedAt: string;
	createdBy: number;
	updatedBy: number;
}

export interface CreateProposalPayload {
	leadId: number;
	templateId?: number;
	title: string;
	content?: string;
	expiryDate?: string;
	internalNotes?: string;
}

export interface UpdateProposalPayload {
	templateId?: number;
	title?: string;
	content?: string;
	expiryDate?: string;
	internalNotes?: string;
}

export interface FastTrackProposalPayload {
	leadId: number;
	title?: string;
	projectName?: string;
	fastTrackReason: string;
}

export interface RejectProposalPayload {
	rejectionReason: string;
	rejectionNotes?: string;
}

export interface ProposalListResponse {
	proposals: Proposal[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}

export interface ProposalFilters {
	search?: string;
	status?: ProposalStatus;
	leadId?: number;
	isFastTrack?: boolean;
	page?: number;
	perPage?: number;
}
