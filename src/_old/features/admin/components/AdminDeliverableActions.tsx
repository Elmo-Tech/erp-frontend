"use client";

/**
 * Admin Deliverable Actions Component
 * Dropdown menu with admin-only actions for deliverables
 */

import { useState } from "react";
import { MoreVertical, Edit, Trash2, RefreshCw, CheckCircle, XCircle, GitBranch } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { TaskDeliverable } from "@/_old/features/projects/types/taskDeliverable";
import { AdminUpdateDeliverableDialog, AdminChangeStatusDialog, AdminForceApproveDialog, AdminForceRejectDialog, AdminDeleteDeliverableDialog } from "./dialogs";
import { useAdminResetDeliverable } from "../hooks/useAdminDeliverables";

interface AdminDeliverableActionsProps {
	deliverable: TaskDeliverable;
}

export function AdminDeliverableActions({ deliverable }: AdminDeliverableActionsProps) {
	const [updateOpen, setUpdateOpen] = useState(false);
	const [changeStatusOpen, setChangeStatusOpen] = useState(false);
	const [forceApproveOpen, setForceApproveOpen] = useState(false);
	const [forceRejectOpen, setForceRejectOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const resetMutation = useAdminResetDeliverable();

	const handleReset = () => {
		resetMutation.mutate(deliverable.deliverableId);
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
					>
						<MoreVertical className="h-4 w-4" />
						<span className="sr-only">Admin Actions</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className="w-56"
				>
					<DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />

					<DropdownMenuItem onClick={() => setUpdateOpen(true)}>
						<Edit className="mr-2 h-4 w-4" />
						Update Deliverable
					</DropdownMenuItem>

					<DropdownMenuItem onClick={() => setChangeStatusOpen(true)}>
						<GitBranch className="mr-2 h-4 w-4" />
						Change Status
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={handleReset}
						disabled={resetMutation.isPending}
					>
						<RefreshCw className="mr-2 h-4 w-4" />
						Reset to Pending
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem onClick={() => setForceApproveOpen(true)}>
						<CheckCircle className="mr-2 h-4 w-4 text-green-600" />
						Force Approve
					</DropdownMenuItem>

					<DropdownMenuItem onClick={() => setForceRejectOpen(true)}>
						<XCircle className="mr-2 h-4 w-4 text-red-600" />
						Force Reject
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem
						onClick={() => setDeleteOpen(true)}
						className="text-red-600"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete Deliverable
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Dialogs */}
			<AdminUpdateDeliverableDialog
				open={updateOpen}
				onOpenChange={setUpdateOpen}
				deliverable={deliverable}
			/>

			<AdminChangeStatusDialog
				open={changeStatusOpen}
				onOpenChange={setChangeStatusOpen}
				deliverable={deliverable}
			/>

			<AdminForceApproveDialog
				open={forceApproveOpen}
				onOpenChange={setForceApproveOpen}
				deliverable={deliverable}
			/>

			<AdminForceRejectDialog
				open={forceRejectOpen}
				onOpenChange={setForceRejectOpen}
				deliverable={deliverable}
			/>

			<AdminDeleteDeliverableDialog
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				deliverable={deliverable}
			/>
		</>
	);
}
