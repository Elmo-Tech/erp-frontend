"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, CheckCircle, Clock, FileText, Award, AlertTriangle } from "lucide-react";
import { useTaskDeliverables } from "../../hooks/useTaskDeliverables";
import { DeliverableFormDialog } from "./DeliverableFormDialog";
import { DeliverableCard } from "./DeliverableCard";
import { DeliverableReviewDialog } from "./DeliverableReviewDialog";
import { DeliverableSubmitDialog } from "./DeliverableSubmitDialog";
import { TaskDeliverable, DeliverableStatus } from "../../types/taskDeliverable";

interface ReviewApprovalTabProps {
	taskId: number;
	taskTitle: string;
	taskType: string;
	canManageDeliverables?: boolean;
	canReviewDeliverables?: boolean;
	isDeveloper?: boolean;
}

export function ReviewApprovalTab({ taskId, taskTitle, taskType, canManageDeliverables = false, canReviewDeliverables = false, isDeveloper = false }: ReviewApprovalTabProps) {
	const { data, isLoading, error } = useTaskDeliverables(taskId);

	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editingDeliverable, setEditingDeliverable] = useState<TaskDeliverable | null>(null);
	const [reviewingDeliverable, setReviewingDeliverable] = useState<TaskDeliverable | null>(null);
	const [submittingDeliverable, setSubmittingDeliverable] = useState<TaskDeliverable | null>(null);
	const [activeTab, setActiveTab] = useState<DeliverableStatus | "all">("all");

	// Check if this is a weekly task
	if (taskType !== "weekly") {
		return (
			<Alert>
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription>Deliverables can only be added to weekly tasks. This is a {taskType} task.</AlertDescription>
			</Alert>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton
							key={i}
							className="h-24"
						/>
					))}
				</div>
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<Skeleton
							key={i}
							className="h-32"
						/>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription>Failed to load deliverables. Please try again.</AlertDescription>
			</Alert>
		);
	}

	if (!data) {
		return (
			<Alert>
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription>No deliverables data available.</AlertDescription>
			</Alert>
		);
	}

	const { deliverables, summary } = data;

	// Filter deliverables by status
	const filteredDeliverables = activeTab === "all" ? deliverables : deliverables.filter((d) => d.status === activeTab);

	// Get status counts for tabs
	const getStatusCount = (status: DeliverableStatus) => {
		return deliverables.filter((d) => d.status === status).length;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold">Review & Approval</h3>
					<p className="text-sm text-muted-foreground">Manage deliverables for: {taskTitle}</p>
				</div>
				{canManageDeliverables && (
					<Button onClick={() => setCreateDialogOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Add Deliverable
					</Button>
				)}
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<FileText className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Total</span>
						</div>
						<p className="text-2xl font-bold">{summary.total}</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-yellow-500" />
							<span className="text-sm text-muted-foreground">Pending Review</span>
						</div>
						<p className="text-2xl font-bold">{summary.submitted + summary.underReview}</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<CheckCircle className="h-4 w-4 text-green-500" />
							<span className="text-sm text-muted-foreground">Approved</span>
						</div>
						<p className="text-2xl font-bold">{summary.approved}</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<Award className="h-4 w-4 text-blue-500" />
							<span className="text-sm text-muted-foreground">Points</span>
						</div>
						<p className="text-2xl font-bold">
							+{summary.totalPointsAwarded} / -{summary.totalPointsDeducted}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Status Filter Tabs */}
			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as DeliverableStatus | "all")}
			>
				<TabsList>
					<TabsTrigger value="all">All ({deliverables.length})</TabsTrigger>
					<TabsTrigger value="pending">Pending ({getStatusCount("pending")})</TabsTrigger>
					<TabsTrigger value="submitted">Submitted ({getStatusCount("submitted")})</TabsTrigger>
					<TabsTrigger value="under_review">Under Review ({getStatusCount("under_review")})</TabsTrigger>
					<TabsTrigger value="approved">Approved ({getStatusCount("approved")})</TabsTrigger>
					<TabsTrigger value="rejected">Rejected ({getStatusCount("rejected")})</TabsTrigger>
				</TabsList>

				<TabsContent
					value={activeTab}
					className="space-y-4"
				>
					{filteredDeliverables.length === 0 ? (
						<Card>
							<CardContent className="pt-6">
								<div className="text-center py-8">
									<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-lg font-semibold mb-2">No deliverables</h3>
									<p className="text-muted-foreground mb-4">{activeTab === "all" ? "No deliverables have been created for this task yet." : `No deliverables with status "${activeTab}" found.`}</p>
									{canManageDeliverables && activeTab === "all" && (
										<Button onClick={() => setCreateDialogOpen(true)}>
											<Plus className="h-4 w-4 mr-2" />
											Create First Deliverable
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-4">
							{filteredDeliverables.map((deliverable) => (
								<DeliverableCard
									key={deliverable.deliverableId}
									deliverable={deliverable}
									canManage={canManageDeliverables}
									canReview={canReviewDeliverables}
									canSubmit={isDeveloper}
									onEdit={() => setEditingDeliverable(deliverable)}
									onReview={() => setReviewingDeliverable(deliverable)}
									onSubmit={() => setSubmittingDeliverable(deliverable)}
								/>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>

			{/* Dialogs */}
			<DeliverableFormDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				taskId={taskId}
				mode="create"
			/>

			<DeliverableFormDialog
				open={!!editingDeliverable}
				onOpenChange={(open) => !open && setEditingDeliverable(null)}
				taskId={taskId}
				deliverable={editingDeliverable}
				mode="edit"
			/>

			<DeliverableReviewDialog
				open={!!reviewingDeliverable}
				onOpenChange={(open) => !open && setReviewingDeliverable(null)}
				deliverable={reviewingDeliverable}
			/>

			<DeliverableSubmitDialog
				open={!!submittingDeliverable}
				onOpenChange={(open) => !open && setSubmittingDeliverable(null)}
				deliverable={submittingDeliverable}
			/>
		</div>
	);
}
