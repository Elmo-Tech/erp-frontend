"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/shared/dialogs/FormDialog";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormTextarea } from "@/components/shared/forms/FormTextarea";
import { UserWithPoints, DeductPointsFormData } from "../../../types/userPoints";
import { useDeductPoints } from "../../../hooks/useUserPoints";

const formSchema = z.object({
	points: z.number().min(1, "Points must be at least 1").max(1000, "Points cannot exceed 1000"),
	reason: z.string().min(3, "Reason must be at least 3 characters").max(255, "Reason cannot exceed 255 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const getDefaultValues = (): FormValues => ({
	points: 5,
	reason: "",
});

interface DeductPointsDialogProps {
	open: boolean;
	onClose: () => void;
	user: UserWithPoints | null;
}

export function DeductPointsDialog({ open, onClose, user }: DeductPointsDialogProps) {
	const deductPointsMutation = useDeductPoints();

	const defaultValues = useMemo(() => getDefaultValues(), []);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
		values: defaultValues,
	});

	const onSubmit = async (values: FormValues) => {
		if (!user) return;

		const data: DeductPointsFormData = {
			userId: user.userId,
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

					<FormInput
						control={form.control}
						name="points"
						label="Points to Deduct"
						type="number"
						placeholder="Enter points amount"
						min={1}
						max={Math.min(1000, user?.totalPoints || 1000)}
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
