"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Skeleton } from "@/shared/ui/skeleton";
import { ArrowLeft, Calendar, DollarSign, ListTodo, Clock, Pencil, Users, FileText, BookOpen, History, FileEdit, Wallet, Building2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useProject } from "../hooks/useProjects";
import { usePermissions } from "@/_old/features/admin/hooks/usePermissions";
import { ProjectStatusBadge } from "@/shared/ui/StatusBadge";
import { UpdateProjectForm } from "./projects";
import { TeamTab, TasksTab, WikiTab, FilesTab, HistoryTab, ChangeRequestsTab, BudgetTab } from "./tabs";

interface ProjectWorkspaceProps {
	projectId: number;
}

/**
 * ProjectWorkspace - The main hub for project management
 * Features:
 * - Tab-based layout: [Overview] [Tasks] [Wiki] [Files] [History]
 * - Project stats and quick info
 * - Permission-based tab visibility
 * Requirements: FE-Pack 2 Step 2
 */
export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ projectId }) => {
	const router = useRouter();
	const { data: project, isLoading } = useProject(projectId);
	const [activeTab, setActiveTab] = useState("overview");
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	// Permission checks
	const { canEditProjects, canViewTasks, canViewProjectMembers, canViewProjectFiles, canViewWiki, canViewProjectHistory, canViewProjectBudget, canViewChangeRequests } = usePermissions();

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Skeleton className="h-10 w-10" />
					<div className="space-y-2">
						<Skeleton className="h-8 w-64" />
						<Skeleton className="h-4 w-48" />
					</div>
				</div>
				<div className="grid gap-4 md:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton
							key={i}
							className="h-24"
						/>
					))}
				</div>
				<Skeleton className="h-64" />
			</div>
		);
	}

	if (!project) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">Project not found</p>
				<Button
					variant="link"
					onClick={() => router.push("/dashboard/projects")}
				>
					Back to Projects
				</Button>
			</div>
		);
	}

	const membersCount = project.members?.length || 0;
	const filesCount = project.files?.length || 0;
	const tasksCount = project.tasks?.length || 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.push("/dashboard/projects")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-3">
							{project.title}
							<ProjectStatusBadge status={project.status} />
						</h1>
						<div className="flex items-center gap-4 text-muted-foreground mt-1">
							{project.client && (
								<div className="flex items-center gap-1">
									<Building2 className="h-4 w-4" />
									<span>{project.client.name}</span>
								</div>
							)}
							<div className="flex items-center gap-1">
								<Calendar className="h-4 w-4" />
								<span>Created {format(new Date(project.createdAt), "MMM d, yyyy")}</span>
							</div>
							{project.createdByUser && (
								<div className="flex items-center gap-1">
									<User className="h-4 w-4" />
									<span>by {project.createdByUser.name}</span>
								</div>
							)}
						</div>
					</div>
				</div>
				{canEditProjects && (
					<Button onClick={() => setEditDialogOpen(true)}>
						<Pencil className="h-4 w-4 mr-2" />
						Edit Project
					</Button>
				)}
			</div>

			{/* Project Description */}
			{project.description && (
				<Card>
					<CardContent className="pt-6">
						<p className="text-muted-foreground">{project.description}</p>
					</CardContent>
				</Card>
			)}

			{/* Quick Stats */}
			<div className={`grid gap-4 ${canViewProjectBudget ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
				{canViewProjectBudget && (
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-2">
								<DollarSign className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">Budget</span>
							</div>
							<p className="text-2xl font-bold">
								{project.budget
									? new Intl.NumberFormat("en-US", {
											style: "currency",
											currency: project.currency || "USD",
										}).format(Number(project.budget))
									: "Not set"}
							</p>
						</CardContent>
					</Card>
				)}
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Deadline</span>
						</div>
						<p className="text-2xl font-bold">{project.deadline ? format(new Date(project.deadline), "MMM d, yyyy") : "Not set"}</p>
						{project.deadline && (
							<p className="text-xs text-muted-foreground mt-1">{new Date(project.deadline) > new Date() ? `${Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left` : "Overdue"}</p>
						)}
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<ListTodo className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Progress</span>
						</div>
						<p className="text-2xl font-bold">{project.progress || 0}%</p>
						<Progress
							value={project.progress || 0}
							className="mt-2 h-2"
						/>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Time Spent</span>
						</div>
						<p className="text-2xl font-bold">
							{Math.floor((project.totalTimeSpent || 0) / 60)}h {(project.totalTimeSpent || 0) % 60}m
						</p>
						{project.estimatedHours && <p className="text-xs text-muted-foreground mt-1">of {project.estimatedHours}h estimated</p>}
					</CardContent>
				</Card>
			</div>

			{/* Main Workspace Tabs */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="space-y-4"
			>
				<TabsList className="grid w-full grid-cols-auto">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					{canViewTasks && (
						<TabsTrigger
							value="tasks"
							className="gap-2"
						>
							<ListTodo className="h-4 w-4" />
							Tasks
							{tasksCount > 0 && (
								<Badge
									variant="secondary"
									className="ml-1 text-xs"
								>
									{tasksCount}
								</Badge>
							)}
						</TabsTrigger>
					)}
					{canViewProjectMembers && (
						<TabsTrigger
							value="team"
							className="gap-2"
						>
							<Users className="h-4 w-4" />
							Team
							{membersCount > 0 && (
								<Badge
									variant="secondary"
									className="ml-1 text-xs"
								>
									{membersCount}
								</Badge>
							)}
						</TabsTrigger>
					)}
					{canViewWiki && (
						<TabsTrigger
							value="wiki"
							className="gap-2"
						>
							<BookOpen className="h-4 w-4" />
							Wiki
						</TabsTrigger>
					)}
					{canViewProjectFiles && (
						<TabsTrigger
							value="files"
							className="gap-2"
						>
							<FileText className="h-4 w-4" />
							Files
							{filesCount > 0 && (
								<Badge
									variant="secondary"
									className="ml-1 text-xs"
								>
									{filesCount}
								</Badge>
							)}
						</TabsTrigger>
					)}
					{canViewProjectHistory && (
						<TabsTrigger
							value="history"
							className="gap-2"
						>
							<History className="h-4 w-4" />
							History
						</TabsTrigger>
					)}
					{canViewChangeRequests && (
						<TabsTrigger
							value="change-requests"
							className="gap-2"
						>
							<FileEdit className="h-4 w-4" />
							Change Requests
						</TabsTrigger>
					)}
					{canViewProjectBudget && (
						<TabsTrigger
							value="budget"
							className="gap-2"
						>
							<Wallet className="h-4 w-4" />
							Budget
						</TabsTrigger>
					)}
				</TabsList>

				{/* Overview Tab */}
				<TabsContent
					value="overview"
					className="space-y-6"
				>
					<div className="grid gap-6 md:grid-cols-2">
						{/* Project Details */}
						<Card>
							<CardHeader>
								<CardTitle>Project Details</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid gap-3">
									<div>
										<p className="text-sm text-muted-foreground">Status</p>
										<ProjectStatusBadge status={project.status} />
									</div>
									{project.client && (
										<div>
											<p className="text-sm text-muted-foreground">Client</p>
											<p className="font-medium">{project.client.name}</p>
										</div>
									)}
									{project.contract && (
										<div>
											<p className="text-sm text-muted-foreground">Contract</p>
											<p className="font-medium">#{project.contract.contractNumber}</p>
										</div>
									)}
									{project.uiApprovedAt && (
										<div>
											<p className="text-sm text-muted-foreground">UI Approved</p>
											<p className="font-medium">{format(new Date(project.uiApprovedAt), "MMM d, yyyy")}</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Team Overview */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5" />
									Team Members
								</CardTitle>
							</CardHeader>
							<CardContent>
								{project.members && project.members.length > 0 ? (
									<div className="space-y-3">
										{project.members.slice(0, 5).map((member) => (
											<div
												key={member.memberId}
												className="flex items-center justify-between"
											>
												<div className="flex items-center gap-2">
													<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
														<User className="h-4 w-4" />
													</div>
													<span className="text-sm font-medium">{member.user?.name || "Unknown"}</span>
												</div>
												<Badge variant="outline">{member.role}</Badge>
											</div>
										))}
										{project.members.length > 5 && (
											<Button
												variant="link"
												className="p-0 h-auto text-sm"
												onClick={() => setActiveTab("team")}
											>
												View all {project.members.length} members
											</Button>
										)}
									</div>
								) : (
									<p className="text-sm text-muted-foreground">No team members assigned</p>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Recent Activity */}
					{canViewProjectHistory && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<History className="h-5 w-5" />
									Recent Activity
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-center py-8">
									<History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
									<p className="text-sm text-muted-foreground">View the full project history in the History tab</p>
									<Button
										variant="link"
										onClick={() => setActiveTab("history")}
										className="mt-2"
									>
										View History
									</Button>
								</div>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Tasks Tab */}
				{canViewTasks && (
					<TabsContent value="tasks">
						<TasksTab projectId={projectId} />
					</TabsContent>
				)}

				{/* Team Tab */}
				{canViewProjectMembers && (
					<TabsContent value="team">
						<TeamTab projectId={projectId} />
					</TabsContent>
				)}

				{/* Wiki Tab */}
				{canViewWiki && (
					<TabsContent value="wiki">
						<WikiTab projectId={projectId} />
					</TabsContent>
				)}

				{/* Files Tab */}
				{canViewProjectFiles && (
					<TabsContent value="files">
						<FilesTab
							projectId={projectId}
							files={project.files || []}
						/>
					</TabsContent>
				)}

				{/* History Tab */}
				{canViewProjectHistory && (
					<TabsContent value="history">
						<HistoryTab projectId={projectId} />
					</TabsContent>
				)}

				{/* Change Requests Tab */}
				{canViewChangeRequests && (
					<TabsContent value="change-requests">
						<ChangeRequestsTab projectId={projectId} />
					</TabsContent>
				)}

				{/* Budget Tab */}
				{canViewProjectBudget && (
					<TabsContent value="budget">
						<BudgetTab projectId={projectId} />
					</TabsContent>
				)}
			</Tabs>

			{/* Edit Project Dialog */}
			<UpdateProjectForm
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				project={project}
			/>
		</div>
	);
};
