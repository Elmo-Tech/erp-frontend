"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Funnel, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { SearchInput } from "@/shared/ui/filters/SearchInput";
import { FilterSelect } from "@/shared/ui/filters/FilterSelect";
import { Pagination } from "@/shared/ui/data-display/Pagination";
import { leadApi } from "@/entities/lead/api/lead.api";
import { leadKeys } from "@/entities/lead/model/query-keys";
import { LeadStatus, LeadStatusLabels, LeadSource, LeadSourceLabels } from "@/entities/lead/model/types";
import type { Lead, LeadFilters } from "@/entities/lead/model/types";
import { LeadCard } from "@/entities/lead/ui/LeadCard";
import { useDeleteLead } from "@/features/leads/model/use-lead-actions";
import { CreateLeadForm } from "@/features/leads/ui/CreateLeadForm";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { cn } from "@/shared/lib/utils";

const DEFAULT_PER_PAGE = 15;

const statusOptions = Object.entries(LeadStatusLabels).map(([value, label]) => ({ value, label: String(label) }));
const sourceOptions = Object.entries(LeadSourceLabels).map(([value, label]) => ({ value, label: String(label) }));

export function SalesPipelineWidget({ className }: { className?: string }) {
	const router = useRouter();
	const [filters, setFilters] = useState<LeadFilters>({ page: 1, perPage: DEFAULT_PER_PAGE });
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

	const leadsQuery = useQuery({
		queryKey: leadKeys.list(filters),
		queryFn: () => leadApi.getLeads(filters),
		staleTime: 5 * 60 * 1000,
	});

	const leads = leadsQuery.data?.leads ?? [];
	const pagination = leadsQuery.data?.pagination;
	const deleteLead = useDeleteLead();

	const handleSearch = (search: string) => {
		setFilters((current) => ({ ...current, search: search || undefined, page: 1 }));
	};

	const handleStatusFilter = (value: string | undefined) => {
		setFilters((current) => ({ ...current, status: value ? (value as LeadStatus) : undefined, page: 1 }));
	};

	const handleSourceFilter = (value: string | undefined) => {
		setFilters((current) => ({ ...current, source: value ? (value as LeadSource) : undefined, page: 1 }));
	};

	const handlePageChange = (page: number) => {
		setFilters((current) => ({ ...current, page }));
	};

	const handleView = (lead: Lead) => {
		router.push(`/dashboard/sales/leads/${lead.leadId}`);
	};

	const handleConfirmDelete = async () => {
		if (!leadToDelete) return;
		try {
			await deleteLead.mutateAsync(leadToDelete.leadId);
			toast.success("Lead deleted");
			setLeadToDelete(null);
		} catch {
			toast.error("Failed to delete lead");
		}
	};

	return (
		<section className={cn("flex flex-col gap-4", className)}>
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">Sales Pipeline</h1>
					<p className="text-sm text-muted-foreground">Track leads through the sales funnel from first contact to conversion.</p>
				</div>
				<Button size="sm" onClick={() => setCreateDialogOpen(true)}>
					<Plus data-icon="inline-start" />
					New lead
				</Button>
			</div>

			<div className="flex flex-col gap-3 border-y py-3 md:flex-row md:items-center md:justify-between">
				<div className="flex flex-1 items-center gap-2">
					<SearchInput
						value={filters.search}
						onChange={handleSearch}
						placeholder="Search leads"
						className="w-full md:max-w-sm"
						autoSearch={false}
					/>
					<FilterSelect
						value={filters.status ?? ""}
						onChange={handleStatusFilter}
						options={statusOptions}
						placeholder="Status"
						icon={Funnel}
						className="w-32"
					/>
					<FilterSelect
						value={filters.source ?? ""}
						onChange={handleSourceFilter}
						options={sourceOptions}
						placeholder="Source"
						icon={Funnel}
						className="w-32"
					/>
				</div>
				<p className="text-xs tabular-nums text-muted-foreground">
					{pagination ? `${pagination.total} leads` : "Loading leads"}
				</p>
			</div>

			<div className="overflow-hidden rounded-md border bg-background">
				<div className="hidden border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[minmax(180px,1.5fr)_minmax(140px,1fr)_90px_100px_90px_40px] md:items-center md:gap-3">
					<span>Lead</span>
					<span>Company</span>
					<span>Status</span>
					<span>Temperature</span>
					<span>Budget</span>
					<span className="sr-only">Actions</span>
				</div>

				{leadsQuery.isLoading ? (
					<LeadRowsSkeleton />
				) : leadsQuery.error ? (
					<div className="flex min-h-40 flex-col items-center justify-center gap-1 px-4 text-center">
						<div className="text-sm font-medium">Unable to load leads</div>
						<div className="text-sm text-muted-foreground">{leadsQuery.error.message}</div>
					</div>
				) : leads.length === 0 ? (
					<div className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 text-center">
						<Funnel className="size-6 text-muted-foreground" />
						<div className="flex flex-col gap-1">
							<div className="text-sm font-medium">No leads found</div>
							<div className="text-sm text-muted-foreground">Create a lead or adjust your search.</div>
						</div>
						<Button size="sm" variant="outline" onClick={() => setCreateDialogOpen(true)}>
							<Plus data-icon="inline-start" />
							New lead
						</Button>
					</div>
				) : (
					leads.map((lead) => (
						<LeadCard
							key={lead.leadId}
							lead={lead}
							onView={handleView}
							onDelete={() => setLeadToDelete(lead)}
						/>
					))
				)}
			</div>

			{pagination && <Pagination pagination={pagination} onPageChange={handlePageChange} />}

			<CreateLeadForm open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

			<ConfirmDialog
				open={Boolean(leadToDelete)}
				onOpenChange={(open) => { if (!open) setLeadToDelete(null); }}
				title="Delete lead"
				description={
					<span>
						Delete <span className="font-medium text-foreground">{leadToDelete?.name}</span>? This action cannot be undone.
					</span>
				}
				confirmLabel="Delete"
				variant="destructive"
				onConfirm={handleConfirmDelete}
				isLoading={deleteLead.isPending}
			/>
		</section>
	);
}

function LeadRowsSkeleton() {
	return (
		<div className="flex flex-col">
			{Array.from({ length: 8 }).map((_, index) => (
				<div key={index} className="grid min-h-14 grid-cols-1 gap-2 border-b px-3 py-2.5 last:border-b-0 md:grid-cols-[minmax(180px,1.5fr)_minmax(140px,1fr)_90px_100px_90px_40px] md:items-center md:gap-3">
					<div className="flex flex-col gap-1">
						<Skeleton className="h-4 w-36" />
						<Skeleton className="h-3 w-44" />
					</div>
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-5 w-20" />
					<Skeleton className="h-5 w-16" />
					<Skeleton className="h-4 w-20" />
					<Skeleton className="size-8" />
				</div>
			))}
		</div>
	);
}
