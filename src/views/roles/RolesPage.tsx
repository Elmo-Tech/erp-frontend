"use client";

import { Fragment, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, Loader2, Lock, Plus, RefreshCw, Shield, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useEmployeePermissions } from "@/entities/user/model/permissions";
import type { Permission, Role } from "@/entities/user/model/types";
import { useDeleteRole, usePermissions, useRoles, useUpdateRole } from "@/features/roles/model/use-role-actions";
import { CreateRoleForm } from "@/features/roles/ui/CreateRoleForm";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/Can";
import { Card, CardContent } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import { cn } from "@/shared/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Constants — group order mirrors the seeder's PERMISSION CATALOGUE comments
// ─────────────────────────────────────────────────────────────────────────────

const GROUP_ORDER: string[] = [
	"Dashboard",
	"User Management",
	"Role Management",
	"Client Management",
	"Project Management",
	"Project Members",
	"Project Files",
	"Task Management",
	"Sales — Leads",
	"Sales — Quotations",
	"Sales — Contracts",
	"Invoice Management",
	"Wiki Management",
	"Time Tracking",
	"Attendance",
	"Employee Management",
	"SOP Management",
	"Meetings",
	"Client Portal",
	"Reports & Analytics",
	"Financial Data",
	"Settings",
	"Security & Audit",
	"Tags",
	"Other",
];

const PROTECTED_ROLES = new Set(["founder", "admin", "pmo", "techdev", "dev", "client"]);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function isProtected(role: Role) {
	return Boolean(role.isProtected || PROTECTED_ROLES.has(role.name.toLowerCase()));
}

function formatLabel(name: string) {
	return name
		.split("_")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

function sortedGroups(permissions: Permission[]): [string, Permission[]][] {
	const map = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
		const g = p.group || "Other";
		(acc[g] ??= []).push(p);
		return acc;
	}, {});

	return GROUP_ORDER.filter((g) => g in map).map((g) => [g, map[g]]);
}

// ─────────────────────────────────────────────────────────────────────────────
// RolesPage
// ─────────────────────────────────────────────────────────────────────────────

export default function RolesPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
	const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

	const { canManageRoles, canViewRoles, canCreateRoles, canEditRoles, canDeleteRoles, canManageProtectedUsers } = useEmployeePermissions();
	const canAccess = canViewRoles || canManageRoles || canCreateRoles || canEditRoles || canDeleteRoles;

	const rolesQuery = useRoles(canAccess);
	const permissionsQuery = usePermissions(canAccess);
	const deleteRole = useDeleteRole();

	const roles = rolesQuery.data?.roles ?? [];
	const permissions = permissionsQuery.data ?? [];
	const isLoading = rolesQuery.isLoading || permissionsQuery.isLoading;
	const isError = rolesQuery.isError || permissionsQuery.isError;

	const toggleGroup = (group: string) =>
		setCollapsedGroups((prev) => {
			const next = new Set(prev);
			if (next.has(group)) {
				next.delete(group);
			} else {
				next.add(group);
			}
			return next;
		});

	const handleDeleteConfirm = () => {
		if (!deleteTarget) return;
		deleteRole.mutate(deleteTarget.id, {
			onSuccess: () => {
				toast.success(`Role "${deleteTarget.name}" deleted`);
				setDeleteTarget(null);
			},
			onError: () => toast.error("Failed to delete role"),
		});
	};

	// ── Access denied ─────────────────────────────────────────────────────────
	if (!canAccess) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-8 text-center">
				<ShieldAlert className="size-14 text-muted-foreground" />
				<p className="text-lg font-semibold">Access Restricted</p>
				<p className="max-w-xs text-sm text-muted-foreground">
					You need a role-management permission such as <code className="rounded bg-muted px-1 text-xs">view_roles</code>, <code className="rounded bg-muted px-1 text-xs">edit_roles</code>, or <code className="rounded bg-muted px-1 text-xs">manage_roles</code> to access this page.
				</p>
			</div>
		);
	}

	return (
		<TooltipProvider delayDuration={100}>
			<div className="flex flex-col gap-6 p-6">
				{/* ── Page header ─────────────────────────────────────────────── */}
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h1 className="flex items-center gap-2 text-2xl font-bold">
							<Shield className="size-6" />
							Roles &amp; Permissions
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">Each column is a role. Each row is a permission. Active sessions refresh permissions automatically. Protected roles cannot be renamed or deleted, and require protected-account access before their permissions can change.</p>
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								rolesQuery.refetch();
								permissionsQuery.refetch();
							}}
							disabled={isLoading}
						>
							<RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
							Refresh
						</Button>

						<Can permission={["create_roles", "manage_roles"]}>
							<Button
								size="sm"
								onClick={() => setCreateOpen(true)}
							>
								<Plus className="size-4" />
								New Role
							</Button>
						</Can>
					</div>
				</div>

				{/* ── Error ───────────────────────────────────────────────────── */}
				{isError && (
					<Card className="border-destructive/50 bg-destructive/5">
						<CardContent className="flex items-center gap-3 pt-5">
							<AlertTriangle className="size-5 shrink-0 text-destructive" />
							<p className="text-sm text-destructive">Failed to load roles or permissions. Check your connection and try refreshing.</p>
						</CardContent>
					</Card>
				)}

				{/* ── Loading skeleton ─────────────────────────────────────────── */}
				{isLoading && (
					<div className="space-y-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
					</div>
				)}

				{/* ── Matrix ──────────────────────────────────────────────────── */}
				{!isLoading && !isError && roles.length > 0 && permissions.length > 0 && (
					<PermissionMatrix
						roles={roles}
						permissions={permissions}
						collapsedGroups={collapsedGroups}
						onToggleGroup={toggleGroup}
						canEdit={canEditRoles}
						canDelete={canDeleteRoles}
						canManageProtected={canManageProtectedUsers}
						onDeleteRole={setDeleteTarget}
					/>
				)}

				{/* ── Empty ───────────────────────────────────────────────────── */}
				{!isLoading && !isError && roles.length === 0 && (
					<Card>
						<CardContent className="flex flex-col items-center gap-4 py-14 text-center">
							<Shield className="size-12 text-muted-foreground/40" />
							<p className="font-medium">No roles found</p>
							<p className="text-sm text-muted-foreground">Create your first role to get started.</p>
							<Can permission={["create_roles", "manage_roles"]}>
								<Button
									size="sm"
									onClick={() => setCreateOpen(true)}
								>
									<Plus className="size-4" />
									Create Role
								</Button>
							</Can>
						</CardContent>
					</Card>
				)}
			</div>

			{/* ── Create role dialog ───────────────────────────────────────── */}
			<Dialog
				open={createOpen}
				onOpenChange={setCreateOpen}
			>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Create Role</DialogTitle>
						<DialogDescription>Define a new role and assign its initial permissions. You can adjust them from the matrix at any time.</DialogDescription>
					</DialogHeader>
					{permissions.length > 0 && (
						<CreateRoleForm
							permissions={permissions}
							onSuccess={() => setCreateOpen(false)}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* ── Delete confirmation dialog ───────────────────────────────── */}
			<Dialog
				open={!!deleteTarget}
				onOpenChange={(o) => !o && setDeleteTarget(null)}
			>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>Delete role</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete <strong className="text-foreground">{deleteTarget?.name}</strong>? This cannot be undone. Users with this role will lose all associated permissions.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2">
						<Button
							variant="outline"
							onClick={() => setDeleteTarget(null)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteConfirm}
							disabled={deleteRole.isPending}
						>
							{deleteRole.isPending && <Loader2 className="size-4 animate-spin" />}
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</TooltipProvider>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// PermissionMatrix
// ─────────────────────────────────────────────────────────────────────────────

interface MatrixProps {
	roles: Role[];
	permissions: Permission[];
	collapsedGroups: Set<string>;
	onToggleGroup: (group: string) => void;
	canEdit: boolean;
	canDelete: boolean;
	canManageProtected: boolean;
	onDeleteRole: (role: Role) => void;
}

function PermissionMatrix({ roles, permissions, collapsedGroups, onToggleGroup, canEdit, canDelete, canManageProtected, onDeleteRole }: MatrixProps) {
	const [updatingCell, setUpdatingCell] = useState<string | null>(null);
	const updateRole = useUpdateRole();
	const groups = sortedGroups(permissions);

	const toggle = async (role: Role, permName: string) => {
		if (!canEdit || (isProtected(role) && !canManageProtected)) return;
		const key = `${role.id}:${permName}`;
		const next = role.permissions.includes(permName) ? role.permissions.filter((p) => p !== permName) : [...role.permissions, permName];
		setUpdatingCell(key);
		try {
			await updateRole.mutateAsync({ id: role.id, payload: { permissions: next } });
		} catch {
			toast.error("Failed to update permission");
		} finally {
			setUpdatingCell(null);
		}
	};

	return (
		<Card className="overflow-hidden p-0">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					{/* ── Column headers (roles) ─────────────────────────────── */}
					<thead>
						<tr className="border-b bg-muted/40">
							{/* Permission label column */}
							<th className="sticky left-0 z-20 min-w-56 bg-muted/40 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Permission</th>

							{roles.map((role) => (
								<th
									key={role.id}
									className="min-w-28 px-3 py-3 text-center"
								>
									<div className="flex flex-col items-center gap-1">
										<div className="flex items-center gap-1.5">
											<span className="font-semibold capitalize text-foreground">{role.name}</span>
											{isProtected(role) && (
												<Tooltip>
													<TooltipTrigger asChild>
														<Lock className="size-3 text-muted-foreground" />
													</TooltipTrigger>
													<TooltipContent>Protected name and deletion; permission changes require protected-account access</TooltipContent>
												</Tooltip>
											)}
										</div>

										<div className="flex items-center gap-1">
											<Badge
												variant="outline"
												className="h-4 rounded-sm px-1 text-[10px] tabular-nums"
											>
												{role.permissions.length}
											</Badge>

											{!isProtected(role) && canDelete && (
												<Tooltip>
													<TooltipTrigger asChild>
														<button
															type="button"
															onClick={() => onDeleteRole(role)}
															className="rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-destructive"
															aria-label={`Delete ${role.name}`}
														>
															<Trash2 className="size-3" />
														</button>
													</TooltipTrigger>
													<TooltipContent>Delete role</TooltipContent>
												</Tooltip>
											)}
										</div>
									</div>
								</th>
							))}
						</tr>
					</thead>

					<tbody>
						{groups.map(([group, perms]) => {
							const isCollapsed = collapsedGroups.has(group);
							return (
								<Fragment key={group}>
									{/* ── Group header row ──────────────────────────────── */}
									<tr
										key={`group-${group}`}
										className="cursor-pointer border-b bg-muted/25 hover:bg-muted/40"
										onClick={() => onToggleGroup(group)}
									>
										<td
											colSpan={roles.length + 1}
											className="sticky left-0 px-4 py-2"
										>
											<div className="flex items-center gap-2">
												{isCollapsed ? <ChevronRight className="size-3.5 text-muted-foreground" /> : <ChevronDown className="size-3.5 text-muted-foreground" />}
												<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group}</span>
												<span className="text-xs text-muted-foreground/50">({perms.length})</span>
											</div>
										</td>
									</tr>

									{/* ── Permission rows ───────────────────────────────── */}
									{!isCollapsed &&
										perms.map((perm) => (
											<tr
												key={perm.name}
												className="border-b transition-colors last:border-b-0 hover:bg-muted/20"
											>
												{/* Permission label */}
												<td className="sticky left-0 z-10 bg-background px-4 py-2.5">
													<Tooltip>
														<TooltipTrigger asChild>
															<div className="cursor-help">
																<p className="font-medium text-foreground">{formatLabel(perm.name)}</p>
																<p className="font-mono text-[11px] text-muted-foreground">{perm.name}</p>
															</div>
														</TooltipTrigger>
														<TooltipContent
															side="right"
															className="max-w-56"
														>
															{perm.description || perm.name}
														</TooltipContent>
													</Tooltip>
												</td>

												{/* Role checkboxes */}
												{roles.map((role) => {
													const key = `${role.id}:${perm.name}`;
													const checked = role.permissions.includes(perm.name);
													const isUpdating = updatingCell === key;
													const locked = !canEdit || (isProtected(role) && !canManageProtected);

													return (
														<td
															key={key}
															className="px-3 py-2.5 text-center"
														>
															<div className="flex justify-center">
																{isUpdating ? (
																	<Loader2 className="size-4 animate-spin text-muted-foreground" />
																) : (
																	<Checkbox
																		checked={checked}
																		disabled={locked || updateRole.isPending}
																		onCheckedChange={() => toggle(role, perm.name)}
																		aria-label={`${perm.name} for ${role.name}`}
																	/>
																)}
															</div>
														</td>
													);
												})}
											</tr>
										))}
								</Fragment>
							);
						})}
					</tbody>
				</table>
			</div>
		</Card>
	);
}
