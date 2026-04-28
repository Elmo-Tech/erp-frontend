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

export type TemplateKind = "proposal" | "contract";

export interface TemplatePlaceholder {
	key: string;
	label: string;
	defaultValue?: string;
}

export interface BaseTemplate {
	templateId: number;
	name: string;
	content: string;
	placeholders: TemplatePlaceholder[];
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface ProposalTemplate extends BaseTemplate {
	type: TemplateType;
}

export interface ContractTemplate extends BaseTemplate {
	type: ContractTemplateType;
}

export type Template = ProposalTemplate | ContractTemplate;

export interface CreateTemplatePayload {
	name: string;
	type: string;
	content: string;
	placeholders?: TemplatePlaceholder[];
	isActive?: boolean;
}

export type UpdateTemplatePayload = Partial<CreateTemplatePayload>;

export interface GenerateFromTemplatePayload {
	quotationId?: number;
	partyOne?: Record<string, string>;
	partyTwo?: Record<string, string>;
	totalAmount?: number;
	currency?: string;
	customValues?: Record<string, string>;
}

export interface GeneratedTemplateContent {
	content: string;
}

