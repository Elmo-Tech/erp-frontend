import { z } from "zod";
import { QuotationStatus } from "../../../types/quotation";

export const quotationSchema = z.object({
	leadId: z.number().min(1, "Please select a lead"),
	frontendHours: z.number().min(0, "Frontend hours cannot be negative"),
	backendHours: z.number().min(0, "Backend hours cannot be negative"),
	uiUxHours: z.number().min(0, "UI/UX hours cannot be negative"),
	testingHours: z.number().min(0, "Testing hours cannot be negative"),
	pmHours: z.number().min(0, "PM hours cannot be negative"),
	hourlyRate: z.number().min(0.01, "Hourly rate must be greater than 0"),
	discountPercentage: z.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%"),
	currency: z.string().length(3, "Currency must be 3 characters"),
	status: z.nativeEnum(QuotationStatus),
});

export type QuotationFormData = z.infer<typeof quotationSchema>;

export const CURRENCY_OPTIONS = [
	{ value: "USD", label: "USD - US Dollar" },
	{ value: "EUR", label: "EUR - Euro" },
	{ value: "SAR", label: "SAR - Saudi Riyal" },
	{ value: "GBP", label: "GBP - British Pound" },
];

export const STATUS_OPTIONS = [
	{ value: QuotationStatus.DRAFT, label: "Draft" },
	{ value: QuotationStatus.SENT, label: "Sent" },
	{ value: QuotationStatus.VIEWED, label: "Viewed" },
	{ value: QuotationStatus.NEGOTIATION, label: "Negotiation" },
	{ value: QuotationStatus.APPROVED, label: "Approved" },
	{ value: QuotationStatus.REJECTED, label: "Rejected" },
	{ value: QuotationStatus.EXPIRED, label: "Expired" },
];

export const getDefaultValues = (initialData?: Partial<QuotationFormData> & { quotationId?: number }): QuotationFormData => ({
	leadId: initialData?.leadId || 0,
	frontendHours: initialData?.frontendHours || 0,
	backendHours: initialData?.backendHours || 0,
	uiUxHours: initialData?.uiUxHours || 0,
	testingHours: initialData?.testingHours || 0,
	pmHours: initialData?.pmHours || 0,
	hourlyRate: initialData?.hourlyRate || 100,
	discountPercentage: initialData?.discountPercentage || 0,
	currency: initialData?.currency || "USD",
	status: initialData?.status || QuotationStatus.DRAFT,
});
