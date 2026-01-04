"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DataTable, EmptyState, LoadingState, StatusBadge, getStatusVariant, SearchInput, FilterSelect, ConfirmDialog } from "@/components/shared";
import { Column } from "@/components/shared/data-display/DataTable";
import { MoreHorizontal, Eye, Edit, Trash2, FileText, Plus } from "lucide-react";
import { useQuotations, useDeleteQuotation } from "../hooks/useQuotations";
import { Quotation, QuotationStatus, QuotationFilters } from "../types/quotation";
import { toast } from "sonner";

const STATUS_OPTIONS = [
	{ value: "", label: "All Statuses" },
	{ value: QuotationStatus.DRAFT, label: "Draft" },
	{ value: QuotationStatus.SENT, label: "Sent" },
	{ value: QuotationStatus.ACCEPTED, label: "Accepted" },
	{ value: QuotationStatus.REJECTED, label: "Rejected" },
	{ value: QuotationStatus.EXPIRED, label: "Expired" },
];

interface QuotationListProps {
	onCreateNew?: () => void;
	onView?: (quotation: Quotation) => void;
	onEdit?: (quotation: Quotation) => void;
}

export function QuotationList({ onCreateNew, onView, onEdit }: QuotationListProps) {
	const [filters, setFilters] = useState<QuotationFilters>({});
	const [deleteTarget, setDeleteTarget] = useState<Quotation | null>(null);

	const { data, isLoading, error } = useQuotations(filters);
	const deleteMutation = useDeleteQuotation();

	const handleDelete = async () => {
		if (!deleteTarget) return;
		try {
			await deleteMutation.mutateAsync({
				id: deleteTarget.quotationId,
				leadId: deleteTarget.leadId,
			});
			toast.success("Quotation deleted successfully");
			setDeleteTarget(null);
		} catch {
			toast.error("Failed to delete quotation");
		}
	};

	const formatCurrency = (amount: number, currency: string) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency,
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const columns: Column<Quotation>[] = [
		{
			key: "quotationId",
			header: "ID",
			render: (item) => <span className="font-mono text-sm">#{item.quotationId}</span>,
		},
		{
			key: "lead",
			header: "Lead",
			render: (item) => (
				<div>
					<p className="font-medium">{item.lead?.name || "N/A"}</p>
					{item.lead?.company && <p className="text-sm text-muted-foreground">{item.lead.company}</p>}
				</div>
			),
		},
		{
			key: "totalHours",
			header: "Total Hours",
			render: (item) => <span>{item.pricingBreakdown?.totalHours || 0}h</span>,
		},
		{
			key: "finalPrice",
			header: "Final Price",
			render: (item) => <span className="font-semibold">{formatCurrency(item.finalPrice, item.currency)}</span>,
		},
		{
			key: "status",
			header: "Status",
			render: (item) => (
				<StatusBadge
					label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
					variant={getStatusVariant(item.status)}
				/>
			),
		},
		{
			key: "createdAt",
			header: "Created",
			render: (item) => formatDate(item.createdAt),
		},
		{
			key: "actions",
			header: "",
			render: (item) => (
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
						<DropdownMenuItem onClick={() => onView?.(item)}>
							<Eye className="mr-2 h-4 w-4" />
							View
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onEdit?.(item)}>
							<Edit className="mr-2 h-4 w-4" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => setDeleteTarget(item)}
							className="text-destructive"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	if (isLoading) {
		return (
			<LoadingState
				variant="table"
				rows={5}
			/>
		);
	}

	if (error) {
		return (
			<EmptyState
				icon={FileText}
				title="Error loading quotations"
				description="Something went wrong while loading quotations."
			/>
		);
	}

	const quotations = data?.quotations || [];

	return (
		<div className="space-y-4">
			{/* Filters */}
			<Card>
				<CardContent className="pt-4">
					<div className="flex flex-col sm:flex-row gap-4">
						<SearchInput
							placeholder="Search quotations..."
							value={filters.search || ""}
							onChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
							className="flex-1"
						/>
						<FilterSelect
							placeholder="Filter by status"
							options={STATUS_OPTIONS}
							value={filters.status || ""}
							onChange={(value) =>
								setFilters((prev) => ({
									...prev,
									status: value as QuotationStatus | undefined,
								}))
							}
						/>
						{onCreateNew && (
							<Button onClick={onCreateNew}>
								<Plus className="mr-2 h-4 w-4" />
								New Quotation
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Table or Empty State */}
			{quotations.length === 0 ? (
				<EmptyState
					icon={FileText}
					title="No quotations yet"
					description="Create your first quotation to get started."
					action={onCreateNew ? { label: "Create Quotation", onClick: onCreateNew } : undefined}
				/>
			) : (
				<DataTable
					columns={columns}
					data={quotations}
					keyExtractor={(item) => item.quotationId}
					pagination={data?.pagination}
					onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
				/>
			)}

			{/* Delete Confirmation */}
			<ConfirmDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				title="Delete Quotation"
				description={`Are you sure you want to delete quotation #${deleteTarget?.quotationId}? This action cannot be undone.`}
				onConfirm={handleDelete}
				isLoading={deleteMutation.isPending}
				variant="destructive"
			/>
		</div>
	);
}
