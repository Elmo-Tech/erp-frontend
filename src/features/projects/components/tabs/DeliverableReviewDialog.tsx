"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, XCircle, Award, Eye, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { TaskDeliverable } from "../../types/taskDeliverable";
import { reviewDeliverableSchema, ReviewDeliverableFormData } from "../../schemas/deliverableSchemas";
import { useStartReviewTaskDeliverable, useApproveTaskDeliverable, useRejectTaskDeliverable } from "../../hooks/useTaskDeliverables";

interface DeliverableReviewDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deliverable: TaskDeliverable | null;
}

export function DeliverableReviewDialog({ open, onOpenChange, deliverable }: DeliverableReviewDialogProps) {
	const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);

	const startReview = useStartReviewTaskDeliverable();
	const approveDeliverable = useApproveTaskDeliverable();
	const rejectDeliverable = useRejectTaskDeliverable();

	const form = useForm<ReviewDeliverableFormData>({
		resolver: zodResolver(reviewDeliverableSchema),
		defaultValues: {
			pointsAwarded: 1,
			pointsDeducted: 1,
			reviewNotes: "",
		},
	});

	const handleStartReview = async () => {
		if (!deliverable) return;

		try {
			await startReview.mutateAsync(deliverable.deliverableId);
			toast.success("Review started");
		} catch (error) {
			toast.error("Failed to start review");
		}
	};

	const onSubmit = async (data: ReviewDeliverableFormData) => {
		if (!deliverable || !reviewAction) return;

		try {
			if (reviewAction === "approve") {
				await approveDeliverable.mutateAsync({
					deliverableId: deliverable.deliverableId,
					data: {
						pointsAwarded: data.pointsAwarded,
						reviewNotes: data.reviewNotes,
					},
				});
				toast.success("Deliverable approved");
			} else {
				await rejectDeliverable.mutateAsync({
					deliverableId: deliverable.deliverableId,
					data: {
						pointsDeducted: data.pointsDeducted,
						reviewNotes: data.reviewNotes,
					},
				});
				toast.success("Deliverable rejected");
			}

			onOpenChange(false);
			setReviewAction(null);
			form.reset();
		} catch (error) {
			toast.error(`Failed to ${reviewAction} deliverable`);
		}
	};

	const isLoading = startReview.isPending || approveDeliverable.isPending || rejectDeliverable.isPending;

	if (!deliverable) return null;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Eye className="h-5 w-5" />
						Review Deliverable
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Deliverable Details */}
					<div className="p-4 bg-muted rounded-lg">
						<div className="flex items-center gap-2 mb-3">
							<h4 className="font-semibold text-lg">{deliverable.title}</h4>
							{deliverable.isBonus && (
								<Badge variant="secondary">
									<Award className="h-3 w-3 mr-1" />
									Bonus
								</Badge>
							)}
							<Badge
								variant="outline"
								className="ml-auto"
							>
								{deliverable.statusLabel}
							</Badge>
						</div>

						{deliverable.description && (
							<div className="mb-3">
								<h5 className="text-sm font-medium mb-1">Description:</h5>
								<p className="text-sm text-muted-foreground">{deliverable.description}</p>
							</div>
						)}

						{deliverable.acceptanceCriteria && (
							<div className="mb-3">
								<h5 className="text-sm font-medium mb-1">Acceptance Criteria:</h5>
								<p className="text-sm">{deliverable.acceptanceCriteria}</p>
							</div>
						)}

						{deliverable.submissionNotes && (
							<div className="p-3 bg-blue-50 rounded-md border border-blue-200">
								<h5 className="text-sm font-medium text-blue-800 mb-1">Submission Notes:</h5>
								<p className="text-sm text-blue-700">{deliverable.submissionNotes}</p>
							</div>
						)}

						{/* Metadata */}
						<div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
							{deliverable.submittedAt && (
								<div className="flex items-center gap-1">
									<Calendar className="h-3 w-3" />
									<span>Submitted: {format(new Date(deliverable.submittedAt), "MMM d, HH:mm")}</span>
								</div>
							)}
							{deliverable.reviewer && (
								<div className="flex items-center gap-1">
									<User className="h-3 w-3" />
									<span>Reviewer: {deliverable.reviewer.name}</span>
								</div>
							)}
						</div>
					</div>

					{/* Review Actions */}
					{deliverable.status === "submitted" && (
						<div className="flex justify-center">
							<Button
								onClick={handleStartReview}
								disabled={isLoading}
							>
								{startReview.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								<Eye className="h-4 w-4 mr-2" />
								Start Review
							</Button>
						</div>
					)}

					{deliverable.status === "under_review" && (
						<Tabs
							value={reviewAction || ""}
							onValueChange={(value) => setReviewAction(value as "approve" | "reject")}
						>
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger
									value="approve"
									className="text-green-600"
								>
									<CheckCircle className="h-4 w-4 mr-2" />
									Approve
								</TabsTrigger>
								<TabsTrigger
									value="reject"
									className="text-red-600"
								>
									<XCircle className="h-4 w-4 mr-2" />
									Reject
								</TabsTrigger>
							</TabsList>

							<TabsContent
								value="approve"
								className="mt-4"
							>
								<Form {...form}>
									<form
										onSubmit={form.handleSubmit(onSubmit)}
										className="space-y-4"
									>
										<FormField
											control={form.control}
											name="pointsAwarded"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Points to Award</FormLabel>
													<FormControl>
														<Input
															type="number"
															min="0"
															max="10"
															{...field}
															onChange={(e) => field.onChange(Number(e.target.value))}
														/>
													</FormControl>
													<FormDescription>Number of points to award (0-10)</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="reviewNotes"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Review Notes</FormLabel>
													<FormControl>
														<Textarea
															placeholder="Add feedback for the developer"
															className="min-h-[100px]"
															{...field}
														/>
													</FormControl>
													<FormDescription>Provide feedback about the deliverable</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="flex justify-end gap-3">
											<Button
												type="button"
												variant="outline"
												onClick={() => {
													onOpenChange(false);
													setReviewAction(null);
												}}
												disabled={isLoading}
											>
												Cancel
											</Button>
											<Button
												type="submit"
												disabled={isLoading}
												className="bg-green-600 hover:bg-green-700"
											>
												{approveDeliverable.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
												<CheckCircle className="h-4 w-4 mr-2" />
												Approve Deliverable
											</Button>
										</div>
									</form>
								</Form>
							</TabsContent>

							<TabsContent
								value="reject"
								className="mt-4"
							>
								<Form {...form}>
									<form
										onSubmit={form.handleSubmit(onSubmit)}
										className="space-y-4"
									>
										<FormField
											control={form.control}
											name="pointsDeducted"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Points to Deduct</FormLabel>
													<FormControl>
														<Input
															type="number"
															min="0"
															max="10"
															{...field}
															onChange={(e) => field.onChange(Number(e.target.value))}
														/>
													</FormControl>
													<FormDescription>Number of points to deduct (0-10)</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="reviewNotes"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Review Notes *</FormLabel>
													<FormControl>
														<Textarea
															placeholder="Explain why this deliverable is being rejected"
															className="min-h-[100px]"
															{...field}
														/>
													</FormControl>
													<FormDescription>Required: Explain what needs to be improved</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="flex justify-end gap-3">
											<Button
												type="button"
												variant="outline"
												onClick={() => {
													onOpenChange(false);
													setReviewAction(null);
												}}
												disabled={isLoading}
											>
												Cancel
											</Button>
											<Button
												type="submit"
												disabled={isLoading}
												variant="destructive"
											>
												{rejectDeliverable.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
												<XCircle className="h-4 w-4 mr-2" />
												Reject Deliverable
											</Button>
										</div>
									</form>
								</Form>
							</TabsContent>
						</Tabs>
					)}

					{/* Already Reviewed */}
					{deliverable.isCompleted && (
						<div className="text-center py-4">
							<Badge
								variant={deliverable.status === "approved" ? "default" : "destructive"}
								className="text-sm"
							>
								{deliverable.status === "approved" ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
								{deliverable.statusLabel}
							</Badge>

							{deliverable.reviewNotes && (
								<div className="mt-3 p-3 bg-muted rounded-md">
									<h5 className="text-sm font-medium mb-1">Review Notes:</h5>
									<p className="text-sm">{deliverable.reviewNotes}</p>
								</div>
							)}

							{deliverable.reviewedAt && <p className="text-xs text-muted-foreground mt-2">Reviewed on {format(new Date(deliverable.reviewedAt), "MMM d, yyyy 'at' HH:mm")}</p>}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
