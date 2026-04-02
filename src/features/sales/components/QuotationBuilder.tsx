"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form } from "@/components/ui/form";
import { Loader2, Calculator, Save } from "lucide-react";
import { useLeads } from "../hooks/useLeads";
import { useCalculatePricing } from "../hooks/useCalculatePricing";
import { useCreateQuotation, useUpdateQuotation, useUpdateQuotationStatus } from "../hooks/useQuotations";
import { CreateQuotationPayload, UpdateQuotationPayload, Estimations } from "../types/quotation";
import { PricingBreakdown } from "./PricingBreakdown";
import { QuotationFormFields, quotationSchema, getDefaultValues, QuotationFormData } from "./quotations/builder";
import { toast } from "sonner";

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
		defaultValues: getDefaultValues(initialData),
		values: initialData ? getDefaultValues(initialData) : undefined,
	});

	const watchedValues = form.watch();

	const { data: leadsResponse, isLoading: leadsLoading } = useLeads();
	const createQuotationMutation = useCreateQuotation();
	const updateQuotationMutation = useUpdateQuotation();
	const updateStatusMutation = useUpdateQuotationStatus();

	const leadOptions = useMemo(() => {
		if (leadsLoading) return [{ value: "loading", label: "Loading leads...", disabled: true }];
		const leads = leadsResponse?.leads || [];
		if (leads.length === 0) return [{ value: "no-leads", label: "No leads available", disabled: true }];
		return leads.map((lead) => ({
			value: lead.leadId.toString(),
			label: `${lead.name}${lead.company ? ` - ${lead.company}` : ""}`,
		}));
	}, [leadsResponse?.leads, leadsLoading]);

	const pricingPayload = useMemo(() => {
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

		return { estimations, hourlyRate, discountPercentage: discountPercentage || 0 };
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
					title: data.title,
					estimations,
					hourlyRate: data.hourlyRate,
					discountPercentage: data.discountPercentage,
					currency: data.currency,
				};

				await updateQuotationMutation.mutateAsync({ id: initialData.quotationId, payload });

				if (data.status !== initialData.status) {
					await updateStatusMutation.mutateAsync({ id: initialData.quotationId, payload: { status: data.status } });
				}

				toast.success("Quotation updated successfully");
				onSuccess?.(initialData.quotationId);
			} else {
				const payload: CreateQuotationPayload = {
					leadId: data.leadId,
					title: data.title,
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
							<QuotationFormFields
								form={form}
								leadOptions={leadOptions}
							/>

							<Separator />

							{/* Real-time Pricing Breakdown */}
							<PricingSection
								pricingBreakdown={pricingBreakdown}
								pricingLoading={pricingLoading}
								pricingError={pricingError}
								currency={watchedValues.currency}
							/>

							{/* Form Actions */}
							<FormActions
								onCancel={onCancel}
								isSubmitting={isSubmitting}
								isValid={form.formState.isValid}
								hasPricing={!!pricingBreakdown}
								isEditing={isEditing}
							/>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};

interface PricingSectionProps {
	pricingBreakdown: ReturnType<typeof useCalculatePricing>["data"];
	pricingLoading: boolean;
	pricingError: Error | null;
	currency: string;
}

function PricingSection({ pricingBreakdown, pricingLoading, pricingError, currency }: PricingSectionProps) {
	return (
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
					currency={currency}
				/>
			) : (
				<div className="p-4 border border-muted rounded-md bg-muted/5">
					<p className="text-sm text-muted-foreground">Enter estimation hours and hourly rate to see pricing breakdown</p>
				</div>
			)}
		</div>
	);
}

interface FormActionsProps {
	onCancel?: () => void;
	isSubmitting: boolean;
	isValid: boolean;
	hasPricing: boolean;
	isEditing: boolean;
}

function FormActions({ onCancel, isSubmitting, isValid, hasPricing, isEditing }: FormActionsProps) {
	return (
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
				disabled={isSubmitting || !isValid || !hasPricing}
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
	);
}
