/**
 * Dashboard Stats Types
 */

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

export interface RecentActivity {
	activityId: number;
	action: string;
	user: string;
	time: string;
	type: "task" | "project" | "file" | "quotation";
}

export interface DashboardOverview {
	stats: DashboardStats;
	recentProjects: RecentProject[];
	recentActivities: RecentActivity[];
}

export interface DashboardOverviewResponse {
	success: boolean;
	message: string;
	data: DashboardOverview;
}
