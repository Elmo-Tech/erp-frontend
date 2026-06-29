"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Can } from "@/shared/ui/Can";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { FilterSelect } from "@/shared/ui/filters/FilterSelect";
import { DatePicker } from "@/shared/ui/forms";
import { SubscriptionFormModal } from "@/features/finance/ui/SubscriptionFormModal";
import { DeleteSubscriptionDialog } from "@/features/finance/ui/DeleteSubscriptionDialog";
import { useSubscriptions } from "@/features/finance/model/use-finance-actions";
import { clientApi } from "@/entities/client/api/client.api";
import { clientKeys } from "@/entities/client/model/query-keys";
import { projectApi } from "@/entities/project/api/project.api";
import { projectKeys } from "@/entities/project/model/query-keys";
import type { FinanceFilters, Subscription } from "@/entities/finance/model/types";
import { formatCurrency } from "@/shared/lib/formatters";
import { formatDate } from "@/shared/lib/dateUtils";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Column definitions
// ─────────────────────────────────────────────────────────────────────────────

function buildColumns(onEdit: (sub: Subscription) => void, onDelete: (sub: Subscription) => void): Column<Subscription>[] {
	return [
		{
			key: "name",
			header: "Name",
			render: (sub) => (
				<div className="min-w-0">
					<p className="text-sm font-medium truncate">{sub.name}</p>
					{sub.provider && <p className="text-xs text-muted-foreground truncate">{sub.provider}</p>}
				</div>
			),
		},
		{
			key: "cost",
			header: "Cost",
			className: "text-right",
			render: (sub) => (
				<div className="text-right">
					<span className="text-sm font-semibold tabular-nums">{formatCurrency(sub.cost, sub.currency)}</span>
					<p className="text-xs text-muted-foreground capitalize">{sub.billingCycle}</p>
				</div>
			),
		},
		{
			key: "nextBillingDate",
			header: "Next Billing",
			render: (sub) => <span className="text-sm text-muted-foreground">{formatDate(sub.nextBillingDate)}</span>,
		},
		{
			key: "status",
			header: "Status",
			render: (sub) => (
				<Badge
					variant={sub.status === "active" ? "default" : "secondary"}
					className="capitalize text-xs"
				>
					{sub.status}
				</Badge>
			),
		},
		{
			key: "actions",
			header: "",
			className: "text-right",
			render: (sub) => (
				<Can permission="manage_subscriptions">
					<div className="flex items-center justify-end gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={(e) => {
								e.stopPropagation();
								onEdit(sub);
							}}
						>
							<Pencil className="h-3.5 w-3.5" />
							<span className="sr-only">Edit {sub.name}</span>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-destructive hover:text-destructive"
							onClick={(e) => {
								e.stopPropagation();
								onDelete(sub);
							}}
						>
							<Trash2 className="h-3.5 w-3.5" />
							<span className="sr-only">Delete {sub.name}</span>
						</Button>
					</div>
				</Can>
			),
		},
	];
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget
// ─────────────────────────────────────────────────────────────────────────────

export function SubscriptionsWidget() {
	const [filters, setFilters] = useState<FinanceFilters>({});
	const { data, isLoading, error } = useSubscriptions(filters);
	const subscriptions = data?.data ?? [];
	const clientsQuery = useQuery({ queryKey: clientKeys.list({ perPage: 100 }), queryFn: () => clientApi.getClients({ perPage: 100 }), staleTime: 5 * 60 * 1000 });
	const projectsQuery = useQuery({ queryKey: projectKeys.list({ perPage: 100 }), queryFn: () => projectApi.getProjects({ perPage: 100 }), staleTime: 5 * 60 * 1000 });

	const [formOpen, setFormOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<Subscription | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null);

	const handleCreate = () => {
		setEditTarget(null);
		setFormOpen(true);
	};

	const handleEdit = (sub: Subscription) => {
		setEditTarget(sub);
		setFormOpen(true);
	};

	const handleCloseForm = () => {
		setFormOpen(false);
		setEditTarget(null);
	};

	const columns = buildColumns(handleEdit, setDeleteTarget);
	const clientOptions = useMemo(() => (clientsQuery.data?.clients ?? []).map((client) => ({ value: String(client.id), label: client.display_name })), [clientsQuery.data?.clients]);
	const projectOptions = useMemo(() => (projectsQuery.data?.projects ?? []).map((project) => ({ value: String(project.projectId), label: project.title })), [projectsQuery.data?.projects]);

	return (
		<section className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
					<p className="text-sm text-muted-foreground">Track SaaS tools and recurring software costs.</p>
				</div>
				<Can permission="manage_subscriptions">
					<Button
						size="sm"
						className="gap-2 shrink-0"
						onClick={handleCreate}
					>
						<Plus className="h-4 w-4" />
						Add Subscription
					</Button>
				</Can>
			</div>

			<div className="grid gap-3 border-y py-3 md:grid-cols-2 xl:grid-cols-5">
				<FilterSelect value={filters.status} onChange={(status) => setFilters((current) => ({ ...current, status }))} options={[{ value: "active", label: "Active" }, { value: "cancelled", label: "Cancelled" }]} allLabel="All statuses" className="w-full" />
				<FilterSelect value={filters.clientId ? String(filters.clientId) : undefined} onChange={(clientId) => setFilters((current) => ({ ...current, clientId: clientId ? Number(clientId) : undefined }))} options={clientOptions} allLabel="All clients" className="w-full" disabled={clientsQuery.isLoading} />
				<FilterSelect value={filters.projectId ? String(filters.projectId) : undefined} onChange={(projectId) => setFilters((current) => ({ ...current, projectId: projectId ? Number(projectId) : undefined }))} options={projectOptions} allLabel="All projects" className="w-full" disabled={projectsQuery.isLoading} />
				<DatePicker value={filters.from ?? ""} onChange={(value) => setFilters((current) => ({ ...current, from: value || undefined }))} ariaLabel="Subscription due from" />
				<DatePicker value={filters.to ?? ""} onChange={(value) => setFilters((current) => ({ ...current, to: value || undefined }))} ariaLabel="Subscription due to" />
			</div>

			<DataTable<Subscription>
				title="All Subscriptions"
				titleBadge={data ? String(subscriptions.length) : undefined}
				columns={columns}
				data={subscriptions}
				keyExtractor={(sub) => sub.id}
				isLoading={isLoading}
				error={error}
				emptyState={{
					icon: CreditCard,
					title: "No subscriptions tracked",
					description: "Add your first SaaS subscription to start tracking recurring costs.",
					action: { label: "Add Subscription", onClick: handleCreate },
				}}
			/>

			<SubscriptionFormModal
				open={formOpen}
				onClose={handleCloseForm}
				editTarget={editTarget}
			/>

			<DeleteSubscriptionDialog
				open={deleteTarget !== null}
				onClose={() => setDeleteTarget(null)}
				subscription={deleteTarget}
			/>
		</section>
	);
}
