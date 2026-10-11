"use client";

import { ClientStatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/shared/data-display/DataTable";
import { Client } from "../../../types";
import { ClientActions } from "./actions";

interface ClientsColumnsOptions {
	onView: (client: Client) => void;
	onEdit?: (client: Client) => void;
	onDelete?: (client: Client) => void;
}

export function getClientsColumns({ onView, onEdit, onDelete }: ClientsColumnsOptions): Column<Client>[] {
	return [
		{
			key: "name",
			header: "Name",
			render: (client) => <span className="font-medium">{client.name}</span>,
		},
		{
			key: "company",
			header: "Company",
			render: (client) => client.company || "-",
		},
		{
			key: "email",
			header: "Email",
			render: (client) => client.email,
		},
		{
			key: "phone",
			header: "Phone",
			render: (client) => client.phone || "-",
		},
		{
			key: "website",
			header: "Website",
			render: (client) => client.website || "-",
		},
		{
			key: "city",
			header: "City",
			render: (client) => client.city || "-",
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
			render: (client) => <Badge variant="outline">{client.projectsCount || 0}</Badge>,
		},
		{
			key: "actions",
			header: "",
			className: "w-[70px]",
			render: (client) => (
				<ClientActions
					client={client}
					onView={onView}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			),
		},
	];
}
