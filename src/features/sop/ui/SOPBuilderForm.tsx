"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { Directive } from "@/entities/sop/model/types";
import { useCreateDirective, useUpdateDirective } from "@/features/sop/model/use-sop-actions";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormInput, FormTextarea } from "@/shared/ui/forms";

const phaseSchema = z.object({
	name: z.string().trim().min(2, "Phase title is required"),
	description: z.string().trim().optional(),
});

const sopBuilderSchema = z.object({
	title: z.string().trim().min(2, "Title is required"),
	description: z.string().trim().optional(),
	phases: z.array(phaseSchema).min(1, "Add at least one phase"),
});

type SOPBuilderValues = z.infer<typeof sopBuilderSchema>;

interface SOPBuilderFormProps {
	directive?: Directive | null;
	onSaved?: () => void;
}

const EMPTY_PHASE = {
	name: "",
	description: "",
};

export function SOPBuilderForm({ directive, onSaved }: SOPBuilderFormProps) {
	const createDirective = useCreateDirective();
	const updateDirective = useUpdateDirective();
	const isEditing = Boolean(directive);
	const isPending = createDirective.isPending || updateDirective.isPending;

	const form = useForm<SOPBuilderValues>({
		resolver: zodResolver(sopBuilderSchema),
		defaultValues: {
			title: directive?.title ?? "",
			description: directive?.description ?? "",
			phases: directive?.phases?.length
				? directive.phases.map((phase) => ({
						name: phase.name,
						description: phase.description ?? "",
					}))
				: [{ ...EMPTY_PHASE }],
		},
		mode: "onChange",
	});

	const phases = useFieldArray({
		control: form.control,
		name: "phases",
	});

	const onSubmit = async (values: SOPBuilderValues) => {
		const payload = {
			title: values.title.trim(),
			description: values.description?.trim() || null,
			phases: values.phases.map((phase) => ({
				name: phase.name.trim(),
				description: phase.description?.trim() || null,
			})),
			target_permissions: ["view_morning_sop"],
			is_recurring: true,
			created_by: directive?.created_by ?? null,
		};

		try {
			if (directive) {
				await updateDirective.mutateAsync({ id: directive.id, payload });
				toast.success("SOP updated");
			} else {
				await createDirective.mutateAsync(payload);
				toast.success("SOP created");
				form.reset({
					title: "",
					description: "",
					phases: [{ ...EMPTY_PHASE }],
				});
			}

			onSaved?.();
		} catch {
			toast.error(isEditing ? "Unable to update SOP" : "Unable to create SOP");
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-5"
			>
				<div className="space-y-4">
					<FormInput
						control={form.control}
						name="title"
						label="Title"
						placeholder="Morning Operating Rhythm"
						inputClassName="h-10 shadow-none"
					/>

					<FormTextarea
						control={form.control}
						name="description"
						label="Description"
						placeholder="The daily operating rhythm PMO must acknowledge before starting the dashboard."
						textareaClassName="min-h-20 resize-none shadow-none"
					/>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between gap-3">
						<div>
							<h3 className="text-sm font-medium">Phases</h3>
							<p className="text-xs text-muted-foreground">PMO users acknowledge every phase during morning check-in.</p>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => phases.append({ ...EMPTY_PHASE })}
						>
							<Plus data-icon="inline-start" />
							Phase
						</Button>
					</div>

					<div className="space-y-2">
						{phases.fields.map((phase, index) => (
							<div
								key={phase.id}
								className="rounded-md border border-border bg-card p-3"
							>
								<div className="mb-3 flex items-center justify-between gap-3">
									<p className="text-xs font-medium text-muted-foreground">Phase {index + 1}</p>
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										disabled={phases.fields.length === 1}
										onClick={() => phases.remove(index)}
										aria-label={`Remove phase ${index + 1}`}
									>
										<Trash2 className="size-4" />
									</Button>
								</div>

								<div className="grid gap-3">
									<FormInput
										control={form.control}
										name={`phases.${index}.name`}
										label="Phase title"
										placeholder="Silent Hours"
										inputClassName="h-9 shadow-none"
									/>

									<FormTextarea
										control={form.control}
										name={`phases.${index}.description`}
										label="Phase description"
										placeholder="Deep work only. No meetings or non-critical interruptions."
										textareaClassName="min-h-16 resize-none shadow-none"
									/>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="flex items-center justify-end gap-2 border-t border-border pt-4">
					<Button
						type="submit"
						size="sm"
						disabled={isPending}
					>
						<Save data-icon="inline-start" />
						{isEditing ? "Save Changes" : "Create SOP"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
