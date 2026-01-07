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
import { UserWithPoints, AddPointsFormData } from "../../../types/userPoints";
import { useAddPoints } from "../../../hooks/useUserPoints";

const formSchema = z.object({
	points: z.number().min(1, "Points must be at least 1").max(1000, "Points cannot exceed 1000"),
	reason: z.string().min(3, "Reason must be at least 3 characters").max(255, "Reason cannot exceed 255 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const getDefaultValues = (): FormValues => ({
	points: 10,
	reason: "",
});

interface AddPointsDialogProps {
	open: boolean;
	onClose: () => void;
	user: UserWithPoints | null;
}

export function AddPointsDialog({ open, onClose, user }: AddPointsDialogProps) {
	const addPointsMutation = useAddPoints();

	const defaultValues = useMemo(() => getDefaultValues(), []);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
		values: defaultValues,
	});

	const onSubmit = async (values: FormValues) => {
		if (!user) return;

		const data: AddPointsFormData = {
			userId: user.userId,
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

	return (
		<FormDialog
			open={open}
			onOpenChange={(o) => !o && onClose()}
			title="Add Points"
			description={user ? `Add points to ${user.name}` : "Add points to user"}
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
						label="Points to Add"
						type="number"
						placeholder="Enter points amount"
						min={1}
						max={1000}
					/>

					<FormTextarea
						control={form.control}
						name="reason"
						label="Reason"
						placeholder="Why are you adding these points?"
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
						>
							{isPending ? "Adding..." : "Add Points"}
						</Button>
					</div>
				</form>
			</Form>
		</FormDialog>
	);
}
