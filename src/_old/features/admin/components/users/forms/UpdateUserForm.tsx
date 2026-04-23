"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { useUpdateUser } from "../../../hooks/useUsers";
import { useRoles } from "../../../hooks/useRoles";
import { useUserSpecializations } from "../../../hooks/useEnums";
import { User } from "../../../types";
import { updateUserSchema, UpdateUserFormData } from "../../../schemas/userSchema";
import { UserFormFields } from "./UserFormFields";
import { toast } from "sonner";

interface UpdateUserFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User;
	onSuccess?: () => void;
}

export function UpdateUserForm({ open, onOpenChange, user, onSuccess }: UpdateUserFormProps) {
	const updateUser = useUpdateUser();
	const { data: rolesData } = useRoles();
	const { data: specializationsData } = useUserSpecializations();

	const form = useForm<UpdateUserFormData>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			name: user.name,
			email: user.email,
			password: "",
			password_confirmation: "",
			skills: user.skills,
			roles: user.roles,
			specialization: user.specialization || "",
			isActive: user.isActive,
			internalHourlyCost: user.internalHourlyCost || 0,
		},
	});

	const setFormData = (userData: User) => {
		form.reset({
			name: userData.name,
			email: userData.email,
			password: "",
			password_confirmation: "",
			skills: userData.skills,
			roles: userData.roles,
			specialization: userData.specialization || "",
			isActive: userData.isActive,
			internalHourlyCost: userData.internalHourlyCost || 0,
		});
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			setFormData(user);
		}
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: UpdateUserFormData) => {
		try {
			const updateData = { ...data };
			if (!updateData.password) {
				delete updateData.password;
				delete updateData.password_confirmation;
			}
			await updateUser.mutateAsync({ id: user.userId, payload: updateData });
			toast.success("User updated successfully");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to update user");
		}
	};

	const roleOptions =
		rolesData?.roles?.map((role) => ({
			value: role.name,
			label: role.name,
		})) || [];

	const specializationOptions = [
		...(specializationsData?.data?.map((spec) => ({
			value: spec.value,
			label: spec.label,
		})) || []),
	];

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Edit User"
			description="Update user information"
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Update User"
			isLoading={updateUser.isPending}
			size="md"
		>
			<UserFormFields
				control={form.control}
				isEditing={true}
				roleOptions={roleOptions}
				specializationOptions={specializationOptions}
			/>
		</FormDialog>
	);
}
