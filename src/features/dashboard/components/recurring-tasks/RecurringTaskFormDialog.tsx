"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RecurringTaskConfig, RecurringTaskFormData } from "../../types";
import { recurringTaskSchema } from "../../schemas";
import { useCreateRecurringTask, useUpdateRecurringTask } from "../../hooks";
import { useTasks } from "../../hooks/useTasks";
import { FrequencySelector } from "./FrequencySelector";
import { DaysOfWeekSelector } from "./DaysOfWeekSelector";
import { FormDatePicker } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RecurringTaskFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	config?: RecurringTaskConfig | null;
}

export function RecurringTaskFormDialog({ open, onOpenChange, config }: RecurringTaskFormDialogProps) {
	const isEditMode = !!config;

	const createMutation = useCreateRecurringTask();
	const updateMutation = useUpdateRecurringTask(config?.id || 0);
	const { data: tasksData } = useTasks({ perPage: 100 });

	const form = useForm<RecurringTaskFormData>({
		resolver: zodResolver(recurringTaskSchema),
		defaultValues: {
			templateTaskId: 0,
			frequency: "daily",
			interval: 1,
			daysOfWeek: [],
			startDate: new Date().toISOString().split("T")[0],
			isActive: true,
		},
	});
	const frequency = useWatch({ control: form.control, name: "frequency" });
	const interval = useWatch({ control: form.control, name: "interval" });

	// Reset form when config changes
	useEffect(() => {
		if (config) {
			form.reset({
				templateTaskId: config.templateTaskId,
				frequency: config.frequency,
				interval: config.interval,
				daysOfWeek: config.daysOfWeek || [],
				dayOfMonth: config.dayOfMonth || undefined,
				startDate: config.startDate.split("T")[0],
				endDate: config.endDate?.split("T")[0],
				maxOccurrences: config.maxOccurrences || undefined,
				isActive: config.isActive,
			});
		} else {
			form.reset({
				templateTaskId: 0,
				frequency: "daily",
				interval: 1,
				daysOfWeek: [],
				startDate: new Date().toISOString().split("T")[0],
				isActive: true,
			});
		}
	}, [config, form]);

	const onSubmit = async (data: RecurringTaskFormData) => {
		try {
			if (isEditMode) {
				await updateMutation.mutateAsync(data);
			} else {
				await createMutation.mutateAsync(data);
			}
			form.reset();
			onOpenChange(false);
		} catch {
			toast.error(isEditMode ? "Could not update the recurring task" : "Could not create the recurring task");
		}
	};

	const showDaysOfWeek = frequency === "weekly";
	const showDayOfMonth = ["monthly", "quarterly", "yearly"].includes(frequency);

	const tasks = tasksData?.tasks || [];
	const isLoading = createMutation.isPending || updateMutation.isPending;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="max-w-2xl max-h-[90vh]">
				<DialogHeader>
					<DialogTitle>{isEditMode ? "Edit Recurring Task" : "Create Recurring Task"}</DialogTitle>
					<DialogDescription>Configure automatic task generation schedule</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-6"
						>
							{/* Template Task Selection */}
							<FormField
								control={form.control}
								name="templateTaskId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Template Task</FormLabel>
										<Select
											value={field.value?.toString()}
											onValueChange={(v) => field.onChange(parseInt(v))}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a task to use as template" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{tasks.map((task) => (
													<SelectItem
														key={task.taskId}
														value={task.taskId.toString()}
													>
														{task.title}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Frequency Selector */}
							<FormField
								control={form.control}
								name="frequency"
								render={({ field }) => (
									<FormItem>
										<FrequencySelector
											frequency={field.value}
											interval={interval ?? 1}
											onFrequencyChange={(freq) => {
												field.onChange(freq);
												// Reset conditional fields
												if (freq !== "weekly") {
													form.setValue("daysOfWeek", []);
												}
												if (!["monthly", "quarterly", "yearly"].includes(freq)) {
													form.setValue("dayOfMonth", undefined);
												}
											}}
											onIntervalChange={(interval) => form.setValue("interval", interval)}
										/>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Days of Week (for weekly) */}
							{showDaysOfWeek && (
								<FormField
									control={form.control}
									name="daysOfWeek"
									render={({ field }) => (
										<FormItem>
											<DaysOfWeekSelector
												selectedDays={field.value || []}
												onChange={field.onChange}
											/>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							{/* Day of Month (for monthly/quarterly/yearly) */}
							{showDayOfMonth && (
								<FormField
									control={form.control}
									name="dayOfMonth"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Day of Month</FormLabel>
											<FormControl>
												<Input
													type="number"
													min="1"
													max="31"
													placeholder="1-31"
													{...field}
													value={field.value || ""}
													onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							{/* Date Range */}
							<div className="grid grid-cols-2 gap-4">
								<FormDatePicker
									control={form.control}
									name="startDate"
									label="Start Date"
								/>

								<FormDatePicker
									control={form.control}
									name="endDate"
									label="End Date (Optional)"
								/>
							</div>

							{/* Max Occurrences */}
							<FormField
								control={form.control}
								name="maxOccurrences"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Max Occurrences (Optional)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="1"
												placeholder="Leave empty for unlimited"
												{...field}
												value={field.value || ""}
												onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Active Toggle */}
							<FormField
								control={form.control}
								name="isActive"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">Active</FormLabel>
											<div className="text-sm text-muted-foreground">Enable automatic task generation</div>
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

							{/* Actions */}
							<div className="flex justify-end gap-3 pt-4">
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
									{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									{isEditMode ? "Update" : "Create"}
								</Button>
							</div>
						</form>
					</Form>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
