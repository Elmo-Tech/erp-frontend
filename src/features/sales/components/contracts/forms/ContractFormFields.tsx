"use client";

import { Control, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { FormTextarea } from "@/components/shared/forms/FormTextarea";
import { MilestoneTriggerType } from "../../../types/contract";
import { Plus, Trash2, FileText } from "lucide-react";

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

interface ContractFormFieldsProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	quotationOptions: { value: string; label: string }[];
	activeTab: string;
	onTabChange: (tab: string) => void;
}

export function ContractFormFields({ control, quotationOptions, activeTab, onTabChange }: ContractFormFieldsProps) {
	const {
		fields: milestones,
		append: addMilestone,
		remove: removeMilestone,
	} = useFieldArray({
		control,
		name: "milestones",
	});

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

	return (
		<Tabs
			value={activeTab}
			onValueChange={onTabChange}
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
						control={control}
						name="quotationId"
						label="Quotation"
						placeholder="Select quotation"
						options={quotationOptions}
					/>
					<FormInput
						control={control}
						name="title"
						label="Contract Title"
						placeholder="Enter contract title"
					/>
				</div>

				<div className="grid grid-cols-3 gap-4">
					<FormInput
						control={control}
						name="totalAmount"
						label="Total Amount"
						type="number"
						step="0.01"
						placeholder="0.00"
					/>
					<FormSelect
						control={control}
						name="currency"
						label="Currency"
						options={CURRENCY_OPTIONS}
					/>
					<div />
				</div>

				<div className="grid grid-cols-2 gap-4">
					<FormInput
						control={control}
						name="startDate"
						label="Start Date"
						type="date"
					/>
					<FormInput
						control={control}
						name="endDate"
						label="End Date"
						type="date"
					/>
				</div>

				<FormTextarea
					control={control}
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
								control={control}
								name="partyOne.company"
								label="Company Name"
								placeholder="Enter company name"
							/>
							<FormInput
								control={control}
								name="partyOne.representative"
								label="Representative"
								placeholder="Enter representative name"
							/>
							<FormInput
								control={control}
								name="partyOne.title"
								label="Title"
								placeholder="Enter title/position"
							/>
							<FormTextarea
								control={control}
								name="partyOne.address"
								label="Address"
								placeholder="Enter company address"
								rows={2}
							/>
							<FormInput
								control={control}
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
								control={control}
								name="partyTwo.company"
								label="Company Name"
								placeholder="Enter company name"
							/>
							<FormInput
								control={control}
								name="partyTwo.representative"
								label="Representative"
								placeholder="Enter representative name"
							/>
							<FormInput
								control={control}
								name="partyTwo.title"
								label="Title"
								placeholder="Enter title/position"
							/>
							<FormTextarea
								control={control}
								name="partyTwo.address"
								label="Address"
								placeholder="Enter company address"
								rows={2}
							/>
							<FormInput
								control={control}
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
					control={control}
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
											control={control}
											name={`milestones.${index}.title`}
											label="Title"
											placeholder="Enter milestone title"
										/>
										<FormSelect
											control={control}
											name={`milestones.${index}.triggerType`}
											label="Trigger Type"
											options={TRIGGER_TYPE_OPTIONS}
										/>
									</div>
									<FormTextarea
										control={control}
										name={`milestones.${index}.description`}
										label="Description"
										placeholder="Enter milestone description"
										rows={2}
									/>
									<div className="grid grid-cols-3 gap-4">
										<FormInput
											control={control}
											name={`milestones.${index}.amount`}
											label="Amount"
											type="number"
											step="0.01"
											placeholder="0.00"
										/>
										<FormInput
											control={control}
											name={`milestones.${index}.percentage`}
											label="Percentage"
											type="number"
											step="0.01"
											min={0}
											max={100}
										/>
										<FormInput
											control={control}
											name={`milestones.${index}.dueDate`}
											label="Due Date"
											type="date"
										/>
									</div>
									<FormInput
										control={control}
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
	);
}
