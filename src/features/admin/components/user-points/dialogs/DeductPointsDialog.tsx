"use client";

import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/shared/dialogs/FormDialog";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormTextarea } from "@/components/shared/forms/FormTextarea";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { UserWithPoints, DeductPointsFormData } from "../../../types/userPoints";
import { useDeductPoints, usePointTransactionTypes } from "../../../hooks/useUserPoints";

const formSchema = z.object({
	type: z.string().min(1, "Please select a deduction type"),
	points: z.number().min(1, "Points must be at least 1").max(1000, "Points cannot exceed 1000"),
	reason: z.string().min(3, "Reason must be at least 3 characters").max(255, "Reason cannot exceed 255 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const getDefaultValues = (): FormValues => ({
	points: 5,
	type: "",
	reason: "",
});

interface DeductPointsDialogProps {
	open: boolean;
	onClose: () => void;
	user: UserWithPoints | null;
}

export function DeductPointsDialog({ open, onClose, user }: DeductPointsDialogProps) {
	const deductPointsMutation = useDeductPoints();
	const { data: transactionTypes = [], isLoading: isLoadingTypes } = usePointTransactionTypes();

	const defaultValues = useMemo(() => getDefaultValues(), []);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
		values: defaultValues,
	});

	useEffect(() => {
		if (!open) return;
		if (!transactionTypes.length) return;
		const negativeType = transactionTypes.find((type) => !type.is_positive);
		if (negativeType) {
			form.setValue("type", negativeType.value, { shouldValidate: true });
		}
	}, [open, transactionTypes, form]);

	const onSubmit = async (values: FormValues) => {
		if (!user) return;

		const data: DeductPointsFormData = {
			userId: user.userId,
			type: values.type as DeductPointsFormData["type"],
			points: values.points,
			reason: values.reason,
		};

		try {
			await deductPointsMutation.mutateAsync(data);
			onClose();
			form.reset();
		} catch {
			// Error handled in mutation
		}
	};

	const isPending = deductPointsMutation.isPending;
	const negativeTypeOptions = useMemo(() => {
		return transactionTypes
			.filter((type) => !type.is_positive)
			.map((type) => ({
				value: type.value,
				label: type.label,
			}));
	}, [transactionTypes]);

	return (
		<FormDialog
			open={open}
			onOpenChange={(o) => !o && onClose()}
			title="Deduct Points"
			description={user ? `Deduct points from ${user.name}` : "Deduct points from user"}
			size="md"
			showFooter={false}
		>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4"
				>
					{user && (
						<div className="p-3 bg-muted rounded-lg">
							<div className="text-sm font-medium">{user.name}</div>
							<div className="text-xs text-muted-foreground">Current Points: {user.totalPoints}</div>
						</div>
					)}

					<FormSelect
						control={form.control}
						name="type"
						label="Deduction Category"
						placeholder={isLoadingTypes ? "Loading categories..." : "Select category"}
						options={negativeTypeOptions}
						disabled={isLoadingTypes}
					/>

					<FormInput
						control={form.control}
						name="points"
						label="Points to Deduct"
						type="number"
						placeholder="Enter points amount"
						min={1}
						max={1000}
					/>

					<FormTextarea
						control={form.control}
						name="reason"
						label="Reason"
						placeholder="Why are you deducting these points?"
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
							variant="destructive"
							disabled={isPending}
						>
							{isPending ? "Deducting..." : "Deduct Points"}
						</Button>
					</div>
				</form>
			</Form>
		</FormDialog>
	);
}
