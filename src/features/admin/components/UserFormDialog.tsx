"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormDialog } from "@/components/shared/dialogs/FormDialog";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { FormSwitch } from "@/components/shared/forms/FormSwitch";
import { FormCheckboxGroup } from "@/components/shared/forms/FormCheckboxGroup";
import { TagInput } from "@/components/shared/forms/TagInput";
import { useCreateUser, useUpdateUser } from "../hooks/useUsers";
import { useRoles } from "../hooks/useRoles";
import { useUserSpecializations } from "../hooks/useEnums";
import { User } from "../types";
import { createUserSchema, updateUserSchema, CreateUserFormData, UpdateUserFormData } from "../schemas/userSchema";
import { toast } from "sonner";

interface UserFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user?: User | null;
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
	const isEditing = !!user;
	const createUser = useCreateUser();
	const updateUser = useUpdateUser();
	const { data: rolesData } = useRoles();
	const { data: specializationsData } = useUserSpecializations();

	const form = useForm<CreateUserFormData | UpdateUserFormData>({
		resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			password_confirmation: "",
			skills: [],
			roles: [],
			specialization: "",
			isActive: true,
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name,
				email: user.email,
				password: "",
				password_confirmation: "",
				skills: user.skills,
				roles: user.roles,
				specialization: user.specialization || "",
				isActive: user.isActive,
			});
		} else {
			form.reset({
				name: "",
				email: "",
				password: "",
				password_confirmation: "",
				skills: [],
				roles: [],
				specialization: "",
				isActive: true,
			});
		}
	}, [user, form]);

	const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
		try {
			if (isEditing && user) {
				const updateData = { ...data };
				if (!updateData.password) {
					delete updateData.password;
					delete updateData.password_confirmation;
				}
				await updateUser.mutateAsync({ id: user.userId, payload: updateData });
				toast.success("User updated successfully");
			} else {
				await createUser.mutateAsync(data as CreateUserFormData);
				toast.success("User created successfully");
			}
			onOpenChange(false);
		} catch {
			toast.error(isEditing ? "Failed to update user" : "Failed to create user");
		}
	};

	const isLoading = createUser.isPending || updateUser.isPending;

	// Transform roles to checkbox options
	const roleOptions =
		rolesData?.roles?.map((role) => ({
			value: role.name,
			label: role.name,
		})) || [];

	// Transform specializations to select options
	const specializationOptions = [
		{ value: "", label: "No Specialization" },
		...(specializationsData?.data?.map((spec) => ({
			value: spec.value,
			label: spec.label,
		})) || []),
	];

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title={isEditing ? "Edit User" : "Add New User"}
			submitLabel={isEditing ? "Update User" : "Create User"}
			isLoading={isLoading}
			onSubmit={form.handleSubmit(onSubmit)}
			showFooter={false}
		>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4"
				>
					<FormInput
						control={form.control}
						name="name"
						label="Name"
						placeholder="John Doe"
					/>

					<FormInput
						control={form.control}
						name="email"
						label="Email"
						type="email"
						placeholder="john@example.com"
					/>

					<FormInput
						control={form.control}
						name="password"
						label={isEditing ? "New Password (leave empty to keep current)" : "Password"}
						type="password"
						placeholder="••••••••"
					/>

					<FormInput
						control={form.control}
						name="password_confirmation"
						label="Confirm Password"
						type="password"
						placeholder="••••••••"
					/>

					<TagInput
						control={form.control}
						name="skills"
						label="Skills"
						placeholder="Type a skill and press Enter"
					/>

					<FormSelect
						control={form.control}
						name="specialization"
						label="Specialization"
						placeholder="Select specialization..."
						options={specializationOptions}
						description="Determines which tasks the user can see and work on"
					/>

					<FormCheckboxGroup
						control={form.control}
						name="roles"
						label="Roles"
						options={roleOptions}
						columns={2}
					/>

					<FormSwitch
						control={form.control}
						name="isActive"
						label="Active Status"
						description="Inactive users cannot log in"
					/>

					<div className="flex justify-end gap-2 pt-4">
						<button
							type="button"
							className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
							disabled={isLoading}
						>
							{isLoading ? "Saving..." : isEditing ? "Update User" : "Create User"}
						</button>
					</div>
				</form>
			</Form>
		</FormDialog>
	);
}
