export enum QuotationStatus {
	DRAFT = "draft",
	SENT = "sent",
	ACCEPTED = "accepted",
	REJECTED = "rejected",
	EXPIRED = "expired",
}

export interface Estimations {
	frontendHours: number;
	backendHours: number;
	uiUxHours: number;
	testingHours: number;
	pmHours: number;
	[key: string]: number; // Allow custom categories
}

export interface PricingBreakdown {
	totalHours: number;
	grossPrice: number;
	discountAmount: number;
	finalPrice: number;
}

export interface Quotation {
	quotationId: number;
	leadId: number;
	estimations: Estimations;
	hourlyRate: number;
	discountPercentage: number;
	finalPrice: number;
	currency: string;
	status: QuotationStatus;
	pricingBreakdown: PricingBreakdown;
	createdAt: string;
	updatedAt: string;
	createdBy: number;
	updatedBy: number;
	// Optional lead relationship
	lead?: {
		leadId: number;
		name: string;
		email: string;
		company?: string;
	};
}

export interface CreateQuotationPayload {
	leadId: number;
	estimations: Estimations;
	hourlyRate: number;
	discountPercentage: number;
	currency: string;
	status?: QuotationStatus;
}

export interface UpdateQuotationPayload {
	leadId?: number;
	estimations?: Estimations;
	hourlyRate?: number;
	discountPercentage?: number;
	currency?: string;
	status?: QuotationStatus;
}

export interface CalculatePricingPayload {
	estimations: Estimations;
	hourlyRate: number;
	discountPercentage: number;
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
	page?: number;
	perPage?: number;
}
