export enum TemplateType {
	SAAS = "saas",
	CUSTOM = "custom",
	MOBILE = "mobile",
	MAINTENANCE = "maintenance",
	CONSULTATION = "consultation",
}

export enum ContractTemplateType {
	DEVELOPMENT = "development",
	MAINTENANCE = "maintenance",
	SLA = "sla",
	NDA = "nda",
	CONSULTATION = "consultation",
}

export interface TemplatePlaceholder {
	key: string;
	label: string;
	defaultValue?: string;
}

export interface ProposalTemplate {
	templateId: number;
	name: string;
	type: TemplateType;
	content: string;
	placeholders: TemplatePlaceholder[];
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface ContractTemplate {
	templateId: number;
	name: string;
	type: ContractTemplateType;
	content: string;
	placeholders: TemplatePlaceholder[];
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTemplatePayload {
	name: string;
	type: string;
	content: string;
	placeholders?: TemplatePlaceholder[];
	isActive?: boolean;
}

export interface UpdateTemplatePayload extends Partial<CreateTemplatePayload> {}

export interface GenerateFromTemplatePayload {
	quotationId?: number;
	partyOne?: Record<string, string>;
	partyTwo?: Record<string, string>;
	totalAmount?: number;
	currency?: string;
	customValues?: Record<string, string>;
}
