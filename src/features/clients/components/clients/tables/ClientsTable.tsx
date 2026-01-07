"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-display/DataTable";
import { SearchInput } from "@/components/shared/filters/SearchInput";
import { FilterBar } from "@/components/shared/filters/FilterBar";
import { useClients, useDeleteClient } from "../../../hooks/useClients";
import { Client, ClientFilters } from "../../../types";
import { getClientsColumns } from "./columns";
import { DeleteClientDialog } from "../dialogs/DeleteClientDialog";
import { Plus, Building2 } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/features/admin/hooks/usePermissions";

interface ClientsTableProps {
	onEdit: (client: Client) => void;
	onAdd: () => void;
}

export function ClientsTable({ onEdit, onAdd }: ClientsTableProps) {
	const router = useRouter();
	const [filters, setFilters] = useState<ClientFilters>({
		page: 1,
		perPage: 15,
	});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

	const { data, isLoading, error } = useClients(filters);
	const deleteClient = useDeleteClient();

	const { canCreateClients, canEditClients, canDeleteClients } = usePermissions();

	const handleSearch = (search: string) => {
		setFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
	};

	const handleView = (client: Client) => {
		router.push(`/dashboard/clients/${client.clientId}`);
	};

	const handleDelete = async () => {
		if (!clientToDelete) return;

		try {
			await deleteClient.mutateAsync(clientToDelete.clientId);
			toast.success("Client deleted successfully");
			setDeleteDialogOpen(false);
			setClientToDelete(null);
		} catch {
			toast.error("Failed to delete client");
		}
	};

	const handlePageChange = (page: number) => {
		setFilters((prev) => ({ ...prev, page }));
	};

	const openDeleteDialog = (client: Client) => {
		setClientToDelete(client);
		setDeleteDialogOpen(true);
	};

	const columns = getClientsColumns({
		onView: handleView,
		onEdit: canEditClients ? onEdit : undefined,
		onDelete: canDeleteClients ? openDeleteDialog : undefined,
	});

	return (
		<>
			<DataTable
				title="Clients"
				titleBadge={data?.pagination ? `${data.pagination.total} clients` : undefined}
				columns={columns}
				data={data?.clients || []}
				keyExtractor={(client) => client.clientId}
				isLoading={isLoading}
				error={error}
				pagination={data?.pagination}
				onPageChange={handlePageChange}
				onRowClick={handleView}
				emptyState={{
					icon: Building2,
					title: "No clients found",
					description: "Get started by adding your first client.",
					action: canCreateClients ? { label: "Add Client", onClick: onAdd } : undefined,
				}}
				headerActions={
					<FilterBar
						actions={
							canCreateClients ? (
								<Button onClick={onAdd}>
									<Plus className="h-4 w-4 mr-2" />
									Add Client
								</Button>
							) : undefined
						}
					>
						<SearchInput
							value={filters.search}
							onChange={handleSearch}
							placeholder="Search clients..."
							className="w-64"
							autoSearch={false}
						/>
					</FilterBar>
				}
			/>

			<DeleteClientDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				client={clientToDelete}
				onConfirm={handleDelete}
				isLoading={deleteClient.isPending}
			/>
		</>
	);
}
