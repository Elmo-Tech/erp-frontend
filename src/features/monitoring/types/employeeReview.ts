export interface EmployeeInfo {
	userId: number;
	name: string;
	email: string;
	avatar: string | null;
	specialization: string | null;
}

export interface ReviewPeriod {
	dateFrom: string | null;
	dateTo: string | null;
}

export interface OverviewMetrics {
	totalTrackedHours: number;
	totalIdleHours: number;
	taskCompletionRate: string;
	averageBounceRate: string;
	attendanceDays: number;
	productivityScore: string;
}

export interface TimeTrackingByType {
	count: number;
	totalMinutes: number;
	totalHours: number;
}

export interface TimeTrackingByDate {
	date: string;
	totalMinutes: number;
	totalHours: number;
}

export interface TimeTrackingData {
	totalEntries: number;
	totalMinutes: number;
	totalHours: number;
	byType: Record<string, TimeTrackingByType>;
	byDate: TimeTrackingByDate[];
}

export interface TaskWithBounce {
	taskId: number;
	title: string;
	projectTitle: string | null;
	status: string;
	reopenCount: number;
	estimatedHours: number | null;
	totalTimeSpent: number;
}

export interface RecentTask {
	taskId: number;
	title: string;
	projectTitle: string | null;
	status: string;
	priority: string;
	createdAt: string;
	updatedAt: string;
}

export interface TasksData {
	total: number;
	completed: number;
	inProgress: number;
	byStatus: Record<string, number>;
	byPriority: Record<string, number>;
	tasksWithBounces: TaskWithBounce[];
	recentTasks: RecentTask[];
	totalBounces: number;
}

export interface ProjectInfo {
	projectId: number;
	title: string;
	clientName: string | null;
	status: string;
	userTimeSpent: number;
}

export interface ProjectsData {
	total: number;
	active: number;
	completed: number;
	projects: ProjectInfo[];
}

export interface AttendanceRecord {
	date: string;
	clockIn: string | null;
	clockOut: string | null;
	isLate: boolean;
	lateMinutes: number;
	idleMinutes: number;
}

export interface AttendanceData {
	totalDays: number;
	lateDays: number;
	totalLateMinutes: number;
	totalIdleMinutes: number;
	averageIdlePerDay: number;
	attendanceList: AttendanceRecord[];
}

export interface ProductivityMetrics {
	efficiency: string;
	qualityScore: string;
	completionRate: string;
	productivityScore: string;
}

export interface EmployeeReviewData {
	employee: EmployeeInfo;
	period: ReviewPeriod;
	overview: OverviewMetrics;
	timeTracking: TimeTrackingData;
	tasks: TasksData;
	projects: ProjectsData;
	attendance: AttendanceData;
	productivity: ProductivityMetrics;
}

export interface EmployeeReviewFilters {
	userId: number;
	dateFrom?: string;
	dateTo?: string;
}
