"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { FormCheckbox } from "@/shared/ui/forms/FormCheckbox";
import { TaskDeliverable } from "@/_old/features/projects/types/taskDeliverable";
import { adminUpdateDeliverableSchema, AdminUpdateDeliverableFormData } from "../../schemas/adminDeliverableSchemas";
import { useAdminUpdateDeliverable } from "../../hooks/useAdminDeliverables";

interface AdminUpdateDeliverableDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deliverable: TaskDeliverable;
}

export function AdminUpdateDeliverableDialog({ open, onOpenChange, deliverable }: AdminUpdateDeliverableDialogProps) {
	const updateMutation = useAdminUpdateDeliverable();

	const form = useForm<AdminUpdateDeliverableFormData>({
		resolver: zodResolver(adminUpdateDeliverableSchema),
		defaultValues: {
			title: deliverable.title,
			description: deliverable.description || "",
			acceptanceCriteria: deliverable.acceptanceCriteria || "",
			submissionNotes: deliverable.submissionNotes || "",
			reviewNotes: deliverable.reviewNotes || "",
			pointsAwarded: deliverable.pointsAwarded,
			isBonus: deliverable.isBonus,
			order: deliverable.order,
		},
	});

	const onSubmit = (data: AdminUpdateDeliverableFormData) => {
		updateMutation.mutate(
			{ deliverableId: deliverable.deliverableId, data },
			{
				onSuccess: () => {
					onOpenChange(false);
					form.reset();
				},
			},
		);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Admin Update Deliverable</DialogTitle>
					<DialogDescription>Update any field regardless of status. All fields are optional.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormInput
							control={form.control}
							name="title"
							label="Title"
							placeholder="Deliverable title"
						/>

						<FormTextarea
							control={form.control}
							name="description"
							label="Description"
							placeholder="Deliverable description"
							rows={3}
						/>

						<FormTextarea
							control={form.control}
							name="acceptanceCriteria"
							label="Acceptance Criteria"
							placeholder="What defines completion?"
							rows={3}
						/>

						<FormTextarea
							control={form.control}
							name="submissionNotes"
							label="Submission Notes"
							placeholder="Developer submission notes"
							rows={2}
						/>

						<FormTextarea
							control={form.control}
							name="reviewNotes"
							label="Review Notes"
							placeholder="Reviewer feedback"
							rows={2}
						/>

						<div className="grid grid-cols-3 gap-4">
							<FormInput
								control={form.control}
								name="pointsAwarded"
								label="Points Awarded"
								type="number"
								min={0}
								max={100}
							/>

							<FormInput
								control={form.control}
								name="order"
								label="Order"
								type="number"
								min={1}
							/>

							<FormCheckbox
								control={form.control}
								name="isBonus"
								label="Is Bonus"
							/>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={updateMutation.isPending}
							>
								{updateMutation.isPending ? "Updating..." : "Update"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
