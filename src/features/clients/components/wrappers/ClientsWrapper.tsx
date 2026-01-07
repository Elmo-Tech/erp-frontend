"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
		<Card>
			<CardHeader>
				<CardTitle>Clients Management</CardTitle>
				<CardDescription>Manage your clients and their information</CardDescription>
			</CardHeader>
			<CardContent>
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
			</CardContent>
		</Card>
	);
}
