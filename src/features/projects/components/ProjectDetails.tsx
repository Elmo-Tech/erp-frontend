"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Edit, Save, X, Calendar, DollarSign, User, FileText, Clock, History } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useProject, useUpdateProject, useApproveUI } from "../hooks/useProjects";
import { Project, ProjectStatus, UpdateProjectPayload } from "../types/project";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { getAvailableTransitions, canTransitionTo } from "../helpers/statusHelpers";
import { updateProjectSchema, UpdateProjectFormData } from "../schemas/projectSchema";
import { WikiList } from "./WikiList";
import { HistoryLog } from "./HistoryLog";

interface ProjectDetailsProps {
	projectId: number;
	onProjectUpdate?: (project: Project) => void;
	className?: string;
}

/**
 * ProjectDetails component for displaying and managing project information
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8
 */
export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId, onProjectUpdate, className = "" }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [activeTab, setActiveTab] = useState("details");

	// Fetch project data
	const { data: project, isLoading, error } = useProject(projectId);
	const updateProjectMutation = useUpdateProject();
	const approveUIMutation = useApproveUI();

	// Form setup
	const form = useForm<UpdateProjectFormData>({
		resolver: zodResolver(updateProjectSchema),
		defaultValues: {
			title: project?.title || "",
			description: project?.description || "",
			budget: project?.budget || 0,
			deadline: project?.deadline ? new Date(project.deadline).toISOString().split("T")[0] : "",
			reason: "",
		},
	});

	// Reset form when project data changes
	React.useEffect(() => {
		if (project) {
			form.reset({
				title: project.title,
				description: project.description || "",
				budget: project.budget,
				deadline: project.deadline ? new Date(project.deadline).toISOString().split("T")[0] : "",
				reason: "",
			});
		}
	}, [project, form]);

	// Handle form submission
	const onSubmit = async (data: UpdateProjectFormData) => {
		if (!project) return;

		try {
			const updatedProject = await updateProjectMutation.mutateAsync({
				id: project.projectId,
				payload: data,
			});

			setIsEditing(false);
			form.reset();
			onProjectUpdate?.(updatedProject);
		} catch (error) {
			console.error("Failed to update project:", error);
		}
	};

	// Handle status transition
	const handleStatusTransition = async (newStatus: ProjectStatus) => {
		if (!project) return;

		try {
			const updatedProject = await updateProjectMutation.mutateAsync({
				id: project.projectId,
				payload: { status: newStatus },
			});

			onProjectUpdate?.(updatedProject);
		} catch (error) {
			console.error("Failed to update project status:", error);
		}
	};

	// Handle UI approval
	const handleApproveUI = async () => {
		if (!project) return;

		try {
			const updatedProject = await approveUIMutation.mutateAsync(project.projectId);
			onProjectUpdate?.(updatedProject);
		} catch (error) {
			console.error("Failed to approve UI:", error);
		}
	};

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	// Format date
	const formatDate = (dateString: string | null) => {
		if (!dateString) return "Not set";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Check if budget or deadline is being changed (for reason requirement)
	const watchedBudget = form.watch("budget");
	const watchedDeadline = form.watch("deadline");
	const isBudgetChanged = watchedBudget !== project?.budget;
	const isDeadlineChanged = watchedDeadline !== (project?.deadline ? new Date(project.deadline).toISOString().split("T")[0] : "");
	const requiresReason = isBudgetChanged || isDeadlineChanged;

	// Loading state
	if (isLoading) {
		return (
			<Card className={className}>
				<CardHeader>
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-6 w-32" />
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								className="space-y-2"
							>
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-10 w-full" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	// Error state
	if (error || !project) {
		return (
			<Card className={className}>
				<CardContent className="flex items-center justify-center h-64">
					<div className="text-center space-y-2">
						<AlertCircle className="h-8 w-8 text-destructive mx-auto" />
						<p className="text-sm text-muted-foreground">Failed to load project</p>
						<p className="text-xs text-muted-foreground">{error?.message}</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const availableTransitions = getAvailableTransitions(project.status, project.previousStatus);

	return (
		<div className={className}>
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="space-y-2">
							<CardTitle className="text-2xl">{project.title}</CardTitle>
							<div className="flex items-center gap-2">
								<ProjectStatusBadge
									status={project.status}
									showIcon
									size="lg"
								/>
								{project.status === ProjectStatus.UI_UX && !project.uiApprovedAt && (
									<Button
										size="sm"
										onClick={handleApproveUI}
										disabled={approveUIMutation.isPending}
									>
										{approveUIMutation.isPending ? "Approving..." : "Approve UI"}
									</Button>
								)}
							</div>
						</div>
						<div className="flex items-center gap-2">
							{!isEditing && (
								<Button
									variant="outline"
									onClick={() => setIsEditing(true)}
								>
									<Edit className="h-4 w-4 mr-2" />
									Edit
								</Button>
							)}
						</div>
					</div>
				</CardHeader>

				<CardContent>
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
					>
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="details">
								<FileText className="h-4 w-4 mr-2" />
								Details
							</TabsTrigger>
							<TabsTrigger value="wiki">
								<FileText className="h-4 w-4 mr-2" />
								Wiki
							</TabsTrigger>
							<TabsTrigger value="history">
								<History className="h-4 w-4 mr-2" />
								History
							</TabsTrigger>
						</TabsList>

						<TabsContent
							value="details"
							className="space-y-6"
						>
							{isEditing ? (
								<Form {...form}>
									<form
										onSubmit={form.handleSubmit(onSubmit)}
										className="space-y-6"
									>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<FormField
												control={form.control}
												name="title"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Title</FormLabel>
														<FormControl>
															<Input {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="budget"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Budget</FormLabel>
														<FormControl>
															<Input
																type="number"
																step="0.01"
																{...field}
																onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="deadline"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Deadline</FormLabel>
														<FormControl>
															<Input
																type="date"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											{requiresReason && (
												<FormField
													control={form.control}
													name="reason"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Reason for Change *</FormLabel>
															<FormControl>
																<Input
																	{...field}
																	placeholder="Explain why budget/deadline is changing..."
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											)}
										</div>

										<FormField
											control={form.control}
											name="description"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Description</FormLabel>
													<FormControl>
														<Textarea
															{...field}
															rows={4}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="flex items-center gap-2">
											<Button
												type="submit"
												disabled={updateProjectMutation.isPending}
											>
												<Save className="h-4 w-4 mr-2" />
												{updateProjectMutation.isPending ? "Saving..." : "Save Changes"}
											</Button>
											<Button
												type="button"
												variant="outline"
												onClick={() => {
													setIsEditing(false);
													form.reset();
												}}
											>
												<X className="h-4 w-4 mr-2" />
												Cancel
											</Button>
										</div>
									</form>
								</Form>
							) : (
								<div className="space-y-6">
									{/* Project Information */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-4">
											<div>
												<label className="text-sm font-medium text-muted-foreground">Client</label>
												<div className="mt-1">
													{project.client ? (
														<div className="flex items-center gap-2">
															<User className="h-4 w-4 text-muted-foreground" />
															<div>
																<p className="font-medium">{project.client.name}</p>
																<p className="text-sm text-muted-foreground">{project.client.email}</p>
															</div>
														</div>
													) : (
														<span className="text-muted-foreground">No client assigned</span>
													)}
												</div>
											</div>

											<div>
												<label className="text-sm font-medium text-muted-foreground">Budget</label>
												<div className="mt-1 flex items-center gap-2">
													<DollarSign className="h-4 w-4 text-muted-foreground" />
													<span className="font-mono text-lg">{formatCurrency(project.budget)}</span>
												</div>
											</div>
										</div>

										<div className="space-y-4">
											<div>
												<label className="text-sm font-medium text-muted-foreground">Deadline</label>
												<div className="mt-1 flex items-center gap-2">
													<Calendar className="h-4 w-4 text-muted-foreground" />
													<span className={project.deadline ? "" : "text-muted-foreground"}>{formatDate(project.deadline)}</span>
												</div>
											</div>

											{project.uiApprovedAt && (
												<div>
													<label className="text-sm font-medium text-muted-foreground">UI Approved</label>
													<div className="mt-1 flex items-center gap-2">
														<Clock className="h-4 w-4 text-muted-foreground" />
														<span>{formatDate(project.uiApprovedAt)}</span>
													</div>
												</div>
											)}
										</div>
									</div>

									{project.description && (
										<div>
											<label className="text-sm font-medium text-muted-foreground">Description</label>
											<p className="mt-1 text-sm leading-relaxed">{project.description}</p>
										</div>
									)}

									{/* Linked Quotation */}
									{project.quotation && (
										<div>
											<label className="text-sm font-medium text-muted-foreground">Linked Quotation</label>
											<div className="mt-1 p-3 bg-muted rounded-lg">
												<div className="flex items-center justify-between">
													<span className="font-medium">Quotation #{project.quotation.quotationId}</span>
													<Badge variant="secondary">{formatCurrency(project.quotation.finalPrice)}</Badge>
												</div>
											</div>
										</div>
									)}

									{/* Status Transitions */}
									{availableTransitions.length > 0 && (
										<div>
											<label className="text-sm font-medium text-muted-foreground">Available Actions</label>
											<div className="mt-2 flex flex-wrap gap-2">
												{availableTransitions.map((status) => (
													<Button
														key={status}
														variant="outline"
														size="sm"
														onClick={() => handleStatusTransition(status)}
														disabled={updateProjectMutation.isPending}
													>
														Move to {status.replace("_", " ")}
													</Button>
												))}
											</div>
										</div>
									)}
								</div>
							)}
						</TabsContent>

						<TabsContent value="wiki">
							<WikiList projectId={project.projectId} />
						</TabsContent>

						<TabsContent value="history">
							<HistoryLog projectId={project.projectId} />
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
};
