"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Permission } from "@/entities/user/model/types";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { createRoleSchema, type CreateRoleFormData } from "../model/role.schema";
import { useCreateRole } from "../model/use-role-actions";

interface CreateRoleFormProps {
	permissions: Permission[];
	onSuccess?: () => void;
}

export function CreateRoleForm({ permissions, onSuccess }: CreateRoleFormProps) {
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
	const createRole = useCreateRole();
	const form = useForm<CreateRoleFormData>({
		resolver: zodResolver(createRoleSchema),
		defaultValues: {
			name: "",
			permissions: [],
		},
	});

	const groupedPermissions = groupPermissions(permissions);

	const togglePermission = (permission: string) => {
		const next = selectedPermissions.includes(permission) ? selectedPermissions.filter((item) => item !== permission) : [...selectedPermissions, permission];
		setSelectedPermissions(next);
		form.setValue("permissions", next, { shouldDirty: true });
	};

	const onSubmit = async (data: CreateRoleFormData) => {
		try {
			await createRole.mutateAsync({ name: data.name, permissions: selectedPermissions });
			toast.success("Role created");
			form.reset();
			setSelectedPermissions([]);
			onSuccess?.();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to create role");
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-1.5">
				<Label htmlFor="role-name">Role name</Label>
				<Input id="role-name" {...form.register("name")} placeholder="project-manager" />
				{form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
			</div>
			<div className="space-y-2">
				<Label>Initial permissions</Label>
				<ScrollArea className="h-72 rounded-md border">
					<div className="space-y-4 p-3">
						{Object.entries(groupedPermissions).map(([group, groupPermissions]) => (
							<div key={group} className="space-y-2">
								<div className="text-xs font-semibold uppercase text-muted-foreground">{group}</div>
								<div className="grid gap-2 md:grid-cols-2">
									{groupPermissions.map((permission) => (
										<label key={permission.name} className="flex items-start gap-2 text-sm">
											<Checkbox checked={selectedPermissions.includes(permission.name)} onCheckedChange={() => togglePermission(permission.name)} />
											<span>
												<span className="block font-medium">{formatPermissionName(permission.name)}</span>
												<span className="block text-xs text-muted-foreground">{permission.description}</span>
											</span>
										</label>
									))}
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
			</div>
			<Button type="submit" disabled={createRole.isPending}>
				{createRole.isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
				Create role
			</Button>
		</form>
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
