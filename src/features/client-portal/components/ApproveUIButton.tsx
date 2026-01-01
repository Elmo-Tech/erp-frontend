"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle, Loader2 } from "lucide-react";
import { useApproveUI } from "../hooks/useApproveUI";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ApproveUIButtonProps {
	/** Project ID to approve UI for */
	projectId: number;
	/** Whether the project can have UI approved (status is ui_ux and not already approved) */
	canApproveUI: boolean;
	/** Project title for confirmation dialog */
	projectTitle?: string;
	/** Callback after successful approval */
	onApprovalSuccess?: () => void;
	/** Additional CSS classes */
	className?: string;
	/** Button size variant */
	size?: "default" | "sm" | "lg";
}

/**
 * ApproveUIButton component for client UI/UX deliverable approval.
 * Shows confirmation dialog before approving and handles the API call.
 *
 * Requirements: 14.4 - Show only when canApproveUI is true, call approveUI API, show confirmation dialog
 */
export const ApproveUIButton: React.FC<ApproveUIButtonProps> = ({ projectId, canApproveUI, projectTitle = "this project", onApprovalSuccess, className = "", size = "default" }) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const approveUIMutation = useApproveUI();

	// Don't render if UI cannot be approved
	if (!canApproveUI) {
		return null;
	}

	const handleApprove = async () => {
		try {
			await approveUIMutation.mutateAsync(projectId);
			toast.success("UI/UX deliverables approved successfully!", {
				description: "The project will now move to the development phase.",
			});
			setIsDialogOpen(false);
			onApprovalSuccess?.();
		} catch (error) {
			toast.error("Failed to approve UI/UX deliverables", {
				description: error instanceof Error ? error.message : "Please try again later.",
			});
		}
	};

	return (
		<AlertDialog
			open={isDialogOpen}
			onOpenChange={setIsDialogOpen}
		>
			<AlertDialogTrigger asChild>
				<Button
					variant="default"
					size={size}
					className={cn("gap-2", className)}
					disabled={approveUIMutation.isPending}
				>
					{approveUIMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
					Approve UI Design
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Approve UI/UX Deliverables</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to approve the UI/UX deliverables for <span className="font-semibold text-foreground">{projectTitle}</span>?
						<br />
						<br />
						This action will:
						<ul className="list-disc list-inside mt-2 space-y-1">
							<li>Mark the UI/UX phase as approved</li>
							<li>Move the project to the development phase</li>
							<li>Cancel any scheduled auto-approval</li>
						</ul>
						<br />
						This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={approveUIMutation.isPending}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleApprove}
						disabled={approveUIMutation.isPending}
						className="gap-2"
					>
						{approveUIMutation.isPending ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Approving...
							</>
						) : (
							<>
								<CheckCircle className="h-4 w-4" />
								Approve
							</>
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default ApproveUIButton;
