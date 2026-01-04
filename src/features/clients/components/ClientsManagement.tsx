"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientsTable } from "./ClientsTable";
import { ClientFormDialog } from "./ClientFormDialog";
import { Client } from "../types";

export function ClientsManagement() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedClient, setSelectedClient] = useState<Client | null>(null);

	const handleAdd = () => {
		setSelectedClient(null);
		setDialogOpen(true);
	};

	const handleEdit = (client: Client) => {
		setSelectedClient(client);
		setDialogOpen(true);
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
				<ClientFormDialog
					open={dialogOpen}
					onOpenChange={setDialogOpen}
					client={selectedClient}
				/>
			</CardContent>
		</Card>
	);
}
