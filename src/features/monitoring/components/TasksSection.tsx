import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TasksData } from "../types/employeeReview";
import { AlertTriangle, CheckCircle2, Clock, Calendar, TrendingDown, TrendingUp, CalendarX } from "lucide-react";
import { format, parseISO } from "date-fns";

interface TasksSectionProps {
	tasks: TasksData;
}

export function TasksSection({ tasks }: TasksSectionProps) {
	const getStatusColor = (status: string) => {
		const colors: Record<string, string> = {
			completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
			in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
			todo: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
			testing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
		};
		return colors[status] || colors.todo;
	};

	const getPriorityColor = (priority: string) => {
		const colors: Record<string, string> = {
			high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
			medium: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
			low: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
		};
		return colors[priority] || colors.medium;
	};

	const getDeliveryStatusColor = (task: any) => {
		if (task.status === "completed") {
			if (task.delayDays && task.delayDays > 0) {
				return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
			}
			return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
		}
		if (task.isOverdue) {
			return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
		}
		return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
	};

	const getDeliveryStatusText = (task: any) => {
		if (task.status === "completed") {
			if (task.delayDays && task.delayDays > 0) {
				return `Late by ${task.delayDays} days`;
			}
			return "On Time";
		}
		if (task.isOverdue) {
			return "Overdue";
		}
		return "In Progress";
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "No due date";
		try {
			return format(parseISO(dateString), "MMM d, yyyy");
		} catch {
			return "Invalid date";
		}
	};

	return (
		<div className="space-y-6">
			{/* Tasks Overview */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{tasks.total}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Completed</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{tasks.completed}</div>
						<p className="text-xs text-muted-foreground">{tasks.total > 0 ? ((tasks.completed / tasks.total) * 100).toFixed(1) : 0}% completion rate</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">In Progress</CardTitle>
						<Clock className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{tasks.inProgress}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Bounces</CardTitle>
						<AlertTriangle className="h-4 w-4 text-orange-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{tasks.totalBounces}</div>
						<p className="text-xs text-muted-foreground">{tasks.tasksWithBounces.length} tasks affected</p>
					</CardContent>
				</Card>
			</div>

			{/* Tasks with Bounces */}
			{tasks.tasksWithBounces.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Tasks with Bounces</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Task</TableHead>
									<TableHead>Project</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Due Date</TableHead>
									<TableHead>Delivery Status</TableHead>
									<TableHead className="text-right">Bounces</TableHead>
									<TableHead className="text-right">Time Spent</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{tasks.tasksWithBounces.map((task) => (
									<TableRow key={task.taskId}>
										<TableCell className="font-medium">{task.title}</TableCell>
										<TableCell>{task.projectTitle || "N/A"}</TableCell>
										<TableCell>
											<Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<Calendar className="h-3 w-3 text-muted-foreground" />
												<span className="text-sm">{formatDate(task.dueDate)}</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge className={getDeliveryStatusColor(task)}>{getDeliveryStatusText(task)}</Badge>
										</TableCell>
										<TableCell className="text-right">
											<Badge variant="destructive">{task.reopenCount}</Badge>
										</TableCell>
										<TableCell className="text-right">{task.totalTimeSpent.toFixed(1)}h</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			{/* Recent Tasks */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Tasks</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Task</TableHead>
								<TableHead>Project</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Priority</TableHead>
								<TableHead>Due Date</TableHead>
								<TableHead>Delivery Status</TableHead>
								<TableHead>Updated</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{tasks.recentTasks.map((task) => (
								<TableRow key={task.taskId}>
									<TableCell className="font-medium">{task.title}</TableCell>
									<TableCell>{task.projectTitle || "N/A"}</TableCell>
									<TableCell>
										<Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
									</TableCell>
									<TableCell>
										<Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1">
											<Calendar className="h-3 w-3 text-muted-foreground" />
											<span className="text-sm">{formatDate(task.dueDate)}</span>
										</div>
									</TableCell>
									<TableCell>
										<Badge className={getDeliveryStatusColor(task)}>{getDeliveryStatusText(task)}</Badge>
									</TableCell>
									<TableCell>{task.updatedAt}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
