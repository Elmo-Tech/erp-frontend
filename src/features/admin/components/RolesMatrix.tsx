"use client";

import React, { useMemo, useCallback, useState } from "react";
import { useRoles, usePermissions, useUpdateRole, useCreateRole, useDeleteRole } from "../hooks/useRoles";
import { Role, Permission, UpdateRolePayload, CreateRolePayload } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Lock, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Protected role names that cannot be edited
 * Requirement 11.6: Disable editing for system-protected roles
 */
const PROTECTED_ROLES = ["admin", "client"];

/**
 * Group permissions by their group property for better organization
 */
const groupPermissions = (permissions: Permission[]): Record<string, Permission[]> => {
	return permissions.reduce((acc, permission) => {
		const group = permission.group || "Other";
		if (!acc[group]) {
			acc[group] = [];
		}
		acc[group].push(permission);
		return acc;
	}, {} as Record<string, Permission[]>);
};

interface RolesMatrixProps {
	/** Additional CSS classes */
	className?: string;
}

/**
 * RolesMatrix Component
 *
 * A visual matrix for managing role permissions with checkboxes.
 * Displays roles as columns and permissions as rows.
 *
 * Requirements:
 * - 11.1: Display roles as columns and permissions as rows
 * - 11.2: Render checkboxes at each role-permission intersection
 * - 11.3: Call API to update role permissions on checkbox toggle
 * - 11.4: Indicate loading state during API calls
 * - 11.5: Display success/error toast notifications after updates
 * - 11.6: Disable editing for system-protected roles
 */
export const RolesMatrix: React.FC<RolesMatrixProps> = ({ className }) => {
	// Track which cell is currently being updated
	const [updatingCell, setUpdatingCell] = useState<string | null>(null);

	// Dialog state for creating new role
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [newRoleName, setNewRoleName] = useState("");
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

	// Dialog state for deleting role
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

	// Fetch roles and permissions
	const { data: rolesData, isLoading: isLoadingRoles, error: rolesError } = useRoles();
	const { data: permissionsData, isLoading: isLoadingPermissions, error: permissionsError } = usePermissions();

	// Mutations
	const updateRoleMutation = useUpdateRole();
	const createRoleMutation = useCreateRole();
	const deleteRoleMutation = useDeleteRole();

	// Extract roles array from response
	const roles = useMemo(() => rolesData?.roles || [], [rolesData]);

	// Group permissions by category
	const groupedPermissions = useMemo(() => {
		if (!permissionsData) return {};
		return groupPermissions(permissionsData);
	}, [permissionsData]);

	// Get all permission groups in order
	const permissionGroups = useMemo(() => Object.keys(groupedPermissions).sort(), [groupedPermissions]);

	/**
	 * Check if a role has a specific permission
	 */
	const roleHasPermission = useCallback((role: Role, permissionName: string): boolean => {
		return role.permissions.includes(permissionName);
	}, []);

	/**
	 * Check if a role is protected (cannot be edited)
	 * Requirement 11.6: Disable editing for system-protected roles
	 */
	const isProtectedRole = useCallback((role: Role): boolean => {
		return role.isProtected || PROTECTED_ROLES.includes(role.name.toLowerCase());
	}, []);

	/**
	 * Handle creating a new role
	 */
	const handleCreateRole = useCallback(async () => {
		if (!newRoleName.trim()) {
			toast.error("Role name is required");
			return;
		}

		// Validate role name format
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
			// Handle validation errors from API
			const axiosError = error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
			const errorMessage = axiosError.response?.data?.message || "Please try again later.";
			const validationErrors = axiosError.response?.data?.errors;

			if (validationErrors) {
				const firstError = Object.values(validationErrors)[0]?.[0];
				toast.error("Validation Error", {
					description: firstError || errorMessage,
				});
			} else {
				toast.error("Failed to create role", {
					description: error instanceof Error ? error.message : errorMessage,
				});
			}
		}
	}, [newRoleName, selectedPermissions, createRoleMutation]);

	/**
	 * Handle deleting a role
	 */
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

	/**
	 * Open delete confirmation dialog
	 */
	const openDeleteDialog = useCallback((role: Role) => {
		setRoleToDelete(role);
		setDeleteDialogOpen(true);
	}, []);

	/**
	 * Handle checkbox toggle for a role-permission pair
	 * Requirement 11.3: Call API to update role permissions on checkbox toggle
	 */
	const handlePermissionToggle = useCallback(
		async (role: Role, permissionName: string, currentlyHasPermission: boolean) => {
			// Don't allow editing protected roles
			if (isProtectedRole(role)) {
				toast.error("Cannot modify protected role", {
					description: `The "${role.name}" role is protected and cannot be modified.`,
				});
				return;
			}

			const cellKey = `${role.id}-${permissionName}`;
			setUpdatingCell(cellKey);

			// Calculate new permissions array
			let newPermissions: string[];
			if (currentlyHasPermission) {
				// Remove permission
				newPermissions = role.permissions.filter((p) => p !== permissionName);
			} else {
				// Add permission
				newPermissions = [...role.permissions, permissionName];
			}

			const payload: UpdateRolePayload = {
				permissions: newPermissions,
			};

			try {
				await updateRoleMutation.mutateAsync({ id: role.id, payload });

				// Requirement 11.5: Display success toast notification
				toast.success("Permission updated", {
					description: `${currentlyHasPermission ? "Removed" : "Added"} "${permissionName}" ${currentlyHasPermission ? "from" : "to"} "${role.name}" role.`,
				});
			} catch (error) {
				// Requirement 11.5: Display error toast notification
				toast.error("Failed to update permission", {
					description: error instanceof Error ? error.message : "Please try again later.",
				});
			} finally {
				setUpdatingCell(null);
			}
		},
		[isProtectedRole, updateRoleMutation]
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

				{/* Create Role Dialog for empty state */}
				<Dialog
					open={createDialogOpen}
					onOpenChange={setCreateDialogOpen}
				>
					<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Create New Role</DialogTitle>
							<DialogDescription>Enter a name for the new role and select the permissions to assign.</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Role Name</label>
								<Input
									placeholder="e.g., project-manager"
									value={newRoleName}
									onChange={(e) => setNewRoleName(e.target.value)}
								/>
							</div>
							{permissionsData && permissionsData.length > 0 && (
								<div className="space-y-2">
									<label className="text-sm font-medium">Permissions</label>
									<div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
										{permissionGroups.map((group) => (
											<div
												key={group}
												className="mb-4"
											>
												<h4 className="font-medium text-sm mb-2">{group}</h4>
												<div className="grid grid-cols-2 gap-2">
													{groupedPermissions[group].map((permission) => (
														<div
															key={permission.name}
															className="flex items-center gap-2"
														>
															<Checkbox
																id={`empty-new-${permission.name}`}
																checked={selectedPermissions.includes(permission.name)}
																onCheckedChange={(checked) => {
																	if (checked) {
																		setSelectedPermissions([...selectedPermissions, permission.name]);
																	} else {
																		setSelectedPermissions(selectedPermissions.filter((p) => p !== permission.name));
																	}
																}}
															/>
															<label
																htmlFor={`empty-new-${permission.name}`}
																className="text-sm cursor-pointer"
															>
																{formatPermissionName(permission.name)}
															</label>
														</div>
													))}
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setCreateDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								onClick={handleCreateRole}
								disabled={createRoleMutation.isPending}
							>
								{createRoleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Create Role
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
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
					<CardDescription>Manage role permissions by toggling checkboxes. Protected roles cannot be modified.</CardDescription>
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
								{/* Requirement 11.1: Display roles as columns */}
								{roles.map((role) => (
									<TableHead
										key={role.id}
										className="text-center min-w-[120px]"
									>
										<div className="flex flex-col items-center gap-1">
											<div className="flex items-center gap-1">
												<span className="font-medium capitalize">{role.name}</span>
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
							{/* Requirement 11.1: Display permissions as rows, grouped by category */}
							{permissionGroups.map((group) => (
								<React.Fragment key={group}>
									{/* Group header row */}
									<TableRow className="bg-muted/50">
										<TableCell
											colSpan={roles.length + 1}
											className="font-semibold text-sm py-2"
										>
											{group}
										</TableCell>
									</TableRow>
									{/* Permission rows within group */}
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
											{/* Requirement 11.2: Render checkboxes at each role-permission intersection */}
											{roles.map((role) => {
												const hasPermission = roleHasPermission(role, permission.name);
												const isProtected = isProtectedRole(role);
												const cellKey = `${role.id}-${permission.name}`;
												const isUpdating = updatingCell === cellKey;

												return (
													<TableCell
														key={cellKey}
														className="text-center"
													>
														<div className="flex justify-center items-center">
															{/* Requirement 11.4: Indicate loading state during API calls */}
															{isUpdating ? (
																<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
															) : (
																<Checkbox
																	checked={hasPermission}
																	disabled={isProtected || updateRoleMutation.isPending}
																	onCheckedChange={() => handlePermissionToggle(role, permission.name, hasPermission)}
																	aria-label={`${hasPermission ? "Remove" : "Add"} ${permission.name} permission ${hasPermission ? "from" : "to"} ${role.name} role`}
																	className={cn(isProtected && "opacity-50 cursor-not-allowed")}
																/>
															)}
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

			{/* Create Role Dialog */}
			<Dialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
			>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Create New Role</DialogTitle>
						<DialogDescription>Enter a name for the new role and select the permissions to assign.</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Role Name</label>
							<Input
								placeholder="e.g., project-manager"
								value={newRoleName}
								onChange={(e) => setNewRoleName(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Permissions</label>
							<div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
								{permissionGroups.map((group) => (
									<div
										key={group}
										className="mb-4"
									>
										<h4 className="font-medium text-sm mb-2">{group}</h4>
										<div className="grid grid-cols-2 gap-2">
											{groupedPermissions[group].map((permission) => (
												<div
													key={permission.name}
													className="flex items-center gap-2"
												>
													<Checkbox
														id={`new-${permission.name}`}
														checked={selectedPermissions.includes(permission.name)}
														onCheckedChange={(checked) => {
															if (checked) {
																setSelectedPermissions([...selectedPermissions, permission.name]);
															} else {
																setSelectedPermissions(selectedPermissions.filter((p) => p !== permission.name));
															}
														}}
													/>
													<label
														htmlFor={`new-${permission.name}`}
														className="text-sm cursor-pointer"
													>
														{formatPermissionName(permission.name)}
													</label>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setCreateDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleCreateRole}
							disabled={createRoleMutation.isPending}
						>
							{createRoleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Create Role
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Role Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Role</DialogTitle>
						<DialogDescription>Are you sure you want to delete the role &quot;{roleToDelete?.name}&quot;? This action cannot be undone.</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteRole}
							disabled={deleteRoleMutation.isPending}
						>
							{deleteRoleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
};

/**
 * Format permission name for display
 * Converts snake_case to Title Case
 */
const formatPermissionName = (name: string): string => {
	return name
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

/**
 * Skeleton loader for the RolesMatrix
 */
const RolesMatrixSkeleton: React.FC = () => {
	return (
		<div className="space-y-4">
			{/* Header skeleton */}
			<div className="flex gap-4">
				<Skeleton className="h-8 w-[200px]" />
				{[1, 2, 3].map((i) => (
					<Skeleton
						key={i}
						className="h-8 w-[120px]"
					/>
				))}
			</div>
			{/* Row skeletons */}
			{[1, 2, 3, 4, 5].map((row) => (
				<div
					key={row}
					className="flex gap-4"
				>
					<Skeleton className="h-6 w-[200px]" />
					{[1, 2, 3].map((col) => (
						<Skeleton
							key={col}
							className="h-6 w-[120px]"
						/>
					))}
				</div>
			))}
		</div>
	);
};

export default RolesMatrix;
