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
import { FilesTab, HistoryTab } from "./tabs";
import { ProjectPipelineTab } from "./pipeline";
import { ArrowLeft, Calendar, ListTodo, Clock, Pencil, Users, FileText, History, Columns3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { isModuleEnabled, moduleKeys } from "@/config/simplification";

interface ProjectDetailsTabsProps {
	projectId: number;
}

export function ProjectDetailsTabs({ projectId }: ProjectDetailsTabsProps) {
	const router = useRouter();
	const { data: project, isLoading } = useProject(projectId);
	const [activeTab, setActiveTab] = useState("pipeline");
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	// Permission checks
	const { canManageProjects, canEditProjects, canViewTasks, canViewProjectFiles, canViewProjectHistory } = usePermissions();

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
				<Skeleton className="h-9 w-72" />
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

	const filesCount = project.files?.length || 0;
	const canShowUIApproval = isModuleEnabled(moduleKeys.uiApproval);
	const visibleActiveTab = activeTab === "pipeline" && !canViewTasks ? "overview" : activeTab;

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

			{/* Tabs */}
			<Tabs
				value={visibleActiveTab}
				onValueChange={setActiveTab}
				className="space-y-4"
			>
				<TabsList className="h-auto flex-wrap justify-start">
					{canViewTasks && (
						<TabsTrigger
							value="pipeline"
							className="gap-2"
						>
							<Columns3 className="h-4 w-4" />
							Pipeline
						</TabsTrigger>
					)}
					{canManageProjects && <TabsTrigger value="overview">Overview</TabsTrigger>}
					{canManageProjects && canViewProjectFiles && (
						<TabsTrigger
							value="files"
							className="gap-2"
						>
							<FileText className="h-4 w-4" />
							Files ({filesCount})
						</TabsTrigger>
					)}
					{canManageProjects && canViewProjectHistory && (
						<TabsTrigger
							value="history"
							className="gap-2"
						>
							<History className="h-4 w-4" />
							History
						</TabsTrigger>
					)}
				</TabsList>

				{/* Overview Tab */}
				{canManageProjects && <TabsContent
					value="overview"
					className="space-y-6"
				>
					<div className="grid gap-4 md:grid-cols-3">
						<Card>
							<CardContent>
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm text-muted-foreground">Deadline</span>
								</div>
								<p className="text-2xl font-bold">{project.deadline ? format(new Date(project.deadline), "MMM d, yyyy") : "Not set"}</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent>
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
							<CardContent>
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

					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardContent className="space-y-4">
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
									{canShowUIApproval && project.uiApprovedAt && (
										<div>
											<p className="text-sm text-muted-foreground">UI Approved</p>
											<p className="font-medium">{format(new Date(project.uiApprovedAt), "MMM d, yyyy")}</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="space-y-4">
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
										{project.members.length > 5 && <p className="text-sm text-muted-foreground">+{project.members.length - 5} more members</p>}
									</div>
								) : (
									<p className="text-sm text-muted-foreground">No team members assigned</p>
								)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>}

				{/* Tasks Tab */}
				{canViewTasks && (
					<TabsContent value="pipeline">
						<ProjectPipelineTab projectId={projectId} />
					</TabsContent>
				)}

				{/* Files Tab */}
				{canManageProjects && canViewProjectFiles && (
					<TabsContent value="files">
						<FilesTab
							projectId={projectId}
							files={project.files || []}
							googleDriveFolderId={project.googleDriveFolderId}
							googleDriveFolderName={project.googleDriveFolderName}
						/>
					</TabsContent>
				)}

				{/* History Tab */}
				{canManageProjects && canViewProjectHistory && (
					<TabsContent value="history">
						<HistoryTab projectId={projectId} />
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
