"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
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
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
			<PasswordField label="Current password" error={form.formState.errors.current_password?.message}>
				<Input type="password" {...form.register("current_password")} autoComplete="current-password" />
			</PasswordField>
			<PasswordField label="New password" error={form.formState.errors.new_password?.message}>
				<Input type="password" {...form.register("new_password")} autoComplete="new-password" />
			</PasswordField>
			<PasswordField label="Confirm new password" error={form.formState.errors.new_password_confirmation?.message}>
				<Input type="password" {...form.register("new_password_confirmation")} autoComplete="new-password" />
			</PasswordField>
			<Button type="submit" disabled={changePassword.isPending}>
				{changePassword.isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
				Change password
			</Button>
		</form>
	);
}

function PasswordField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
	return (
		<div className="space-y-1.5">
			<Label>{label}</Label>
			{children}
			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
}
