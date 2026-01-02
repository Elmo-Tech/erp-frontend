"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-display/DataTable";
import { SearchInput } from "@/components/shared/filters/SearchInput";
import { FilterBar } from "@/components/shared/filters/FilterBar";
import { ConfirmDialog } from "@/components/shared/dialogs/ConfirmDialog";
import { useUsers, useDeleteUser, useToggleUserStatus } from "../hooks/useUsers";
import { User, UsersFilters } from "../types";
import { getUsersColumns } from "./columns/usersColumns";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";

interface UsersTableProps {
	onEdit: (user: User) => void;
	onAdd: () => void;
}

export function UsersTable({ onEdit, onAdd }: UsersTableProps) {
	const [filters, setFilters] = useState<UsersFilters>({
		page: 1,
		perPage: 15,
	});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);

	const { data, isLoading, error } = useUsers(filters);
	const deleteUser = useDeleteUser();
	const toggleStatus = useToggleUserStatus();

	const handleSearch = (search: string) => {
		setFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
	};

	const handleDelete = async () => {
		if (!userToDelete) return;

		try {
			await deleteUser.mutateAsync(userToDelete.userId);
			toast.success("User deleted successfully");
			setDeleteDialogOpen(false);
			setUserToDelete(null);
		} catch {
			toast.error("Failed to delete user");
		}
	};

	const handleToggleStatus = async (user: User) => {
		try {
			await toggleStatus.mutateAsync(user.userId);
			toast.success(user.isActive ? "User deactivated successfully" : "User activated successfully");
		} catch {
			toast.error("Failed to update user status");
		}
	};

	const handlePageChange = (page: number) => {
		setFilters((prev) => ({ ...prev, page }));
	};

	const openDeleteDialog = (user: User) => {
		setUserToDelete(user);
		setDeleteDialogOpen(true);
	};

	// Get columns with handlers
	const columns = getUsersColumns({
		onEdit,
		onDelete: openDeleteDialog,
		onToggleStatus: handleToggleStatus,
	});

	return (
		<>
			<DataTable
				title="Users"
				titleBadge={data?.pagination ? `${data.pagination.total} users` : undefined}
				columns={columns}
				data={data?.users || []}
				keyExtractor={(user) => user.userId}
				isLoading={isLoading}
				error={error}
				pagination={data?.pagination}
				onPageChange={handlePageChange}
				emptyState={{
					icon: Users,
					title: "No users found",
					description: "Get started by adding your first user.",
					action: { label: "Add User", onClick: onAdd },
				}}
				headerActions={
					<FilterBar
						actions={
							<Button onClick={onAdd}>
								<Plus className="h-4 w-4 mr-2" />
								Add User
							</Button>
						}
					>
						<SearchInput
							value={filters.search}
							onChange={handleSearch}
							placeholder="Search users..."
							className="w-64"
							autoSearch={false}
						/>
					</FilterBar>
				}
			/>

			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete User"
				description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
				confirmLabel="Delete"
				onConfirm={handleDelete}
				variant="destructive"
				isLoading={deleteUser.isPending}
			/>
		</>
	);
}
