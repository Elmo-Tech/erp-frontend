"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Save, FileText, Calendar, DollarSign, ListChecks, Users } from "lucide-react";
import { toast } from "sonner";
import { useCreateContract, useCreateContractFromQuotation } from "../../../hooks/useContracts";
import { useQuotations } from "../../../hooks/useQuotations";
import { PaymentMilestonesBuilder } from "../../quotations/PaymentMilestonesBuilder";
import { validateMilestonePercentages, getDefaultMilestones } from "../../../schemas/contractSchema";
import { CreateContractPayload } from "../../../types/contract";
import { QuotationStatus } from "../../../types/quotation";
import { format, addDays } from "date-fns";
import { PaymentMilestone } from "../../../schemas/quotationSchema";

interface CreateContractDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	leadId?: number;
	leadName?: string;
	onSuccess?: (contractId: number) => void;
}

/**
 * Data source type for contracts
 */
type DataSource = "from_quotation" | "new_terms";

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
 * Party data interface
 */
interface PartyData {
	company: string;
	representative: string;
	title: string;
	address: string;
}

export const CreateContractDialog: React.FC<CreateContractDialogProps> = ({ open, onOpenChange, leadId, leadName, onSuccess }) => {
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Data source selection
	const [dataSource, setDataSource] = useState<DataSource>("from_quotation");

	// Common fields
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [expiryDays, setExpiryDays] = useState(30);
	const [projectDuration, setProjectDuration] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [deliverables, setDeliverables] = useState<string[]>([]);
	const [deliverableInput, setDeliverableInput] = useState("");

	// Party data
	const [partyOne, setPartyOne] = useState<PartyData>({
		company: "",
		representative: "",
		title: "",
		address: "",
	});
	const [partyTwo, setPartyTwo] = useState<PartyData>({
		company: "",
		representative: "",
		title: "",
		address: "",
	});

	// From quotation specific
	const [selectedQuotationId, setSelectedQuotationId] = useState<number | null>(null);

	// New terms specific
	const [totalAmount, setTotalAmount] = useState(0);
	const [currency, setCurrency] = useState("USD");
	const [milestones, setMilestones] = useState<PaymentMilestone[]>(() => getDefaultMilestones("standard"));

	// API hooks
	const createContractMutation = useCreateContract();
	const createFromQuotationMutation = useCreateContractFromQuotation();

	// Fetch approved quotations for lead
	const { data: quotationsData, isLoading: quotationsLoading } = useQuotations({
		leadId,
		perPage: 100,
	});

	// Get approved quotations only
	const approvedQuotations = useMemo(() => {
		if (!quotationsData?.quotations) return [];
		return quotationsData.quotations.filter((q) => q.status === QuotationStatus.APPROVED);
	}, [quotationsData?.quotations]);

	// Calculate milestone validation
	const milestoneValidation = useMemo(() => {
		return validateMilestonePercentages(milestones);
	}, [milestones]);

	// Calculate expiry date for display
	const expiryDate = useMemo(() => {
		return format(addDays(new Date(), expiryDays), "MMMM dd, yyyy");
	}, [expiryDays]);

	// Form validation
	const isFormValid = useMemo(() => {
		// Common validation
		const hasBasic = title && content && expiryDays > 0 && projectDuration && startDate && endDate;
		const hasPartyOne = partyOne.company && partyOne.representative && partyOne.title;
		const hasPartyTwo = partyTwo.company && partyTwo.representative;
		const hasDeliverables = dataSource === "from_quotation" ? true : deliverables.length > 0;

		if (dataSource === "from_quotation") {
			return hasBasic && hasPartyOne && hasPartyTwo && selectedQuotationId !== null;
		} else {
			return hasBasic && hasPartyOne && hasPartyTwo && hasDeliverables && totalAmount > 0 && milestoneValidation.isValid;
		}
	}, [dataSource, title, content, expiryDays, projectDuration, startDate, endDate, partyOne, partyTwo, deliverables.length, selectedQuotationId, totalAmount, milestoneValidation.isValid]);

	// Add deliverable
	const addDeliverable = () => {
		if (deliverableInput.trim()) {
			setDeliverables([...deliverables, deliverableInput.trim()]);
			setDeliverableInput("");
		}
	};

	// Remove deliverable
	const removeDeliverable = (index: number) => {
		setDeliverables(deliverables.filter((_, i) => i !== index));
	};

	// Handle submit
	const handleSubmit = async () => {
		try {
			setIsSubmitting(true);

			// Build common payload
			const commonPayload = {
				title,
				content,
				expiryDays,
				projectDuration,
				startDate,
				endDate,
				deliverables,
				partyOne: {
					company: partyOne.company,
					representative: partyOne.representative,
					title: partyOne.title,
					address: partyOne.address || undefined,
				},
				partyTwo: {
					company: partyTwo.company,
					representative: partyTwo.representative,
					title: partyTwo.title || undefined,
					address: partyTwo.address || undefined,
				},
			};

			if (dataSource === "from_quotation") {
				// Create from quotation
				if (!selectedQuotationId) {
					toast.error("Please select a quotation");
					return;
				}

				const payload: CreateContractPayload = {
					...commonPayload,
					dataSource: "from_quotation" as const,
					quotationId: selectedQuotationId,
				};

				// Use the from_quotation API
				const result = await createFromQuotationMutation.mutateAsync({
					quotationId: selectedQuotationId,
					payload,
				});

				toast.success("Contract created from quotation successfully");
				onSuccess?.(result.contractId);
			} else {
				if (deliverables.length === 0) {
					toast.error("Please add at least one deliverable");
					return;
				}

				// Create with new terms
				const payload: CreateContractPayload = {
					...commonPayload,
					dataSource: "new_terms" as const,
					totalAmount,
					currency,
					milestones: milestones.map((m) => ({
						title: m.name,
						percentage: m.percentage,
						dueDate: undefined,
						triggerType: "date" as const,
					})),
				};

				const result = await createContractMutation.mutateAsync(payload);

				toast.success("Contract created successfully");
				onSuccess?.(result.contractId);
			}

			// Reset form
			resetForm();
			onOpenChange(false);
		} catch (error) {
			console.error("Error creating contract:", error);
			toast.error("Failed to create contract");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Reset form
	const resetForm = () => {
		setDataSource("from_quotation");
		setTitle("");
		setContent("");
		setExpiryDays(30);
		setProjectDuration("");
		setStartDate("");
		setEndDate("");
		setDeliverables([]);
		setDeliverableInput("");
		setPartyOne({ company: "", representative: "", title: "", address: "" });
		setPartyTwo({ company: "", representative: "", title: "", address: "" });
		setSelectedQuotationId(null);
		setTotalAmount(0);
		setCurrency("USD");
		setMilestones(getDefaultMilestones("standard"));
	};

	// Reset when dialog closes
	useEffect(() => {
		if (!open) {
			resetForm();
		}
	}, [open]);

	// Pre-fill title when quotation is selected
	useEffect(() => {
		if (selectedQuotationId && approvedQuotations.length > 0) {
			const quotation = approvedQuotations.find((q) => q.quotationId === selectedQuotationId);
			if (quotation && !title) {
				setTitle(`Contract - ${quotation.quotationNumber}`);
			}
		}
	}, [selectedQuotationId, approvedQuotations, title]);

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create Contract</DialogTitle>
					<DialogDescription>Create a new contract for {leadName || "this lead"}</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Data Source Selection */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								Contract Source
							</CardTitle>
							<CardDescription>Choose how you want to create this contract</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<Label>Source Type</Label>
								<Select
									value={dataSource}
									onValueChange={(value: string) => setDataSource(value as DataSource)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select source type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="from_quotation">From Approved Quotation</SelectItem>
										<SelectItem value="new_terms">New Terms</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					{/* Dynamic Content Based on Data Source */}
					{dataSource === "from_quotation" ? (
						<Card>
							<CardHeader>
								<CardTitle>Quotation Selection</CardTitle>
								<CardDescription>Select an approved quotation to convert to contract</CardDescription>
							</CardHeader>
							<CardContent>
								{quotationsLoading ? (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="h-6 w-6 animate-spin" />
									</div>
								) : approvedQuotations.length === 0 ? (
									<div className="text-center py-8 text-muted-foreground">
										<p>No approved quotations available for this lead.</p>
										<p className="text-sm mt-1">Create and approve a quotation first.</p>
									</div>
								) : (
									<div className="space-y-2">
										<Label>Select Quotation</Label>
										<Select
											value={selectedQuotationId?.toString() || ""}
											onValueChange={(value) => setSelectedQuotationId(parseInt(value))}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select an approved quotation" />
											</SelectTrigger>
											<SelectContent>
												{approvedQuotations.map((quotation) => (
													<SelectItem
														key={quotation.quotationId}
														value={quotation.quotationId.toString()}
													>
														{quotation.quotationNumber} - {quotation.currency} {quotation.finalPrice.toLocaleString()}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}
							</CardContent>
						</Card>
					) : (
						<>
							{/* Pricing Section for New Terms */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<DollarSign className="h-5 w-5" />
										Pricing
									</CardTitle>
									<CardDescription>Enter the contract value and payment milestones</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="totalAmount">Total Amount</Label>
											<Input
												id="totalAmount"
												type="number"
												min={0}
												step={0.01}
												value={totalAmount}
												onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
												placeholder="0.00"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="currency">Currency</Label>
											<Select
												value={currency}
												onValueChange={setCurrency}
											>
												<SelectTrigger id="currency">
													<SelectValue placeholder="Select currency" />
												</SelectTrigger>
												<SelectContent>
													{CURRENCY_OPTIONS.map((option) => (
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
								</CardContent>
							</Card>

							{/* Payment Milestones */}
							<PaymentMilestonesBuilder
								totalAmount={totalAmount}
								milestones={milestones}
								onMilestonesChange={setMilestones}
								currency={currency}
							/>
						</>
					)}

					{/* Contract Details */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-5 w-5" />
								Contract Details
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Title */}
							<div className="space-y-2">
								<Label htmlFor="title">Contract Title</Label>
								<Input
									id="title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="e.g., Service Agreement - Project Name"
								/>
							</div>

							{/* Content */}
							<div className="space-y-2">
								<Label htmlFor="content">Contract Content</Label>
								<Textarea
									id="content"
									value={content}
									onChange={(e) => setContent(e.target.value)}
									placeholder="Enter the contract content..."
									rows={4}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Expiry Days */}
								<div className="space-y-2">
									<Label htmlFor="expiryDays">Valid For (Days)</Label>
									<Input
										id="expiryDays"
										type="number"
										min={1}
										max={365}
										value={expiryDays}
										onChange={(e) => setExpiryDays(parseInt(e.target.value) || 30)}
									/>
									<p className="text-sm text-muted-foreground">
										Expires on: <span className="font-medium">{expiryDate}</span>
									</p>
								</div>

								{/* Project Duration */}
								<div className="space-y-2">
									<Label htmlFor="projectDuration">Project Duration</Label>
									<Input
										id="projectDuration"
										value={projectDuration}
										onChange={(e) => setProjectDuration(e.target.value)}
										placeholder="e.g., 3 months"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Start Date */}
								<div className="space-y-2">
									<Label htmlFor="startDate">Start Date</Label>
									<Input
										id="startDate"
										type="date"
										value={startDate}
										onChange={(e) => setStartDate(e.target.value)}
									/>
								</div>

								{/* End Date */}
								<div className="space-y-2">
									<Label htmlFor="endDate">End Date</Label>
									<Input
										id="endDate"
										type="date"
										value={endDate}
										onChange={(e) => setEndDate(e.target.value)}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Parties */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="h-5 w-5" />
								Contract Parties
							</CardTitle>
							<CardDescription>Enter information for both parties</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Party One (Provider) */}
							<div className="space-y-4">
								<h4 className="font-medium">Party One (Service Provider)</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="partyOneCompany">Company Name</Label>
										<Input
											id="partyOneCompany"
											value={partyOne.company}
											onChange={(e) => setPartyOne({ ...partyOne, company: e.target.value })}
											placeholder="Your company name"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="partyOneRepresentative">Representative</Label>
										<Input
											id="partyOneRepresentative"
											value={partyOne.representative}
											onChange={(e) => setPartyOne({ ...partyOne, representative: e.target.value })}
											placeholder="Representative name"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="partyOneTitle">Title/Position</Label>
										<Input
											id="partyOneTitle"
											value={partyOne.title}
											onChange={(e) => setPartyOne({ ...partyOne, title: e.target.value })}
											placeholder="e.g., CEO, Manager"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="partyOneAddress">Address (Optional)</Label>
										<Input
											id="partyOneAddress"
											value={partyOne.address}
											onChange={(e) => setPartyOne({ ...partyOne, address: e.target.value })}
											placeholder="Company address"
										/>
									</div>
								</div>
							</div>

							{/* Party Two (Client) */}
							<div className="space-y-4">
								<h4 className="font-medium">Party Two (Client)</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="partyTwoCompany">Company Name</Label>
										<Input
											id="partyTwoCompany"
											value={partyTwo.company}
											onChange={(e) => setPartyTwo({ ...partyTwo, company: e.target.value })}
											placeholder="Client company name"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="partyTwoRepresentative">Representative</Label>
										<Input
											id="partyTwoRepresentative"
											value={partyTwo.representative}
											onChange={(e) => setPartyTwo({ ...partyTwo, representative: e.target.value })}
											placeholder="Client representative name"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="partyTwoTitle">Title/Position (Optional)</Label>
										<Input
											id="partyTwoTitle"
											value={partyTwo.title}
											onChange={(e) => setPartyTwo({ ...partyTwo, title: e.target.value })}
											placeholder="e.g., CEO, Manager"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="partyTwoAddress">Address (Optional)</Label>
										<Input
											id="partyTwoAddress"
											value={partyTwo.address}
											onChange={(e) => setPartyTwo({ ...partyTwo, address: e.target.value })}
											placeholder="Client address"
										/>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Deliverables */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<ListChecks className="h-5 w-5" />
								Deliverables
							</CardTitle>
							<CardDescription>List the deliverables for this contract</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-2">
								<Input
									value={deliverableInput}
									onChange={(e) => setDeliverableInput(e.target.value)}
									placeholder="Add a deliverable..."
									onKeyPress={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											addDeliverable();
										}
									}}
								/>
								<Button
									type="button"
									variant="outline"
									onClick={addDeliverable}
								>
									Add
								</Button>
							</div>

							{deliverables.length > 0 && (
								<div className="space-y-2">
									{deliverables.map((deliverable, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-2 bg-muted rounded-md"
										>
											<span className="text-sm">{deliverable}</span>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => removeDeliverable(index)}
											>
												×
											</Button>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!isFormValid || isSubmitting}
					>
						{isSubmitting ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Creating...
							</>
						) : (
							<>
								<Save className="h-4 w-4 mr-2" />
								Create Contract
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CreateContractDialog;
