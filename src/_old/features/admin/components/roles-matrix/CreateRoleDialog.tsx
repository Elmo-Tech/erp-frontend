/**
 * Create Role Dialog Component
 */

"use client";

import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { FormDialog } from "@/shared/ui";
import { Permission } from "../../types";
import { formatPermissionName } from "./constants";

interface CreateRoleDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	newRoleName: string;
	onRoleNameChange: (name: string) => void;
	selectedPermissions: string[];
	onPermissionsChange: (permissions: string[]) => void;
	permissionGroups: string[];
	groupedPermissions: Record<string, Permission[]>;
	onSubmit: () => void;
	isPending: boolean;
}

export function CreateRoleDialog({ open, onOpenChange, newRoleName, onRoleNameChange, selectedPermissions, onPermissionsChange, permissionGroups, groupedPermissions, onSubmit, isPending }: CreateRoleDialogProps) {
	const handlePermissionToggle = (permissionName: string, checked: boolean) => {
		if (checked) {
			onPermissionsChange([...selectedPermissions, permissionName]);
		} else {
			onPermissionsChange(selectedPermissions.filter((p) => p !== permissionName));
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Create New Role"
			description="Enter a name for the new role and select the permissions to assign."
			submitLabel="Create Role"
			isLoading={isPending}
			onSubmit={onSubmit}
			size="xxl"
		>
			<div className="space-y-4 py-4">
				<div className="space-y-2">
					<Label>Role Name</Label>
					<Input
						placeholder="e.g., project-manager"
						value={newRoleName}
						onChange={(e) => onRoleNameChange(e.target.value)}
					/>
				</div>
				{permissionGroups.length > 0 && (
					<div className="space-y-2">
						<Label>Permissions</Label>
						<div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
							{permissionGroups.map((group) => (
								<div
									key={group}
									className="mb-4"
								>
									<h4 className="font-medium text-sm mb-2">{group}</h4>
									<div className="grid grid-cols-2 gap-2">
										{groupedPermissions[group]?.map((permission) => (
											<div
												key={permission.name}
												className="flex items-center gap-2"
											>
												<Checkbox
													id={`new-${permission.name}`}
													checked={selectedPermissions.includes(permission.name)}
													onCheckedChange={(checked) => handlePermissionToggle(permission.name, !!checked)}
												/>
												<label
													htmlFor={`new-${permission.name}`}
													className="text-sm cursor-pointer"
												>
													{formatPermissionName(permission.name)}
												</label>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</FormDialog>
	);
}
