"use client";

import { Fragment, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import type { Permission, Role } from "@/entities/user/model/types";
import { Badge } from "@/shared/ui/badge";
import { Checkbox } from "@/shared/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import { useUpdateRole } from "../model/use-role-actions";

interface AssignPermissionsMatrixProps {
	roles: Role[];
	permissions: Permission[];
}

const protectedRoleNames = new Set(["founder", "pmo", "techdev", "dev", "client"]);

export function AssignPermissionsMatrix({ roles, permissions }: AssignPermissionsMatrixProps) {
	const [updatingCell, setUpdatingCell] = useState<string | null>(null);
	const updateRole = useUpdateRole();
	const groupedPermissions = groupPermissions(permissions);

	const togglePermission = async (role: Role, permission: string) => {
		if (isProtectedRole(role)) {
			toast.error("Protected roles cannot be modified");
			return;
		}

		const cellKey = `${role.id}:${permission}`;
		const nextPermissions = role.permissions.includes(permission) ? role.permissions.filter((item) => item !== permission) : [...role.permissions, permission];

		setUpdatingCell(cellKey);
		try {
			await updateRole.mutateAsync({ id: role.id, payload: { permissions: nextPermissions } });
			toast.success("Permission updated");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to update permission");
		} finally {
			setUpdatingCell(null);
		}
	};

	return (
		<TooltipProvider delayDuration={150}>
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="sticky left-0 z-10 min-w-64 bg-background">Permission</TableHead>
							{roles.map((role) => (
								<TableHead key={role.id} className="min-w-32 text-center">
									<div className="flex items-center justify-center gap-1">
										<span className="capitalize">{role.name}</span>
										{isProtectedRole(role) && (
											<Badge variant="secondary" className="h-5 rounded-sm px-1 text-[10px]">
												<Lock className="mr-1 size-3" />
												Locked
											</Badge>
										)}
									</div>
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{Object.entries(groupedPermissions).map(([group, items]) => (
							<Fragment key={group}>
								<TableRow className="bg-muted/50">
									<TableCell colSpan={roles.length + 1} className="h-8 py-1 text-xs font-semibold uppercase text-muted-foreground">
										{group}
									</TableCell>
								</TableRow>
								{items.map((permission) => (
									<TableRow key={permission.name}>
										<TableCell className="sticky left-0 z-10 bg-background">
											<Tooltip>
												<TooltipTrigger asChild>
													<div className="cursor-help">
														<div className="text-sm font-medium">{formatPermissionName(permission.name)}</div>
														<div className="text-xs text-muted-foreground">{permission.name}</div>
													</div>
												</TooltipTrigger>
												<TooltipContent side="right">{permission.description || permission.name}</TooltipContent>
											</Tooltip>
										</TableCell>
										{roles.map((role) => {
											const cellKey = `${role.id}:${permission.name}`;
											const isUpdating = updatingCell === cellKey;
											const disabled = isProtectedRole(role) || updateRole.isPending;

											return (
												<TableCell key={cellKey} className="text-center">
													<div className="flex justify-center">
														{isUpdating ? (
															<Loader2 className="size-4 animate-spin text-muted-foreground" />
														) : (
															<Checkbox checked={role.permissions.includes(permission.name)} disabled={disabled} onCheckedChange={() => togglePermission(role, permission.name)} />
														)}
													</div>
												</TableCell>
											);
										})}
									</TableRow>
								))}
							</Fragment>
						))}
					</TableBody>
				</Table>
			</div>
		</TooltipProvider>
	);
}

function isProtectedRole(role: Role) {
	return Boolean(role.isProtected || protectedRoleNames.has(role.name.toLowerCase()));
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
