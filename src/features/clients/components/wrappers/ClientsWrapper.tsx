"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Building2 } from "lucide-react";
import { ClientsTable, CreateClientForm, UpdateClientForm } from "../clients";
import { Client } from "../../types";

export function ClientsWrapper() {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
	const [selectedClient, setSelectedClient] = useState<Client | null>(null);

	const handleAdd = () => {
		setCreateDialogOpen(true);
	};

	const handleEdit = (client: Client) => {
		setSelectedClient(client);
		setUpdateDialogOpen(true);
	};

	const handleUpdateClose = () => {
		setUpdateDialogOpen(false);
		setSelectedClient(null);
	};

	return (
		<div className="space-y-6">
			<PageHeader title="Clients Management" description="Keep client details and projects close at hand." icon={Building2} />
				<ClientsTable
					onAdd={handleAdd}
					onEdit={handleEdit}
				/>

				<CreateClientForm
					open={createDialogOpen}
					onOpenChange={setCreateDialogOpen}
				/>

				{selectedClient && (
					<UpdateClientForm
						open={updateDialogOpen}
						onOpenChange={handleUpdateClose}
						client={selectedClient}
					/>
				)}
		</div>
	);
}
