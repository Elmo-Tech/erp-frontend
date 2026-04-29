"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@/entities/user/model/types";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormCheckbox, FormCheckboxGroup, FormInput } from "@/shared/ui/forms";
import { createUserSchema, parseSkills, type CreateUserFormData, type CreateUserFormValues } from "../model/user.schema";
import { useCreateUser } from "../model/use-user-actions";

interface CreateUserFormProps {
	roles?: Role[];
	onSuccess?: () => void;
}

export function CreateUserForm({ roles = [], onSuccess }: CreateUserFormProps) {
	const createUser = useCreateUser();
	const form = useForm<CreateUserFormValues, unknown, CreateUserFormData>({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			password_confirmation: "",
			skillsText: "",
			roles: [],
			specialization: "",
			isActive: true,
			internalHourlyCost: "",
		},
	});

	const onSubmit = async (data: CreateUserFormData) => {
		try {
			await createUser.mutateAsync({
				name: data.name,
				email: data.email,
				password: data.password,
				password_confirmation: data.password_confirmation,
				skills: parseSkills(data.skillsText),
				roles: data.roles,
				specialization: data.specialization || undefined,
				isActive: data.isActive,
				internalHourlyCost: data.internalHourlyCost,
			});
			toast.success("User created");
			form.reset();
			onSuccess?.();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to create user");
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
						autoComplete="name"
					/>
					<FormInput
						control={form.control}
						name="email"
						label="Email"
						type="email"
						autoComplete="email"
					/>
					<FormInput
						control={form.control}
						name="password"
						label="Password"
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
					placeholder="React, Laravel, QA"
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
					disabled={createUser.isPending}
				>
					{createUser.isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
					Create user
				</Button>
			</form>
		</Form>
	);
}
