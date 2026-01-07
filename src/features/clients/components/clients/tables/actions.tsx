"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Client } from "../../../types";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";

interface ClientActionsProps {
	client: Client;
	onView: (client: Client) => void;
	onEdit?: (client: Client) => void;
	onDelete?: (client: Client) => void;
}

export function ClientActions({ client, onView, onEdit, onDelete }: ClientActionsProps) {
	return (
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
				{onEdit && (
					<DropdownMenuItem onClick={() => onEdit(client)}>
						<Pencil className="h-4 w-4 mr-2" />
						Edit
					</DropdownMenuItem>
				)}
				{onDelete && (
					<DropdownMenuItem
						className="text-destructive"
						onClick={() => onDelete(client)}
					>
						<Trash2 className="h-4 w-4 mr-2" />
						Delete
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
