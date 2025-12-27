"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Calculator, Save } from "lucide-react";
import { useLeads } from "../hooks/useLeads";
import { useCalculatePricing } from "../hooks/useCalculatePricing";
import { useCreateQuotation } from "../hooks/useQuotations";
import { CreateQuotationPayload, Estimations, QuotationStatus } from "../types/quotation";
import { PricingBreakdown } from "./PricingBreakdown";

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
});

type QuotationFormData = z.infer<typeof quotationSchema>;

interface QuotationBuilderProps {
	onSuccess?: (quotationId: number) => void;
	onCancel?: () => void;
	initialData?: Partial<QuotationFormData>;
}

/**
 * QuotationBuilder component for creating quotations with real-time pricing
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.7, 9.8
 */
export const QuotationBuilder: React.FC<QuotationBuilderProps> = ({ onSuccess, onCancel, initialData }) => {
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Form setup with validation
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
		},
	});

	// Watch form values for real-time pricing calculation
	const watchedValues = form.watch();

	// Hooks for data fetching and mutations
	const { data: leadsResponse, isLoading: leadsLoading } = useLeads();
	const createQuotationMutation = useCreateQuotation();

	// Prepare pricing payload for real-time calculation
	const pricingPayload = React.useMemo(() => {
		const { frontendHours, backendHours, uiUxHours, testingHours, pmHours, hourlyRate, discountPercentage } = watchedValues;

		// Only calculate if we have valid data
		if (hourlyRate <= 0) return null;

		const estimations: Estimations = {
			frontendHours: frontendHours || 0,
			backendHours: backendHours || 0,
			uiUxHours: uiUxHours || 0,
			testingHours: testingHours || 0,
			pmHours: pmHours || 0,
		};

		// Check if we have at least some hours
		const totalHours = Object.values(estimations).reduce((sum, hours) => sum + hours, 0);
		if (totalHours === 0) return null;

		return {
			estimations,
			hourlyRate,
			discountPercentage: discountPercentage || 0,
		};
	}, [watchedValues]);

	// Real-time pricing calculation with debouncing
	const {
		data: pricingBreakdown,
		isLoading: pricingLoading,
		error: pricingError,
	} = useCalculatePricing(pricingPayload, {
		enabled: !!pricingPayload,
		debounceMs: 500,
	});

	// Handle form submission
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

			const payload: CreateQuotationPayload = {
				leadId: data.leadId,
				estimations,
				hourlyRate: data.hourlyRate,
				discountPercentage: data.discountPercentage,
				currency: data.currency,
				status: QuotationStatus.DRAFT,
			};

			const result = await createQuotationMutation.mutateAsync(payload);

			// Success notification would go here
			onSuccess?.(result.quotationId);
		} catch (error) {
			console.error("Failed to create quotation:", error);
			// Error notification would go here
		} finally {
			setIsSubmitting(false);
		}
	};

	const leads = leadsResponse?.leads || [];

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5" />
						Create Quotation
					</CardTitle>
					<CardDescription>Build a detailed quotation with real-time pricing calculations</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
					>
						{/* Lead Selection */}
						<div className="space-y-2">
							<Label htmlFor="leadId">Select Lead *</Label>
							<Select
								value={watchedValues.leadId?.toString() || ""}
								onValueChange={(value) => form.setValue("leadId", parseInt(value))}
							>
								<SelectTrigger>
									<SelectValue placeholder="Choose a lead..." />
								</SelectTrigger>
								<SelectContent>
									{leadsLoading ? (
										<SelectItem
											value=""
											disabled
										>
											Loading leads...
										</SelectItem>
									) : leads.length === 0 ? (
										<SelectItem
											value=""
											disabled
										>
											No leads available
										</SelectItem>
									) : (
										leads.map((lead) => (
											<SelectItem
												key={lead.leadId}
												value={lead.leadId.toString()}
											>
												{lead.name} - {lead.company}
											</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
							{form.formState.errors.leadId && <p className="text-sm text-destructive">{form.formState.errors.leadId.message}</p>}
						</div>

						<Separator />

						{/* Estimation Hours */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Project Estimations</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="frontendHours">Frontend Hours</Label>
									<Input
										id="frontendHours"
										type="number"
										min="0"
										step="0.5"
										placeholder="0"
										{...form.register("frontendHours", { valueAsNumber: true })}
									/>
									{form.formState.errors.frontendHours && <p className="text-sm text-destructive">{form.formState.errors.frontendHours.message}</p>}
								</div>

								<div className="space-y-2">
									<Label htmlFor="backendHours">Backend Hours</Label>
									<Input
										id="backendHours"
										type="number"
										min="0"
										step="0.5"
										placeholder="0"
										{...form.register("backendHours", { valueAsNumber: true })}
									/>
									{form.formState.errors.backendHours && <p className="text-sm text-destructive">{form.formState.errors.backendHours.message}</p>}
								</div>

								<div className="space-y-2">
									<Label htmlFor="uiUxHours">UI/UX Hours</Label>
									<Input
										id="uiUxHours"
										type="number"
										min="0"
										step="0.5"
										placeholder="0"
										{...form.register("uiUxHours", { valueAsNumber: true })}
									/>
									{form.formState.errors.uiUxHours && <p className="text-sm text-destructive">{form.formState.errors.uiUxHours.message}</p>}
								</div>

								<div className="space-y-2">
									<Label htmlFor="testingHours">Testing Hours</Label>
									<Input
										id="testingHours"
										type="number"
										min="0"
										step="0.5"
										placeholder="0"
										{...form.register("testingHours", { valueAsNumber: true })}
									/>
									{form.formState.errors.testingHours && <p className="text-sm text-destructive">{form.formState.errors.testingHours.message}</p>}
								</div>

								<div className="space-y-2">
									<Label htmlFor="pmHours">Project Management Hours</Label>
									<Input
										id="pmHours"
										type="number"
										min="0"
										step="0.5"
										placeholder="0"
										{...form.register("pmHours", { valueAsNumber: true })}
									/>
									{form.formState.errors.pmHours && <p className="text-sm text-destructive">{form.formState.errors.pmHours.message}</p>}
								</div>
							</div>
						</div>

						<Separator />

						{/* Pricing Configuration */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Pricing Configuration</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="hourlyRate">Hourly Rate *</Label>
									<Input
										id="hourlyRate"
										type="number"
										min="0.01"
										step="0.01"
										placeholder="100.00"
										{...form.register("hourlyRate", { valueAsNumber: true })}
									/>
									{form.formState.errors.hourlyRate && <p className="text-sm text-destructive">{form.formState.errors.hourlyRate.message}</p>}
								</div>

								<div className="space-y-2">
									<Label htmlFor="discountPercentage">Discount (%)</Label>
									<Input
										id="discountPercentage"
										type="number"
										min="0"
										max="100"
										step="0.1"
										placeholder="0"
										{...form.register("discountPercentage", { valueAsNumber: true })}
									/>
									{form.formState.errors.discountPercentage && <p className="text-sm text-destructive">{form.formState.errors.discountPercentage.message}</p>}
								</div>

								<div className="space-y-2">
									<Label htmlFor="currency">Currency</Label>
									<Select
										value={watchedValues.currency}
										onValueChange={(value) => form.setValue("currency", value)}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select currency" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="USD">USD - US Dollar</SelectItem>
											<SelectItem value="EUR">EUR - Euro</SelectItem>
											<SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
											<SelectItem value="GBP">GBP - British Pound</SelectItem>
										</SelectContent>
									</Select>
									{form.formState.errors.currency && <p className="text-sm text-destructive">{form.formState.errors.currency.message}</p>}
								</div>
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
										Creating...
									</>
								) : (
									<>
										<Save className="h-4 w-4 mr-2" />
										Create Quotation
									</>
								)}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
