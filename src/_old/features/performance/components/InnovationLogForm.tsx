"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { useCreateInnovationLog } from "../hooks";
import { innovationLogSchema, InnovationLogFormData } from "../schemas/innovationLogSchema";
import { toast } from "sonner";

interface InnovationLogFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

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

export function InnovationLogForm({ open, onOpenChange }: InnovationLogFormProps) {
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
				timeSavedMinutes: data.timeSavedMinutes ? parseInt(data.timeSavedMinutes, 10) : undefined,
			});
			toast.success("Innovation logged successfully");
			form.reset();
			onOpenChange(false);
		} catch {
			toast.error("Failed to log innovation");
		}
	};

	const isLoading = createMutation.isPending;

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Log New Innovation"
			description="Record your use of AI tools or new technologies that helped improve your work"
			submitLabel="Save"
			isLoading={isLoading}
			onSubmit={form.handleSubmit(onSubmit)}
			showFooter={false}
			size="md"
		>
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
							placeholder="0"
							description="Approximate estimate"
						/>
					</div>

					<div className="flex justify-end gap-2 pt-4">
						<button
							type="button"
							className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
							disabled={isLoading}
						>
							{isLoading ? "Saving..." : "Save"}
						</button>
					</div>
				</form>
			</Form>
		</FormDialog>
	);
}
