"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-display/DataTable";
import { SearchInput } from "@/components/shared/filters/SearchInput";
import { FilterBar } from "@/components/shared/filters/FilterBar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { ConfirmDialog } from "@/components/shared/dialogs/ConfirmDialog";
import { useLeads, useDeleteLead } from "../hooks/useLeads";
import { Lead, LeadStatus, LeadPriority, LeadSource, LeadFilters } from "../types/lead";
import { getLeadsColumns } from "./columns/leadsColumns";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/features/admin/hooks/usePermissions";

const STATUS_OPTIONS = [
	{ value: LeadStatus.NEW, label: "New" },
	{ value: LeadStatus.CONTACTED, label: "Contacted" },
	{ value: LeadStatus.QUALIFIED, label: "Qualified" },
	{ value: LeadStatus.PROPOSAL, label: "Proposal" },
	{ value: LeadStatus.NEGOTIATION, label: "Negotiation" },
	{ value: LeadStatus.WON, label: "Won" },
	{ value: LeadStatus.LOST, label: "Lost" },
];

const PRIORITY_OPTIONS = [
	{ value: LeadPriority.LOW, label: "Low" },
	{ value: LeadPriority.MEDIUM, label: "Medium" },
	{ value: LeadPriority.HIGH, label: "High" },
	{ value: LeadPriority.URGENT, label: "Urgent" },
];

const SOURCE_OPTIONS = [
	{ value: LeadSource.WEBSITE, label: "Website" },
	{ value: LeadSource.REFERRAL, label: "Referral" },
	{ value: LeadSource.LINKEDIN, label: "LinkedIn" },
	{ value: LeadSource.FACEBOOK, label: "Facebook" },
	{ value: LeadSource.GOOGLE, label: "Google" },
	{ value: LeadSource.DIRECT, label: "Direct" },
	{ value: LeadSource.OTHER, label: "Other" },
];

interface LeadsTableProps {
	onAdd: () => void;
}

export function LeadsTable({ onAdd }: LeadsTableProps) {
	const router = useRouter();
	const [filters, setFilters] = useState<LeadFilters>({
		page: 1,
		perPage: 15,
	});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

	const { data, isLoading, error } = useLeads(filters);
	const deleteLead = useDeleteLead();

	// Permission checks
	const { canCreateLeads, canDeleteLeads } = usePermissions();

	const handleSearch = (search: string) => {
		setFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
	};

	const handleStatusFilter = (status: string | undefined) => {
		setFilters((prev) => ({
			...prev,
			status: status ? (status as LeadStatus) : undefined,
			page: 1,
		}));
	};

	const handlePriorityFilter = (priority: string | undefined) => {
		setFilters((prev) => ({
			...prev,
			priority: priority ? (priority as LeadPriority) : undefined,
			page: 1,
		}));
	};

	const handleSourceFilter = (source: string | undefined) => {
		setFilters((prev) => ({
			...prev,
			source: source ? (source as LeadSource) : undefined,
			page: 1,
		}));
	};

	const handleView = (lead: Lead) => {
		router.push(`/dashboard/sales/leads/${lead.leadId}`);
	};

	const handleDelete = async () => {
		if (!leadToDelete) return;

		try {
			await deleteLead.mutateAsync(leadToDelete.leadId);
			toast.success("Lead deleted successfully");
			setDeleteDialogOpen(false);
			setLeadToDelete(null);
		} catch {
			toast.error("Failed to delete lead");
		}
	};

	const handlePageChange = (page: number) => {
		setFilters((prev) => ({ ...prev, page }));
	};

	const openDeleteDialog = (lead: Lead) => {
		setLeadToDelete(lead);
		setDeleteDialogOpen(true);
	};

	const columns = getLeadsColumns({
		onView: handleView,
		onDelete: canDeleteLeads ? openDeleteDialog : undefined,
	});

	return (
		<>
			<DataTable
				title="Leads"
				titleBadge={data?.pagination ? `${data.pagination.total} leads` : undefined}
				columns={columns}
				data={data?.leads || []}
				keyExtractor={(lead) => lead.leadId}
				isLoading={isLoading}
				error={error}
				pagination={data?.pagination}
				onPageChange={handlePageChange}
				onRowClick={handleView}
				emptyState={{
					icon: Users,
					title: "No leads found",
					description: "Get started by adding your first lead.",
					action: canCreateLeads ? { label: "Add Lead", onClick: onAdd } : undefined,
				}}
				headerActions={
					<FilterBar
						actions={
							canCreateLeads ? (
								<Button onClick={onAdd}>
									<Plus className="h-4 w-4 mr-2" />
									Add Lead
								</Button>
							) : undefined
						}
					>
						<SearchInput
							value={filters.search}
							onChange={handleSearch}
							placeholder="Search leads..."
							className="w-64"
							autoSearch={false}
						/>
						<FilterSelect
							value={filters.status || ""}
							onChange={handleStatusFilter}
							options={STATUS_OPTIONS}
							placeholder="Status"
							className="w-36"
						/>
						<FilterSelect
							value={filters.priority || ""}
							onChange={handlePriorityFilter}
							options={PRIORITY_OPTIONS}
							placeholder="Priority"
							className="w-36"
						/>
						<FilterSelect
							value={filters.source || ""}
							onChange={handleSourceFilter}
							options={SOURCE_OPTIONS}
							placeholder="Source"
							className="w-36"
						/>
					</FilterBar>
				}
			/>

			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Lead"
				description={`Are you sure you want to delete ${leadToDelete?.name}? This action cannot be undone.`}
				confirmLabel="Delete"
				onConfirm={handleDelete}
				variant="destructive"
				isLoading={deleteLead.isPending}
			/>
		</>
	);
}
