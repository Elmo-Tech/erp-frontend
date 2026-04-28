"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Role, UpdateUserPayload, User } from "@/entities/user/model/types";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
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

	const selectedRoles = useWatch({ control: form.control, name: "roles" });
	const isActive = useWatch({ control: form.control, name: "isActive" });

	const toggleRole = (role: string) => {
		const next = selectedRoles.includes(role) ? selectedRoles.filter((item) => item !== role) : [...selectedRoles, role];
		form.setValue("roles", next, { shouldDirty: true });
	};

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
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
			<div className="grid gap-3 md:grid-cols-2">
				<Field label="Name" error={form.formState.errors.name?.message}>
					<Input {...form.register("name")} />
				</Field>
				<Field label="Email" error={form.formState.errors.email?.message}>
					<Input type="email" {...form.register("email")} />
				</Field>
				<Field label="New Password" error={form.formState.errors.password?.message}>
					<Input type="password" {...form.register("password")} autoComplete="new-password" />
				</Field>
				<Field label="Confirm Password" error={form.formState.errors.password_confirmation?.message}>
					<Input type="password" {...form.register("password_confirmation")} autoComplete="new-password" />
				</Field>
				<Field label="Specialization" error={form.formState.errors.specialization?.message}>
					<Input {...form.register("specialization")} />
				</Field>
				<Field label="Hourly Cost" error={form.formState.errors.internalHourlyCost?.message}>
					<Input type="number" min={0} step="0.01" {...form.register("internalHourlyCost")} />
				</Field>
			</div>
			<Field label="Skills" error={form.formState.errors.skillsText?.message}>
				<Input {...form.register("skillsText")} />
			</Field>
			<div className="space-y-2">
				<Label>Roles</Label>
				<div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
					{roles.map((role) => (
						<label key={role.id} className="flex items-center gap-2 text-sm">
							<Checkbox checked={selectedRoles.includes(role.name)} onCheckedChange={() => toggleRole(role.name)} />
							<span className="capitalize">{role.name}</span>
						</label>
					))}
				</div>
			</div>
			<label className="flex items-center gap-2 text-sm">
				<Checkbox checked={isActive} onCheckedChange={(value) => form.setValue("isActive", Boolean(value), { shouldDirty: true })} />
				Active account
			</label>
			<Button type="submit" disabled={updateUser.isPending}>
				{updateUser.isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
				Update user
			</Button>
		</form>
	);
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
	return (
		<div className="space-y-1.5">
			<Label>{label}</Label>
			{children}
			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
}
