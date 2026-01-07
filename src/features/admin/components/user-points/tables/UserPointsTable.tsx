"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-display/DataTable";
import { SearchInput } from "@/components/shared/filters/SearchInput";
import { FilterBar } from "@/components/shared/filters/FilterBar";
import { UserWithPoints, UserPointsFilters } from "../../../types/userPoints";
import { useUsersWithPoints } from "../../../hooks/useUserPoints";
import { getUserPointsColumns } from "./columns";
import { AddPointsDialog } from "../dialogs/AddPointsDialog";
import { DeductPointsDialog } from "../dialogs/DeductPointsDialog";
import { SetPointsDialog } from "../dialogs/SetPointsDialog";
import { UserPointsHistoryDialog } from "../dialogs/UserPointsHistoryDialog";
import { Plus, Award } from "lucide-react";
import { usePermissions } from "@/features/admin/hooks/usePermissions";

interface UserPointsTableProps {
	filters: UserPointsFilters;
	onFiltersChange: (filters: UserPointsFilters) => void;
}

export function UserPointsTable({ filters, onFiltersChange }: UserPointsTableProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedUser, setSelectedUser] = useState<UserWithPoints | null>(null);
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [deductDialogOpen, setDeductDialogOpen] = useState(false);
	const [setDialogOpen, setSetDialogOpen] = useState(false);
	const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

	const { data, isLoading, error } = useUsersWithPoints(filters, currentPage, 15);
	const { canManageUserPoints } = usePermissions();

	// For header button - opens dialog without pre-selected user
	const handleOpenAddDialog = () => {
		setSelectedUser(null);
		setAddDialogOpen(true);
	};

	const handleSearch = (search: string) => {
		onFiltersChange({ ...filters, search: search || undefined });
	};

	const handleAddPoints = (user: UserWithPoints) => {
		console.log("Add points clicked for:", user.name);
		setSelectedUser(user);
		setAddDialogOpen(true);
	};

	const handleDeductPoints = (user: UserWithPoints) => {
		console.log("Deduct points clicked for:", user.name);
		setSelectedUser(user);
		setDeductDialogOpen(true);
	};

	const handleSetPoints = (user: UserWithPoints) => {
		console.log("Set points clicked for:", user.name);
		setSelectedUser(user);
		setSetDialogOpen(true);
	};

	const handleViewHistory = (user: UserWithPoints) => {
		console.log("History clicked for:", user.name);
		setSelectedUser(user);
		setHistoryDialogOpen(true);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const columns = getUserPointsColumns({
		onAddPoints: canManageUserPoints ? handleAddPoints : () => {},
		onDeductPoints: canManageUserPoints ? handleDeductPoints : () => {},
		onSetPoints: canManageUserPoints ? handleSetPoints : () => {},
		onViewHistory: handleViewHistory,
	});

	return (
		<>
			<DataTable
				title="Employee Points"
				titleBadge={data?.pagination ? `${data.pagination.total} employees` : undefined}
				columns={columns}
				data={data?.users || []}
				keyExtractor={(user) => user.userId.toString()}
				isLoading={isLoading}
				error={error}
				pagination={data?.pagination}
				onPageChange={handlePageChange}
				emptyState={{
					icon: Award,
					title: "No employees found",
					description: "No employees with points data available.",
				}}
				headerActions={
					<FilterBar
						actions={
							canManageUserPoints ? (
								<Button onClick={handleOpenAddDialog}>
									<Plus className="h-4 w-4 mr-2" />
									Add Points
								</Button>
							) : undefined
						}
					>
						<SearchInput
							value={filters.search}
							onChange={handleSearch}
							placeholder="Search employees..."
							className="w-64"
							autoSearch={false}
						/>
					</FilterBar>
				}
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
