"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TaskDeliverable } from "../../types/taskDeliverable";
import { createDeliverableSchema, updateDeliverableSchema, CreateDeliverableFormData, UpdateDeliverableFormData } from "../../schemas/deliverableSchemas";
import { useCreateTaskDeliverable, useUpdateTaskDeliverable } from "../../hooks/useTaskDeliverables";

interface DeliverableFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	taskId: number;
	deliverable?: TaskDeliverable | null;
	mode: "create" | "edit";
}

export function DeliverableFormDialog({ open, onOpenChange, taskId, deliverable, mode }: DeliverableFormDialogProps) {
	const createDeliverable = useCreateTaskDeliverable();
	const updateDeliverable = useUpdateTaskDeliverable();

	const isEditing = mode === "edit" && deliverable;
	const schema = isEditing ? updateDeliverableSchema : createDeliverableSchema;

	const form = useForm<CreateDeliverableFormData | UpdateDeliverableFormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			title: "",
			description: "",
			acceptanceCriteria: "",
			isBonus: false,
		},
	});

	// Reset form when dialog opens/closes or deliverable changes
	useEffect(() => {
		if (open) {
			if (isEditing && deliverable) {
				form.reset({
					title: deliverable.title,
					description: deliverable.description || "",
					acceptanceCriteria: deliverable.acceptanceCriteria || "",
					isBonus: deliverable.isBonus,
				});
			} else {
				form.reset({
					title: "",
					description: "",
					acceptanceCriteria: "",
					isBonus: false,
				});
			}
		}
	}, [open, isEditing, deliverable, form]);

	const onSubmit = async (data: CreateDeliverableFormData | UpdateDeliverableFormData) => {
		try {
			if (isEditing && deliverable) {
				await updateDeliverable.mutateAsync({
					deliverableId: deliverable.deliverableId,
					data: data as UpdateDeliverableFormData,
				});
				toast.success("Deliverable updated successfully");
			} else {
				await createDeliverable.mutateAsync({
					taskId,
					data: data as CreateDeliverableFormData,
				});
				toast.success("Deliverable created successfully");
			}
			onOpenChange(false);
		} catch (error) {
			toast.error(isEditing ? "Failed to update deliverable" : "Failed to create deliverable");
		}
	};

	const isLoading = createDeliverable.isPending || updateDeliverable.isPending;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>{isEditing ? "Edit Deliverable" : "Create New Deliverable"}</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
					>
						{/* Title */}
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title *</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter deliverable title"
											{...field}
										/>
									</FormControl>
									<FormDescription>A clear, concise title for this deliverable</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Description */}
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Describe what needs to be delivered"
											className="min-h-[100px]"
											{...field}
										/>
									</FormControl>
									<FormDescription>Optional detailed description of the deliverable</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Acceptance Criteria */}
						<FormField
							control={form.control}
							name="acceptanceCriteria"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Acceptance Criteria</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Define the criteria for accepting this deliverable"
											className="min-h-[100px]"
											{...field}
										/>
									</FormControl>
									<FormDescription>Specific criteria that must be met for approval</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Is Bonus */}
						<FormField
							control={form.control}
							name="isBonus"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel className="text-base">Bonus Deliverable</FormLabel>
										<FormDescription>Mark this as a bonus deliverable for extra points</FormDescription>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Form Actions */}
						<div className="flex justify-end gap-3">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isLoading}
							>
								{isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								{isEditing ? "Update" : "Create"} Deliverable
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
