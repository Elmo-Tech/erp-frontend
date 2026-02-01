"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-display/DataTable";
import { SearchInput } from "@/components/shared/filters/SearchInput";
import { FilterBar } from "@/components/shared/filters/FilterBar";
import { useUsers, useDeleteUser, useToggleUserStatus } from "../../../hooks/useUsers";
import { User, UsersFilters } from "../../../types";
import { getUsersColumns } from "./columns";
import { DeleteUserDialog } from "../dialogs/DeleteUserDialog";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";

interface UsersTableProps {
	onEdit?: (user: User) => void;
	onAdd?: () => void;
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
					action: onAdd ? { label: "Add User", onClick: onAdd } : undefined,
				}}
				headerActions={
					<FilterBar
						actions={
							onAdd ? (
								<Button onClick={onAdd}>
									<Plus className="h-4 w-4 mr-2" />
									Add User
								</Button>
							) : null
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

			<DeleteUserDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				user={userToDelete}
				onConfirm={handleDelete}
				isLoading={deleteUser.isPending}
			/>
		</>
	);
}
