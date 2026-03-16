import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PeriodTask, TasksData } from "../types/employeeReview";
import { Calendar, Clock, CheckCircle2, AlertTriangle, TrendingDown } from "lucide-react";
import { format, parseISO } from "date-fns";

interface DeliveryLogsSectionProps {
	tasks: TasksData;
}

export function DeliveryLogsSection({ tasks }: DeliveryLogsSectionProps) {
	const periodTasks = tasks.periodTasks || [];

	// Calculate delivery statistics
	const completedTasks = periodTasks.filter((task) => task.status === "completed");
	const overdueTasks = periodTasks.filter((task) => task.isOverdue);
	const onTimeTasks = completedTasks.filter((task) => !task.delayDays || task.delayDays <= 0);
	const lateTasks = completedTasks.filter((task) => task.delayDays && task.delayDays > 0);

	const getDeliveryStatusColor = (task: PeriodTask) => {
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

	const getDeliveryStatusText = (task: PeriodTask) => {
		if (task.deliveryStatusLabel) {
			return task.deliveryStatusLabel;
		}
		if (task.status === "completed") {
			if (task.delayDays && task.delayDays > 0) {
				return `Delivered ${task.delayDays} days late`;
			}
			if (task.delayDays && task.delayDays < 0) {
				return `Delivered ${Math.abs(task.delayDays)} days early`;
			}
			return "Delivered on time";
		}
		if (task.isOverdue) {
			const today = new Date();
			const dueDate = new Date(task.dueDate);
			const overdueDays = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
			return `Overdue by ${overdueDays} days`;
		}
		if (task.dueDate) {
			const today = new Date();
			const dueDate = new Date(task.dueDate);
			const remainingDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
			if (remainingDays <= 0) {
				return "Due today";
			}
			return `Due in ${remainingDays} days`;
		}
		return "No due date";
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "No date";
		try {
			return format(parseISO(dateString), "MMM d, yyyy");
		} catch {
			return "Invalid date";
		}
	};

	const formatDateTime = (dateString: string | null) => {
		if (!dateString) return "Not completed";
		try {
			return format(parseISO(dateString), "MMM d, yyyy HH:mm");
		} catch {
			return "Invalid date";
		}
	};

	return (
		<div className="space-y-6">
			{/* Delivery Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">On Time Deliveries</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">{onTimeTasks.length}</div>
						<p className="text-xs text-muted-foreground">{completedTasks.length > 0 ? ((onTimeTasks.length / completedTasks.length) * 100).toFixed(1) : 0}% of completed tasks</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Late Deliveries</CardTitle>
						<TrendingDown className="h-4 w-4 text-orange-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-orange-600">{lateTasks.length}</div>
						<p className="text-xs text-muted-foreground">{completedTasks.length > 0 ? ((lateTasks.length / completedTasks.length) * 100).toFixed(1) : 0}% of completed tasks</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Currently Overdue</CardTitle>
						<AlertTriangle className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
						<p className="text-xs text-muted-foreground">Active tasks past due date</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Average Delay</CardTitle>
						<Clock className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">{lateTasks.length > 0 ? (lateTasks.reduce((sum, task) => sum + (task.delayDays || 0), 0) / lateTasks.length).toFixed(1) : "0"}</div>
						<p className="text-xs text-muted-foreground">days for late tasks</p>
					</CardContent>
				</Card>
			</div>

			{/* Overdue Tasks */}
			{overdueTasks.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-red-600" />
							Currently Overdue Tasks
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Task</TableHead>
									<TableHead>Project</TableHead>
									<TableHead>Due Date</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Days Overdue</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{overdueTasks.map((task) => {
									const today = new Date();
									const dueDate = new Date(task.dueDate || "");
									const overdueDays = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

									return (
										<TableRow key={task.taskId}>
											<TableCell className="font-medium">{task.title}</TableCell>
											<TableCell>{task.projectTitle || "N/A"}</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<Calendar className="h-3 w-3 text-muted-foreground" />
													<span className="text-sm">{formatDate(task.dueDate)}</span>
												</div>
											</TableCell>
											<TableCell>
												<Badge className={getDeliveryStatusColor(task)}>{task.status.replace("_", " ")}</Badge>
											</TableCell>
											<TableCell>
												<Badge variant="destructive">{overdueDays} days</Badge>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			{/* Delivery History */}
			<Card>
				<CardHeader>
					<CardTitle>Delivery History</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Task</TableHead>
								<TableHead>Project</TableHead>
								<TableHead>Due Date</TableHead>
								<TableHead>Completed Date</TableHead>
								<TableHead>Delivery Status</TableHead>
								<TableHead>Priority</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{[...periodTasks]
								.sort((a, b) => {
									// Sort by completion date (completed tasks first), then by due date
									if (a.completedAt && b.completedAt) {
										return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
									}
									if (a.completedAt && !b.completedAt) return -1;
									if (!a.completedAt && b.completedAt) return 1;
									if (a.dueDate && b.dueDate) {
										return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
									}
									return 0;
								})
								.map((task) => (
									<TableRow key={task.taskId}>
										<TableCell className="font-medium">{task.title}</TableCell>
										<TableCell>{task.projectTitle || "N/A"}</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<Calendar className="h-3 w-3 text-muted-foreground" />
												<span className="text-sm">{formatDate(task.dueDate)}</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<Clock className="h-3 w-3 text-muted-foreground" />
												<span className="text-sm">{formatDateTime(task.completedAt)}</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge className={getDeliveryStatusColor(task)}>{getDeliveryStatusText(task)}</Badge>
										</TableCell>
										<TableCell>
											<Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}>{task.priority || "n/a"}</Badge>
										</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
					{periodTasks.length === 0 && (
						<div className="text-center py-8 text-muted-foreground">
							<Calendar className="h-8 w-8 mx-auto mb-2" />
							<p>No tasks found for this period</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
