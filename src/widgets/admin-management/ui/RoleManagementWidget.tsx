"use client";

import { Plus, Shield } from "lucide-react";
import { useState } from "react";
import { RoleBadge } from "@/entities/user/ui/RoleBadge";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { AssignPermissionsMatrix } from "@/features/roles/ui/AssignPermissionsMatrix";
import { CreateRoleForm } from "@/features/roles/ui/CreateRoleForm";
import { usePermissions, useRoles } from "@/features/roles/model/use-role-actions";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Skeleton } from "@/shared/ui/skeleton";

export function RoleManagementWidget() {
	const hasPermission = useAuthStore((state) => state.hasPermission);
	const canManageRoles = hasPermission("manage_roles");
	const [createOpen, setCreateOpen] = useState(false);
	const rolesQuery = useRoles(canManageRoles);
	const permissionsQuery = usePermissions(canManageRoles);
	const roles = rolesQuery.data?.roles ?? [];
	const permissions = permissionsQuery.data ?? [];

	if (!canManageRoles) {
		return (
			<Alert variant="destructive">
				<AlertDescription>You do not have permission to manage roles.</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Roles</h1>
					<p className="text-sm text-muted-foreground">Toggle permissions by role. Protected roles are locked.</p>
				</div>
				<Button onClick={() => setCreateOpen(true)}>
					<Plus data-icon="inline-start" />
					Create role
				</Button>
			</div>

			<div className="grid gap-4 xl:grid-cols-[280px_1fr]">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-sm">
							<Shield className="size-4" />
							Role inventory
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{rolesQuery.isLoading ? (
							<>
								<Skeleton className="h-8 w-full" />
								<Skeleton className="h-8 w-full" />
								<Skeleton className="h-8 w-full" />
							</>
						) : (
							roles.map((role) => (
								<div key={role.id} className="flex items-center justify-between rounded-md border px-2 py-1.5">
									<RoleBadge role={role.name} />
									<span className="text-xs text-muted-foreground">{role.permissions.length} permissions</span>
								</div>
							))
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm">Permissions matrix</CardTitle>
					</CardHeader>
					<CardContent>
						{rolesQuery.isLoading || permissionsQuery.isLoading ? (
							<div className="space-y-2">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-64 w-full" />
							</div>
						) : rolesQuery.error || permissionsQuery.error ? (
							<Alert variant="destructive">
								<AlertDescription>Failed to load roles or permissions.</AlertDescription>
							</Alert>
						) : (
							<AssignPermissionsMatrix roles={roles} permissions={permissions} />
						)}
					</CardContent>
				</Card>
			</div>

			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Create role</DialogTitle>
						<DialogDescription>Create a role and select its starting permissions.</DialogDescription>
					</DialogHeader>
					<CreateRoleForm permissions={permissions} onSuccess={() => setCreateOpen(false)} />
				</DialogContent>
			</Dialog>
		</div>
	);
}
