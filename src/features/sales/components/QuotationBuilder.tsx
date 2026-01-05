"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form } from "@/components/ui/form";
import { Loader2, Calculator, Save } from "lucide-react";
import { FormInput, FormSelect } from "@/components/shared";
import { useLeads } from "../hooks/useLeads";
import { useCalculatePricing } from "../hooks/useCalculatePricing";
import { useCreateQuotation, useUpdateQuotation } from "../hooks/useQuotations";
import { CreateQuotationPayload, UpdateQuotationPayload, Estimations, QuotationStatus } from "../types/quotation";
import { PricingBreakdown } from "./PricingBreakdown";
import { toast } from "sonner";

// Form validation schema
const quotationSchema = z.object({
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

type QuotationFormData = z.infer<typeof quotationSchema>;

const CURRENCY_OPTIONS = [
	{ value: "USD", label: "USD - US Dollar" },
	{ value: "EUR", label: "EUR - Euro" },
	{ value: "SAR", label: "SAR - Saudi Riyal" },
	{ value: "GBP", label: "GBP - British Pound" },
];

const STATUS_OPTIONS = [
	{ value: QuotationStatus.DRAFT, label: "Draft" },
	{ value: QuotationStatus.SENT, label: "Sent" },
	{ value: QuotationStatus.VIEWED, label: "Viewed" },
	{ value: QuotationStatus.NEGOTIATION, label: "Negotiation" },
	{ value: QuotationStatus.APPROVED, label: "Approved" },
	{ value: QuotationStatus.REJECTED, label: "Rejected" },
	{ value: QuotationStatus.EXPIRED, label: "Expired" },
];

interface QuotationBuilderProps {
	onSuccess?: (quotationId: number) => void;
	onCancel?: () => void;
	initialData?: Partial<QuotationFormData> & { quotationId?: number };
}

export const QuotationBuilder: React.FC<QuotationBuilderProps> = ({ onSuccess, onCancel, initialData }) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isEditing = !!initialData?.quotationId;

	const form = useForm<QuotationFormData>({
		resolver: zodResolver(quotationSchema),
		defaultValues: {
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
		},
	});

	// Reset form when initialData changes
	useEffect(() => {
		if (initialData) {
			form.reset({
				leadId: initialData.leadId || 0,
				frontendHours: initialData.frontendHours || 0,
				backendHours: initialData.backendHours || 0,
				uiUxHours: initialData.uiUxHours || 0,
				testingHours: initialData.testingHours || 0,
				pmHours: initialData.pmHours || 0,
				hourlyRate: initialData.hourlyRate || 100,
				discountPercentage: initialData.discountPercentage || 0,
				currency: initialData.currency || "USD",
				status: initialData.status || QuotationStatus.DRAFT,
			});
		}
	}, [initialData, form]);

	const watchedValues = form.watch();

	const { data: leadsResponse, isLoading: leadsLoading } = useLeads();
	const createQuotationMutation = useCreateQuotation();
	const updateQuotationMutation = useUpdateQuotation();

	const leadOptions = React.useMemo(() => {
		if (leadsLoading) return [{ value: "loading", label: "Loading leads...", disabled: true }];
		const leads = leadsResponse?.leads || [];
		if (leads.length === 0) return [{ value: "no-leads", label: "No leads available", disabled: true }];
		return leads.map((lead) => ({
			value: lead.leadId.toString(),
			label: `${lead.name}${lead.company ? ` - ${lead.company}` : ""}`,
		}));
	}, [leadsResponse?.leads, leadsLoading]);

	const pricingPayload = React.useMemo(() => {
		const { frontendHours, backendHours, uiUxHours, testingHours, pmHours, hourlyRate, discountPercentage } = watchedValues;

		if (hourlyRate <= 0) return null;

		const estimations: Estimations = {
			frontendHours: frontendHours || 0,
			backendHours: backendHours || 0,
			uiUxHours: uiUxHours || 0,
			testingHours: testingHours || 0,
			pmHours: pmHours || 0,
		};

		const totalHours = Object.values(estimations).reduce((sum, hours) => sum + hours, 0);
		if (totalHours === 0) return null;

		return {
			estimations,
			hourlyRate,
			discountPercentage: discountPercentage || 0,
		};
	}, [watchedValues]);

	const {
		data: pricingBreakdown,
		isLoading: pricingLoading,
		error: pricingError,
	} = useCalculatePricing(pricingPayload, {
		enabled: !!pricingPayload,
		debounceMs: 500,
	});

	const onSubmit = async (data: QuotationFormData) => {
		try {
			setIsSubmitting(true);

			const estimations: Estimations = {
				frontendHours: data.frontendHours,
				backendHours: data.backendHours,
				uiUxHours: data.uiUxHours,
				testingHours: data.testingHours,
				pmHours: data.pmHours,
			};

			if (isEditing && initialData?.quotationId) {
				const payload: UpdateQuotationPayload = {
					leadId: data.leadId,
					estimations,
					hourlyRate: data.hourlyRate,
					discountPercentage: data.discountPercentage,
					currency: data.currency,
				};

				await updateQuotationMutation.mutateAsync({
					id: initialData.quotationId,
					payload,
				});
				toast.success("Quotation updated successfully");
				onSuccess?.(initialData.quotationId);
			} else {
				const payload: CreateQuotationPayload = {
					leadId: data.leadId,
					estimations,
					hourlyRate: data.hourlyRate,
					discountPercentage: data.discountPercentage,
					currency: data.currency,
				};

				const result = await createQuotationMutation.mutateAsync(payload);
				toast.success("Quotation created successfully");
				onSuccess?.(result.quotationId);
			}
		} catch {
			toast.error(isEditing ? "Failed to update quotation" : "Failed to create quotation");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5" />
						{isEditing ? "Edit Quotation" : "Create Quotation"}
					</CardTitle>
					<CardDescription>{isEditing ? "Update quotation details" : "Build a detailed quotation with real-time pricing calculations"}</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-6"
						>
							{/* Lead Selection & Status */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormSelect
									control={form.control}
									name="leadId"
									label="Select Lead *"
									placeholder="Choose a lead..."
									options={leadOptions}
									onValueChange={(value) => form.setValue("leadId", parseInt(value))}
								/>
								<FormSelect
									control={form.control}
									name="status"
									label="Status"
									placeholder="Select status"
									options={STATUS_OPTIONS}
								/>
							</div>

							<Separator />

							{/* Estimation Hours */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold">Project Estimations</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									<FormInput
										control={form.control}
										name="frontendHours"
										label="Frontend Hours"
										type="number"
										placeholder="0"
										min={0}
										step="0.5"
									/>
									<FormInput
										control={form.control}
										name="backendHours"
										label="Backend Hours"
										type="number"
										placeholder="0"
										min={0}
										step="0.5"
									/>
									<FormInput
										control={form.control}
										name="uiUxHours"
										label="UI/UX Hours"
										type="number"
										placeholder="0"
										min={0}
										step="0.5"
									/>
									<FormInput
										control={form.control}
										name="testingHours"
										label="Testing Hours"
										type="number"
										placeholder="0"
										min={0}
										step="0.5"
									/>
									<FormInput
										control={form.control}
										name="pmHours"
										label="Project Management Hours"
										type="number"
										placeholder="0"
										min={0}
										step="0.5"
									/>
								</div>
							</div>

							<Separator />

							{/* Pricing Configuration */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold">Pricing Configuration</h3>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<FormInput
										control={form.control}
										name="hourlyRate"
										label="Hourly Rate *"
										type="number"
										placeholder="100.00"
										min={0.01}
										step="0.01"
									/>
									<FormInput
										control={form.control}
										name="discountPercentage"
										label="Discount (%)"
										type="number"
										placeholder="0"
										min={0}
										max={100}
										step="0.1"
									/>
									<FormSelect
										control={form.control}
										name="currency"
										label="Currency"
										placeholder="Select currency"
										options={CURRENCY_OPTIONS}
									/>
								</div>
							</div>

							<Separator />

							{/* Real-time Pricing Breakdown */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold">Pricing Breakdown</h3>
								{pricingLoading ? (
									<div className="flex items-center justify-center p-8">
										<Loader2 className="h-6 w-6 animate-spin" />
										<span className="ml-2">Calculating pricing...</span>
									</div>
								) : pricingError ? (
									<div className="p-4 border border-destructive/20 rounded-md bg-destructive/5">
										<p className="text-sm text-destructive">Error calculating pricing. Please check your inputs.</p>
									</div>
								) : pricingBreakdown ? (
									<PricingBreakdown
										breakdown={pricingBreakdown}
										currency={watchedValues.currency}
									/>
								) : (
									<div className="p-4 border border-muted rounded-md bg-muted/5">
										<p className="text-sm text-muted-foreground">Enter estimation hours and hourly rate to see pricing breakdown</p>
									</div>
								)}
							</div>

							{/* Form Actions */}
							<div className="flex justify-end gap-3 pt-6">
								{onCancel && (
									<Button
										type="button"
										variant="outline"
										onClick={onCancel}
									>
										Cancel
									</Button>
								)}
								<Button
									type="submit"
									disabled={isSubmitting || !form.formState.isValid || !pricingBreakdown}
									className="min-w-[120px]"
								>
									{isSubmitting ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin mr-2" />
											{isEditing ? "Updating..." : "Creating..."}
										</>
									) : (
										<>
											<Save className="h-4 w-4 mr-2" />
											{isEditing ? "Update Quotation" : "Create Quotation"}
										</>
									)}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};
