"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Info, CheckCircle2 } from "lucide-react";
import { useInstantiateTemplate } from "../../hooks";
import { instantiateTaskSchema, type InstantiateTaskFormData } from "../../schemas";
import { TaskTemplate } from "../../types/taskTemplate";
import { useProjects } from "@/_old/features/projects/hooks";

interface InstantiateTemplateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	template: TaskTemplate | null;
}

export function InstantiateTemplateDialog({ open, onOpenChange, template }: InstantiateTemplateDialogProps) {
	const instantiateMutation = useInstantiateTemplate();
	const { data: projectsData } = useProjects();

	const form = useForm<InstantiateTaskFormData>({
		resolver: zodResolver(instantiateTaskSchema),
		defaultValues: {
			projectId: undefined,
			parentId: undefined,
			overrides: {},
		},
	});

	// Reset form when dialog opens
	useEffect(() => {
		if (open) {
			form.reset({
				projectId: undefined,
				parentId: undefined,
				overrides: {},
			});
		}
	}, [open, form]);

	const onSubmit = async (data: InstantiateTaskFormData) => {
		if (!template) return;

		try {
			await instantiateMutation.mutateAsync({
				templateId: template.id,
				data,
			});
			onOpenChange(false);
		} catch (error) {
			// Error handled by mutation
		}
	};

	if (!template) return null;

	const projects = projectsData?.projects || [];
	const subtasksCount = template.subtasks?.length || 0;
	const hasDefaultValues = template.defaultValues && Object.keys(template.defaultValues).length > 0;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Create Task from Template</DialogTitle>
					<DialogDescription>Create a new task based on &quot;{template.name}&quot; template</DialogDescription>
				</DialogHeader>

				{/* Template Info */}
				<Alert>
					<Info className="h-4 w-4" />
					<AlertDescription className="space-y-2">
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-sm font-medium">Template:</span>
							<Badge variant="secondary">{template.name}</Badge>
							{template.category && <Badge variant="outline">{template.category}</Badge>}
						</div>
						<div className="text-sm space-y-1">
							{subtasksCount > 0 && (
								<div className="flex items-center gap-2">
									<CheckCircle2 className="h-3 w-3 text-green-600" />
									<span>
										{subtasksCount} subtask{subtasksCount > 1 ? "s" : ""} will be created
									</span>
								</div>
							)}
							{hasDefaultValues && (
								<div className="flex items-center gap-2">
									<CheckCircle2 className="h-3 w-3 text-green-600" />
									<span>Default values will be applied</span>
								</div>
							)}
						</div>
					</AlertDescription>
				</Alert>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						{/* Project Selection */}
						<FormField
							control={form.control}
							name="projectId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Project <span className="text-destructive">*</span>
									</FormLabel>
									<Select
										onValueChange={(value) => field.onChange(parseInt(value))}
										value={field.value?.toString()}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a project" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{projects.map((project) => (
												<SelectItem
													key={project.projectId}
													value={project.projectId.toString()}
												>
													{project.title}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>The project where the task will be created</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Parent Task (Optional) */}
						<FormField
							control={form.control}
							name="parentId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Parent Task (Optional)</FormLabel>
									<Select
										onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
										value={field.value?.toString() || "none"}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="No parent task" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="none">No parent task</SelectItem>
											{/* TODO: Load tasks from selected project */}
										</SelectContent>
									</Select>
									<FormDescription>Create this task as a subtask of another task</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Template Details */}
						{template.description && (
							<div className="rounded-lg border p-4 space-y-2">
								<h4 className="text-sm font-medium">Template Description</h4>
								<p className="text-sm text-muted-foreground">{template.description}</p>
							</div>
						)}

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={instantiateMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={instantiateMutation.isPending}
							>
								{instantiateMutation.isPending ? "Creating..." : "Create Task"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
