"use client";

import { useState } from "react";
import { Users, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Can } from "@/shared/ui/Can";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { UserFormModal } from "@/features/users/ui/UserFormModal";
import { useUsers, useDeleteUser, useToggleUserStatus } from "@/features/users/model/use-user-actions";
import type { User } from "@/entities/user/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Column definitions
// ─────────────────────────────────────────────────────────────────────────────

function buildColumns(onEdit: (user: User) => void, onDelete: (user: User) => void, onToggle: (user: User) => void): Column<User>[] {
	return [
		{
			key: "user",
			header: "User",
			render: (u) => (
				<div className="flex items-center gap-3">
					<Avatar className="h-8 w-8 shrink-0">
						<AvatarImage src={u.avatar ?? undefined} />
						<AvatarFallback>{u.name.slice(0, 2).toUpperCase()}</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<p className="truncate text-sm font-medium">{u.name}</p>
						<p className="truncate text-xs text-muted-foreground">{u.email}</p>
					</div>
				</div>
			),
		},
		{
			key: "roles",
			header: "Roles",
			render: (u) =>
				u.roles.length > 0 ? (
					<div className="flex flex-wrap gap-1">
						{u.roles.map((role) => (
							<Badge
								key={role}
								variant="secondary"
								className="px-1.5 py-0 text-xs capitalize"
							>
								{role}
							</Badge>
						))}
					</div>
				) : (
					<span className="text-xs text-muted-foreground">No roles</span>
				),
		},
		{
			key: "status",
			header: "Status",
			render: (u) => (
				<Badge
					variant={u.isActive ? "default" : "outline"}
					className="text-xs"
				>
					{u.isActive ? "Active" : "Inactive"}
				</Badge>
			),
		},
		{
			key: "created",
			header: "Joined",
			render: (u) => <span className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</span>,
		},
		{
			key: "actions",
			header: "",
			className: "text-right",
			render: (u) => (
				<div className="flex items-center justify-end gap-1">
					<Can permission="manage_users">
						<>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								title={u.isActive ? "Deactivate user" : "Activate user"}
								onClick={(e) => {
									e.stopPropagation();
									onToggle(u);
								}}
							>
								{u.isActive ? <ToggleRight className="h-3.5 w-3.5 text-green-600" /> : <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />}
								<span className="sr-only">Toggle {u.name}</span>
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={(e) => {
									e.stopPropagation();
									onEdit(u);
								}}
							>
								<Pencil className="h-3.5 w-3.5" />
								<span className="sr-only">Edit {u.name}</span>
							</Button>
						</>
					</Can>
					<Can permission="delete_users">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-destructive hover:text-destructive"
							onClick={(e) => {
								e.stopPropagation();
								onDelete(u);
							}}
						>
							<Trash2 className="h-3.5 w-3.5" />
							<span className="sr-only">Delete {u.name}</span>
						</Button>
					</Can>
				</div>
			),
		},
	];
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget
// ─────────────────────────────────────────────────────────────────────────────

export function UsersWidget() {
	const { data, isLoading, error } = useUsers();
	const deleteUser = useDeleteUser();
	const toggleStatus = useToggleUserStatus();

	const [formOpen, setFormOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<User | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

	const users = data?.users ?? [];

	const handleCreate = () => {
		setEditTarget(null);
		setFormOpen(true);
	};

	const handleEdit = (user: User) => {
		setEditTarget(user);
		setFormOpen(true);
	};

	const handleCloseForm = () => {
		setFormOpen(false);
		setEditTarget(null);
	};

	const handleToggle = async (user: User) => {
		try {
			await toggleStatus.mutateAsync(user.userId);
			toast.success(`${user.name} ${user.isActive ? "deactivated" : "activated"}`);
		} catch {
			toast.error("Failed to update user status");
		}
	};

	const handleDeleteConfirm = async () => {
		if (!deleteTarget) return;
		try {
			await deleteUser.mutateAsync(deleteTarget.userId);
			toast.success(`${deleteTarget.name} deleted`);
			setDeleteTarget(null);
		} catch {
			toast.error("Failed to delete user");
		}
	};

	const columns = buildColumns(handleEdit, setDeleteTarget, handleToggle);

	return (
		<section className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">Users</h1>
					<p className="text-sm text-muted-foreground">Manage system users, their roles, and access status.</p>
				</div>
				<Can permission="manage_users">
					<Button
						size="sm"
						className="gap-2 shrink-0"
						onClick={handleCreate}
					>
						<Plus className="h-4 w-4" />
						New User
					</Button>
				</Can>
			</div>

			<DataTable<User>
				title="All Users"
				titleBadge={users.length > 0 ? String(users.length) : undefined}
				columns={columns}
				data={users}
				keyExtractor={(u) => u.userId}
				isLoading={isLoading}
				error={error}
				emptyState={{
					icon: Users,
					title: "No users found",
					description: "Create the first user to get started.",
					action: { label: "New User", onClick: handleCreate },
				}}
			/>

			<UserFormModal
				open={formOpen}
				onClose={handleCloseForm}
				editTarget={editTarget}
			/>

			<ConfirmDialog
				open={deleteTarget !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				title="Delete User"
				description={
					deleteTarget ? (
						<span>
							Delete <span className="font-medium text-foreground">{deleteTarget.name}</span>? This action cannot be undone.
						</span>
					) : (
						"Delete this user?"
					)
				}
				confirmLabel="Delete"
				variant="destructive"
				isLoading={deleteUser.isPending}
				onConfirm={handleDeleteConfirm}
			/>
		</section>
	);
}
