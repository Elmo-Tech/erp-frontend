"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormTextarea } from "@/components/shared/forms/FormTextarea";
import { FormCheckbox } from "@/components/shared/forms/FormCheckbox";
import { TaskDeliverable } from "@/features/projects/types/taskDeliverable";
import { adminForceApproveSchema, AdminForceApproveFormData } from "../../schemas/adminDeliverableSchemas";
import { useAdminForceApprove } from "../../hooks/useAdminDeliverables";

interface AdminForceApproveDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deliverable: TaskDeliverable;
}

export function AdminForceApproveDialog({ open, onOpenChange, deliverable }: AdminForceApproveDialogProps) {
	const forceApproveMutation = useAdminForceApprove();

	const form = useForm<AdminForceApproveFormData>({
		resolver: zodResolver(adminForceApproveSchema),
		defaultValues: { reviewNotes: "", pointsAwarded: 0, isBonus: false },
	});

	const onSubmit = (data: AdminForceApproveFormData) => {
		forceApproveMutation.mutate(
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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Force Approve Deliverable</DialogTitle>
					<DialogDescription>Approve directly without review process. Use only in exceptional cases.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormTextarea
							control={form.control}
							name="reviewNotes"
							label="Review Notes *"
							placeholder="Explain why you're force approving..."
							rows={3}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormInput
								control={form.control}
								name="pointsAwarded"
								label="Points Awarded *"
								type="number"
								min={0}
								max={100}
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
								disabled={forceApproveMutation.isPending}
								className="bg-green-600 hover:bg-green-700"
							>
								{forceApproveMutation.isPending ? "Approving..." : "Force Approve"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
