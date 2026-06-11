"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Building2, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Can, usePermissionGate } from "@/shared/ui/Can";
import { SearchInput } from "@/shared/ui/filters/SearchInput";
import { FilterSelect } from "@/shared/ui/filters/FilterSelect";
import { Input } from "@/shared/ui/input";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { ClientStatusBadge } from "@/shared/ui/data-display/StatusBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { clientApi } from "@/entities/client/api/client.api";
import { clientKeys } from "@/entities/client/model/query-keys";
import { ClientStatus, ClientStatusLabels, type ClientIndexRow, type ClientFilters } from "@/entities/client/model/types";
import { AddClientModal } from "@/features/clients/ui/AddClientModal";
import { DeleteClientDialog } from "@/features/clients/ui/DeleteClientDialog";
import { EditClientModal } from "@/features/clients/ui/EditClientModal";
import { formatCurrency } from "@/shared/lib/formatters";

const DEFAULT_FILTERS: ClientFilters = {
	page: 1,
	perPage: 15,
};

const STATUS_OPTIONS = Object.values(ClientStatus).map((status) => ({
	value: status,
	label: ClientStatusLabels[status],
}));

const clientColumns: Column<ClientIndexRow>[] = [
	{
		key: "client",
		header: "Client",
		render: (client) => (
			<div className="min-w-0">
				<div className="truncate font-medium">{client.display_name}</div>
				<div className="truncate text-xs text-muted-foreground">{client.email ?? "No email"}</div>
			</div>
		),
	},
	{
		key: "company",
		header: "Company",
		render: (client) => (
			<div className="min-w-0">
				<div className="truncate">{client.company_name?.trim() || "Not set"}</div>
				<div className="truncate text-xs text-muted-foreground">{client.position?.trim() || "Not set"}</div>
			</div>
		),
	},
	{
		key: "status",
		header: "Status",
		render: (client) => (
			<ClientStatusBadge
				status={client.status}
				size="sm"
			/>
		),
	},
	{
		key: "projects",
		header: "Projects",
		render: (client) => <span className="font-mono text-xs">{client.projects_count ?? 0}</span>,
	},
	{
		key: "revenue",
		header: "Revenue",
		className: "text-right",
		render: (client) => <span className="text-xs tabular-nums text-muted-foreground">{formatCurrency(client.total_revenue ?? 0)}</span>,
	},
];

export function ClientListWidget() {
	const router = useRouter();
	const { canAny } = usePermissionGate();
	const [filters, setFilters] = useState<ClientFilters>(DEFAULT_FILTERS);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [clientToEditId, setClientToEditId] = useState<number | null>(null);
	const [clientToDelete, setClientToDelete] = useState<ClientIndexRow | null>(null);

	const clientsQuery = useQuery({
		queryKey: clientKeys.list(filters),
		queryFn: () => clientApi.getClients(filters),
		staleTime: 5 * 60 * 1000,
	});

	const clients = clientsQuery.data?.clients ?? [];
	const pagination = clientsQuery.data?.pagination;
	const canCreateClient = canAny(["manage_clients", "create_clients"]);
	const clientToEditQuery = useQuery({
		queryKey: clientToEditId ? clientKeys.detail(clientToEditId) : clientKeys.details(),
		queryFn: () => clientApi.getClientById(clientToEditId as number),
		enabled: Boolean(clientToEditId),
	});

	const handleSearch = (search: string) => {
		setFilters((currentFilters) => ({
			...currentFilters,
			search: search || undefined,
			page: 1,
		}));
	};

	const handlePageChange = (page: number) => {
		setFilters((currentFilters) => ({
			...currentFilters,
			page,
		}));
	};

	const handleView = (client: ClientIndexRow) => {
		router.push(`/dashboard/clients/${client.id}`);
	};

	const handleCreateClick = () => {
		setCreateDialogOpen(true);
	};

	const filtersContent = (
		<div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_180px_180px_auto] lg:items-center">
			<SearchInput
				value={filters.search}
				onChange={handleSearch}
				placeholder="Search clients"
				className="w-full"
				autoSearch={false}
			/>
			<FilterSelect
				value={filters.status}
				onChange={(status) => setFilters((current) => ({ ...current, status: status as ClientStatus | undefined, page: 1 }))}
				options={STATUS_OPTIONS}
				placeholder="Status"
				allLabel="All statuses"
				className="w-full"
			/>
			<Input
				value={filters.company ?? ""}
				onChange={(event) => setFilters((current) => ({ ...current, company: event.target.value || undefined, page: 1 }))}
				placeholder="Company"
			/>
			<Input
				value={filters.email ?? ""}
				onChange={(event) => setFilters((current) => ({ ...current, email: event.target.value || undefined, page: 1 }))}
				placeholder="Email"
			/>

			<p className="text-xs tabular-nums text-muted-foreground">
				{pagination ? `${pagination.total} clients` : "Loading clients"}
			</p>
		</div>
	);

	return (
		<section className="flex flex-col gap-4">
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
					<p className="text-sm text-muted-foreground">Manage client records, contact details, and account activity.</p>
				</div>

				<Can permission={["manage_clients", "create_clients"]}>
					<Button
						size="sm"
						onClick={handleCreateClick}
					>
						<Plus data-icon="inline-start" />
						Add Client
					</Button>
				</Can>
			</div>

			<DataTable
				columns={clientColumns}
				data={clients}
				keyExtractor={(client) => client.id}
				isLoading={clientsQuery.isLoading}
				error={clientsQuery.error}
				pagination={pagination}
				onPageChange={handlePageChange}
				onRowClick={handleView}
				filters={filtersContent}
				rowActions={(client) => (
					<ClientRowActions
						client={client}
						onView={handleView}
						onEdit={(selectedClient) => setClientToEditId(selectedClient.id)}
						onDelete={setClientToDelete}
					/>
				)}
				emptyState={{
					icon: Building2,
					title: "No clients found",
					description: "Create a client or adjust your search.",
					action: canCreateClient ? { label: "Add Client", onClick: handleCreateClick } : undefined,
				}}
			/>

			<AddClientModal
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
			/>

			{clientToEditQuery.data && (
				<EditClientModal
					open={Boolean(clientToEditId)}
					onOpenChange={(open) => {
						if (!open) {
							setClientToEditId(null);
						}
					}}
					client={clientToEditQuery.data}
				/>
			)}

			<DeleteClientDialog
				open={Boolean(clientToDelete)}
				onOpenChange={(open) => {
					if (!open) {
						setClientToDelete(null);
					}
				}}
				client={clientToDelete}
				onSuccess={() => setClientToDelete(null)}
			/>
		</section>
	);
}

interface ClientRowActionsProps {
	client: ClientIndexRow;
	onView: (client: ClientIndexRow) => void;
	onEdit: (client: ClientIndexRow) => void;
	onDelete: (client: ClientIndexRow) => void;
}

function ClientRowActions({ client, onView, onEdit, onDelete }: ClientRowActionsProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label={`Open actions for ${client.display_name}`}
				>
					<MoreHorizontal />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => onView(client)}>View</DropdownMenuItem>
				<Can permission={["manage_clients", "edit_clients"]}>
					<DropdownMenuItem onClick={() => onEdit(client)}>Edit</DropdownMenuItem>
				</Can>
				<Can permission={["manage_clients", "delete_clients"]}>
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onClick={() => onDelete(client)}
					>
						Delete
					</DropdownMenuItem>
				</Can>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
