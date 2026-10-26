"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable, CreateUserForm, UpdateUserForm } from "../users";
import { User } from "../../types";
import { useAuthStore } from "@/store/authStore";

export function UsersWrapper() {
	const { hasPermission: has } = useAuthStore((state) => state);
	const canCreate = has("manage_users") || has("create_users");
	const canEdit = has("manage_users") || has("edit_users");
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	const handleAdd = () => {
		setCreateDialogOpen(true);
	};

	const handleEdit = (user: User) => {
		setSelectedUser(user);
		setUpdateDialogOpen(true);
	};

	const handleUpdateClose = () => {
		setUpdateDialogOpen(false);
		setSelectedUser(null);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Users Management</CardTitle>
				<CardDescription>Manage system users, their roles, and permissions</CardDescription>
			</CardHeader>
			<CardContent>
				<UsersTable
					onAdd={canCreate ? handleAdd : undefined}
					onEdit={canEdit ? handleEdit : undefined}
				/>

				{canCreate && <CreateUserForm
					open={createDialogOpen}
					onOpenChange={setCreateDialogOpen}
				/>}

				{selectedUser && canEdit && (
					<UpdateUserForm
						open={updateDialogOpen}
						onOpenChange={handleUpdateClose}
						user={selectedUser}
					/>
				)}
			</CardContent>
		</Card>
	);
}
