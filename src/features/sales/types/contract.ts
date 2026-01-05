export enum ContractStatus {
	DRAFT = "draft",
	PENDING_SIGNATURE = "pending_signature",
	SIGNED = "signed",
	ACTIVE = "active",
	COMPLETED = "completed",
	TERMINATED = "terminated",
}

export enum MilestoneStatus {
	PENDING = "pending",
	DUE = "due",
	INVOICED = "invoiced",
	PAID = "paid",
	OVERDUE = "overdue",
}

export enum MilestoneTriggerType {
	IMMEDIATE = "immediate",
	PROJECT_STATUS = "project_status",
	DELIVERABLE = "deliverable",
	DATE = "date",
}

export interface ContractParty {
	company: string;
	representative: string;
	title: string;
	address?: string;
	idNumber?: string;
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
	quotationId?: number;
	projectId?: number;
	templateId?: number;
	title: string;
	content: string;
	partyOne: ContractParty;
	partyTwo: ContractParty;
	totalAmount: number;
	currency?: string;
	paymentTerms?: string;
	startDate: string;
	endDate?: string;
	milestones?: Omit<ContractMilestone, "milestoneId" | "contractId" | "status" | "invoiceId" | "paidAt">[];
}

export interface UpdateContractPayload extends Partial<CreateContractPayload> {}

export interface SignContractPayload {
	signedByClient: string;
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
	page?: number;
	perPage?: number;
}
