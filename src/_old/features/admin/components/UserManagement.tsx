/**
 * UserManagement Component
 * Complete user management interface with table, forms, and internal cost management.
 * Includes permission-based access control for sensitive fields.
 *
 * Requirements: FE-Pack 3 - User Management with internal_hourly_cost
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { DataTable } from "@/shared/ui/data-display/DataTable";
import { SearchInput } from "@/shared/ui/filters/SearchInput";
import { FilterSelect, FilterOption } from "@/shared/ui/filters/FilterSelect";
import { FilterBar } from "@/shared/ui/filters/FilterBar";
import { Plus, Users, AlertCircle, RefreshCw, Filter } from "lucide-react";

import { useUsers } from "../hooks/useUsers";
import { useRoles } from "../hooks/useRoles";
import { usePermissions } from "../hooks/usePermissions";
import { User, UsersFilters } from "../types";
import { getUsersColumns } from "./users/tables";
import { CreateUserForm } from "./users/forms/CreateUserForm";
import { UpdateUserForm } from "./users/forms/UpdateUserForm";
import { DeleteUserDialog } from "./users/dialogs/DeleteUserDialog";

/**
 * UserManagement Component
 * Complete user management interface
 */
export function UserManagement() {
	const { canViewUsers, canCreateUsers, canEditUsers, canDeleteUsers } = usePermissions();

	// State for filters and dialogs
	const [filters, setFilters] = useState<UsersFilters>({
		page: 1,
		perPage: 20,
	});
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	// API calls
	const { data, isLoading, error, refetch } = useUsers(filters);
	const { data: rolesData } = useRoles();

	// Handle filter changes
	const handleFilterChange = (key: keyof UsersFilters, value: string | number | boolean | undefined) => {
		setFilters((prev) => ({
			...prev,
			[key]: value || undefined,
			page: 1,
		}));
	};

	const handlePageChange = (page: number) => {
		setFilters((prev) => ({ ...prev, page }));
	};

	const handleClearFilters = () => {
		setFilters({ page: 1, perPage: 20 });
	};

	// Dialog handlers
	const handleCreateUser = () => {
		setCreateDialogOpen(true);
	};

	const handleEditUser = (user: User) => {
		setSelectedUser(user);
		setUpdateDialogOpen(true);
	};

	const handleDeleteUser = (user: User) => {
		setSelectedUser(user);
		setDeleteDialogOpen(true);
	};

	const handleSuccess = () => {
		refetch();
	};

	// Permission check
	if (!canViewUsers) {
		return (
			<div className="container mx-auto p-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>You don&apos;t have permission to view users. This feature requires the &apos;view_users&apos; permission.</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Role options for filter
	const roleOptions: FilterOption[] = [
		...(rolesData?.roles?.map((role) => ({
			value: role.name,
			label: role.name,
		})) || []),
	];

	// Status options for filter
	const statusOptions: FilterOption[] = [
		{ value: "true", label: "Active" },
		{ value: "false", label: "Inactive" },
	];

	// Get columns with action handlers
	const columns = getUsersColumns({
		onEdit: canEditUsers ? handleEditUser : () => {},
		onDelete: canDeleteUsers ? handleDeleteUser : () => {},
		onToggleStatus: () => {}, // Add toggle status handler
	});

	// Count active filters
	const activeFiltersCount = Object.keys(filters).filter((key) => key !== "page" && key !== "perPage" && filters[key as keyof UsersFilters]).length;

	// Statistics
	const totalUsers = data?.pagination?.total || 0;
	const activeUsers = data?.users?.filter((user) => user.isActive).length || 0;
	const inactiveUsers = totalUsers - activeUsers;

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">User Management</h1>
					<p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
				</div>

				{canCreateUsers && (
					<Button onClick={handleCreateUser}>
						<Plus className="h-4 w-4 mr-2" />
						Add User
					</Button>
				)}
			</div>

			{/* Statistics Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							Showing {data?.users?.length || 0} of {totalUsers}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
						<Users className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">{activeUsers}</div>
						<p className="text-xs text-muted-foreground">Can log in and access system</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Inactive Users</CardTitle>
						<Users className="h-4 w-4 text-red-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">{inactiveUsers}</div>
						<p className="text-xs text-muted-foreground">Disabled accounts</p>
					</CardContent>
				</Card>
			</div>

			{/* Users Table */}
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
					description: "Try adjusting your filters or create your first user",
					action: canCreateUsers
						? {
								label: "Add User",
								onClick: handleCreateUser,
							}
						: undefined,
				}}
				headerActions={
					<FilterBar
						actions={
							<div className="flex items-center gap-2">
								{activeFiltersCount > 0 && (
									<Button
										variant="outline"
										size="sm"
										onClick={handleClearFilters}
									>
										Clear ({activeFiltersCount})
									</Button>
								)}
								<Button
									variant="outline"
									size="sm"
									onClick={() => refetch()}
									disabled={isLoading}
								>
									<RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
									Refresh
								</Button>
							</div>
						}
					>
						<SearchInput
							value={filters.search || ""}
							onChange={(value) => handleFilterChange("search", value)}
							placeholder="Search users..."
							className="w-64"
						/>
						<FilterSelect
							value={filters.role}
							onChange={(value) => handleFilterChange("role", value)}
							options={roleOptions}
							placeholder="All Roles"
							icon={Filter}
						/>
						<FilterSelect
							value={filters.isActive?.toString()}
							onChange={(value) => handleFilterChange("isActive", value === "true")}
							options={statusOptions}
							placeholder="All Status"
							icon={Filter}
						/>
					</FilterBar>
				}
			/>

			{/* Dialogs */}
			<CreateUserForm
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				onSuccess={handleSuccess}
			/>

			{selectedUser && (
				<>
					<UpdateUserForm
						open={updateDialogOpen}
						onOpenChange={setUpdateDialogOpen}
						user={selectedUser}
						onSuccess={handleSuccess}
					/>

					<DeleteUserDialog
						open={deleteDialogOpen}
						onOpenChange={setDeleteDialogOpen}
						user={selectedUser}
						onConfirm={handleSuccess}
					/>
				</>
			)}
		</div>
	);
}

export default UserManagement;
