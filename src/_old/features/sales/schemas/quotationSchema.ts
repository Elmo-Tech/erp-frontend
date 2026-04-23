import { z } from "zod";
import { QuotationStatus } from "../types/quotation";

/**
 * Payment Milestone interface
 * Represents a single milestone in the payment plan
 */
export interface PaymentMilestone {
	id?: string;
	name: string;
	percentage: number;
	amount?: number; // Calculated automatically from percentage * totalAmount
}

/**
 * Milestone validation helper
 * Ensures the sum of all milestone percentages equals exactly 100%
 */
const milestonesRefine = (milestones: PaymentMilestone[]) => {
	const totalPercentage = milestones.reduce((sum, m) => sum + (m.percentage || 0), 0);
	return Math.abs(totalPercentage - 100) < 0.01; // Allow for floating point precision
};

/**
 * Create Quotation Schema with Payment Milestones
 * Based on Phase 3 / Priority 3 requirements
 *
 * Fields:
 * - title: Quotation title
 * - basePrice: Base price before discount and commission
 * - currency: Currency code (USD, EUR, SAR, GBP)
 * - discountType: Type of discount (percentage, fixed)
 * - discountValue: Value of discount
 * - commissionType: Type of commission (markup, margin)
 * - commissionValue: Value of commission
 * - commissionCalculation: How commission is calculated
 * - expiryDays: Number of days until quotation expires
 * - milestones: Array of payment milestones with name and percentage
 */
export const createQuotationWithMilestonesSchema = z.object({
	// Basic Info
	leadId: z.number().min(1, "Please select a lead"),
	title: z.string().min(1, "Title is required").max(255, "Title cannot exceed 255 characters"),

	// Pricing
	basePrice: z.number().min(0, "Base price cannot be negative"),
	currency: z.string().length(3, "Currency must be 3 characters").default("USD"),

	// Discount
	discountType: z.enum(["percentage", "fixed"]).default("percentage"),
	discountValue: z.number().min(0, "Discount value cannot be negative").default(0),

	// Commission
	commissionType: z.enum(["markup", "margin", "none"]).default("none"),
	commissionValue: z.number().min(0, "Commission value cannot be negative").default(0),
	commissionCalculation: z.enum(["on_base", "after_discount"]).default("after_discount"),

	// Timeline
	expiryDays: z.number().int().min(1, "Expiry days must be at least 1").max(365, "Expiry days cannot exceed 365").default(30),

	// Status
	status: z.nativeEnum(QuotationStatus).optional().default(QuotationStatus.DRAFT),

	// Payment Milestones - with 100% validation
	milestones: z
		.array(
			z.object({
				id: z.string().optional(),
				name: z.string().min(1, "Milestone name is required"),
				percentage: z.number().min(0, "Percentage cannot be negative").max(100, "Percentage cannot exceed 100"),
			}),
		)
		.min(1, "At least one milestone is required")
		.refine(milestonesRefine, {
			message: "Milestone percentages must sum to exactly 100%",
		}),
});

/**
 * Schema for creating a quotation from the builder
 * Extends the base schema with additional fields
 */
export const quotationBuilderSchema = createQuotationWithMilestonesSchema.extend({
	// Optional fields
	templateId: z.number().optional(),
	notes: z.string().optional(),
	termsConditions: z.string().optional(),

	// Commission user assignment
	commissionUserId: z.number().optional(),

	// Override price (manual override)
	overridePrice: z.number().optional(),
	overrideReason: z.string().optional(),
});

/**
 * Schema for updating a quotation
 */
export const updateQuotationWithMilestonesSchema = quotationBuilderSchema.partial();

/**
 * Schema for filtering quotations
 */
export const quotationFiltersSchema = z.object({
	search: z.string().optional(),
	status: z.nativeEnum(QuotationStatus).optional(),
	leadId: z.number().min(1).optional(),
	page: z.number().min(1).optional(),
	perPage: z.number().min(1).max(100).optional(),
});

/**
 * Default milestone templates
 * Common payment milestone structures
 */
export const DEFAULT_MILESTONE_TEMPLATES = {
	standard: [
		{ name: "Down Payment", percentage: 50 },
		{ name: "Design Approval", percentage: 20 },
		{ name: "Development Completion", percentage: 20 },
		{ name: "Final Delivery", percentage: 10 },
	],
	three_step: [
		{ name: "Down Payment", percentage: 33.33 },
		{ name: "Development Completion", percentage: 33.33 },
		{ name: "Final Delivery", percentage: 33.34 },
	],
	half_half: [
		{ name: "Down Payment", percentage: 50 },
		{ name: "Final Payment", percentage: 50 },
	],
	four_equal: [
		{ name: "Phase 1 - Discovery", percentage: 25 },
		{ name: "Phase 2 - Development", percentage: 25 },
		{ name: "Phase 3 - Testing", percentage: 25 },
		{ name: "Phase 4 - Launch", percentage: 25 },
	],
};

/**
 * Get default milestones based on template
 */
export function getDefaultMilestones(template: keyof typeof DEFAULT_MILESTONE_TEMPLATES = "standard"): PaymentMilestone[] {
	return DEFAULT_MILESTONE_TEMPLATES[template].map((m, index) => ({
		id: `milestone-${Date.now()}-${index}`,
		name: m.name,
		percentage: m.percentage,
	}));
}

/**
 * Calculate milestone amounts based on total amount
 */
export function calculateMilestoneAmounts(milestones: PaymentMilestone[], totalAmount: number): PaymentMilestone[] {
	return milestones.map((milestone) => ({
		...milestone,
		amount: (milestone.percentage / 100) * totalAmount,
	}));
}

/**
 * Validate milestone percentages sum to 100
 */
export function validateMilestonePercentages(milestones: PaymentMilestone[]): { isValid: boolean; total: number; difference: number } {
	const total = milestones.reduce((sum, m) => sum + (m.percentage || 0), 0);
	const difference = Math.abs(total - 100);
	return {
		isValid: difference < 0.01,
		total,
		difference,
	};
}

// Export inferred types
export type CreateQuotationWithMilestonesFormData = z.infer<typeof createQuotationWithMilestonesSchema>;
export type QuotationBuilderFormData = z.infer<typeof quotationBuilderSchema>;
export type UpdateQuotationWithMilestonesFormData = z.infer<typeof updateQuotationWithMilestonesSchema>;
export type QuotationFiltersFormData = z.infer<typeof quotationFiltersSchema>;
