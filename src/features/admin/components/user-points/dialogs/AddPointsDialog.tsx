/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/shared/dialogs/FormDialog";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { FormTextarea } from "@/components/shared/forms/FormTextarea";
import { UserWithPoints, AddPointsFormData } from "../../../types/userPoints";
import { useAddPoints } from "../../../hooks/useUserPoints";
import { useEmployees } from "@/features/hr/hooks";

const formSchema = z.object({
	userId: z.number().min(1, "Please select a user"),
	points: z
		.number()
		.min(-1000, "Points cannot be less than -1000")
		.max(1000, "Points cannot exceed 1000")
		.refine((val) => val !== 0, "Points cannot be zero"),
	reason: z.string().min(3, "Reason must be at least 3 characters").max(255, "Reason cannot exceed 255 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const getDefaultValues = (userId?: number): FormValues => ({
	userId: userId || 0,
	points: 10,
	reason: "",
});

interface AddPointsDialogProps {
	open: boolean;
	onClose: () => void;
	user?: UserWithPoints | null;
}

export function AddPointsDialog({ open, onClose, user }: AddPointsDialogProps) {
	const addPointsMutation = useAddPoints();
	const { data: employeesData, isLoading: isLoadingUsers, error } = useEmployees({ isActive: true, perPage: 100 });

	// Debug log
	console.log("AddPointsDialog - employeesData:", employeesData);
	console.log("AddPointsDialog - isLoading:", isLoadingUsers);
	console.log("AddPointsDialog - error:", error);

	const defaultValues = useMemo(() => getDefaultValues(user?.userId), [user?.userId]);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	// Update form when user prop changes
	useEffect(() => {
		if (user) {
			form.setValue("userId", user.userId);
		}
	}, [user, form]);

	// Reset form when dialog opens
	useEffect(() => {
		if (open) {
			form.reset(getDefaultValues(user?.userId));
		}
	}, [open, user?.userId, form]);

	const selectedUserId = form.watch("userId");
	const selectedUser = employeesData?.employees.find((u) => u.userId === selectedUserId);

	const userOptions = useMemo(() => {
		if (!employeesData?.employees || employeesData.employees.length === 0) return [];
		return employeesData.employees.map((u) => ({
			value: u.userId.toString(),
			label: `${u.name} (${u.totalPoints} pts)`,
		}));
	}, [employeesData?.employees]);

	const onSubmit = async (values: FormValues) => {
		const data: AddPointsFormData = {
			userId: values.userId,
			points: values.points,
			reason: values.reason,
		};

		try {
			await addPointsMutation.mutateAsync(data);
			onClose();
			form.reset();
		} catch {
			// Error handled in mutation
		}
	};

	const isPending = addPointsMutation.isPending;
	const pointsValue = form.watch("points");
	const isNegative = pointsValue < 0;

	return (
		<FormDialog
			open={open}
			onOpenChange={(o) => !o && onClose()}
			title={isNegative ? "Deduct Points" : "Add Points"}
			description="Add or deduct points from a user"
			size="md"
			showFooter={false}
		>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4"
				>
					<FormSelect
						control={form.control}
						name="userId"
						label="Select User"
						placeholder={isLoadingUsers ? "Loading users..." : "Choose a user..."}
						options={userOptions}
						disabled={isLoadingUsers}
						onValueChange={(value) => form.setValue("userId", parseInt(value))}
					/>

					{selectedUser && (
						<div className="p-3 bg-muted rounded-lg">
							<div className="text-sm font-medium">{selectedUser.name}</div>
							<div className="text-xs text-muted-foreground">Current Points: {selectedUser.totalPoints}</div>
						</div>
					)}

					<FormInput
						control={form.control}
						name="points"
						label="Points"
						description="Use positive values to add, negative to deduct"
						type="number"
						placeholder="Enter points (e.g., 10 or -5)"
						min={-1000}
						max={1000}
					/>

					<FormTextarea
						control={form.control}
						name="reason"
						label="Reason"
						placeholder="Why are you adding/deducting these points?"
						rows={3}
					/>

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isPending}
							variant={isNegative ? "destructive" : "default"}
						>
							{isPending ? "Processing..." : isNegative ? "Deduct Points" : "Add Points"}
						</Button>
					</div>
				</form>
			</Form>
		</FormDialog>
	);
}
