"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "../hooks/useProjects";
import { UpdateProjectForm } from "./projects";
import { TeamTab, TasksTab, WikiTab, FilesTab, HistoryTab, ChangeRequestsTab, BudgetTab } from "./tabs";
import { ArrowLeft, Calendar, DollarSign, ListTodo, Clock, Pencil, Users, FileText, BookOpen, History, FileEdit, Wallet, CheckSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";

interface ProjectDetailsTabsProps {
	projectId: number;
}

export function ProjectDetailsTabs({ projectId }: ProjectDetailsTabsProps) {
	const router = useRouter();
	const { data: project, isLoading } = useProject(projectId);
	const [activeTab, setActiveTab] = useState("overview");
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	// Get user role from auth store
	const { role } = useAuthStore();

	// Permission checks
	const { canEditProjects, canViewTasks, canViewProjectMembers, canViewProjectFiles, canViewWiki, canViewProjectHistory, canViewProjectBudget, canViewChangeRequests, canManageTasks } = usePermissions();

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
						<h1 className="text-3xl font-bold flex items-center gap-2">
							{project.title}
							<ProjectStatusBadge status={project.status} />
						</h1>
						<p className="text-muted-foreground">
							{project.client?.name || "No client"} • Created {format(new Date(project.createdAt), "MMM d, yyyy")}
						</p>
					</div>
				</div>
				{canEditProjects && (
					<Button onClick={() => setEditDialogOpen(true)}>
						<Pencil className="h-4 w-4 mr-2" />
						Edit Project
					</Button>
				)}
			</div>

			{/* Quick Stats */}
			<div className={`grid gap-4 ${canViewProjectBudget ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
				{canViewProjectBudget && (
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-2">
								<DollarSign className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">Budget</span>
							</div>
							<p className="text-2xl font-bold">${Number(project.budget || 0).toLocaleString()}</p>
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
					</CardContent>
				</Card>
			</div>

			{/* Tabs */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="space-y-4"
			>
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					{canViewTasks && (
						<TabsTrigger
							value="tasks"
							className="gap-2"
						>
							<ListTodo className="h-4 w-4" />
							Tasks
						</TabsTrigger>
					)}
					{canViewTasks && (role === "admin" || role === "super-admin" || canManageTasks) && (
						<TabsTrigger
							value="deliverables"
							className="gap-2"
						>
							<CheckSquare className="h-4 w-4" />
							Deliverables
						</TabsTrigger>
					)}
					{canViewProjectMembers && (
						<TabsTrigger
							value="team"
							className="gap-2"
						>
							<Users className="h-4 w-4" />
							Team ({membersCount})
						</TabsTrigger>
					)}
					{canViewProjectFiles && (
						<TabsTrigger
							value="files"
							className="gap-2"
						>
							<FileText className="h-4 w-4" />
							Files ({filesCount})
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
							CRs
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
					className="space-y-4"
				>
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardContent className="pt-6 space-y-4">
								<h3 className="font-semibold">Project Details</h3>
								<div className="space-y-3">
									<div>
										<p className="text-sm text-muted-foreground">Client</p>
										<p className="font-medium">{project.client?.name || "No client assigned"}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Description</p>
										<p className="font-medium">{project.description || "No description"}</p>
									</div>
									{project.uiApprovedAt && (
										<div>
											<p className="text-sm text-muted-foreground">UI Approved</p>
											<p className="font-medium">{format(new Date(project.uiApprovedAt), "MMM d, yyyy")}</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="pt-6 space-y-4">
								<h3 className="font-semibold flex items-center gap-2">
									<Users className="h-4 w-4" />
									Team Members
								</h3>
								{project.members && project.members.length > 0 ? (
									<div className="space-y-2">
										{project.members.slice(0, 5).map((member) => (
											<div
												key={member.memberId}
												className="flex items-center justify-between"
											>
												<span className="text-sm">{member.user?.name || "Unknown"}</span>
												<Badge variant="outline">{member.role}</Badge>
											</div>
										))}
										{project.members.length > 5 && (
											<Button
												variant="link"
												className="p-0 h-auto"
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

				{/* Files Tab */}
				{canViewProjectFiles && (
					<TabsContent value="files">
						<FilesTab
							projectId={projectId}
							files={project.files || []}
						/>
					</TabsContent>
				)}

				{/* Wiki Tab */}
				{canViewWiki && (
					<TabsContent value="wiki">
						<WikiTab projectId={projectId} />
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
}
