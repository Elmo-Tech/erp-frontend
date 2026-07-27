/**
 * RolesMatrix Component
 *
 * A visual matrix for managing role permissions with checkboxes.
 * Displays roles as columns and permissions as rows.
 */

"use client";

import React, { useMemo, useCallback, useState } from "react";
import { useRoles, usePermissions, useUpdateRole, useCreateRole, useDeleteRole } from "../../hooks/useRoles";
import { Role, UpdateRolePayload, CreateRolePayload } from "../../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldCheck, Lock, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { PROTECTED_ROLES, groupPermissions, formatPermissionName } from "./constants";
import { RolesMatrixSkeleton } from "./RolesMatrixSkeleton";
import { CreateRoleDialog } from "./CreateRoleDialog";
import { DeleteRoleDialog } from "./DeleteRoleDialog";
import { PermissionCheckbox } from "./PermissionCheckbox";
import { getRoleLabel } from "@/config/simplification";
import { useAuthStore } from "@/store/authStore";

interface RolesMatrixProps {
	className?: string;
}

export function RolesMatrix({ className }: RolesMatrixProps) {
	const [updatingCell, setUpdatingCell] = useState<string | null>(null);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [newRoleName, setNewRoleName] = useState("");
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
	const canManageProtectedRoles = useAuthStore((state) => state.hasPermission("manage_protected_users"));

	const { data: rolesData, isLoading: isLoadingRoles, error: rolesError } = useRoles();
	const { data: permissionsData, isLoading: isLoadingPermissions, error: permissionsError } = usePermissions();

	const updateRoleMutation = useUpdateRole();
	const createRoleMutation = useCreateRole();
	const deleteRoleMutation = useDeleteRole();

	const roles = useMemo(() => rolesData?.roles || [], [rolesData]);
	const groupedPermissions = useMemo(() => {
		if (!permissionsData) return {};
		return groupPermissions(permissionsData);
	}, [permissionsData]);
	const permissionGroups = useMemo(() => Object.keys(groupedPermissions).sort(), [groupedPermissions]);

	const roleHasPermission = useCallback((role: Role, permissionName: string): boolean => {
		return role.permissions.includes(permissionName);
	}, []);

	const isProtectedRole = useCallback((role: Role): boolean => {
		return role.isProtected || PROTECTED_ROLES.includes(role.name.toLowerCase());
	}, []);

	const handleCreateRole = useCallback(async () => {
		if (!newRoleName.trim()) {
			toast.error("Role name is required");
			return;
		}

		const roleName = newRoleName.trim().toLowerCase().replace(/\s+/g, "-");
		if (!/^[a-z0-9-_]+$/.test(roleName)) {
			toast.error("Invalid role name", {
				description: "Role name may only contain lowercase letters, numbers, hyphens, and underscores.",
			});
			return;
		}

		const payload: CreateRolePayload = {
			name: roleName,
			permissions: selectedPermissions,
		};

		try {
			await createRoleMutation.mutateAsync(payload);
			toast.success("Role created successfully");
			setCreateDialogOpen(false);
			setNewRoleName("");
			setSelectedPermissions([]);
		} catch (error: unknown) {
			const axiosError = error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
			const errorMessage = axiosError.response?.data?.message || "Please try again later.";
			const validationErrors = axiosError.response?.data?.errors;

			if (validationErrors) {
				const firstError = Object.values(validationErrors)[0]?.[0];
				toast.error("Validation Error", { description: firstError || errorMessage });
			} else {
				toast.error("Failed to create role", {
					description: error instanceof Error ? error.message : errorMessage,
				});
			}
		}
	}, [newRoleName, selectedPermissions, createRoleMutation]);

	const handleDeleteRole = useCallback(async () => {
		if (!roleToDelete) return;

		try {
			await deleteRoleMutation.mutateAsync(roleToDelete.id);
			toast.success("Role deleted successfully");
			setDeleteDialogOpen(false);
			setRoleToDelete(null);
		} catch (error) {
			toast.error("Failed to delete role", {
				description: error instanceof Error ? error.message : "Please try again later.",
			});
		}
	}, [roleToDelete, deleteRoleMutation]);

	const openDeleteDialog = useCallback((role: Role) => {
		setRoleToDelete(role);
		setDeleteDialogOpen(true);
	}, []);

	const handlePermissionToggle = useCallback(
		async (role: Role, permissionName: string, currentlyHasPermission: boolean) => {
			if (isProtectedRole(role) && !canManageProtectedRoles) {
				toast.error("Cannot modify protected role", {
					description: `The "${role.name}" role is protected and cannot be modified.`,
				});
				return;
			}

			const cellKey = `${role.id}-${permissionName}`;
			setUpdatingCell(cellKey);

			const newPermissions = currentlyHasPermission ? role.permissions.filter((p) => p !== permissionName) : [...role.permissions, permissionName];

			const payload: UpdateRolePayload = { permissions: newPermissions };

			try {
				await updateRoleMutation.mutateAsync({ id: role.id, payload });
				toast.success("Permission updated", {
					description: `${currentlyHasPermission ? "Removed" : "Added"} "${permissionName}" ${currentlyHasPermission ? "from" : "to"} "${role.name}" role.`,
				});
			} catch (error) {
				toast.error("Failed to update permission", {
					description: error instanceof Error ? error.message : "Please try again later.",
				});
			} finally {
				setUpdatingCell(null);
			}
		},
		[canManageProtectedRoles, isProtectedRole, updateRoleMutation]
	);

	// Loading state
	if (isLoadingRoles || isLoadingPermissions) {
		return (
			<Card className={cn("w-full", className)}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ShieldCheck className="h-5 w-5" />
						Roles & Permissions Matrix
					</CardTitle>
					<CardDescription>Loading roles and permissions...</CardDescription>
				</CardHeader>
				<CardContent>
					<RolesMatrixSkeleton />
				</CardContent>
			</Card>
		);
	}

	// Error state
	if (rolesError || permissionsError) {
		return (
			<Card className={cn("w-full", className)}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ShieldCheck className="h-5 w-5" />
						Roles & Permissions Matrix
					</CardTitle>
					<CardDescription className="text-destructive">Failed to load data. Please try again.</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	// Empty state
	if (roles.length === 0 || !permissionsData || permissionsData.length === 0) {
		return (
			<>
				<Card className={cn("w-full", className)}>
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<ShieldCheck className="h-5 w-5" />
								Roles & Permissions Matrix
							</CardTitle>
							<CardDescription>{roles.length === 0 ? "No roles found. Create your first role to get started." : "No permissions found."}</CardDescription>
						</div>
						<Button onClick={() => setCreateDialogOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Add Role
						</Button>
					</CardHeader>
				</Card>
				<CreateRoleDialog
					open={createDialogOpen}
					onOpenChange={setCreateDialogOpen}
					newRoleName={newRoleName}
					onRoleNameChange={setNewRoleName}
					selectedPermissions={selectedPermissions}
					onPermissionsChange={setSelectedPermissions}
					permissionGroups={permissionGroups}
					groupedPermissions={groupedPermissions}
					onSubmit={handleCreateRole}
					isPending={createRoleMutation.isPending}
				/>
			</>
		);
	}

	return (
		<Card className={cn("w-full", className)}>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle className="flex items-center gap-2">
						<ShieldCheck className="h-5 w-5" />
						Roles & Permissions Matrix
					</CardTitle>
					<CardDescription>
						Manage role permissions by toggling checkboxes. Protected role names cannot be renamed or deleted.
					</CardDescription>
				</div>
				<Button onClick={() => setCreateDialogOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Add Role
				</Button>
			</CardHeader>
			<CardContent>
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="min-w-[200px] sticky left-0 bg-background z-10">Permission</TableHead>
								{roles.map((role) => (
									<TableHead
										key={role.id}
										className="text-center min-w-[120px]"
									>
										<div className="flex flex-col items-center gap-1">
											<div className="flex items-center gap-1">
												<span className="font-medium">{getRoleLabel(role.name)}</span>
												{!isProtectedRole(role) && (
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6"
														onClick={() => openDeleteDialog(role)}
													>
														<Trash2 className="h-3 w-3 text-destructive" />
													</Button>
												)}
											</div>
											{isProtectedRole(role) && (
												<Tooltip>
													<TooltipTrigger asChild>
														<Badge
															variant="secondary"
															className="gap-1 text-xs"
														>
															<Lock className="h-3 w-3" />
															Protected
														</Badge>
													</TooltipTrigger>
													<TooltipContent>This role is protected and cannot be modified</TooltipContent>
												</Tooltip>
											)}
										</div>
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{permissionGroups.map((group) => (
								<React.Fragment key={group}>
									<TableRow className="bg-muted/50">
										<TableCell
											colSpan={roles.length + 1}
											className="font-semibold text-sm py-2"
										>
											{group}
										</TableCell>
									</TableRow>
									{groupedPermissions[group].map((permission) => (
										<TableRow key={permission.name}>
											<TableCell className="sticky left-0 bg-background z-10">
												<Tooltip>
													<TooltipTrigger asChild>
														<span className="cursor-help text-sm">{formatPermissionName(permission.name)}</span>
													</TooltipTrigger>
													<TooltipContent side="right">{permission.description || permission.name}</TooltipContent>
												</Tooltip>
											</TableCell>
											{roles.map((role) => {
												const hasPermission = roleHasPermission(role, permission.name);
												const isProtected = isProtectedRole(role);
												const isLocked = isProtected && !canManageProtectedRoles;
												const cellKey = `${role.id}-${permission.name}`;
												const isUpdating = updatingCell === cellKey;

												return (
													<TableCell
														key={cellKey}
														className="text-center"
													>
														<div className="flex justify-center items-center">
															<PermissionCheckbox
																hasPermission={hasPermission}
																isProtected={isLocked}
																isUpdating={isUpdating}
																isGlobalUpdating={updateRoleMutation.isPending}
																permissionName={permission.name}
																roleName={role.name}
																onToggle={() => handlePermissionToggle(role, permission.name, hasPermission)}
															/>
														</div>
													</TableCell>
												);
											})}
										</TableRow>
									))}
								</React.Fragment>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>

			<CreateRoleDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				newRoleName={newRoleName}
				onRoleNameChange={setNewRoleName}
				selectedPermissions={selectedPermissions}
				onPermissionsChange={setSelectedPermissions}
				permissionGroups={permissionGroups}
				groupedPermissions={groupedPermissions}
				onSubmit={handleCreateRole}
				isPending={createRoleMutation.isPending}
			/>

			<DeleteRoleDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				role={roleToDelete}
				onConfirm={handleDeleteRole}
				isPending={deleteRoleMutation.isPending}
			/>
		</Card>
	);
}

export default RolesMatrix;
