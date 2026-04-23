/**
 * Create Change Request Dialog
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/shared/ui/form";
import { FormDialog, FormInput, FormTextarea, FormSwitch } from "@/shared/ui";
import { CreateChangeRequestPayload } from "../../../types/changeRequest";

const createCRSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	impactAnalysis: z.string().optional(),
	isBillable: z.boolean(),
	estimatedHours: z.number().min(0),
	estimatedCost: z.number().min(0),
	additionalDays: z.number().min(0).optional(),
});

type CreateCRFormData = z.infer<typeof createCRSchema>;

interface CreateCRDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (payload: CreateChangeRequestPayload) => void;
	isLoading: boolean;
}

export function CreateCRDialog({ open, onOpenChange, onSubmit, isLoading }: CreateCRDialogProps) {
	const form = useForm<CreateCRFormData>({
		resolver: zodResolver(createCRSchema),
		defaultValues: {
			title: "",
			description: "",
			impactAnalysis: "",
			isBillable: true,
			estimatedHours: 0,
			estimatedCost: 0,
			additionalDays: 0,
		},
	});

	const handleSubmit = (data: CreateCRFormData) => {
		onSubmit(data);
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="New Change Request"
			submitLabel="Create"
			isLoading={isLoading}
			onSubmit={form.handleSubmit(handleSubmit)}
			size="lg"
		>
			<Form {...form}>
				<div className="space-y-4">
					<FormInput
						control={form.control}
						name="title"
						label="Title *"
						placeholder="Enter title..."
					/>

					<FormTextarea
						control={form.control}
						name="description"
						label="Description *"
						placeholder="Enter description..."
						rows={3}
					/>

					<FormTextarea
						control={form.control}
						name="impactAnalysis"
						label="Impact Analysis"
						placeholder="Enter impact analysis..."
						rows={2}
					/>

					<div className="grid grid-cols-2 gap-4">
						<FormInput
							control={form.control}
							name="estimatedHours"
							label="Estimated Hours *"
							type="number"
							min={0}
							step={0.5}
						/>

						<FormInput
							control={form.control}
							name="estimatedCost"
							label="Estimated Cost *"
							type="number"
							min={0}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<FormInput
							control={form.control}
							name="additionalDays"
							label="Additional Days"
							type="number"
							min={0}
						/>

						<FormSwitch
							control={form.control}
							name="isBillable"
							label="Billable"
							className="mt-6"
						/>
					</div>
				</div>
			</Form>
		</FormDialog>
	);
}
