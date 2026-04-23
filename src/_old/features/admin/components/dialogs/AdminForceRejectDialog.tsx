"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { TaskDeliverable } from "@/_old/features/projects/types/taskDeliverable";
import { adminForceRejectSchema, AdminForceRejectFormData } from "../../schemas/adminDeliverableSchemas";
import { useAdminForceReject } from "../../hooks/useAdminDeliverables";

interface AdminForceRejectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deliverable: TaskDeliverable;
}

export function AdminForceRejectDialog({ open, onOpenChange, deliverable }: AdminForceRejectDialogProps) {
	const forceRejectMutation = useAdminForceReject();

	const form = useForm<AdminForceRejectFormData>({
		resolver: zodResolver(adminForceRejectSchema),
		defaultValues: { reviewNotes: "", pointsAwarded: 0 },
	});

	const onSubmit = (data: AdminForceRejectFormData) => {
		forceRejectMutation.mutate(
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
					<DialogTitle>Force Reject Deliverable</DialogTitle>
					<DialogDescription>Reject directly without review process. Use only in exceptional cases.</DialogDescription>
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
							placeholder="Explain why you're force rejecting..."
							rows={3}
						/>

						<FormInput
							control={form.control}
							name="pointsAwarded"
							label="Points Awarded (optional)"
							type="number"
							min={0}
							max={100}
						/>

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
								disabled={forceRejectMutation.isPending}
								variant="destructive"
							>
								{forceRejectMutation.isPending ? "Rejecting..." : "Force Reject"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
