"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSwitch } from "@/shared/ui/forms/FormSwitch";
import { FormMultiCombobox } from "@/shared/ui/forms/FormMultiCombobox";
import { Can } from "@/shared/ui/Can";
import { EMPLOYEE_PERMISSIONS } from "@/entities/user/model/permissions";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { useCreateUser, useUpdateUser, useRoles } from "../model/use-user-actions";
import { createUserSchema, editUserSchema, CREATE_USER_DEFAULT_VALUES, ROLE_LABELS, AVAILABLE_ROLES, type CreateUserFormData, type EditUserFormData } from "../model/users.schema";
import type { User } from "@/entities/user/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface UserFormModalProps {
	open: boolean;
	onClose: () => void;
	/** null = create mode, User = edit mode */
	editTarget: User | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function UserFormModal({ open, onClose, editTarget }: UserFormModalProps) {
	const isEditing = editTarget !== null;
	const createUser = useCreateUser();
	const updateUser = useUpdateUser();
	const hasPermission = useAuthStore((state) => state.hasPermission);
	const canAssignRoles = hasPermission(EMPLOYEE_PERMISSIONS.ASSIGN_USER_ROLES);
	const canResetCredentials = hasPermission(EMPLOYEE_PERMISSIONS.RESET_USER_CREDENTIALS);

	// Fetch roles from the backend so the list is always in sync with the seeder
	const { data: rolesData } = useRoles();

	const roleOptions = useMemo(() => {
		// Prefer backend roles; fall back to the static AVAILABLE_ROLES constant
		const names = rolesData?.roles.map((r) => r.name) ?? [...AVAILABLE_ROLES];
		return names.map((name) => ({
			value: name,
			label: ROLE_LABELS[name as keyof typeof ROLE_LABELS] ?? name,
		}));
	}, [rolesData]);

	// ── Create form ────────────────────────────────────────────────────────────
	const createForm = useForm<CreateUserFormData>({
		resolver: zodResolver(createUserSchema),
		defaultValues: CREATE_USER_DEFAULT_VALUES,
	});

	// ── Edit form ──────────────────────────────────────────────────────────────
	const editForm = useForm<EditUserFormData>({
		resolver: zodResolver(editUserSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			password_confirmation: "",
			roles: [],
			isActive: true,
		},
	});

	// Sync edit form when modal opens or target changes
	useEffect(() => {
		if (!open) return;
		if (editTarget) {
			editForm.reset({
				name: editTarget.name,
				email: editTarget.email,
				password: "",
				password_confirmation: "",
				roles: editTarget.roles ?? [],
				isActive: editTarget.isActive,
			});
		} else {
			createForm.reset(CREATE_USER_DEFAULT_VALUES);
		}
	}, [open, editTarget, editForm, createForm]);

	const isPending = createUser.isPending || updateUser.isPending;

	// ── Submit handlers ────────────────────────────────────────────────────────

	const handleCreate = async (data: CreateUserFormData) => {
		try {
			await createUser.mutateAsync({
				name: data.name,
				email: data.email,
				password: data.password,
				password_confirmation: data.password_confirmation,
				roles: canAssignRoles ? data.roles : [],
				isActive: data.isActive,
			});
			toast.success("User created successfully");
			onClose();
		} catch {
			toast.error("Failed to create user");
		}
	};

	const handleEdit = async (data: EditUserFormData) => {
		if (!editTarget) return;
		try {
			const payload: Record<string, unknown> = {
				name: data.name,
				email: data.email,
				isActive: data.isActive,
			};
			if (canAssignRoles) {
				payload.roles = data.roles;
			}
			// Only include password fields if the user typed a new password
			if (canResetCredentials && data.password) {
				payload.password = data.password;
				payload.password_confirmation = data.password_confirmation;
			}
			await updateUser.mutateAsync({ id: editTarget.userId, payload });
			toast.success("User updated successfully");
			onClose();
		} catch {
			toast.error("Failed to update user");
		}
	};

	// ── Render ─────────────────────────────────────────────────────────────────

	if (isEditing) {
		return (
			<FormDialog
				open={open}
				onOpenChange={(isOpen) => {
					if (!isOpen) onClose();
				}}
				title="Edit User"
				description="Update user details and role assignments."
				onSubmit={editForm.handleSubmit(handleEdit)}
				submitLabel="Save Changes"
				isLoading={isPending}
				size="lg"
			>
				<Form {...editForm}>
					<div className="flex flex-col gap-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormInput
								control={editForm.control}
								name="name"
								label="Full Name"
								placeholder="Jane Cooper"
								disabled={isPending}
							/>
							<FormInput
								control={editForm.control}
								name="email"
								label="Email"
								type="email"
								placeholder="jane@example.com"
								disabled={isPending}
							/>
						</div>

						<Can permission={EMPLOYEE_PERMISSIONS.ASSIGN_USER_ROLES}>
							<FormMultiCombobox
								control={editForm.control}
								name="roles"
								label="Roles"
								placeholder="Select roles…"
								searchPlaceholder="Search roles…"
								emptyText="No roles found."
								options={roleOptions}
								disabled={isPending}
								description="Assign one or more roles. Roles determine what the user can access."
							/>
						</Can>

						<Can permission={EMPLOYEE_PERMISSIONS.RESET_USER_CREDENTIALS}>
							<div className="border-t pt-4">
								<p className="text-sm font-medium mb-3">Change Password</p>
								<p className="text-xs text-muted-foreground mb-3">Leave blank to keep the current password.</p>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<FormInput
										control={editForm.control}
										name="password"
										label="New Password"
										type="password"
										placeholder="Min. 8 characters"
										autoComplete="new-password"
										disabled={isPending}
									/>
									<FormInput
										control={editForm.control}
										name="password_confirmation"
										label="Confirm Password"
										type="password"
										placeholder="Repeat password"
										autoComplete="new-password"
										disabled={isPending}
									/>
								</div>
							</div>
						</Can>

						<FormSwitch
							control={editForm.control}
							name="isActive"
							label="Active"
							description="Inactive users cannot log in."
							disabled={isPending}
						/>
					</div>
				</Form>
			</FormDialog>
		);
	}

	return (
		<FormDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			title="Create User"
			description="Add a new user and assign their roles."
			onSubmit={createForm.handleSubmit(handleCreate)}
			submitLabel="Create User"
			isLoading={isPending}
			size="lg"
		>
			<Form {...createForm}>
				<div className="flex flex-col gap-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<FormInput
							control={createForm.control}
							name="name"
							label="Full Name"
							placeholder="Jane Cooper"
							disabled={isPending}
						/>
						<FormInput
							control={createForm.control}
							name="email"
							label="Email"
							type="email"
							placeholder="jane@example.com"
							disabled={isPending}
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<FormInput
							control={createForm.control}
							name="password"
							label="Password"
							type="password"
							placeholder="Min. 8 characters"
							autoComplete="new-password"
							disabled={isPending}
						/>
						<FormInput
							control={createForm.control}
							name="password_confirmation"
							label="Confirm Password"
							type="password"
							placeholder="Repeat password"
							autoComplete="new-password"
							disabled={isPending}
						/>
					</div>

					<Can permission={EMPLOYEE_PERMISSIONS.ASSIGN_USER_ROLES}>
						<FormMultiCombobox
							control={createForm.control}
							name="roles"
							label="Roles"
							placeholder="Select roles…"
							searchPlaceholder="Search roles…"
							emptyText="No roles found."
							options={roleOptions}
							disabled={isPending}
							description="Assign one or more roles. Roles determine what the user can access."
						/>
					</Can>

					<FormSwitch
						control={createForm.control}
						name="isActive"
						label="Active"
						description="Inactive users cannot log in."
						disabled={isPending}
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
