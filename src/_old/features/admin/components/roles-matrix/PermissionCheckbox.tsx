/**
 * Permission Checkbox Component
 * Single checkbox for role-permission intersection
 */

"use client";

import { Checkbox } from "@/shared/ui/checkbox";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface PermissionCheckboxProps {
	hasPermission: boolean;
	isProtected: boolean;
	isUpdating: boolean;
	isGlobalUpdating: boolean;
	permissionName: string;
	roleName: string;
	onToggle: () => void;
}

export function PermissionCheckbox({ hasPermission, isProtected, isUpdating, isGlobalUpdating, permissionName, roleName, onToggle }: PermissionCheckboxProps) {
	if (isUpdating) {
		return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
	}

	return (
		<Checkbox
			checked={hasPermission}
			disabled={isProtected || isGlobalUpdating}
			onCheckedChange={onToggle}
			aria-label={`${hasPermission ? "Remove" : "Add"} ${permissionName} permission ${hasPermission ? "from" : "to"} ${roleName} role`}
			className={cn(isProtected && "opacity-50 cursor-not-allowed")}
		/>
	);
}
