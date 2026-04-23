/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Loader2, Save, Calculator, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { useCreateQuotation } from "../../../hooks/useQuotations";
import { useLeads } from "../../../hooks/useLeads";
import { PaymentMilestonesBuilder } from "../PaymentMilestonesBuilder";
import { DEFAULT_MILESTONE_TEMPLATES, PaymentMilestone, validateMilestonePercentages, calculateMilestoneAmounts } from "../../../schemas/quotationSchema";
import { CreateQuotationPayload, QuotationStatus } from "../../../types/quotation";
import { format, addDays } from "date-fns";

/**
 * CreateQuotationDialog Component
 *
 * A comprehensive dialog for creating quotations with:
 * - Basic Info section (title, lead selection)
 * - Pricing section (base price, currency, discount, commission)
 * - Payment Milestones section (with validation)
 * - Timeline section (expiry date)
 *
 * Real-time calculation of final total: Base Price - Discount + Commission
 * Submit button disabled until milestones sum to exactly 100%
 */
interface CreateQuotationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	leadId?: number;
	onSuccess?: (quotationId: number) => void;
}

interface FormValues {
	title: string;
	leadId: number;
	basePrice: number;
	currency: string;
	discountType: "percentage" | "fixed";
	discountValue: number;
	commissionType: "markup" | "margin" | "none";
	commissionValue: number;
	expiryDays: number;
	status: QuotationStatus;
	notes?: string;
	termsConditions?: string;
}

/**
 * Currency options
 */
const CURRENCY_OPTIONS = [
	{ value: "USD", label: "USD - US Dollar" },
	{ value: "EUR", label: "EUR - Euro" },
	{ value: "SAR", label: "SAR - Saudi Riyal" },
	{ value: "GBP", label: "GBP - British Pound" },
];

/**
 * Default form values
 */
const getDefaultValues = (leadId?: number): FormValues => ({
	title: "",
	leadId: leadId || 0,
	basePrice: 0,
	currency: "USD",
	discountType: "percentage",
	discountValue: 0,
	commissionType: "none",
	commissionValue: 0,
	expiryDays: 30,
	status: QuotationStatus.DRAFT,
	notes: "",
	termsConditions: "",
});

export const CreateQuotationDialog: React.FC<CreateQuotationDialogProps> = ({ open, onOpenChange, leadId, onSuccess }) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState<FormValues>(getDefaultValues(leadId));
	const [milestones, setMilestones] = useState<PaymentMilestone[]>(() =>
		DEFAULT_MILESTONE_TEMPLATES.standard.map((m: { name: string; percentage: number }, index: number) => ({
			id: `milestone-${Date.now()}-${index}`,
			name: m.name,
			percentage: m.percentage,
		})),
	);

	const { data: leadsData, isLoading: leadsLoading } = useLeads();
	const createQuotationMutation = useCreateQuotation();

	// Lead options
	const leadOptions = useMemo(() => {
		if (leadsLoading) return [{ value: "loading", label: "Loading leads...", disabled: true }];
		const leads = leadsData?.leads || [];
		if (leads.length === 0) return [{ value: "no-leads", label: "No leads available", disabled: true }];
		return leads.map((lead: { leadId: number; name: string; company?: string }) => ({
			value: lead.leadId.toString(),
			label: `${lead.name}${lead.company ? ` - ${lead.company}` : ""}`,
		}));
	}, [leadsData?.leads, leadsLoading]);

	// Calculate pricing in real-time
	const pricing = useMemo(() => {
		const { basePrice, discountType, discountValue, commissionType, commissionValue } = formData;

		// Calculate discount amount
		let discountAmount = 0;
		if (discountType === "percentage") {
			discountAmount = basePrice * (discountValue / 100);
		} else {
			discountAmount = discountValue;
		}

		// Price after discount
		const priceAfterDiscount = basePrice - discountAmount;

		// Calculate commission amount
		let commissionAmount = 0;
		if (commissionType === "markup") {
			commissionAmount = priceAfterDiscount * (commissionValue / 100);
		} else if (commissionType === "margin") {
			// Margin calculation: margin = (price - cost) / price
			// So: price = cost / (1 - margin)
			const impliedCost = priceAfterDiscount / (1 + commissionValue / 100);
			commissionAmount = priceAfterDiscount - impliedCost;
		}

		// Final price
		const finalPrice = priceAfterDiscount + commissionAmount;

		return {
			basePrice,
			discountAmount,
			priceAfterDiscount,
			commissionAmount,
			finalPrice: Math.max(0, finalPrice),
		};
	}, [formData.basePrice, formData.discountType, formData.discountValue, formData.commissionType, formData.commissionValue]);

	// Validate milestones
	const milestoneValidation = useMemo(() => {
		return validateMilestonePercentages(milestones);
	}, [milestones]);

	// Calculate milestone amounts
	const milestonesWithAmounts = useMemo(() => {
		return calculateMilestoneAmounts(milestones, pricing.finalPrice);
	}, [milestones, pricing.finalPrice]);

	// Form is valid when:
	// 1. Required fields are filled
	// 2. Has a positive price
	// 3. Milestones sum to exactly 100%
	const isFormValid = useMemo(() => {
		const hasRequired = formData.title && formData.leadId > 0;
		const hasPrice = pricing.finalPrice > 0;
		const milestonesValid = milestoneValidation.isValid;

		return hasRequired && hasPrice && milestonesValid;
	}, [formData.title, formData.leadId, pricing.finalPrice, milestoneValidation.isValid]);

	// Handle form field changes
	const handleFieldChange = (field: keyof FormValues, value: string | number) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// Handle form submission
	const onSubmit = async () => {
		if (!milestoneValidation.isValid) {
			toast.error("Milestone percentages must sum to exactly 100%");
			return;
		}

		try {
			setIsSubmitting(true);

			// Prepare milestones for API (without calculated amounts)
				const payload: CreateQuotationPayload = {
					leadId: formData.leadId,
					title: formData.title,
					basePrice: formData.basePrice,
					currency: formData.currency,
					discountType: formData.discountType === "percentage" ? "percent" : "amount",
					discountValue: formData.discountValue,
					commissionType: formData.commissionType === "none" ? undefined : formData.commissionType,
					commissionValue: formData.commissionType === "none" ? undefined : formData.commissionValue,
					commissionCalculation: "add" as const,
					expiryDays: formData.expiryDays,
					status: formData.status,
					milestones: milestones.map((m: PaymentMilestone) => ({
					name: m.name,
					percentage: m.percentage,
				})),
					notes: formData.notes,
					termsConditions: formData.termsConditions,
				};

				const result = await createQuotationMutation.mutateAsync(payload);
			toast.success("Quotation created successfully");
			onSuccess?.(result.quotationId);
			onOpenChange(false);
			setFormData(getDefaultValues(leadId));
			setMilestones(
				DEFAULT_MILESTONE_TEMPLATES.standard.map((m: { name: string; percentage: number }, index: number) => ({
					id: `milestone-${Date.now()}-${index}`,
					name: m.name,
					percentage: m.percentage,
				})),
			);
		} catch (error) {
			toast.error("Failed to create quotation");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Calculate expiry date for display
	const expiryDate = useMemo(() => {
		const days = formData.expiryDays || 30;
		return format(addDays(new Date(), days), "MMMM dd, yyyy");
	}, [formData.expiryDays]);

	// Reset form when leadId changes
	React.useEffect(() => {
		if (leadId && open) {
			setFormData((prev) => ({ ...prev, leadId }));
		}
	}, [leadId, open]);

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create Quotation</DialogTitle>
					<DialogDescription>Create a new quotation with payment milestones</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Basic Info Section */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								Basic Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="lead">Lead</Label>
								<Select
									value={formData.leadId?.toString() || ""}
									onValueChange={(value) => handleFieldChange("leadId", parseInt(value))}
									disabled={!!leadId}
								>
									<SelectTrigger id="lead">
										<SelectValue placeholder="Select a lead" />
									</SelectTrigger>
									<SelectContent>
										{leadOptions.map((option: { value: string; label: string; disabled?: boolean }) => (
											<SelectItem
												key={option.value}
												value={option.value}
												disabled={option.disabled}
											>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="title">Title</Label>
								<Input
									id="title"
									value={formData.title}
									onChange={(e) => handleFieldChange("title", e.target.value)}
									placeholder="e.g., Website Development Project"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="status">Status</Label>
								<Select
									value={formData.status}
									onValueChange={(value) => handleFieldChange("status", value as QuotationStatus)}
								>
									<SelectTrigger id="status">
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={QuotationStatus.DRAFT}>Draft</SelectItem>
										<SelectItem value={QuotationStatus.SENT}>Sent</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					{/* Pricing Section */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calculator className="h-5 w-5" />
								Pricing
							</CardTitle>
							<CardDescription>Base price will be adjusted by discount and commission to calculate final total</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="basePrice">Base Price</Label>
									<Input
										id="basePrice"
										type="number"
										min={0}
										step={0.01}
										value={formData.basePrice}
										onChange={(e) => handleFieldChange("basePrice", parseFloat(e.target.value) || 0)}
										placeholder="0.00"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="currency">Currency</Label>
									<Select
										value={formData.currency}
										onValueChange={(value) => handleFieldChange("currency", value)}
									>
										<SelectTrigger id="currency">
											<SelectValue placeholder="Select currency" />
										</SelectTrigger>
										<SelectContent>
											{CURRENCY_OPTIONS.map((option: { value: string; label: string }) => (
												<SelectItem
													key={option.value}
													value={option.value}
												>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Discount</Label>
									<div className="flex gap-2">
										<Select
											value={formData.discountType}
											onValueChange={(value) => handleFieldChange("discountType", value)}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="percentage">Percentage</SelectItem>
												<SelectItem value="fixed">Fixed Amount</SelectItem>
											</SelectContent>
										</Select>
										<Input
											type="number"
											min={0}
											value={formData.discountValue}
											onChange={(e) => handleFieldChange("discountValue", parseFloat(e.target.value) || 0)}
											placeholder={formData.discountType === "percentage" ? "0" : "0.00"}
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label>Commission</Label>
									<div className="flex gap-2">
										<Select
											value={formData.commissionType}
											onValueChange={(value) => handleFieldChange("commissionType", value)}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="none">None</SelectItem>
												<SelectItem value="markup">Markup</SelectItem>
												<SelectItem value="margin">Margin</SelectItem>
											</SelectContent>
										</Select>
										{formData.commissionType !== "none" && (
											<Input
												type="number"
												min={0}
												value={formData.commissionValue}
												onChange={(e) => handleFieldChange("commissionValue", parseFloat(e.target.value) || 0)}
												placeholder="0"
											/>
										)}
									</div>
								</div>
							</div>

							{/* Real-time Pricing Summary */}
							<Separator />
							<div className="bg-muted/50 p-4 rounded-lg space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Base Price:</span>
									<span>
										{formData.currency} {pricing.basePrice.toLocaleString()}
									</span>
								</div>
								{pricing.discountAmount > 0 && (
									<div className="flex justify-between text-sm text-green-600">
										<span>Discount:</span>
										<span>
											-{formData.currency} {pricing.discountAmount.toLocaleString()}
										</span>
									</div>
								)}
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">After Discount:</span>
									<span>
										{formData.currency} {pricing.priceAfterDiscount.toLocaleString()}
									</span>
								</div>
								{pricing.commissionAmount > 0 && (
									<div className="flex justify-between text-sm text-orange-600">
										<span>Commission:</span>
										<span>
											+{formData.currency} {pricing.commissionAmount.toLocaleString()}
										</span>
									</div>
								)}
								<Separator />
								<div className="flex justify-between font-semibold text-lg">
									<span>Final Total:</span>
									<span className="text-primary">
										{formData.currency} {pricing.finalPrice.toLocaleString()}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Payment Milestones Section */}
					<PaymentMilestonesBuilder
						totalAmount={pricing.finalPrice}
						milestones={milestones}
						onMilestonesChange={setMilestones}
						currency={formData.currency}
					/>

					{/* Timeline Section */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-5 w-5" />
								Timeline
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="expiryDays">Valid For (Days)</Label>
								<Input
									id="expiryDays"
									type="number"
									min={1}
									max={365}
									value={formData.expiryDays}
									onChange={(e) => handleFieldChange("expiryDays", parseInt(e.target.value) || 30)}
								/>
								<p className="text-sm text-muted-foreground">
									Quotation expires on: <span className="font-medium">{expiryDate}</span>
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="notes">Notes (Optional)</Label>
								<Textarea
									id="notes"
									value={formData.notes}
									onChange={(e) => handleFieldChange("notes", e.target.value)}
									placeholder="Additional notes for this quotation..."
									rows={3}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="termsConditions">Terms & Conditions (Optional)</Label>
								<Textarea
									id="termsConditions"
									value={formData.termsConditions}
									onChange={(e) => handleFieldChange("termsConditions", e.target.value)}
									placeholder="Payment terms, warranty info, etc..."
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Form Actions */}
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							disabled={isSubmitting || !isFormValid}
							onClick={onSubmit}
						>
							{isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Creating...
								</>
							) : (
								<>
									<Save className="h-4 w-4 mr-2" />
									Create Quotation
								</>
							)}
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default CreateQuotationDialog;
