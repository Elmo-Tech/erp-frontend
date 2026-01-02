"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable } from "./UsersTable";
import { UserFormDialog } from "./UserFormDialog";
import { User } from "../types";

export function UsersManagement() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	const handleAdd = () => {
		setSelectedUser(null);
		setDialogOpen(true);
	};

	const handleEdit = (user: User) => {
		setSelectedUser(user);
		setDialogOpen(true);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Users Management</CardTitle>
				<CardDescription>Manage system users, their roles, and permissions</CardDescription>
			</CardHeader>
			<CardContent>
				<UsersTable
					onAdd={handleAdd}
					onEdit={handleEdit}
				/>
				<UserFormDialog
					open={dialogOpen}
					onOpenChange={setDialogOpen}
					user={selectedUser}
				/>
			</CardContent>
		</Card>
	);
}
