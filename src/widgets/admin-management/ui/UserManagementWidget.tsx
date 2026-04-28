"use client";

import { useState } from "react";
import { Edit, MoreHorizontal, Plus, Power, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { UserRow } from "@/entities/user/ui/UserRow";
import type { User, UserFilters } from "@/entities/user/model/types";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { useRoles } from "@/features/roles/model/use-role-actions";
import { useDeleteUser, useToggleUserStatus, useUsers } from "@/features/users/model/use-user-actions";
import { CreateUserForm } from "@/features/users/ui/CreateUserForm";
import { UpdateUserForm } from "@/features/users/ui/UpdateUserForm";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { Input } from "@/shared/ui/input";

export function UserManagementWidget() {
	const hasPermission = useAuthStore((state) => state.hasPermission);
	const canManageUsers = hasPermission("manage_users");
	const [filters, setFilters] = useState<UserFilters>({ page: 1, perPage: 15 });
	const [createOpen, setCreateOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const usersQuery = useUsers(filters);
	const rolesQuery = useRoles(canManageUsers);
	const deleteUser = useDeleteUser();
	const toggleStatus = useToggleUserStatus();

	if (!canManageUsers) {
		return (
			<Alert variant="destructive">
				<AlertDescription>You do not have permission to manage users.</AlertDescription>
			</Alert>
		);
	}

	const columns: Column<User>[] = [
		{
			key: "user",
			header: "User",
			render: (user) => <UserRow user={user} />,
		},
		{
			key: "specialization",
			header: "Specialization",
			className: "hidden lg:table-cell",
			render: (user) => <span className="text-sm text-muted-foreground">{user.specialization || "Unassigned"}</span>,
		},
		{
			key: "created",
			header: "Created",
			className: "hidden xl:table-cell",
			render: (user) => <span className="text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</span>,
		},
		{
			key: "actions",
			header: "",
			className: "w-12 text-right",
			render: (user) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" aria-label="User actions">
							<MoreHorizontal />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => setEditingUser(user)}>
							<Edit data-icon="inline-start" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleToggleStatus(user)}>
							<Power data-icon="inline-start" />
							{user.isActive ? "Deactivate" : "Activate"}
						</DropdownMenuItem>
						<DropdownMenuItem variant="destructive" onClick={() => handleDelete(user)}>
							<Trash2 data-icon="inline-start" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	async function handleToggleStatus(user: User) {
		try {
			await toggleStatus.mutateAsync(user.userId);
			toast.success(user.isActive ? "User deactivated" : "User activated");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to update user");
		}
	}

	async function handleDelete(user: User) {
		if (!window.confirm(`Delete ${user.name}?`)) return;

		try {
			await deleteUser.mutateAsync(user.userId);
			toast.success("User deleted");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to delete user");
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Users</h1>
					<p className="text-sm text-muted-foreground">Manage system accounts, status, and roles.</p>
				</div>
				<Button onClick={() => setCreateOpen(true)}>
					<Plus data-icon="inline-start" />
					Create user
				</Button>
			</div>

			<DataTable
				columns={columns}
				data={usersQuery.data?.users ?? []}
				keyExtractor={(user) => user.userId}
				isLoading={usersQuery.isLoading}
				error={usersQuery.error}
				pagination={usersQuery.data?.pagination}
				onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
				emptyState={{ icon: Users, title: "No users found", description: "Create a user or adjust the search filter." }}
				headerActions={
					<div className="flex items-center gap-2">
						<Input
							value={filters.search ?? ""}
							onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value || undefined, page: 1 }))}
							placeholder="Search users"
							className="h-9 w-56"
						/>
					</div>
				}
			/>

			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Create user</DialogTitle>
						<DialogDescription>Add an account and assign initial roles.</DialogDescription>
					</DialogHeader>
					<CreateUserForm roles={rolesQuery.data?.roles ?? []} onSuccess={() => setCreateOpen(false)} />
				</DialogContent>
			</Dialog>

			<Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && setEditingUser(null)}>
				<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Update user</DialogTitle>
						<DialogDescription>Edit account details and role assignment.</DialogDescription>
					</DialogHeader>
					{editingUser && <UpdateUserForm user={editingUser} roles={rolesQuery.data?.roles ?? []} onSuccess={() => setEditingUser(null)} />}
				</DialogContent>
			</Dialog>
		</div>
	);
}
