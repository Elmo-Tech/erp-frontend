"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormDialog } from "@/shared/ui";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { FormDatePicker } from "@/shared/ui/forms/FormDatePicker";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import { Upload, Calendar, SkipForward, FileText, X, Check } from "lucide-react";
import { useEmployees } from "@/_old/features/hr/hooks/useEmployees";
import { createProposalSchema, ProposalActionType, CreateProposalFormData } from "../../../schemas/proposalSchema";
import { useCreateProposal } from "../../../hooks/useProposals";

interface CreateProposalDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	leadId: number;
	onSuccess?: () => void;
}

type CreateProposalFormValues = z.input<typeof createProposalSchema>;

const ACTION_TYPE_OPTIONS = [
	{
		value: ProposalActionType.UPLOAD,
		label: "Upload Now",
		description: "Upload the proposal PDF immediately",
		icon: Upload,
	},
	{
		value: ProposalActionType.SCHEDULE,
		label: "Schedule Task",
		description: "Create a task for someone to prepare the proposal",
		icon: Calendar,
	},
	{
		value: ProposalActionType.SKIP,
		label: "Skip Proposal",
		description: "Skip the proposal phase (requires reason)",
		icon: SkipForward,
	},
];

export function CreateProposalDialog({ open, onOpenChange, leadId, onSuccess }: CreateProposalDialogProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [fileError, setFileError] = useState<string>("");
	const createProposal = useCreateProposal();

	// Fetch employees for the dropdown
	const { data: employeesData } = useEmployees({ isActive: true, perPage: 100 });

	// Transform employees for select
	const employeeOptions = useMemo(() => {
		return (
			employeesData?.employees.map((emp) => ({
				value: emp.userId.toString(),
				label: emp.name,
			})) || []
		);
	}, [employeesData]);

	// Default values for the form
	const defaultValues = {
		title: "",
		actionType: ProposalActionType.UPLOAD as ProposalActionType,
		expiryDays: 30,
		skipReason: "",
		taskAssignedTo: undefined as number | undefined,
		taskDueDate: "",
		file: undefined,
	};

	const form = useForm<CreateProposalFormValues, undefined, CreateProposalFormData>({
		resolver: zodResolver(createProposalSchema),
		defaultValues: defaultValues as Partial<CreateProposalFormValues>,
		mode: "onChange",
	});

	const {
		watch,
		setValue,
		handleSubmit,
		reset,
		formState: { isValid },
	} = form;

	const watchedValues = watch();
	const watchedActionType = watchedValues.actionType;
	const watchedSkipReason = "skipReason" in watchedValues ? watchedValues.skipReason || "" : "";

	// Calculate character count for skip reason
	const skipReasonCharCount = watchedSkipReason.length;
	const skipReasonMinChars = 30;

	// Check if form is valid based on current action type
	const isFormValid = useMemo(() => {
		if (!watchedActionType) return false;

		switch (watchedActionType) {
			case ProposalActionType.UPLOAD:
				return isValid && selectedFile !== null;
			case ProposalActionType.SCHEDULE:
				return isValid;
			case ProposalActionType.SKIP:
				return isValid && skipReasonCharCount >= skipReasonMinChars;
			default:
				return false;
		}
	}, [watchedActionType, isValid, selectedFile, skipReasonCharCount]);

	// Handle file selection
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file type
			if (file.type !== "application/pdf") {
				setFileError("Only PDF files are allowed");
				setSelectedFile(null);
				setValue("file" as never, undefined as never, { shouldValidate: true, shouldDirty: true });
				return;
			}
			// Validate file size (max 10MB)
			if (file.size > 10 * 1024 * 1024) {
				setFileError("File size must be less than 10MB");
				setSelectedFile(null);
				setValue("file" as never, undefined as never, { shouldValidate: true, shouldDirty: true });
				return;
			}
			setFileError("");
			setSelectedFile(file);
			setValue("file" as never, file as never, { shouldValidate: true, shouldDirty: true });
		}
	};

	// Remove selected file
	const handleRemoveFile = () => {
		setSelectedFile(null);
		setFileError("");
		setValue("file" as never, undefined as never, { shouldValidate: true, shouldDirty: true });
	};

	const handleActionTypeChange = (value: ProposalActionType) => {
		setValue("actionType", value as never, { shouldValidate: true, shouldDirty: true });

		if (value !== ProposalActionType.UPLOAD) {
			handleRemoveFile();
		}
	};

	// Handle form submission
	const onSubmit = async (data: CreateProposalFormData) => {
		try {
			const formData = new FormData();
			formData.append("leadId", leadId.toString());
			formData.append("title", data.title);
			formData.append("actionType", data.actionType);

			if ("expiryDays" in data) {
				formData.append("expiryDays", data.expiryDays.toString());
			}

			switch (data.actionType) {
				case ProposalActionType.UPLOAD:
					if (selectedFile) {
						formData.append("file", selectedFile);
					}
					break;
				case ProposalActionType.SCHEDULE:
					if ("taskAssignedTo" in data && data.taskAssignedTo) {
						formData.append("taskAssignedTo", data.taskAssignedTo.toString());
					}
					if ("taskDueDate" in data && data.taskDueDate) {
						formData.append("taskDueDate", data.taskDueDate);
					}
					break;
				case ProposalActionType.SKIP:
					if ("skipReason" in data && data.skipReason) {
						formData.append("skipReason", data.skipReason);
					}
					break;
			}

			await createProposal.mutateAsync(formData);
			handleClose();
			onSuccess?.();
		} catch {
			// Errors are surfaced by the shared mutation hook.
		}
	};

	// Handle dialog close
	const handleClose = () => {
		reset(defaultValues as Partial<CreateProposalFormValues>);
		setSelectedFile(null);
		setFileError("");
		onOpenChange(false);
	};

	const RadioGroupItem = ({ value: itemValue, id, checked, onChange }: { value: string; id?: string; checked?: boolean; onChange?: () => void }) => {
		return (
			<input
				type="radio"
				id={id}
				name="actionType"
				value={itemValue}
				checked={checked}
				onChange={onChange}
				className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
			/>
		);
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) {
					handleClose();
					return;
				}
				onOpenChange(nextOpen);
			}}
			title="Create Proposal"
			description="Create a new technical proposal for this lead"
			showFooter={false}
			size="lg"
		>
			<Form {...form}>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-6"
				>
					{/* Title Input */}
					<FormInput
						control={form.control}
						name="title"
						label="Proposal Title"
						placeholder="Enter proposal title"
					/>

					{/* Expiry Days Input (hidden when Skip is selected) */}
					{watchedActionType !== ProposalActionType.SKIP && (
						<FormInput
							control={form.control}
							name="expiryDays"
							label="Expiry Days"
							type="number"
							min={1}
							max={365}
							placeholder="Number of days until expiry"
						/>
					)}

					{/* Delivery Method Radio Group */}
					<div className="space-y-3">
						<Label className="text-sm font-medium">Delivery Method</Label>
						<div className="flex flex-col gap-2">
							{ACTION_TYPE_OPTIONS.map((option) => {
								const Icon = option.icon;
								const isSelected = watchedActionType === option.value;
								return (
									<div
										key={option.value}
										className={cn("flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors", isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50")}
										onClick={() => handleActionTypeChange(option.value as ProposalActionType)}
									>
										<RadioGroupItem
											value={option.value}
											id={option.value}
											checked={isSelected}
											onChange={() => handleActionTypeChange(option.value as ProposalActionType)}
										/>
										<div className="flex-1">
											<Label
												htmlFor={option.value}
												className="flex items-center gap-2 font-medium cursor-pointer"
											>
												<Icon className="h-4 w-4" />
												{option.label}
											</Label>
											<p className="text-sm text-muted-foreground">{option.description}</p>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Dynamic Content Based on Action Type */}
					{/* Upload Section */}
					{watchedActionType === ProposalActionType.UPLOAD && (
						<div className="space-y-3">
							<Label className="text-sm font-medium">Proposal File</Label>
							<div className={cn("border-2 border-dashed rounded-lg p-6 text-center transition-colors", selectedFile ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
								{selectedFile ? (
									<div className="flex items-center justify-center gap-3">
										<FileText className="h-8 w-8 text-primary" />
										<div className="flex-1 text-left">
											<p className="font-medium">{selectedFile.name}</p>
											<p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={handleRemoveFile}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								) : (
									<>
										<Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
										<p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
										<p className="text-xs text-muted-foreground">PDF only, max 10MB</p>
										<Input
											type="file"
											accept=".pdf"
											className="hidden"
											id="proposal-file"
											onChange={handleFileChange}
										/>
										<Button
											type="button"
											variant="outline"
											className="mt-3"
											onClick={() => document.getElementById("proposal-file")?.click()}
										>
											Select File
										</Button>
									</>
								)}
							</div>
							{fileError && <p className="text-sm text-destructive">{fileError}</p>}
						</div>
					)}

					{/* Schedule Section */}
					{watchedActionType === ProposalActionType.SCHEDULE && (
						<div className="space-y-4">
							<FormSelect
								control={form.control}
								name="taskAssignedTo"
								label="Assign To"
								placeholder="Select team member"
								options={employeeOptions}
							/>
							<FormDatePicker
								control={form.control}
								name="taskDueDate"
								label="Due Date"
								placeholder="Select due date"
								minDate={new Date()}
							/>
						</div>
					)}

					{/* Skip Section */}
					{watchedActionType === ProposalActionType.SKIP && (
						<div className="space-y-3">
							<FormTextarea
								control={form.control}
								name="skipReason"
								label="Skip Reason"
								placeholder="Explain why the proposal phase is being skipped (minimum 30 characters)"
								rows={4}
								textareaClassName="resize-none"
							/>
							<div className="flex justify-between text-sm">
								<span className={skipReasonCharCount >= skipReasonMinChars ? "text-green-600" : "text-muted-foreground"}>
									{skipReasonCharCount >= skipReasonMinChars ? (
										<span className="flex items-center gap-1">
											<Check className="h-3 w-3" />
											Minimum characters met
										</span>
									) : (
										`${skipReasonCharCount}/${skipReasonMinChars} characters minimum`
									)}
								</span>
							</div>
						</div>
					)}

					{/* Submit Button */}
					<div className="flex justify-end gap-2 pt-4 border-t">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!isFormValid || createProposal.isPending}
						>
							Create Proposal
						</Button>
					</div>
				</form>
			</Form>
		</FormDialog>
	);
}
