"use client";

import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/shared/data-display/DataTable";
import { User } from "../../../types";
import { formatDateDisplay } from "@/lib/dateUtils";
import { UserActions } from "./actions";
import { getRoleLabel } from "@/config/simplification";

interface UsersColumnsOptions {
	onEdit?: (user: User) => void;
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
							{getRoleLabel(role)}
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
			render: (user) => formatDateDisplay(user.createdAt),
		},
		{
			key: "actions",
			header: "",
			className: "w-[70px]",
			render: (user) => (
				<UserActions
					user={user}
					onEdit={onEdit}
					onDelete={onDelete}
					onToggleStatus={onToggleStatus}
				/>
			),
		},
	];
}
