"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-display/DataTable";
import { SearchInput } from "@/components/shared/filters/SearchInput";
import { FilterBar } from "@/components/shared/filters/FilterBar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { useQuotations, useDeleteQuotation } from "../../../hooks/useQuotations";
import { Quotation, QuotationStatus, QuotationFilters } from "../../../types/quotation";
import { getQuotationsColumns } from "./columns";
import { DeleteQuotationDialog } from "../dialogs/DeleteQuotationDialog";
import { Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/features/admin/hooks/usePermissions";

const STATUS_OPTIONS = [
	{ value: QuotationStatus.DRAFT, label: "Draft" },
	{ value: QuotationStatus.SENT, label: "Sent" },
	{ value: QuotationStatus.VIEWED, label: "Viewed" },
	{ value: QuotationStatus.NEGOTIATION, label: "Negotiation" },
	{ value: QuotationStatus.APPROVED, label: "Approved" },
	{ value: QuotationStatus.REJECTED, label: "Rejected" },
	{ value: QuotationStatus.EXPIRED, label: "Expired" },
];

interface QuotationsTableProps {
	onAdd: () => void;
	onEdit: (quotation: Quotation) => void;
	onView?: (quotation: Quotation) => void;
}

export function QuotationsTable({ onAdd, onEdit, onView }: QuotationsTableProps) {
	const [filters, setFilters] = useState<QuotationFilters>({
		page: 1,
		perPage: 15,
	});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null);

	const { data, isLoading, error } = useQuotations(filters);
	const deleteQuotation = useDeleteQuotation();

	const { canCreateQuotations, canEditQuotations, canDeleteQuotations } = usePermissions();

	const handleSearch = (search: string) => {
		setFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
	};

	const handleStatusFilter = (status: string | undefined) => {
		setFilters((prev) => ({
			...prev,
			status: status ? (status as QuotationStatus) : undefined,
			page: 1,
		}));
	};

	const handleDelete = async () => {
		if (!quotationToDelete) return;

		try {
			await deleteQuotation.mutateAsync(quotationToDelete.quotationId);
			toast.success("Quotation deleted successfully");
			setDeleteDialogOpen(false);
			setQuotationToDelete(null);
		} catch {
			toast.error("Failed to delete quotation");
		}
	};

	const handlePageChange = (page: number) => {
		setFilters((prev) => ({ ...prev, page }));
	};

	const openDeleteDialog = (quotation: Quotation) => {
		setQuotationToDelete(quotation);
		setDeleteDialogOpen(true);
	};

	const columns = getQuotationsColumns({
		onView,
		onEdit: canEditQuotations ? onEdit : undefined,
		onDelete: canDeleteQuotations ? openDeleteDialog : undefined,
	});

	return (
		<>
			<DataTable
				title="Quotations"
				titleBadge={data?.pagination ? `${data.pagination.total} quotations` : undefined}
				columns={columns}
				data={data?.quotations || []}
				keyExtractor={(quotation) => quotation.quotationId}
				isLoading={isLoading}
				error={error}
				pagination={data?.pagination}
				onPageChange={handlePageChange}
				onRowClick={onView}
				emptyState={{
					icon: FileText,
					title: "No quotations found",
					description: "Get started by creating your first quotation.",
					action: canCreateQuotations ? { label: "Create Quotation", onClick: onAdd } : undefined,
				}}
				headerActions={
					<FilterBar
						actions={
							canCreateQuotations ? (
								<Button onClick={onAdd}>
									<Plus className="h-4 w-4 mr-2" />
									New Quotation
								</Button>
							) : undefined
						}
					>
						<SearchInput
							value={filters.search}
							onChange={handleSearch}
							placeholder="Search quotations..."
							className="w-64"
							autoSearch={false}
						/>
						<FilterSelect
							value={filters.status || ""}
							onChange={handleStatusFilter}
							options={STATUS_OPTIONS}
							placeholder="Status"
							className="w-40"
						/>
					</FilterBar>
				}
			/>

			<DeleteQuotationDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				quotation={quotationToDelete}
				onConfirm={handleDelete}
				isLoading={deleteQuotation.isPending}
			/>
		</>
	);
}
