"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormInput } from "@/shared/ui/forms";
import { changePasswordSchema, type ChangePasswordFormData } from "../model/profile.schema";
import { useChangePassword } from "../model/use-profile-actions";

export function ChangePasswordForm() {
	const changePassword = useChangePassword();
	const form = useForm<ChangePasswordFormData>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			current_password: "",
			new_password: "",
			new_password_confirmation: "",
		},
	});

	const onSubmit = async (data: ChangePasswordFormData) => {
		try {
			await changePassword.mutateAsync(data);
			form.reset();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to change password");
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4"
			>
				<FormInput
					control={form.control}
					name="current_password"
					label="Current password"
					type="password"
					autoComplete="current-password"
				/>
				<FormInput
					control={form.control}
					name="new_password"
					label="New password"
					type="password"
					autoComplete="new-password"
				/>
				<FormInput
					control={form.control}
					name="new_password_confirmation"
					label="Confirm new password"
					type="password"
					autoComplete="new-password"
				/>
				<Button
					type="submit"
					disabled={changePassword.isPending}
				>
					{changePassword.isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
					Change password
				</Button>
			</form>
		</Form>
	);
}
