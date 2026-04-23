// Re-export enums from centralized statusHelpers
export { ContractStatus, ContractStatusLabels, ContractStatusColors, MilestoneStatus, MilestoneStatusLabels, MilestoneStatusColors } from "@/shared/lib/statusHelpers";
import { ContractStatus, MilestoneStatus } from "@/shared/lib/statusHelpers";

export enum MilestoneTriggerType {
	IMMEDIATE = "immediate",
	PROJECT_STATUS = "project_status",
	DELIVERABLE = "deliverable",
	DATE = "date",
}

export interface ContractParty {
	company: string;
	representative: string;
	title?: string;
	address?: string;
	idNumber?: string;
	name?: string;
	email?: string;
	phone?: string;
}

export interface ContractMilestone {
	milestoneId: number;
	contractId: number;
	title: string;
	description?: string;
	amount: number;
	percentage: number;
	dueDate?: string;
	triggerType: MilestoneTriggerType;
	triggerValue?: string;
	status: MilestoneStatus;
	invoiceId?: number;
	paidAt?: string;
	sortOrder: number;
}

export interface Contract {
	contractId: number;
	contractNumber: string;
	quotationId?: number;
	projectId?: number;
	templateId?: number;
	title: string;
	content: string;
	partyOne: ContractParty;
	partyTwo: ContractParty;
	totalAmount: number;
	currency: string;
	paymentTerms?: string;
	startDate: string;
	endDate?: string;
	signedAt?: string;
	signedByClient?: string;
	status: ContractStatus;
	milestones?: ContractMilestone[];
	quotation?: {
		quotationId: number;
		quotationNumber: string;
		finalPrice: number;
	};
	project?: {
		projectId: number;
		title: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface CreateContractPayload {
	dataSource?: "from_quotation" | "new_terms";
	quotationId?: number;
	projectId?: number;
	templateId?: number;
	taskId?: number;
	fileNumber?: string;
	title: string;
	content: string;
	deliverables?: string[];
	expiryDays?: number;
	expiryDate?: string;
	projectDuration?: string;
	preparationDeadline?: string;
	partyOne: ContractParty;
	partyTwo: ContractParty;
	totalAmount?: number;
	currency?: string;
	paymentTerms?: string;
	startDate: string;
	endDate?: string;
	milestones?: Array<{
		title: string;
		description?: string;
		percentage: number;
		dueDate?: string;
		triggerType?: MilestoneTriggerType;
		triggerValue?: string;
	}>;
}

export type UpdateContractPayload = Partial<CreateContractPayload>;

export interface SignContractPayload {
	signedByClient: string;
	signedPdf?: File;
}

export interface ContractListResponse {
	contracts: Contract[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}

export interface ContractFilters {
	search?: string;
	status?: ContractStatus;
	projectId?: number;
	quotationId?: number;
	leadId?: number;
	page?: number;
	perPage?: number;
}
