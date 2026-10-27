/**
 * Dashboard Stats Types
 */

// Admin Stats
export interface AdminDashboardStats {
	totalProjects: number;
	projectsChange: number;
	monthlySales: number;
	salesChange: number;
	workHours: number;
	workHoursChange: number;
	activeClients: number;
	clientsChange: number;
	activeProjects: number;
	completedProjects: number;
	openTasks: number;
	overdueTasks: number;
	employeesCount: number;
	todayAttendance: number;
}

// Manager Stats
export interface ManagerDashboardStats {
	activeProjects: number;
	totalTasks: number;
	completedTasks: number;
	pendingTasks: number;
	teamHours: number;
	teamHoursChange: number;
	teamMembers: number;
}

// Developer Stats
export interface DeveloperDashboardStats {
	myTotalTasks: number;
	myCompletedTasks: number;
	myInProgressTasks: number;
	myTodoTasks: number;
	myHoursThisMonth: number;
	myHoursChange: number;
	myActiveProjects: number;
	clockedIn: boolean;
	clockedOut?: boolean;
	todayHours: number;
}

export interface PointsCycleSummary {
	label: string;
	startDate: string;
	endDate: string;
	netPoints: number;
	earnedPoints: number;
	deductedPoints: number;
	transactionCount: number;
}

// Legacy type for backward compatibility
export interface DashboardStats {
	totalProjects: number;
	projectsChange: number;
	monthlySales: number;
	salesChange: number;
	workHours: number;
	workHoursChange: number;
	activeClients: number;
	clientsChange: number;
}

export interface RecentProject {
	projectId: number;
	name: string;
	status: string;
	progress: number;
}

export interface RecentTask {
	taskId: number;
	title: string;
	status: string;
	assignee?: string;
	project: string;
	priority?: string;
}

export interface RecentActivity {
	activityId: number;
	action: string;
	user: string;
	time: string;
	type: "task" | "project" | "file" | "quotation" | "time";
}

export interface DeliveryTimelineItem {
	id: string;
	entityType: "project" | "task";
	title: string;
	startDate: string;
	endDate: string;
	projectId: number;
	projectName: string;
}

// Role-based Dashboard Responses
export interface AdminDashboardOverview {
	liveWork?: { activeTimerCount: number; working: { userId: number; name: string; taskId: number; taskTitle: string; projectId: number | null; startedAt: string; targetStatus?: string; targetMessage?: string | null }[]; idle: { userId: number; name: string }[] };
	role: "admin";
	stats: AdminDashboardStats;
	recentProjects: RecentProject[];
	recentActivities: RecentActivity[];
	timeline: DeliveryTimelineItem[];
}

export interface ManagerDashboardOverview {
	role: "manager";
	stats: ManagerDashboardStats;
	pointsCycle: PointsCycleSummary;
	recentTasks: RecentTask[];
	recentActivities: RecentActivity[];
}

export interface DeveloperDashboardOverview {
	projects?: { projectId: number; name: string; deadline: string | null }[];
	role: "developer";
	stats: DeveloperDashboardStats;
	pointsCycle: PointsCycleSummary;
	recentTasks: RecentTask[];
	recentActivities: RecentActivity[];
}

export type DashboardOverview = AdminDashboardOverview | ManagerDashboardOverview | DeveloperDashboardOverview;

export interface DashboardOverviewResponse {
	success: boolean;
	message: string;
	data: DashboardOverview;
}
