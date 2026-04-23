/**
 * Change Request Detail Dialog
 */

"use client";

import { FormDialog } from "@/shared/ui";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { ChangeRequest, ChangeRequestStatus, ChangeRequestStatusLabels, ChangeRequestStatusColors } from "../../../types/changeRequest";
import { CheckCircle, XCircle, Send, Wrench } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface CRDetailDialogProps {
	cr: ChangeRequest | null;
	onClose: () => void;
	onSubmit: (id: number) => void;
	onApprove: (id: number) => void;
	onReject: () => void;
	onImplement: (id: number) => void;
	approvedCost: number | undefined;
	onApprovedCostChange: (cost: number | undefined) => void;
	canApprove: boolean;
	isSubmitting: boolean;
	isApproving: boolean;
	isImplementing: boolean;
}

export function CRDetailDialog({ cr, onClose, onSubmit, onApprove, onReject, onImplement, approvedCost, onApprovedCostChange, canApprove, isSubmitting, isApproving, isImplementing }: CRDetailDialogProps) {
	if (!cr) return null;

	return (
		<FormDialog
			open={!!cr}
			onOpenChange={onClose}
			title={
				<span className="flex items-center gap-2">
					<span className="font-mono text-muted-foreground">{cr.crNumber}</span>
					{cr.title}
				</span>
			}
			showFooter={false}
			size="xxl"
		>
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<Badge className={cn(ChangeRequestStatusColors[cr.status])}>{ChangeRequestStatusLabels[cr.status]}</Badge>
					{cr.isBillable && <Badge variant="outline">Billable</Badge>}
				</div>
				<div>
					<Label className="text-muted-foreground">Description</Label>
					<p className="mt-1">{cr.description}</p>
				</div>
				{cr.impactAnalysis && (
					<div>
						<Label className="text-muted-foreground">Impact Analysis</Label>
						<p className="mt-1">{cr.impactAnalysis}</p>
					</div>
				)}
				<div className="grid grid-cols-3 gap-4">
					<div>
						<Label className="text-muted-foreground">Estimated Hours</Label>
						<p className="font-medium">{cr.estimatedHours}h</p>
					</div>
					<div>
						<Label className="text-muted-foreground">Estimated Cost</Label>
						<p className="font-medium">${cr.estimatedCost}</p>
					</div>
					<div>
						<Label className="text-muted-foreground">Additional Days</Label>
						<p className="font-medium">{cr.additionalDays || 0} days</p>
					</div>
				</div>
				{cr.approvedCost !== null && (
					<div>
						<Label className="text-muted-foreground">Approved Cost</Label>
						<p className="font-medium text-green-600">${cr.approvedCost}</p>
					</div>
				)}
				{cr.rejectionReason && (
					<div className="p-3 bg-red-50 rounded-lg">
						<Label className="text-red-600">Rejection Reason</Label>
						<p className="mt-1 text-red-700">{cr.rejectionReason}</p>
					</div>
				)}
			</div>
			<div className="flex justify-end gap-2 pt-4 border-t">
				{cr.status === ChangeRequestStatus.DRAFT && (
					<Button
						onClick={() => onSubmit(cr.changeRequestId)}
						disabled={isSubmitting}
					>
						<Send className="h-4 w-4 mr-2" />
						Submit for Review
					</Button>
				)}
				{cr.status === ChangeRequestStatus.PENDING && canApprove && (
					<>
						<div className="flex items-center gap-2 mr-auto">
							<Label>Approved Cost:</Label>
							<Input
								type="number"
								className="w-32"
								placeholder={cr.estimatedCost.toString()}
								value={approvedCost || ""}
								onChange={(e) => onApprovedCostChange(e.target.value ? Number(e.target.value) : undefined)}
							/>
						</div>
						<Button
							variant="destructive"
							onClick={onReject}
						>
							<XCircle className="h-4 w-4 mr-2" />
							Reject
						</Button>
						<Button
							onClick={() => onApprove(cr.changeRequestId)}
							disabled={isApproving}
						>
							<CheckCircle className="h-4 w-4 mr-2" />
							Approve
						</Button>
					</>
				)}
				{cr.status === ChangeRequestStatus.APPROVED && (
					<Button
						onClick={() => onImplement(cr.changeRequestId)}
						disabled={isImplementing}
					>
						<Wrench className="h-4 w-4 mr-2" />
						Mark Implemented
					</Button>
				)}
			</div>
		</FormDialog>
	);
}
