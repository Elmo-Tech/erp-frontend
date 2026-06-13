"use client";

import { useForm, useWatch } from "react-hook-form";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormInput } from "@/shared/ui/forms";

export interface ChangePasswordFormValues {
	current_password: string;
	new_password: string;
	new_password_confirmation: string;
}

interface ChangePasswordFormProps {
	isLoading?: boolean;
	onSubmit: (values: ChangePasswordFormValues, reset: () => void) => void;
}

const defaultValues: ChangePasswordFormValues = {
	current_password: "",
	new_password: "",
	new_password_confirmation: "",
};

export function ChangePasswordForm({ isLoading = false, onSubmit }: ChangePasswordFormProps) {
	const form = useForm<ChangePasswordFormValues>({ defaultValues });
	const currentPassword = useWatch({ control: form.control, name: "current_password" });
	const newPassword = useWatch({ control: form.control, name: "new_password" });
	const confirmation = useWatch({ control: form.control, name: "new_password_confirmation" });

	return (
		<Form {...form}>
			<form className="grid gap-4" onSubmit={form.handleSubmit((values) => onSubmit(values, () => form.reset(defaultValues)))}>
				<FormInput control={form.control} name="current_password" label="Current password" type="password" autoComplete="current-password" />
				<div className="grid gap-2 md:grid-cols-2">
					<FormInput control={form.control} name="new_password" label="New password" type="password" autoComplete="new-password" />
					<FormInput control={form.control} name="new_password_confirmation" label="Confirm password" type="password" autoComplete="new-password" />
				</div>
				<Button type="submit" className="w-fit gap-2" disabled={isLoading || !currentPassword || !newPassword || newPassword !== confirmation}>
					{isLoading ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
					Change Password
				</Button>
			</form>
		</Form>
	);
}
