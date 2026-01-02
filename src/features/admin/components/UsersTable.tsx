"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsers, useDeleteUser, useToggleUserStatus } from "../hooks/useUsers";
import { User, UsersFilters } from "../types";
import { MoreHorizontal, Search, Plus, Pencil, Trash2, UserCheck, UserX } from "lucide-react";
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
	const [searchInput, setSearchInput] = useState("");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);

	const { data, isLoading, error } = useUsers(filters);
	const deleteUser = useDeleteUser();
	const toggleStatus = useToggleUserStatus();

	const handleSearch = () => {
		setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
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

	if (error) {
		return <div className="text-center py-8 text-destructive">Failed to load users. Please try again.</div>;
	}

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search users..."
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							onKeyDown={handleKeyDown}
							className="pl-9 w-64"
						/>
					</div>
					<Button
						variant="outline"
						onClick={handleSearch}
					>
						Search
					</Button>
				</div>
				<Button onClick={onAdd}>
					<Plus className="h-4 w-4 mr-2" />
					Add User
				</Button>
			</div>

			{/* Table */}
			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Roles</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="w-[70px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<Skeleton className="h-4 w-32" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-48" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-16" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-8" />
									</TableCell>
								</TableRow>
							))
						) : data?.users.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-center py-8 text-muted-foreground"
								>
									No users found
								</TableCell>
							</TableRow>
						) : (
							data?.users.map((user) => (
								<TableRow key={user.userId}>
									<TableCell className="font-medium">{user.name}</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>
										<div className="flex gap-1 flex-wrap">
											{user.roles.map((role) => (
												<Badge
													key={role}
													variant="secondary"
												>
													{role}
												</Badge>
											))}
										</div>
									</TableCell>
									<TableCell>
										<Badge variant={user.isActive ? "default" : "destructive"}>{user.isActive ? "Active" : "Inactive"}</Badge>
									</TableCell>
									<TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => onEdit(user)}>
													<Pencil className="h-4 w-4 mr-2" />
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleToggleStatus(user)}>
													{user.isActive ? (
														<>
															<UserX className="h-4 w-4 mr-2" />
															Deactivate
														</>
													) : (
														<>
															<UserCheck className="h-4 w-4 mr-2" />
															Activate
														</>
													)}
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => {
														setUserToDelete(user);
														setDeleteDialogOpen(true);
													}}
												>
													<Trash2 className="h-4 w-4 mr-2" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{data?.pagination && data.pagination.totalPages > 1 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Showing {data.pagination.count} of {data.pagination.total} users
					</p>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={data.pagination.currentPage === 1}
							onClick={() => handlePageChange(data.pagination.currentPage - 1)}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={data.pagination.currentPage === data.pagination.totalPages}
							onClick={() => handlePageChange(data.pagination.currentPage + 1)}
						>
							Next
						</Button>
					</div>
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete User</AlertDialogTitle>
						<AlertDialogDescription>Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
