export enum LeadStatus {
	NEW = "new",
	CONTACTED = "contacted",
	QUALIFIED = "qualified",
	PROPOSAL = "proposal",
	NEGOTIATION = "negotiation",
	WON = "won",
	LOST = "lost",
}

export interface Lead {
	leadId: number;
	name: string;
	email: string;
	company?: string;
	source?: string;
	status: LeadStatus;
	createdAt: string;
	updatedAt: string;
	createdBy: number;
	updatedBy: number;
}

export interface CreateLeadPayload {
	name: string;
	email: string;
	company?: string;
	source?: string;
	status?: LeadStatus;
}

export interface UpdateLeadPayload {
	name?: string;
	email?: string;
	company?: string;
	source?: string;
	status?: LeadStatus;
}

export interface LeadListResponse {
	leads: Lead[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}

export interface LeadFilters {
	search?: string;
	status?: LeadStatus;
	page?: number;
	perPage?: number;
}
