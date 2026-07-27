"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDialog } from "@/components/shared/dialogs/FormDialog";
import { useCreateUser } from "../../../hooks/useUsers";
import { useRoles } from "../../../hooks/useRoles";
import { useUserSpecializations } from "../../../hooks/useEnums";
import { createUserSchema, CreateUserFormData } from "../../../schemas/userSchema";
import { UserFormFields } from "./UserFormFields";
import { toast } from "sonner";
import { getRoleLabel } from "@/config/simplification";
import { handleApiError } from "@/lib/errorHandling";
import { Form } from "@/components/ui/form";
import { useAuthStore } from "@/store/authStore";

interface CreateUserFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function CreateUserForm({ open, onOpenChange, onSuccess }: CreateUserFormProps) {
	const createUser = useCreateUser();
	const { data: rolesData } = useRoles();
	const { data: specializationsData } = useUserSpecializations();
	const canManageProtectedUsers = useAuthStore((state) => state.hasPermission("manage_protected_users"));

	const form = useForm<CreateUserFormData>({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			password_confirmation: "",
			skills: [],
			roles: [],
			specialization: "",
			isActive: true,
			internalHourlyCost: 0,
		},
	});

	const resetForm = () => {
		form.reset({
			name: "",
			email: "",
			password: "",
			password_confirmation: "",
			skills: [],
			roles: [],
			specialization: "",
			isActive: true,
			internalHourlyCost: 0,
		});
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			resetForm();
		}
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: CreateUserFormData) => {
		try {
			await createUser.mutateAsync(data);
			toast.success("User created successfully");
			onOpenChange(false);
			onSuccess?.();
		} catch (error) {
			toast.error(handleApiError(error));
		}
	};

	const roleOptions =
		rolesData?.roles
			?.filter((role) => role.name !== "super-admin" || canManageProtectedUsers)
			.map((role) => ({
			value: role.name,
			label: getRoleLabel(role.name),
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
			title="Add New User"
			description="Create a new user account"
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Create User"
			isLoading={createUser.isPending}
			size="md"
		>
			<Form {...form}>
				<UserFormFields
					control={form.control}
					isEditing={false}
					roleOptions={roleOptions}
					specializationOptions={specializationOptions}
				/>
			</Form>
		</FormDialog>
	);
}
