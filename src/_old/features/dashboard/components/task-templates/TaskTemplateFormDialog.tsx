/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useCreateTaskTemplate, useUpdateTaskTemplate } from "../../hooks";
import { taskTemplateSchema, type TaskTemplateFormData } from "../../schemas";
import { TaskTemplate, TEMPLATE_CATEGORIES } from "../../types/taskTemplate";
import { SubtasksEditor } from "./SubtasksEditor";
import { ScrollArea } from "@/shared/ui/scroll-area";

interface TaskTemplateFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	template?: TaskTemplate | null;
}

export function TaskTemplateFormDialog({ open, onOpenChange, template }: TaskTemplateFormDialogProps) {
	const isEdit = !!template;
	const [activeTab, setActiveTab] = useState("basic");

	const createMutation = useCreateTaskTemplate();
	const updateMutation = useUpdateTaskTemplate(template?.id || 0);

	const form = useForm({
		resolver: zodResolver(taskTemplateSchema),
		defaultValues: {
			name: "",
			description: "",
			category: "",
			code: "",
			defaultValues: {},
			subtasks: [],
			isActive: true,
		},
	});

	// Reset form when template changes
	useEffect(() => {
		if (template) {
			form.reset({
				name: template.name,
				description: template.description || "",
				category: template.category || "",
				code: template.code || "",
				defaultValues: template.defaultValues || {},
				subtasks: (template.subtasks || []) as any,
				isActive: template.isActive,
			});
		} else {
			form.reset({
				name: "",
				description: "",
				category: "",
				code: "",
				defaultValues: {},
				subtasks: [],
				isActive: true,
			});
		}
	}, [template, form]);

	const onSubmit = async (data: TaskTemplateFormData) => {
		try {
			if (isEdit) {
				await updateMutation.mutateAsync(data);
			} else {
				await createMutation.mutateAsync(data);
			}
			onOpenChange(false);
		} catch (error) {
			// Error handled by mutation
		}
	};

	const isPending = createMutation.isPending || updateMutation.isPending;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="max-w-3xl max-h-[90vh]">
				<DialogHeader>
					<DialogTitle>{isEdit ? "Edit Template" : "Create Task Template"}</DialogTitle>
					<DialogDescription>{isEdit ? "Update the template details and configuration" : "Create a reusable task template with default values and subtasks"}</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<Tabs
							value={activeTab}
							onValueChange={setActiveTab}
						>
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="basic">Basic Info</TabsTrigger>
								<TabsTrigger value="subtasks">Subtasks ({form.watch("subtasks")?.length || 0})</TabsTrigger>
								<TabsTrigger value="settings">Settings</TabsTrigger>
							</TabsList>

							<ScrollArea className="h-[450px] pr-4">
								<TabsContent
									value="basic"
									className="space-y-4 mt-4"
								>
									{/* Name */}
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Template Name <span className="text-destructive">*</span>
												</FormLabel>
												<FormControl>
													<Input
														placeholder="e.g., Bug Fix Template"
														{...field}
													/>
												</FormControl>
												<FormDescription>A descriptive name for this template</FormDescription>
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
														placeholder="Describe what this template is for..."
														rows={3}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Category & Code */}
									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="category"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Category</FormLabel>
													<Select
														onValueChange={field.onChange}
														value={field.value}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select category" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															{TEMPLATE_CATEGORIES.map((cat) => (
																<SelectItem
																	key={cat}
																	value={cat}
																>
																	{cat}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="code"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Code</FormLabel>
													<FormControl>
														<Input
															placeholder="e.g., BUG-FIX"
															{...field}
														/>
													</FormControl>
													<FormDescription className="text-xs">Short identifier</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</TabsContent>

								<TabsContent
									value="subtasks"
									className="space-y-4 mt-4"
								>
									<FormField
										control={form.control}
										name="subtasks"
										render={({ field }) => (
											<FormItem>
												<SubtasksEditor
													subtasks={field.value || []}
													onChange={field.onChange}
												/>
												<FormMessage />
											</FormItem>
										)}
									/>
								</TabsContent>

								<TabsContent
									value="settings"
									className="space-y-4 mt-4"
								>
									{/* Active Status */}
									<FormField
										control={form.control}
										name="isActive"
										render={({ field }) => (
											<FormItem className="flex items-center justify-between rounded-lg border p-4">
												<div className="space-y-0.5">
													<FormLabel className="text-base">Active Template</FormLabel>
													<FormDescription>Inactive templates won&apos;t appear in the template selector</FormDescription>
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

									{/* Usage Info */}
									{isEdit && template && (
										<div className="rounded-lg border p-4 space-y-2">
											<h4 className="text-sm font-medium">Usage Statistics</h4>
											<div className="text-sm text-muted-foreground">
												<p>Used {template.usageCount} times</p>
												<p className="text-xs mt-1">Created on {new Date(template.createdAt).toLocaleDateString()}</p>
											</div>
										</div>
									)}
								</TabsContent>
							</ScrollArea>
						</Tabs>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isPending}
							>
								{isPending ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Template" : "Create Template"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
