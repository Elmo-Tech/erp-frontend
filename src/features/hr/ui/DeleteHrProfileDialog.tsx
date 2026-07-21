"use client";

import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { useDeleteHrProfile } from "@/features/hr/model/use-hr-actions";
import type { EmployeeProfile } from "@/entities/hr/model/types";
import { useEmployeePermissions } from "@/entities/user/model/permissions";

interface DeleteHrProfileDialogProps {
	open: boolean;
	onClose: () => void;
	/** The profile to delete. Pass null when no deletion is pending. */
	profile: EmployeeProfile | null;
}

export function DeleteHrProfileDialog({ open, onClose, profile }: DeleteHrProfileDialogProps) {
	const { canDeleteEmployees } = useEmployeePermissions();
	const deleteProfile = useDeleteHrProfile();

	const handleConfirm = async () => {
		if (!profile) return;
		if (!canDeleteEmployees) {
			toast.error("You do not have permission to remove employee profiles");
			return;
		}

		try {
			await deleteProfile.mutateAsync(profile.id);
			toast.success("HR profile removed successfully");
			onClose();
		} catch {
			toast.error("Failed to remove HR profile");
		}
	};

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			title="Remove HR profile"
			description={
				<span>
					Remove the HR profile for <span className="font-medium text-foreground">{profile?.user?.name}</span>? This will not delete the user account — only their salary, shift, and payroll data.
				</span>
			}
			confirmLabel="Remove Profile"
			variant="destructive"
			isLoading={deleteProfile.isPending}
			onConfirm={handleConfirm}
		/>
	);
}
