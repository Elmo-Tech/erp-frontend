"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Column } from "@/components/shared/data-display/DataTable";
import { User } from "../../types";
import { formatDate } from "@/lib/formatters";
import { MoreHorizontal, Pencil, Trash2, UserCheck, UserX } from "lucide-react";

interface UsersColumnsOptions {
	onEdit: (user: User) => void;
	onDelete: (user: User) => void;
	onToggleStatus: (user: User) => void;
}

export function getUsersColumns({ onEdit, onDelete, onToggleStatus }: UsersColumnsOptions): Column<User>[] {
	return [
		{
			key: "name",
			header: "Name",
			render: (user) => <span className="font-medium">{user.name}</span>,
		},
		{
			key: "email",
			header: "Email",
			render: (user) => user.email,
		},
		{
			key: "roles",
			header: "Roles",
			render: (user) => (
				<div className="flex gap-1 flex-wrap">
					{user.roles.map((role) => (
						<Badge
							key={role}
							variant="secondary"
						>
							{role}
						</Badge>
					))}
				</div>
			),
		},
		{
			key: "isActive",
			header: "Status",
			render: (user) => <Badge variant={user.isActive ? "default" : "destructive"}>{user.isActive ? "Active" : "Inactive"}</Badge>,
		},
		{
			key: "createdAt",
			header: "Created",
			render: (user) => formatDate(user.createdAt),
		},
		{
			key: "actions",
			header: "",
			className: "w-[70px]",
			render: (user) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
						>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => onEdit(user)}>
							<Pencil className="h-4 w-4 mr-2" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onToggleStatus(user)}>
							{user.isActive ? (
								<>
									<UserX className="h-4 w-4 mr-2" />
									Deactivate
								</>
							) : (
								<>
									<UserCheck className="h-4 w-4 mr-2" />
									Activate
								</>
							)}
						</DropdownMenuItem>
						<DropdownMenuItem
							className="text-destructive"
							onClick={() => onDelete(user)}
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
