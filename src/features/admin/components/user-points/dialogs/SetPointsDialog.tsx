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
import { UserWithPoints, SetPointsFormData } from "../../../types/userPoints";
import { useSetPoints } from "../../../hooks/useUserPoints";

const formSchema = z.object({
	points: z.number().min(0, "Points cannot be negative").max(10000, "Points cannot exceed 10,000"),
	reason: z.string().min(3, "Reason must be at least 3 characters").max(255, "Reason cannot exceed 255 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const getDefaultValues = (user: UserWithPoints | null): FormValues => ({
	points: user?.totalPoints || 0,
	reason: "",
});

interface SetPointsDialogProps {
	open: boolean;
	onClose: () => void;
	user: UserWithPoints | null;
}

export function SetPointsDialog({ open, onClose, user }: SetPointsDialogProps) {
	const setPointsMutation = useSetPoints();

	const defaultValues = useMemo(() => getDefaultValues(user), [user]);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
		values: defaultValues,
	});

	const onSubmit = async (values: FormValues) => {
		if (!user) return;

		const data: SetPointsFormData = {
			userId: user.userId,
			points: values.points,
			reason: values.reason,
		};

		try {
			await setPointsMutation.mutateAsync(data);
			onClose();
		} catch {
			// Error handled in mutation
		}
	};

	const isPending = setPointsMutation.isPending;
	const pointsChange = form.watch("points") - (user?.totalPoints || 0);

	return (
		<FormDialog
			open={open}
			onOpenChange={(o) => !o && onClose()}
			title="Set Points"
			description={user ? `Set exact points for ${user.name}` : "Set exact points for user"}
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
							{pointsChange !== 0 && (
								<div className={`text-xs font-medium ${pointsChange > 0 ? "text-green-600" : "text-red-600"}`}>
									Change: {pointsChange > 0 ? "+" : ""}
									{pointsChange}
								</div>
							)}
						</div>
					)}

					<FormInput
						control={form.control}
						name="points"
						label="New Points Total"
						type="number"
						placeholder="Enter new points total"
						min={0}
						max={10000}
					/>

					<FormTextarea
						control={form.control}
						name="reason"
						label="Reason"
						placeholder="Why are you setting these points?"
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
							{isPending ? "Setting..." : "Set Points"}
						</Button>
					</div>
				</form>
			</Form>
		</FormDialog>
	);
}
