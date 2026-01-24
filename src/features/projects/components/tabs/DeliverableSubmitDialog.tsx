"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Award } from "lucide-react";
import { toast } from "sonner";
import { TaskDeliverable } from "../../types/taskDeliverable";
import { submitDeliverableSchema, SubmitDeliverableFormData } from "../../schemas/deliverableSchemas";
import { useSubmitTaskDeliverable } from "../../hooks/useTaskDeliverables";

interface DeliverableSubmitDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deliverable: TaskDeliverable | null;
}

export function DeliverableSubmitDialog({ open, onOpenChange, deliverable }: DeliverableSubmitDialogProps) {
	const submitDeliverable = useSubmitTaskDeliverable();

	const form = useForm<SubmitDeliverableFormData>({
		resolver: zodResolver(submitDeliverableSchema),
		defaultValues: {
			submissionNotes: "",
		},
	});

	const onSubmit = async (data: SubmitDeliverableFormData) => {
		if (!deliverable) return;

		try {
			await submitDeliverable.mutateAsync({
				deliverableId: deliverable.deliverableId,
				data,
			});
			toast.success("Deliverable submitted for review");
			onOpenChange(false);
			form.reset();
		} catch (error) {
			toast.error("Failed to submit deliverable");
		}
	};

	if (!deliverable) return null;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Send className="h-5 w-5" />
						Submit Deliverable
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{/* Deliverable Info */}
					<div className="p-4 bg-muted rounded-lg">
						<div className="flex items-center gap-2 mb-2">
							<h4 className="font-semibold">{deliverable.title}</h4>
							{deliverable.isBonus && (
								<Badge
									variant="secondary"
									className="text-xs"
								>
									<Award className="h-3 w-3 mr-1" />
									Bonus
								</Badge>
							)}
						</div>

						{deliverable.description && <p className="text-sm text-muted-foreground mb-2">{deliverable.description}</p>}

						{deliverable.acceptanceCriteria && (
							<div>
								<h5 className="text-xs font-medium text-muted-foreground mb-1">Acceptance Criteria:</h5>
								<p className="text-sm">{deliverable.acceptanceCriteria}</p>
							</div>
						)}
					</div>

					{/* Submission Form */}
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4"
						>
							<FormField
								control={form.control}
								name="submissionNotes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Submission Notes</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Add any notes about your submission (optional)"
												className="min-h-[100px]"
												{...field}
											/>
										</FormControl>
										<FormDescription>Provide any additional context or notes for the reviewer</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Form Actions */}
							<div className="flex justify-end gap-3">
								<Button
									type="button"
									variant="outline"
									onClick={() => onOpenChange(false)}
									disabled={submitDeliverable.isPending}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={submitDeliverable.isPending}
								>
									{submitDeliverable.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
									<Send className="h-4 w-4 mr-2" />
									Submit for Review
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
