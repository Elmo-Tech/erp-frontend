export enum QuotationStatus {
	DRAFT = "draft",
	SENT = "sent",
	VIEWED = "viewed",
	EXPIRED = "expired",
	NEGOTIATION = "negotiation",
	APPROVED = "approved",
	REJECTED = "rejected",
}

export enum CommissionType {
	MARKUP = "markup",
	MARGIN = "margin",
}

export enum ResourceType {
	BACKEND = "backend",
	FRONTEND = "frontend",
	UI_UX = "ui_ux",
	MOBILE = "mobile",
	DEVOPS = "devops",
	QA = "qa",
	PM = "pm",
}

export enum RejectionReason {
	PRICE = "price",
	TIMELINE = "timeline",
	COMPETITOR = "competitor",
	BUDGET = "budget",
	SCOPE = "scope",
	OTHER = "other",
}

export interface QuotationItem {
	itemId?: number;
	resourceType: ResourceType;
	description: string;
	estimatedHours: number;
	hourlyRate: number;
	internalHourlyCost?: number;
	subtotal: number;
}

export interface Estimations {
	frontendHours: number;
	backendHours: number;
	uiUxHours: number;
	testingHours: number;
	pmHours: number;
	[key: string]: number;
}

export interface PricingBreakdown {
	totalHours: number;
	grossPrice: number;
	discountAmount: number;
	commissionAmount: number;
	finalPrice: number;
	internalCost?: number;
	profitMargin?: number;
}

export interface Quotation {
	quotationId: number;
	quotationNumber: string;
	leadId: number;
	templateId?: number;
	estimations?: Estimations;
	items?: QuotationItem[];
	hourlyRate: number;
	discountPercentage: number;
	finalPrice: number;
	currency: string;
	status: QuotationStatus;
	expiryDate?: string;
	sentAt?: string;
	viewedAt?: string;
	rejectionReason?: RejectionReason;
	rejectionNotes?: string;
	commissionType?: CommissionType;
	commissionPercentage: number;
	commissionAmount: number;
	commissionUserId?: number;
	commissionUserName?: string;
	internalCost?: number;
	profitMargin?: number;
	overridePrice?: number;
	overrideReason?: string;
	notes?: string;
	termsConditions?: string;
	pricingBreakdown?: PricingBreakdown;
	createdAt: string;
	updatedAt: string;
	createdBy: number;
	updatedBy: number;
	lead?: {
		leadId: number;
		name: string;
		email: string;
		company?: string;
	};
}

export interface CreateQuotationPayload {
	leadId: number;
	templateId?: number;
	items?: Omit<QuotationItem, "itemId" | "subtotal">[];
	estimations?: Estimations;
	hourlyRate?: number;
	discountPercentage: number;
	currency: string;
	expiryDate?: string;
	commissionType?: CommissionType;
	commissionPercentage?: number;
	commissionUserId?: number;
	overridePrice?: number;
	overrideReason?: string;
	notes?: string;
	termsConditions?: string;
}

export interface UpdateQuotationPayload extends Partial<CreateQuotationPayload> {}

export interface UpdateStatusPayload {
	status: QuotationStatus;
	rejectionReason?: RejectionReason;
	rejectionNotes?: string;
}

export interface CalculatePricingPayload {
	items?: Omit<QuotationItem, "itemId" | "subtotal">[];
	estimations?: Estimations;
	hourlyRate?: number;
	discountPercentage: number;
	commissionType?: CommissionType;
	commissionPercentage?: number;
}

export interface QuotationListResponse {
	quotations: Quotation[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}

export interface QuotationFilters {
	search?: string;
	status?: QuotationStatus;
	leadId?: number;
	expiringIn?: number;
	page?: number;
	perPage?: number;
}
