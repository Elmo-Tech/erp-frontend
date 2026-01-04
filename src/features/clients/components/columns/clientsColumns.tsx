"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Column } from "@/components/shared/data-display/DataTable";
import { Client } from "../../types";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";

interface ClientsColumnsOptions {
	onView: (client: Client) => void;
	onEdit: (client: Client) => void;
	onDelete: (client: Client) => void;
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
			key: "status",
			header: "Status",
			render: (client) => <Badge variant={client.status === "active" ? "default" : "secondary"}>{client.status}</Badge>,
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
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							onClick={(e) => e.stopPropagation()}
						>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => onView(client)}>
							<Eye className="h-4 w-4 mr-2" />
							View
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onEdit(client)}>
							<Pencil className="h-4 w-4 mr-2" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							className="text-destructive"
							onClick={() => onDelete(client)}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];
}
