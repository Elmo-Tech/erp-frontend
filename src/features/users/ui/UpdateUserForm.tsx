"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Role, UpdateUserPayload, User } from "@/entities/user/model/types";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormCheckbox, FormCheckboxGroup, FormInput } from "@/shared/ui/forms";
import { parseSkills, updateUserSchema, type UpdateUserFormData, type UpdateUserFormValues } from "../model/user.schema";
import { useUpdateUser } from "../model/use-user-actions";

interface UpdateUserFormProps {
	user: User;
	roles?: Role[];
	onSuccess?: () => void;
}

export function UpdateUserForm({ user, roles = [], onSuccess }: UpdateUserFormProps) {
	const updateUser = useUpdateUser();
	const form = useForm<UpdateUserFormValues, unknown, UpdateUserFormData>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			name: user.name,
			email: user.email,
			password: "",
			password_confirmation: "",
			skillsText: user.skills.join(", "),
			roles: user.roles,
			specialization: user.specialization ?? "",
			isActive: user.isActive,
			internalHourlyCost: user.internalHourlyCost ?? "",
		},
	});

	const onSubmit = async (data: UpdateUserFormData) => {
		const payload: UpdateUserPayload = {
			name: data.name,
			email: data.email,
			skills: parseSkills(data.skillsText),
			roles: data.roles,
			specialization: data.specialization || undefined,
			isActive: data.isActive,
			internalHourlyCost: data.internalHourlyCost,
		};

		if (data.password) {
			payload.password = data.password;
			payload.password_confirmation = data.password_confirmation;
		}

		try {
			await updateUser.mutateAsync({ id: user.userId, payload });
			toast.success("User updated");
			onSuccess?.();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to update user");
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4"
			>
				<div className="grid gap-3 md:grid-cols-2">
					<FormInput
						control={form.control}
						name="name"
						label="Name"
					/>
					<FormInput
						control={form.control}
						name="email"
						label="Email"
						type="email"
					/>
					<FormInput
						control={form.control}
						name="password"
						label="New Password"
						type="password"
						autoComplete="new-password"
					/>
					<FormInput
						control={form.control}
						name="password_confirmation"
						label="Confirm Password"
						type="password"
						autoComplete="new-password"
					/>
					<FormInput
						control={form.control}
						name="specialization"
						label="Specialization"
					/>
					<FormInput
						control={form.control}
						name="internalHourlyCost"
						label="Hourly Cost"
						type="number"
						min={0}
						step="0.01"
					/>
				</div>
				<FormInput
					control={form.control}
					name="skillsText"
					label="Skills"
				/>
				<FormCheckboxGroup
					control={form.control}
					name="roles"
					label="Roles"
					options={roles.map((role) => ({ value: role.name, label: role.name }))}
					columns={2}
				/>
				<FormCheckbox
					control={form.control}
					name="isActive"
					label="Active account"
				/>
				<Button
					type="submit"
					disabled={updateUser.isPending}
				>
					{updateUser.isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
					Update user
				</Button>
			</form>
		</Form>
	);
}
