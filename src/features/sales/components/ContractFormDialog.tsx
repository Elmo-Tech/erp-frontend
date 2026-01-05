"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog } from "@/components/shared/dialogs/FormDialog";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { FormTextarea } from "@/components/shared/forms/FormTextarea";
import { createContractSchema } from "../schemas/contractSchema";
import { Contract, MilestoneTriggerType } from "../types/contract";
import { useCreateContract, useUpdateContract } from "../hooks/useContracts";
import { useQuotations } from "../hooks/useQuotations";
import { Plus, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

const CURRENCY_OPTIONS = [
	{ value: "USD", label: "USD - US Dollar" },
	{ value: "EUR", label: "EUR - Euro" },
	{ value: "GBP", label: "GBP - British Pound" },
	{ value: "EGP", label: "EGP - Egyptian Pound" },
];

const TRIGGER_TYPE_OPTIONS = [
	{ value: MilestoneTriggerType.IMMEDIATE, label: "Immediate" },
	{ value: MilestoneTriggerType.PROJECT_STATUS, label: "Project Status" },
	{ value: MilestoneTriggerType.DELIVERABLE, label: "Deliverable" },
	{ value: MilestoneTriggerType.DATE, label: "Date" },
];

interface ContractFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	contract?: Contract | null;
	quotationId?: number;
	onSuccess?: () => void;
}

export function ContractFormDialog({ open, onOpenChange, contract, quotationId, onSuccess }: ContractFormDialogProps) {
	const [activeTab, setActiveTab] = useState("details");
	const isEditing = !!contract;
	const createMutation = useCreateContract();
	const updateMutation = useUpdateContract();

	// Fetch quotations for dropdown - filter approved ones
	const { data: quotationsData } = useQuotations();

	const form = useForm({
		resolver: zodResolver(createContractSchema),
		defaultValues: {
			quotationId: quotationId?.toString() || "",
			title: "",
			content: "",
			partyOne: {
				company: "",
				representative: "",
				title: "",
				address: "",
				idNumber: "",
			},
			partyTwo: {
				company: "",
				representative: "",
				title: "",
				address: "",
				idNumber: "",
			},
			totalAmount: 0,
			currency: "USD",
			paymentTerms: "",
			startDate: "",
			endDate: "",
			milestones: [],
		},
	});

	const {
		fields: milestones,
		append: addMilestone,
		remove: removeMilestone,
	} = useFieldArray({
		control: form.control,
		name: "milestones",
	});

	// Watch quotationId to auto-fill price and currency
	const selectedQuotationId = form.watch("quotationId");

	useEffect(() => {
		if (selectedQuotationId && quotationsData?.quotations) {
			const selectedQuotation = quotationsData.quotations.find((q) => q.quotationId.toString() === selectedQuotationId);
			if (selectedQuotation) {
				form.setValue("totalAmount", selectedQuotation.finalPrice);
				form.setValue("currency", selectedQuotation.currency);
			}
		}
	}, [selectedQuotationId, quotationsData, form]);

	// Reset form when dialog opens/closes
	useEffect(() => {
		if (open) {
			if (contract) {
				form.reset({
					quotationId: contract.quotationId?.toString() || "",
					title: contract.title,
					content: contract.content,
					partyOne: contract.partyOne,
					partyTwo: contract.partyTwo,
					totalAmount: contract.totalAmount,
					currency: contract.currency,
					paymentTerms: contract.paymentTerms,
					startDate: contract.startDate,
					endDate: contract.endDate || "",
					milestones: contract.milestones || [],
				});
			} else {
				const initialQuotationId = quotationId?.toString() || "";
				let initialAmount = 0;
				let initialCurrency = "USD";

				if (initialQuotationId && quotationsData?.quotations) {
					const selectedQuotation = quotationsData.quotations.find((q) => q.quotationId.toString() === initialQuotationId);
					if (selectedQuotation) {
						initialAmount = selectedQuotation.finalPrice;
						initialCurrency = selectedQuotation.currency;
					}
				}

				form.reset({
					quotationId: initialQuotationId,
					title: "",
					content: "",
					partyOne: {
						company: "",
						representative: "",
						title: "",
						address: "",
						idNumber: "",
					},
					partyTwo: {
						company: "",
						representative: "",
						title: "",
						address: "",
						idNumber: "",
					},
					totalAmount: initialAmount,
					currency: initialCurrency,
					paymentTerms: "",
					startDate: "",
					endDate: "",
					milestones: [],
				});
			}
		}
	}, [open, contract, quotationId, form, quotationsData]);

	const onSubmit = async (data: unknown) => {
		try {
			// Convert quotationId from string to number for API
			const formData = data as Record<string, unknown>;
			const payload = {
				...formData,
				quotationId: formData.quotationId ? parseInt(formData.quotationId as string, 10) : undefined,
			};

			if (isEditing && contract) {
				await updateMutation.mutateAsync({
					id: contract.contractId,
					payload: payload as Parameters<typeof updateMutation.mutateAsync>[0]["payload"],
				});
				toast.success("Contract updated successfully");
			} else {
				await createMutation.mutateAsync(payload as Parameters<typeof createMutation.mutateAsync>[0]);
				toast.success("Contract created successfully");
			}
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error(isEditing ? "Failed to update contract" : "Failed to create contract");
		}
	};

	const handleAddMilestone = () => {
		addMilestone({
			title: "",
			description: "",
			amount: 0,
			percentage: 0,
			triggerType: MilestoneTriggerType.IMMEDIATE,
			sortOrder: milestones.length,
		});
	};

	const isLoading = createMutation.isPending || updateMutation.isPending;

	const quotationOptions =
		quotationsData?.quotations
			?.filter((q) => q.status === "approved")
			?.map((q) => ({
				value: q.quotationId.toString(),
				label: `#${q.quotationId} - ${q.lead?.company || q.lead?.name || "Unknown"} (${q.currency} ${q.finalPrice.toLocaleString()})`,
			})) || [];

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title={isEditing ? "Edit Contract" : "Create Contract"}
			description={isEditing ? "Update contract details" : "Create a new contract"}
			onSubmit={form.handleSubmit(onSubmit)}
			submitLabel={isEditing ? "Update Contract" : "Create Contract"}
			isLoading={isLoading}
			size="full"
			className="max-w-4xl"
		>
			<Form {...form}>
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
				>
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="details">Details</TabsTrigger>
						<TabsTrigger value="parties">Parties</TabsTrigger>
						<TabsTrigger value="content">Content</TabsTrigger>
						<TabsTrigger value="milestones">Milestones</TabsTrigger>
					</TabsList>

					<TabsContent
						value="details"
						className="space-y-4"
					>
						<div className="grid grid-cols-2 gap-4">
							<FormSelect
								control={form.control}
								name="quotationId"
								label="Quotation"
								placeholder="Select quotation"
								options={quotationOptions}
							/>

							<FormInput
								control={form.control}
								name="title"
								label="Contract Title"
								placeholder="Enter contract title"
							/>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<FormInput
								control={form.control}
								name="totalAmount"
								label="Total Amount"
								type="number"
								step="0.01"
								placeholder="0.00"
							/>

							<FormSelect
								control={form.control}
								name="currency"
								label="Currency"
								options={CURRENCY_OPTIONS}
							/>

							<div />
						</div>

						<div className="grid grid-cols-2 gap-4">
							<FormInput
								control={form.control}
								name="startDate"
								label="Start Date"
								type="date"
							/>

							<FormInput
								control={form.control}
								name="endDate"
								label="End Date"
								type="date"
							/>
						</div>

						<FormTextarea
							control={form.control}
							name="paymentTerms"
							label="Payment Terms"
							placeholder="Enter payment terms"
							rows={3}
						/>
					</TabsContent>

					<TabsContent
						value="parties"
						className="space-y-4"
					>
						<div className="grid grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Party One</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<FormInput
										control={form.control}
										name="partyOne.company"
										label="Company Name"
										placeholder="Enter company name"
									/>

									<FormInput
										control={form.control}
										name="partyOne.representative"
										label="Representative"
										placeholder="Enter representative name"
									/>

									<FormInput
										control={form.control}
										name="partyOne.title"
										label="Title"
										placeholder="Enter title/position"
									/>

									<FormTextarea
										control={form.control}
										name="partyOne.address"
										label="Address"
										placeholder="Enter company address"
										rows={2}
									/>

									<FormInput
										control={form.control}
										name="partyOne.idNumber"
										label="ID/Registration Number"
										placeholder="Enter ID number"
									/>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Party Two</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<FormInput
										control={form.control}
										name="partyTwo.company"
										label="Company Name"
										placeholder="Enter company name"
									/>

									<FormInput
										control={form.control}
										name="partyTwo.representative"
										label="Representative"
										placeholder="Enter representative name"
									/>

									<FormInput
										control={form.control}
										name="partyTwo.title"
										label="Title"
										placeholder="Enter title/position"
									/>

									<FormTextarea
										control={form.control}
										name="partyTwo.address"
										label="Address"
										placeholder="Enter company address"
										rows={2}
									/>

									<FormInput
										control={form.control}
										name="partyTwo.idNumber"
										label="ID/Registration Number"
										placeholder="Enter ID number"
									/>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent
						value="content"
						className="space-y-4"
					>
						<FormTextarea
							control={form.control}
							name="content"
							label="Contract Content"
							placeholder="Enter contract content"
							rows={15}
							textareaClassName="font-mono text-sm"
						/>
					</TabsContent>

					<TabsContent
						value="milestones"
						className="space-y-4"
					>
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-medium">Milestones</h3>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleAddMilestone}
							>
								<Plus className="mr-2 h-4 w-4" />
								Add Milestone
							</Button>
						</div>

						{milestones.length === 0 ? (
							<Card>
								<CardContent className="flex flex-col items-center justify-center py-8 text-center">
									<FileText className="mb-2 h-8 w-8 text-muted-foreground" />
									<p>No milestones added yet</p>
									<p className="text-sm text-muted-foreground">Click &quot;Add Milestone&quot; to get started</p>
								</CardContent>
							</Card>
						) : (
							<div className="space-y-4">
								{milestones.map((milestone, index) => (
									<Card key={milestone.id}>
										<CardHeader className="pb-3">
											<div className="flex items-center justify-between">
												<CardTitle className="text-base">Milestone {index + 1}</CardTitle>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removeMilestone(index)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="grid grid-cols-2 gap-4">
												<FormInput
													control={form.control}
													name={`milestones.${index}.title`}
													label="Title"
													placeholder="Enter milestone title"
												/>

												<FormSelect
													control={form.control}
													name={`milestones.${index}.triggerType`}
													label="Trigger Type"
													options={TRIGGER_TYPE_OPTIONS}
												/>
											</div>

											<FormTextarea
												control={form.control}
												name={`milestones.${index}.description`}
												label="Description"
												placeholder="Enter milestone description"
												rows={2}
											/>

											<div className="grid grid-cols-3 gap-4">
												<FormInput
													control={form.control}
													name={`milestones.${index}.amount`}
													label="Amount"
													type="number"
													step="0.01"
													placeholder="0.00"
												/>

												<FormInput
													control={form.control}
													name={`milestones.${index}.percentage`}
													label="Percentage"
													type="number"
													step="0.01"
													min={0}
													max={100}
												/>

												<FormInput
													control={form.control}
													name={`milestones.${index}.dueDate`}
													label="Due Date"
													type="date"
												/>
											</div>

											<FormInput
												control={form.control}
												name={`milestones.${index}.triggerValue`}
												label="Trigger Value"
												placeholder="Enter trigger value (optional)"
											/>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</TabsContent>
				</Tabs>
			</Form>
		</FormDialog>
	);
}
