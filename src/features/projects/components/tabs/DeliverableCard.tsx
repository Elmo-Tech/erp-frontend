"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Send, Eye, CheckCircle, XCircle, Clock, Award, User } from "lucide-react";
import { TaskDeliverable } from "../../types/taskDeliverable";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDeleteTaskDeliverable } from "../../hooks/useTaskDeliverables";
import { toast } from "sonner";

interface DeliverableCardProps {
	deliverable: TaskDeliverable;
	canManage?: boolean;
	canReview?: boolean;
	canSubmit?: boolean;
	onEdit?: () => void;
	onReview?: () => void;
	onSubmit?: () => void;
}

export function DeliverableCard({ deliverable, canManage = false, canReview = false, canSubmit = false, onEdit, onReview, onSubmit }: DeliverableCardProps) {
	const deleteDeliverable = useDeleteTaskDeliverable();

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this deliverable?")) {
			return;
		}

		try {
			await deleteDeliverable.mutateAsync(deliverable.deliverableId);
			toast.success("Deliverable deleted successfully");
		} catch {
			toast.error("Failed to delete deliverable");
		}
	};

	// Get status color and icon
	const getStatusDisplay = () => {
		switch (deliverable.status) {
			case "pending":
				return {
					color: "bg-gray-100 text-gray-800 border-gray-200",
					icon: <Clock className="h-3 w-3" />,
					label: "Pending",
				};
			case "submitted":
				return {
					color: "bg-blue-100 text-blue-800 border-blue-200",
					icon: <Send className="h-3 w-3" />,
					label: "Submitted",
				};
			case "under_review":
				return {
					color: "bg-yellow-100 text-yellow-800 border-yellow-200",
					icon: <Eye className="h-3 w-3" />,
					label: "Under Review",
				};
			case "approved":
				return {
					color: "bg-green-100 text-green-800 border-green-200",
					icon: <CheckCircle className="h-3 w-3" />,
					label: "Approved",
				};
			case "rejected":
				return {
					color: "bg-red-100 text-red-800 border-red-200",
					icon: <XCircle className="h-3 w-3" />,
					label: "Rejected",
				};
			default:
				return {
					color: "bg-gray-100 text-gray-800 border-gray-200",
					icon: <Clock className="h-3 w-3" />,
					label: deliverable.status,
				};
		}
	};

	const statusDisplay = getStatusDisplay();

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-2">
							<h4 className="font-semibold">{deliverable.title}</h4>
							{deliverable.isBonus && (
								<Badge
									variant="secondary"
									className="text-xs"
								>
									<Award className="h-3 w-3 mr-1" />
									Bonus
								</Badge>
							)}
						</div>

						<div className="flex items-center gap-2">
							<Badge
								variant="outline"
								className={cn("text-xs", statusDisplay.color)}
							>
								{statusDisplay.icon}
								<span className="ml-1">{statusDisplay.label}</span>
							</Badge>

							{deliverable.pointsAwarded !== 0 && (
								<Badge
									variant={deliverable.pointsAwarded > 0 ? "default" : "destructive"}
									className="text-xs"
								>
									{deliverable.pointsAwarded > 0 ? "+" : ""}
									{deliverable.pointsAwarded} pts
								</Badge>
							)}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center gap-1">
						{/* Submit Button (for developers) */}
						{canSubmit && deliverable.canBeSubmitted && (
							<Button
								size="sm"
								variant="outline"
								onClick={onSubmit}
							>
								<Send className="h-4 w-4 mr-1" />
								Submit
							</Button>
						)}

						{/* Review Button (for reviewers) */}
						{canReview && deliverable.canBeReviewed && (
							<Button
								size="sm"
								variant="outline"
								onClick={onReview}
							>
								<Eye className="h-4 w-4 mr-1" />
								Review
							</Button>
						)}

						{/* Edit Button (for managers) */}
						{canManage && !deliverable.isCompleted && (
							<Button
								size="sm"
								variant="ghost"
								onClick={onEdit}
							>
								<Edit className="h-4 w-4" />
							</Button>
						)}

						{/* Delete Button (for managers, only pending) */}
						{canManage && deliverable.status === "pending" && (
							<Button
								size="sm"
								variant="ghost"
								onClick={handleDelete}
								disabled={deleteDeliverable.isPending}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				{/* Description */}
				{deliverable.description && (
					<div className="mb-3">
						<p className="text-sm text-muted-foreground">{deliverable.description}</p>
					</div>
				)}

				{/* Acceptance Criteria */}
				{deliverable.acceptanceCriteria && (
					<div className="mb-3">
						<h5 className="text-xs font-medium text-muted-foreground mb-1">Acceptance Criteria:</h5>
						<p className="text-sm">{deliverable.acceptanceCriteria}</p>
					</div>
				)}

				{/* Submission Notes */}
				{deliverable.submissionNotes && (
					<div className="mb-3 p-2 bg-blue-50 rounded-md border border-blue-200">
						<h5 className="text-xs font-medium text-blue-800 mb-1">Submission Notes:</h5>
						<p className="text-sm text-blue-700">{deliverable.submissionNotes}</p>
					</div>
				)}

				{/* Review Notes */}
				{deliverable.reviewNotes && (
					<div className={cn("mb-3 p-2 rounded-md border", deliverable.status === "approved" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
						<h5 className={cn("text-xs font-medium mb-1", deliverable.status === "approved" ? "text-green-800" : "text-red-800")}>Review Notes:</h5>
						<p className={cn("text-sm", deliverable.status === "approved" ? "text-green-700" : "text-red-700")}>{deliverable.reviewNotes}</p>
					</div>
				)}

				{/* Metadata */}
				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<div className="flex items-center gap-4">
						{deliverable.submittedAt && <span>Submitted: {format(new Date(deliverable.submittedAt), "MMM d, HH:mm")}</span>}
						{deliverable.reviewedAt && <span>Reviewed: {format(new Date(deliverable.reviewedAt), "MMM d, HH:mm")}</span>}
					</div>

					{/* Reviewer Info */}
					{deliverable.reviewer && (
						<div className="flex items-center gap-1">
							<User className="h-3 w-3" />
							<span>{deliverable.reviewer.name}</span>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
