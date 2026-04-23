"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/shared/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Switch } from "@/shared/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Plus, Package, Clock, CheckCircle2, XCircle, AlertCircle, Eye, Edit, Trash2, Star, Award } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/shared/lib/utils";
import { Task, TaskDeliverable } from "@/_old/features/dashboard/types/task";
import { DeliverableStatus } from "@/shared/lib/statusHelpers";
import { usePermissions } from "@/_old/features/admin/hooks/usePermissions";
import { useAuthStore } from "@/_old/store/authStore";
import { useTaskDeliverables, useCreateTaskDeliverable, useUpdateTaskDeliverable, useDeleteTaskDeliverable, useSubmitTaskDeliverable, useReviewTaskDeliverable } from "@/_old/features/projects/hooks/useTaskDeliverables";
import { AdminDeliverableActions } from "@/_old/features/admin";

interface TaskDeliverablesSectionProps {
	task: Task;
	deliverables?: TaskDeliverable[];
}

// Deliverable form schema
const deliverableSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	acceptanceCriteria: z.string().optional(),
	isBonus: z.boolean(),
	order: z.number().min(0),
});

type DeliverableFormData = z.infer<typeof deliverableSchema>;

// Submit deliverable schema
const submitSchema = z.object({
	submissionNotes: z.string().optional(),
});

type SubmitFormData = z.infer<typeof submitSchema>;

// Review deliverable schema
const reviewSchema = z.object({
	status: z.enum([DeliverableStatus.APPROVED, DeliverableStatus.REJECTED]),
	reviewNotes: z.string().optional(),
	pointsAwarded: z.number().min(0),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

// Status configurations
const statusConfig = {
	[DeliverableStatus.PENDING]: {
		label: "Pending",
		color: "bg-gray-100 text-gray-800 border-gray-200",
		icon: Clock,
	},
	[DeliverableStatus.SUBMITTED]: {
		label: "Submitted",
		color: "bg-blue-100 text-blue-800 border-blue-200",
		icon: Eye,
	},
	[DeliverableStatus.UNDER_REVIEW]: {
		label: "Under Review",
		color: "bg-yellow-100 text-yellow-800 border-yellow-200",
		icon: AlertCircle,
	},
	[DeliverableStatus.APPROVED]: {
		label: "Approved",
		color: "bg-green-100 text-green-800 border-green-200",
		icon: CheckCircle2,
	},
	[DeliverableStatus.REJECTED]: {
		label: "Rejected",
		color: "bg-red-100 text-red-800 border-red-200",
		icon: XCircle,
	},
};

function DeliverableStatusBadge({ status }: { status: DeliverableStatus }) {
	const config = statusConfig[status];
	const Icon = config.icon;

	return (
		<Badge
			variant="outline"
			className={cn("gap-1", config.color)}
		>
			<Icon className="h-3 w-3" />
			{config.label}
		</Badge>
	);
}

function CreateDeliverableDialog({ onSuccess, onCreateDeliverable }: { onSuccess: () => void; onCreateDeliverable: (data: DeliverableFormData) => Promise<void> }) {
	const [open, setOpen] = useState(false);
	const form = useForm<DeliverableFormData>({
		resolver: zodResolver(deliverableSchema),
		defaultValues: {
			title: "",
			description: "",
			acceptanceCriteria: "",
			isBonus: false,
			order: 0,
		},
	});

	const onSubmit = async (data: DeliverableFormData) => {
		try {
			await onCreateDeliverable(data);
			setOpen(false);
			form.reset();
			onSuccess();
		} catch (error) {
			console.error("Failed to create deliverable:", error);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button
					size="sm"
					className="gap-2"
				>
					<Plus className="h-4 w-4" />
					Add Deliverable
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Create Deliverable</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter deliverable title"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Describe what needs to be delivered"
											className="min-h-[80px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="acceptanceCriteria"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Acceptance Criteria</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Define what makes this deliverable acceptable"
											className="min-h-[60px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex items-center justify-between">
							<FormField
								control={form.control}
								name="isBonus"
								render={({ field }) => (
									<FormItem className="flex items-center space-x-2">
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<FormLabel className="text-sm font-normal">Bonus Deliverable</FormLabel>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="order"
								render={({ field }) => (
									<FormItem className="w-20">
										<FormLabel>Order</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
												{...field}
												onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit">Create</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

function DeliverableCard({
	deliverable,
	canEdit,
	canSubmit,
	canReview,
	canManageDeliverables,
	onSubmit,
	onReview,
	onEdit,
	onDelete,
}: {
	deliverable: TaskDeliverable;
	canEdit: boolean;
	canSubmit: boolean;
	canReview: boolean;
	canManageDeliverables: boolean;
	onSubmit: (deliverableId: number, submissionNotes?: string) => Promise<void>;
	onReview: (deliverableId: number, data: ReviewFormData) => Promise<void>;
	onEdit: (deliverable: TaskDeliverable) => void;
	onDelete: (deliverableId: number) => void;
}) {
	const [submitOpen, setSubmitOpen] = useState(false);
	const [reviewOpen, setReviewOpen] = useState(false);

	const submitForm = useForm<SubmitFormData>({
		resolver: zodResolver(submitSchema),
		defaultValues: {
			submissionNotes: "",
		},
	});

	const reviewForm = useForm<ReviewFormData>({
		resolver: zodResolver(reviewSchema),
		defaultValues: {
			status: DeliverableStatus.APPROVED,
			reviewNotes: "",
			pointsAwarded: 0,
		},
	});

	const handleSubmit = async (data: SubmitFormData) => {
		try {
			await onSubmit(deliverable.deliverableId, data.submissionNotes);
			setSubmitOpen(false);
			submitForm.reset();
		} catch (error) {
			console.error("Failed to submit deliverable:", error);
		}
	};

	const handleReview = async (data: ReviewFormData) => {
		try {
			await onReview(deliverable.deliverableId, data);
			setReviewOpen(false);
			reviewForm.reset();
		} catch (error) {
			console.error("Failed to review deliverable:", error);
		}
	};

	return (
		<Card className="relative">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<CardTitle className="text-base line-clamp-1">{deliverable.title}</CardTitle>
							{deliverable.isBonus && (
								<Badge
									variant="outline"
									className="gap-1 text-yellow-600 border-yellow-300"
								>
									<Star className="h-3 w-3" />
									Bonus
								</Badge>
							)}
						</div>
						<div className="flex items-center gap-2">
							<DeliverableStatusBadge status={deliverable.status} />
							{deliverable.pointsAwarded > 0 && (
								<Badge
									variant="outline"
									className="gap-1 text-green-600 border-green-300"
								>
									<Award className="h-3 w-3" />
									{deliverable.pointsAwarded} pts
								</Badge>
							)}
						</div>
					</div>

					<div className="flex gap-1">
						{/* Admin Actions - Always visible to admins */}
						{canManageDeliverables && <AdminDeliverableActions deliverable={deliverable} />}

						{/* Regular Edit/Delete - Only for pending deliverables */}
						{canEdit && deliverable.status === DeliverableStatus.PENDING && (
							<>
								<Button
									size="sm"
									variant="ghost"
									className="h-8 w-8 p-0"
									onClick={() => onEdit(deliverable)}
								>
									<Edit className="h-4 w-4" />
								</Button>
								<Button
									size="sm"
									variant="ghost"
									className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
									onClick={() => onDelete(deliverable.deliverableId)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				{deliverable.description && <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{deliverable.description}</p>}

				{deliverable.acceptanceCriteria && (
					<div className="mb-3">
						<h5 className="text-xs font-medium text-muted-foreground mb-1">Acceptance Criteria</h5>
						<p className="text-sm whitespace-pre-wrap">{deliverable.acceptanceCriteria}</p>
					</div>
				)}

				{/* Submission Notes */}
				{deliverable.submissionNotes && (
					<div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
						<h5 className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Submission Notes</h5>
						<p className="text-sm text-blue-600 dark:text-blue-400 whitespace-pre-wrap">{deliverable.submissionNotes}</p>
					</div>
				)}

				{/* Review Notes */}
				{deliverable.reviewNotes && (
					<div
						className={cn(
							"mb-3 p-2 rounded border",
							deliverable.status === DeliverableStatus.APPROVED ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
						)}
					>
						<h5 className={cn("text-xs font-medium mb-1", deliverable.status === DeliverableStatus.APPROVED ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300")}>Review Notes</h5>
						<p className={cn("text-sm whitespace-pre-wrap", deliverable.status === DeliverableStatus.APPROVED ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>{deliverable.reviewNotes}</p>
					</div>
				)}

				{/* Timestamps */}
				<div className="text-xs text-muted-foreground space-y-1">
					<div>Created: {format(new Date(deliverable.createdAt), "MMM d, yyyy 'at' HH:mm")}</div>
					{deliverable.submittedAt && <div>Submitted: {format(new Date(deliverable.submittedAt), "MMM d, yyyy 'at' HH:mm")}</div>}
					{deliverable.reviewedAt && deliverable.reviewedBy && (
						<div>
							Reviewed by {deliverable.reviewedBy.name}: {format(new Date(deliverable.reviewedAt), "MMM d, yyyy 'at' HH:mm")}
						</div>
					)}
				</div>

				{/* Action Buttons */}
				<div className="flex gap-2 mt-4">
					{canSubmit && deliverable.status === DeliverableStatus.PENDING && (
						<Dialog
							open={submitOpen}
							onOpenChange={setSubmitOpen}
						>
							<DialogTrigger asChild>
								<Button
									size="sm"
									variant="outline"
								>
									Submit
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-md">
								<DialogHeader>
									<DialogTitle>Submit Deliverable</DialogTitle>
								</DialogHeader>
								<Form {...submitForm}>
									<form
										onSubmit={submitForm.handleSubmit(handleSubmit)}
										className="space-y-4"
									>
										<FormField
											control={submitForm.control}
											name="submissionNotes"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Submission Notes (Optional)</FormLabel>
													<FormControl>
														<Textarea
															placeholder="Add any notes about your submission"
															className="min-h-[80px]"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<div className="flex justify-end gap-2">
											<Button
												type="button"
												variant="outline"
												onClick={() => setSubmitOpen(false)}
											>
												Cancel
											</Button>
											<Button type="submit">Submit</Button>
										</div>
									</form>
								</Form>
							</DialogContent>
						</Dialog>
					)}

					{canReview && (deliverable.status === DeliverableStatus.SUBMITTED || deliverable.status === DeliverableStatus.UNDER_REVIEW) && (
						<Dialog
							open={reviewOpen}
							onOpenChange={setReviewOpen}
						>
							<DialogTrigger asChild>
								<Button size="sm">Review</Button>
							</DialogTrigger>
							<DialogContent className="max-w-md">
								<DialogHeader>
									<DialogTitle>Review Deliverable</DialogTitle>
								</DialogHeader>
								<Form {...reviewForm}>
									<form
										onSubmit={reviewForm.handleSubmit(handleReview)}
										className="space-y-4"
									>
										<FormField
											control={reviewForm.control}
											name="status"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Decision</FormLabel>
													<Select
														onValueChange={field.onChange}
														defaultValue={field.value}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select decision" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value={DeliverableStatus.APPROVED}>Approve</SelectItem>
															<SelectItem value={DeliverableStatus.REJECTED}>Reject</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={reviewForm.control}
											name="pointsAwarded"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Points Awarded</FormLabel>
													<FormControl>
														<Input
															type="number"
															min="0"
															placeholder="0"
															{...field}
															onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={reviewForm.control}
											name="reviewNotes"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Review Notes (Optional)</FormLabel>
													<FormControl>
														<Textarea
															placeholder="Add feedback about the deliverable"
															className="min-h-[80px]"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="flex justify-end gap-2">
											<Button
												type="button"
												variant="outline"
												onClick={() => setReviewOpen(false)}
											>
												Cancel
											</Button>
											<Button type="submit">Submit Review</Button>
										</div>
									</form>
								</Form>
							</DialogContent>
						</Dialog>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

export function TaskDeliverablesSection({ task, deliverables = [] }: TaskDeliverablesSectionProps) {
	const { canEditWeeklyTasks } = usePermissions();
	const { user, hasPermission } = useAuthStore();

	// Check if user has admin deliverable management permission
	const canManageDeliverables = hasPermission("manage_deliverables");

	// Fetch deliverables from API
	const { data: apiDeliverables, refetch } = useTaskDeliverables(task.taskId);
	const createDeliverable = useCreateTaskDeliverable();
	const updateDeliverable = useUpdateTaskDeliverable();
	const deleteDeliverable = useDeleteTaskDeliverable();
	const submitDeliverable = useSubmitTaskDeliverable();
	const reviewDeliverable = useReviewTaskDeliverable();

	// State for edit and delete dialogs
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedDeliverable, setSelectedDeliverable] = useState<TaskDeliverable | null>(null);

	// Use API data if available, fallback to props
	const currentDeliverables = apiDeliverables || deliverables;

	// Check if user is the reviewer assigned to this task
	const isTaskReviewer = task.assignees?.some((assignee) => assignee.userId === user?.userId && assignee.role === "reviewer") ?? false;

	// Check if user is a regular assignee (not reviewer)
	const isRegularAssignee = task.assignees?.some((assignee) => assignee.userId === user?.userId && assignee.role !== "reviewer") ?? false;

	// Only Admins and the assigned Reviewer can manage deliverables for Weekly Tasks
	const canEdit = task.type === "weekly" && (canEditWeeklyTasks || isTaskReviewer);

	// Only Admins and the assigned Reviewer can review
	const canReview = canEdit;

	// Regular assignees (developers) can submit, but cannot edit/delete/review
	const canSubmit = task.type === "weekly" && isRegularAssignee && !canEdit;

	// Edit form
	const editForm = useForm<DeliverableFormData>({
		resolver: zodResolver(deliverableSchema),
		defaultValues: {
			title: "",
			description: "",
			acceptanceCriteria: "",
			isBonus: false,
			order: 0,
		},
	});

	const handleRefresh = () => {
		refetch();
	};

	const handleCreateDeliverable = async (data: DeliverableFormData) => {
		try {
			await createDeliverable.mutateAsync({
				taskId: task.taskId,
				data: {
					title: data.title,
					description: data.description,
					acceptanceCriteria: data.acceptanceCriteria,
					isBonus: data.isBonus,
					order: data.order,
				},
			});
		} catch (error) {
			console.error("Failed to create deliverable:", error);
			throw error;
		}
	};

	const handleEditDeliverable = (deliverable: TaskDeliverable) => {
		setSelectedDeliverable(deliverable);
		editForm.reset({
			title: deliverable.title,
			description: deliverable.description || "",
			acceptanceCriteria: deliverable.acceptanceCriteria || "",
			isBonus: deliverable.isBonus,
			order: deliverable.order,
		});
		setEditDialogOpen(true);
	};

	const handleUpdateDeliverable = async (data: DeliverableFormData) => {
		if (!selectedDeliverable) return;

		try {
			await updateDeliverable.mutateAsync({
				taskId: task.taskId,
				deliverableId: selectedDeliverable.deliverableId,
				data: {
					title: data.title,
					description: data.description,
					acceptanceCriteria: data.acceptanceCriteria,
					isBonus: data.isBonus,
					order: data.order,
				},
			});
			setEditDialogOpen(false);
			setSelectedDeliverable(null);
			editForm.reset();
		} catch (error) {
			console.error("Failed to update deliverable:", error);
			throw error;
		}
	};

	const handleDeleteDeliverable = (deliverableId: number) => {
		const deliverable = currentDeliverables.find((d) => d.deliverableId === deliverableId);
		if (deliverable) {
			setSelectedDeliverable(deliverable);
			setDeleteDialogOpen(true);
		}
	};

	const confirmDeleteDeliverable = async () => {
		if (!selectedDeliverable) return;

		try {
			await deleteDeliverable.mutateAsync({
				taskId: task.taskId,
				deliverableId: selectedDeliverable.deliverableId,
			});
			setDeleteDialogOpen(false);
			setSelectedDeliverable(null);
		} catch (error) {
			console.error("Failed to delete deliverable:", error);
		}
	};

	const handleSubmitDeliverable = async (deliverableId: number, submissionNotes?: string) => {
		try {
			await submitDeliverable.mutateAsync({
				taskId: task.taskId,
				deliverableId,
				data: { submissionNotes },
			});
		} catch (error) {
			console.error("Failed to submit deliverable:", error);
			throw error;
		}
	};

	const handleReviewDeliverable = async (deliverableId: number, data: ReviewFormData) => {
		try {
			await reviewDeliverable.mutateAsync({
				taskId: task.taskId,
				deliverableId,
				data: {
					status: data.status,
					reviewNotes: data.reviewNotes,
					pointsAwarded: data.pointsAwarded,
				},
			});
		} catch (error) {
			console.error("Failed to review deliverable:", error);
			throw error;
		}
	};

	// Sort deliverables by order, then by creation date
	const sortedDeliverables = [...currentDeliverables].sort((a, b) => {
		if (a.order !== b.order) return a.order - b.order;
		return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
	});

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Package className="h-5 w-5 text-muted-foreground" />
					<h3 className="font-medium">Deliverables</h3>
					<Badge variant="secondary">{currentDeliverables.length}</Badge>
				</div>
				{canEdit && (
					<CreateDeliverableDialog
						onSuccess={handleRefresh}
						onCreateDeliverable={handleCreateDeliverable}
					/>
				)}
			</div>

			{/* Deliverables List */}
			{sortedDeliverables.length > 0 ? (
				<div className="space-y-3">
					{sortedDeliverables.map((deliverable) => (
						<DeliverableCard
							key={deliverable.deliverableId}
							deliverable={deliverable}
							canEdit={canEdit}
							canSubmit={canSubmit}
							canReview={canReview}
							canManageDeliverables={canManageDeliverables}
							onSubmit={handleSubmitDeliverable}
							onReview={handleReviewDeliverable}
							onEdit={handleEditDeliverable}
							onDelete={handleDeleteDeliverable}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-8 text-muted-foreground">
					<Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
					<p className="text-sm">No deliverables defined for this task</p>
					{canEdit && <p className="text-xs mt-1">Click &quot;Add Deliverable&quot; to create the first one</p>}
				</div>
			)}

			{/* Edit Deliverable Dialog */}
			<Dialog
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Edit Deliverable</DialogTitle>
					</DialogHeader>
					<Form {...editForm}>
						<form
							onSubmit={editForm.handleSubmit(handleUpdateDeliverable)}
							className="space-y-4"
						>
							<FormField
								control={editForm.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter deliverable title"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={editForm.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe what needs to be delivered"
												className="min-h-[80px]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={editForm.control}
								name="acceptanceCriteria"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Acceptance Criteria</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Define what makes this deliverable acceptable"
												className="min-h-[60px]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex items-center justify-between">
								<FormField
									control={editForm.control}
									name="isBonus"
									render={({ field }) => (
										<FormItem className="flex items-center space-x-2">
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
											<FormLabel className="text-sm font-normal">Bonus Deliverable</FormLabel>
										</FormItem>
									)}
								/>

								<FormField
									control={editForm.control}
									name="order"
									render={({ field }) => (
										<FormItem className="w-20">
											<FormLabel>Order</FormLabel>
											<FormControl>
												<Input
													type="number"
													min="0"
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<div className="flex justify-end gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setEditDialogOpen(false);
										setSelectedDeliverable(null);
										editForm.reset();
									}}
								>
									Cancel
								</Button>
								<Button type="submit">Update</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Delete Deliverable</DialogTitle>
						<DialogDescription>Are you sure you want to delete this deliverable? This action cannot be undone.</DialogDescription>
					</DialogHeader>
					{selectedDeliverable && (
						<div className="py-4">
							<p className="text-sm font-medium">{selectedDeliverable.title}</p>
							{selectedDeliverable.description && <p className="text-sm text-muted-foreground mt-1">{selectedDeliverable.description}</p>}
						</div>
					)}
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setDeleteDialogOpen(false);
								setSelectedDeliverable(null);
							}}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={confirmDeleteDeliverable}
						>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
