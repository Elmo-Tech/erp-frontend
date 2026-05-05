"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/Can";
import { Skeleton } from "@/shared/ui/skeleton";
import { SearchInput } from "@/shared/ui/filters/SearchInput";
import { Pagination } from "@/shared/ui/data-display/Pagination";
import { clientApi } from "@/entities/client/api/client.api";
import { ClientCard } from "@/entities/client/ui/ClientCard";
import { clientKeys } from "@/entities/client/model/query-keys";
import type { ClientIndexRow, ClientFilters } from "@/entities/client/model/types";
import { AddClientModal } from "@/features/clients/ui/AddClientModal";
import { DeleteClientDialog } from "@/features/clients/ui/DeleteClientDialog";
import { EditClientModal } from "@/features/clients/ui/EditClientModal";

const DEFAULT_FILTERS: ClientFilters = {
	page: 1,
	perPage: 15,
};

export function ClientListWidget() {
	const router = useRouter();
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

			<div className="flex flex-col gap-3 border-y py-3 md:flex-row md:items-center md:justify-between">
				<SearchInput
					value={filters.search}
					onChange={handleSearch}
					placeholder="Search clients"
					className="w-full md:max-w-sm"
					autoSearch={false}
				/>

				<p className="text-xs tabular-nums text-muted-foreground">
					{pagination ? `${pagination.total} clients` : "Loading clients"}
				</p>
			</div>

			<div className="overflow-hidden rounded-md border bg-background">
				<div className="hidden border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[minmax(180px,1.5fr)_minmax(160px,1fr)_minmax(120px,0.75fr)_90px_110px_40px] md:items-center md:gap-3">
					<span>Client</span>
					<span>Company</span>
					<span>Status</span>
					<span>Projects</span>
					<span>Revenue</span>
					<span className="sr-only">Actions</span>
				</div>

				{clientsQuery.isLoading ? (
					<ClientRowsSkeleton />
				) : clientsQuery.error ? (
					<div className="flex min-h-40 flex-col items-center justify-center gap-1 px-4 text-center">
						<div className="text-sm font-medium">Unable to load clients</div>
						<div className="text-sm text-muted-foreground">{clientsQuery.error.message}</div>
					</div>
				) : clients.length === 0 ? (
					<div className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 text-center">
						<Building2 className="size-6 text-muted-foreground" />
						<div className="flex flex-col gap-1">
							<div className="text-sm font-medium">No clients found</div>
							<div className="text-sm text-muted-foreground">Create a client or adjust your search.</div>
						</div>
						<Can permission={["manage_clients", "create_clients"]}>
							<Button
								size="sm"
								variant="outline"
								onClick={handleCreateClick}
							>
								<Plus data-icon="inline-start" />
								Add Client
							</Button>
						</Can>
					</div>
				) : (
					clients.map((client) => (
						<PermissionedClientCard
							key={client.id}
							client={client}
							onView={handleView}
							onEdit={(selectedClient) => setClientToEditId(selectedClient.id)}
							onDelete={setClientToDelete}
						/>
					))
				)}
			</div>

			{pagination && (
				<Pagination
					pagination={pagination}
					onPageChange={handlePageChange}
				/>
			)}

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

interface PermissionedClientCardProps {
	client: ClientIndexRow;
	onView: (client: ClientIndexRow) => void;
	onEdit: (client: ClientIndexRow) => void;
	onDelete: (client: ClientIndexRow) => void;
}

function PermissionedClientCard({ client, onView, onEdit, onDelete }: PermissionedClientCardProps) {
	return (
		<Can
			permission={["manage_clients", "edit_clients"]}
			fallback={
				<Can
					permission={["manage_clients", "delete_clients"]}
					fallback={
						<ClientCard
							client={client}
							onView={onView}
						/>
					}
				>
					<ClientCard
						client={client}
						onView={onView}
						onDelete={onDelete}
					/>
				</Can>
			}
		>
			<Can
				permission={["manage_clients", "delete_clients"]}
				fallback={
					<ClientCard
						client={client}
						onView={onView}
						onEdit={onEdit}
					/>
				}
			>
				<ClientCard
					client={client}
					onView={onView}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			</Can>
		</Can>
	);
}

function ClientRowsSkeleton() {
	return (
		<div className="flex flex-col">
			{Array.from({ length: 8 }).map((_, index) => (
				<div
					key={index}
					className="grid min-h-14 grid-cols-1 gap-2 border-b px-3 py-2.5 last:border-b-0 md:grid-cols-[minmax(180px,1.5fr)_minmax(160px,1fr)_minmax(120px,0.75fr)_90px_110px_40px] md:items-center md:gap-3"
				>
					<div className="flex flex-col gap-1">
						<Skeleton className="h-4 w-36" />
						<Skeleton className="h-3 w-44" />
					</div>
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-5 w-20" />
					<Skeleton className="h-5 w-10" />
					<Skeleton className="h-4 w-20" />
					<Skeleton className="size-8" />
				</div>
			))}
		</div>
	);
}
