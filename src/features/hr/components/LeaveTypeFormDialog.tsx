"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { handleApiError } from "@/lib/errorHandling";
import { useCreateLeaveType, useUpdateLeaveType } from "../hooks/useEmployeeLeaves";
import { buildLeaveTypePayload, leaveTypeFormSchema, toLeaveTypeFormValues } from "../lib/leave-management";
import type { LeaveType, LeaveTypeFormValues } from "../types/leave-management";

interface LeaveTypeFormDialogProps {
	leaveType?: LeaveType;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function createSlug(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

export function LeaveTypeFormDialog({ leaveType, open, onOpenChange }: LeaveTypeFormDialogProps) {
	const createLeaveType = useCreateLeaveType();
	const updateLeaveType = useUpdateLeaveType();
	const isEditing = Boolean(leaveType);
	const isSaving = createLeaveType.isPending || updateLeaveType.isPending;
	const form = useForm<LeaveTypeFormValues>({
		resolver: zodResolver(leaveTypeFormSchema),
		defaultValues: toLeaveTypeFormValues(leaveType),
	});

	useEffect(() => {
		if (open) form.reset(toLeaveTypeFormValues(leaveType));
	}, [form, leaveType, open]);

	const handleSubmit = async (values: LeaveTypeFormValues) => {
		try {
			const payload = buildLeaveTypePayload(values);
			if (leaveType) {
				await updateLeaveType.mutateAsync({ id: leaveType.id, payload });
				toast.success("Leave type updated");
			} else {
				await createLeaveType.mutateAsync(payload);
				toast.success("Leave type created");
			}
			onOpenChange(false);
		} catch (error) {
			toast.error(handleApiError(error));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>{isEditing ? "Edit leave type" : "Add leave type"}</DialogTitle>
					<DialogDescription>Configure how this leave type is presented and initialized for new employee balances.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem className="sm:col-span-2">
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g. Annual leave"
												disabled={isSaving}
												{...field}
												onChange={(event) => {
													field.onChange(event.target.value);
													if (!isEditing && !form.formState.dirtyFields.slug) {
														form.setValue("slug", createSlug(event.target.value), { shouldValidate: true });
													}
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="slug"
								render={({ field }) => (
									<FormItem className="sm:col-span-2">
										<FormLabel>Slug</FormLabel>
										<FormControl>
											<Input placeholder="e.g. annual-leave" disabled={isSaving} {...field} />
										</FormControl>
										<FormDescription>Lowercase letters, numbers, and hyphens only.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="annualAllowanceDays"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Annual allowance (days)</FormLabel>
										<FormControl>
											<Input type="number" min={0} max={366} step={1} disabled={isSaving} value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value === "" ? "" : Number(event.target.value))} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="displayOrder"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Display order</FormLabel>
										<FormControl>
											<Input type="number" min={0} max={65535} step={1} disabled={isSaving} value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value === "" ? "" : Number(event.target.value))} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="isPaid"
							render={({ field }) => (
								<FormItem className="flex items-center justify-between gap-4 rounded-lg border p-3">
									<div className="space-y-1">
										<FormLabel>Paid leave</FormLabel>
										<FormDescription>Approved leave of this type is paid.</FormDescription>
									</div>
									<FormControl>
										<Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSaving} aria-label="Paid leave" />
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="isActive"
							render={({ field }) => (
								<FormItem className="flex items-center justify-between gap-4 rounded-lg border p-3">
									<div className="space-y-1">
										<FormLabel>Active</FormLabel>
										<FormDescription>Only active types are available when leave is requested.</FormDescription>
									</div>
									<FormControl>
										<Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSaving} aria-label="Leave type active" />
									</FormControl>
								</FormItem>
							)}
						/>

						<p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
							Changing an allowance applies to new balance initialization only. Historical balances are not changed.
						</p>

						<DialogFooter>
							<Button type="button" variant="outline" disabled={isSaving} onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSaving}>
								{isSaving && <Loader2 className="animate-spin" />}
								{isSaving ? "Saving..." : isEditing ? "Save changes" : "Add leave type"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
