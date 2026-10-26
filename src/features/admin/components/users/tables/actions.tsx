"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User } from "../../../types";
import { MoreHorizontal, Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface UserActionsProps {
	user: User;
	onEdit?: (user: User) => void;
	onDelete: (user: User) => void;
	onToggleStatus: (user: User) => void;
}

export function UserActions({ user, onEdit, onDelete, onToggleStatus }: UserActionsProps) {
	const { hasPermission: has } = useAuthStore((state) => state);
	const canEdit = has("manage_users") || has("edit_users");
	const canDelete = has("manage_users") || has("delete_users");
	if (!canEdit && !canDelete) return null;
	return (
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
				{onEdit && canEdit && (
					<DropdownMenuItem onClick={() => onEdit(user)}>
						<Pencil className="h-4 w-4 mr-2" />
						Edit
					</DropdownMenuItem>
				)}
				{canEdit && <DropdownMenuItem onClick={() => onToggleStatus(user)}>
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
				</DropdownMenuItem>}
				{canDelete && <DropdownMenuItem
					className="text-destructive"
					onClick={() => onDelete(user)}
				>
					<Trash2 className="h-4 w-4 mr-2" />
					Delete
				</DropdownMenuItem>}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
