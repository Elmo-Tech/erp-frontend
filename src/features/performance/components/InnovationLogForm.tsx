"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { FormDialog } from "@/components/shared/dialogs/FormDialog";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { FormTextarea } from "@/components/shared/forms/FormTextarea";
import { useCreateInnovationLog } from "../hooks";
import { innovationLogSchema, InnovationLogFormData } from "../schemas/innovationLogSchema";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

const categoryOptions = [
	{ value: "ai_tool", label: "AI Tool" },
	{ value: "automation", label: "Automation" },
	{ value: "new_tech", label: "New Technology" },
	{ value: "process_improvement", label: "Process Improvement" },
];

const impactOptions = [
	{ value: "low", label: "Low" },
	{ value: "medium", label: "Medium" },
	{ value: "high", label: "High" },
];

export function InnovationLogForm() {
	const [open, setOpen] = useState(false);
	const createMutation = useCreateInnovationLog();

	const form = useForm<InnovationLogFormData>({
		resolver: zodResolver(innovationLogSchema),
		defaultValues: {
			toolName: "",
			category: "ai_tool",
			description: "",
			impactDescription: "",
			impactLevel: "medium",
			timeSavedMinutes: "",
		},
	});

	const onSubmit = async (data: InnovationLogFormData) => {
		try {
			await createMutation.mutateAsync({
				toolName: data.toolName,
				category: data.category,
				description: data.description,
				impactDescription: data.impactDescription || undefined,
				impactLevel: data.impactLevel,
				timeSavedMinutes: typeof data.timeSavedMinutes === "number" ? data.timeSavedMinutes : undefined,
			});
			toast.success("Innovation logged successfully");
			form.reset();
			setOpen(false);
		} catch {
			toast.error("Failed to log innovation");
		}
	};

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
		if (!isOpen) {
			form.reset();
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Log Innovation
				</Button>
			</DialogTrigger>

			<FormDialog
				open={open}
				onOpenChange={handleOpenChange}
				title="Log New Innovation"
				description="Record your use of AI tools or new technologies that helped improve your work"
				showFooter={false}
				size="md"
			>
				<div className="flex items-center gap-2 mb-4">
					<Sparkles className="h-5 w-5 text-yellow-500" />
					<span className="text-sm text-muted-foreground">Track your innovation contributions</span>
				</div>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormInput
							control={form.control}
							name="toolName"
							label="Tool/Technology Name"
							placeholder="e.g., GitHub Copilot"
						/>

						<FormSelect
							control={form.control}
							name="category"
							label="Category"
							placeholder="Select category"
							options={categoryOptions}
						/>

						<FormTextarea
							control={form.control}
							name="description"
							label="Description"
							placeholder="Explain how you used this tool/technology"
							rows={3}
						/>

						<FormTextarea
							control={form.control}
							name="impactDescription"
							label="Impact (Optional)"
							placeholder="How did it help improve your work?"
							rows={2}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormSelect
								control={form.control}
								name="impactLevel"
								label="Impact Level"
								options={impactOptions}
							/>

							<FormInput
								control={form.control}
								name="timeSavedMinutes"
								label="Time Saved (minutes)"
								type="number"
								min={0}
								placeholder="0"
								description="Approximate estimate"
							/>
						</div>

						<div className="flex justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => handleOpenChange(false)}
								disabled={createMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={createMutation.isPending}
							>
								{createMutation.isPending ? "Saving..." : "Save"}
							</Button>
						</div>
					</form>
				</Form>
			</FormDialog>
		</Dialog>
	);
}
