"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/shared/data-display/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Minus, Settings, History } from "lucide-react";
import { UserWithPoints, UserPointsFilters } from "../../types/userPoints";
import { useUsersWithPoints } from "../../hooks/useUserPoints";
import { AddPointsDialog } from "./dialogs/AddPointsDialog";
import { DeductPointsDialog } from "./dialogs/DeductPointsDialog";
import { SetPointsDialog } from "./dialogs/SetPointsDialog";
import { UserPointsHistoryDialog } from "./dialogs/UserPointsHistoryDialog";

interface UserPointsTableProps {
	filters: UserPointsFilters;
	onFiltersChange: (filters: UserPointsFilters) => void;
}

export function UserPointsTable({ filters }: UserPointsTableProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedUser, setSelectedUser] = useState<UserWithPoints | null>(null);
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [deductDialogOpen, setDeductDialogOpen] = useState(false);
	const [setDialogOpen, setSetDialogOpen] = useState(false);
	const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

	const { data, isLoading } = useUsersWithPoints(filters, currentPage, 15);

	const columns: Column<UserWithPoints>[] = [
		{
			key: "user",
			header: "Employee",
			render: (user: UserWithPoints) => (
				<div className="flex items-center gap-3">
					<Avatar className="h-8 w-8">
						<AvatarImage
							src={user.avatar}
							alt={user.name}
						/>
						<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
					</Avatar>
					<div>
						<div className="font-medium">{user.name}</div>
						<div className="text-sm text-muted-foreground">{user.email}</div>
					</div>
				</div>
			),
		},
		{
			key: "totalPoints",
			header: "Total Points",
			render: (user: UserWithPoints) => (
				<div className="text-center">
					<Badge
						variant={user.totalPoints >= 100 ? "default" : "secondary"}
						className="text-sm"
					>
						{user.totalPoints} pts
					</Badge>
				</div>
			),
		},
		{
			key: "isActive",
			header: "Status",
			render: (user: UserWithPoints) => <Badge variant={user.isActive ? "default" : "secondary"}>{user.isActive ? "Active" : "Inactive"}</Badge>,
		},
		{
			key: "actions",
			header: "Actions",
			render: (user: UserWithPoints) => (
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setSelectedUser(user);
							setAddDialogOpen(true);
						}}
						className="h-8 w-8 p-0"
					>
						<Plus className="h-4 w-4 text-green-600" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setSelectedUser(user);
							setDeductDialogOpen(true);
						}}
						className="h-8 w-8 p-0"
					>
						<Minus className="h-4 w-4 text-red-600" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setSelectedUser(user);
							setSetDialogOpen(true);
						}}
						className="h-8 w-8 p-0"
					>
						<Settings className="h-4 w-4 text-blue-600" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setSelectedUser(user);
							setHistoryDialogOpen(true);
						}}
						className="h-8 w-8 p-0"
					>
						<History className="h-4 w-4 text-gray-600" />
					</Button>
				</div>
			),
		},
	];

	return (
		<>
			<DataTable<UserWithPoints>
				data={data?.users || []}
				columns={columns}
				keyExtractor={(user) => user.userId.toString()}
				isLoading={isLoading}
				pagination={
					data?.pagination
						? {
								currentPage: data.pagination.currentPage,
								totalPages: data.pagination.totalPages,
								total: data.pagination.total,
								count: data.pagination.count,
								perPage: data.pagination.perPage,
						  }
						: undefined
				}
				onPageChange={setCurrentPage}
			/>

			{/* Dialogs */}
			<AddPointsDialog
				open={addDialogOpen}
				onClose={() => {
					setAddDialogOpen(false);
					setSelectedUser(null);
				}}
				user={selectedUser}
			/>

			<DeductPointsDialog
				open={deductDialogOpen}
				onClose={() => {
					setDeductDialogOpen(false);
					setSelectedUser(null);
				}}
				user={selectedUser}
			/>

			<SetPointsDialog
				open={setDialogOpen}
				onClose={() => {
					setSetDialogOpen(false);
					setSelectedUser(null);
				}}
				user={selectedUser}
			/>

			<UserPointsHistoryDialog
				open={historyDialogOpen}
				onClose={() => {
					setHistoryDialogOpen(false);
					setSelectedUser(null);
				}}
				user={selectedUser}
			/>
		</>
	);
}
