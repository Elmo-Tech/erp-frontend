"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-display/DataTable";
import { SearchInput } from "@/components/shared/filters/SearchInput";
import { FilterBar } from "@/components/shared/filters/FilterBar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { ConfirmDialog } from "@/components/shared/dialogs/ConfirmDialog";
import { useContracts, useDeleteContract } from "../hooks/useContracts";
import { Contract, ContractStatus, ContractFilters } from "../types/contract";
import { getContractsColumns } from "./columns/contractsColumns";
import { Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/features/admin/hooks/usePermissions";

const STATUS_OPTIONS = [
	{ value: ContractStatus.DRAFT, label: "Draft" },
	{ value: ContractStatus.PENDING_SIGNATURE, label: "Pending Signature" },
	{ value: ContractStatus.SIGNED, label: "Signed" },
	{ value: ContractStatus.ACTIVE, label: "Active" },
	{ value: ContractStatus.COMPLETED, label: "Completed" },
	{ value: ContractStatus.TERMINATED, label: "Terminated" },
];

interface ContractsTableProps {
	onAdd: () => void;
}

export function ContractsTable({ onAdd }: ContractsTableProps) {
	const router = useRouter();
	const [filters, setFilters] = useState<ContractFilters>({
		page: 1,
		perPage: 15,
	});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);

	const { data, isLoading, error } = useContracts(filters);
	const deleteContract = useDeleteContract();

	// Permission checks
	const { canCreateContracts, canDeleteContracts } = usePermissions();

	const handleSearch = (search: string) => {
		setFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
	};

	const handleStatusFilter = (status: string | undefined) => {
		setFilters((prev) => ({
			...prev,
			status: status ? (status as ContractStatus) : undefined,
			page: 1,
		}));
	};

	const handleView = (contract: Contract) => {
		router.push(`/dashboard/sales/contracts/${contract.contractId}`);
	};

	const handleDelete = async () => {
		if (!contractToDelete) return;

		try {
			await deleteContract.mutateAsync(contractToDelete.contractId);
			toast.success("Contract deleted successfully");
			setDeleteDialogOpen(false);
			setContractToDelete(null);
		} catch {
			toast.error("Failed to delete contract");
		}
	};

	const handlePageChange = (page: number) => {
		setFilters((prev) => ({ ...prev, page }));
	};

	const openDeleteDialog = (contract: Contract) => {
		setContractToDelete(contract);
		setDeleteDialogOpen(true);
	};

	const columns = getContractsColumns({
		onView: handleView,
		onDelete: canDeleteContracts ? openDeleteDialog : undefined,
	});

	return (
		<>
			<DataTable
				title="Contracts"
				titleBadge={data?.pagination ? `${data.pagination.total} contracts` : undefined}
				columns={columns}
				data={data?.contracts || []}
				keyExtractor={(contract) => contract.contractId}
				isLoading={isLoading}
				error={error}
				pagination={data?.pagination}
				onPageChange={handlePageChange}
				onRowClick={handleView}
				emptyState={{
					icon: FileText,
					title: "No contracts found",
					description: "Get started by creating your first contract.",
					action: canCreateContracts ? { label: "Create Contract", onClick: onAdd } : undefined,
				}}
				headerActions={
					<FilterBar
						actions={
							canCreateContracts ? (
								<Button onClick={onAdd}>
									<Plus className="h-4 w-4 mr-2" />
									New Contract
								</Button>
							) : undefined
						}
					>
						<SearchInput
							value={filters.search}
							onChange={handleSearch}
							placeholder="Search contracts..."
							className="w-64"
							autoSearch={false}
						/>
						<FilterSelect
							value={filters.status || ""}
							onChange={handleStatusFilter}
							options={STATUS_OPTIONS}
							placeholder="Status"
							className="w-44"
						/>
					</FilterBar>
				}
			/>

			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Contract"
				description={`Are you sure you want to delete contract ${contractToDelete?.contractNumber}? This action cannot be undone.`}
				confirmLabel="Delete"
				onConfirm={handleDelete}
				variant="destructive"
				isLoading={deleteContract.isPending}
			/>
		</>
	);
}
