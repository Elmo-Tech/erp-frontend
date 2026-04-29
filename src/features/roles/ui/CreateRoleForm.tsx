"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Permission } from "@/entities/user/model/types";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormCheckboxGroup, FormInput } from "@/shared/ui/forms";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { createRoleSchema, type CreateRoleFormData } from "../model/role.schema";
import { useCreateRole } from "../model/use-role-actions";

interface CreateRoleFormProps {
	permissions: Permission[];
	onSuccess?: () => void;
}

export function CreateRoleForm({ permissions, onSuccess }: CreateRoleFormProps) {
	const createRole = useCreateRole();
	const form = useForm<CreateRoleFormData>({
		resolver: zodResolver(createRoleSchema),
		defaultValues: {
			name: "",
			permissions: [],
		},
	});

	const groupedPermissions = groupPermissions(permissions);

	const onSubmit = async (data: CreateRoleFormData) => {
		try {
			await createRole.mutateAsync({ name: data.name, permissions: data.permissions });
			toast.success("Role created");
			form.reset();
			onSuccess?.();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to create role");
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
					name="name"
					label="Role name"
					placeholder="project-manager"
				/>
				<div className="space-y-2">
					<div className="text-sm font-medium">Initial permissions</div>
					<ScrollArea className="h-72 rounded-md border">
						<div className="space-y-4 p-3">
							{Object.entries(groupedPermissions).map(([group, groupPermissions]) => (
								<FormCheckboxGroup
									key={group}
									control={form.control}
									name="permissions"
									label={group}
									options={groupPermissions.map((permission) => ({
										value: permission.name,
										label: formatPermissionName(permission.name),
										description: permission.description,
									}))}
									columns={2}
								/>
							))}
						</div>
					</ScrollArea>
				</div>
				<Button
					type="submit"
					disabled={createRole.isPending}
				>
					{createRole.isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
					Create role
				</Button>
			</form>
		</Form>
	);
}

function groupPermissions(permissions: Permission[]) {
	return permissions.reduce<Record<string, Permission[]>>((acc, permission) => {
		const group = permission.group || "Other";
		acc[group] ||= [];
		acc[group].push(permission);
		return acc;
	}, {});
}

function formatPermissionName(name: string) {
	return name
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}
