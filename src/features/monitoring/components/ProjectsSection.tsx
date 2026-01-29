import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProjectsData } from "../types/employeeReview";
import { Briefcase, CheckCircle2, Clock } from "lucide-react";

interface ProjectsSectionProps {
	projects: ProjectsData;
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
	const getStatusColor = (status: string) => {
		const colors: Record<string, string> = {
			completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
			in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
			on_hold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
			cancelled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
		};
		return colors[status] || colors.in_progress;
	};

	return (
		<div className="space-y-6">
			{/* Projects Overview */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Projects</CardTitle>
						<Briefcase className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{projects?.total || 0}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Projects</CardTitle>
						<Clock className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{projects?.active || 0}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Completed</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{projects?.completed || 0}</div>
					</CardContent>
				</Card>
			</div>

			{/* Projects List */}
			<Card>
				<CardHeader>
					<CardTitle>Projects Worked On</CardTitle>
				</CardHeader>
				<CardContent>
					{projects?.projects && projects.projects.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Project</TableHead>
									<TableHead>Client</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Time Spent</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{projects.projects.map((project) => (
									<TableRow key={project.projectId}>
										<TableCell className="font-medium">{project.title}</TableCell>
										<TableCell>{project.clientName || "N/A"}</TableCell>
										<TableCell>
											<Badge className={getStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
										</TableCell>
										<TableCell className="text-right font-medium">{project.userTimeSpent.toFixed(1)}h</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<div className="text-center py-8">
							<p className="text-muted-foreground">No projects found for this period</p>
							{projects && <p className="text-sm text-muted-foreground mt-2">Total projects in system: {projects.total || 0}</p>}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
