export interface EmployeeInfo {
	userId: number;
	name: string;
	email: string;
	avatar: string | null;
	specialization: string | null;
	totalPoints: number; // إضافة النقاط الحالية
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
	// إضافة إحصائيات النقاط
	pointsEarned: number;
	pointsDeducted: number;
	netPointsChange: number;
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
	// إضافة معلومات التسليم
	dueDate: string | null;
	completedAt: string | null;
	delayDays: number | null;
	isOverdue: boolean;
}

export interface RecentTask {
	taskId: number;
	title: string;
	projectTitle: string | null;
	status: string;
	priority: string;
	createdAt: string;
	updatedAt: string;
	// إضافة معلومات التسليم
	dueDate: string | null;
	completedAt: string | null;
	delayDays: number | null;
	isOverdue: boolean;
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

// إضافة interfaces للنقاط
export interface PointTransaction {
	transactionId: string;
	points: number;
	type: string;
	reason: string;
	createdAt: string;
	createdBy: string;
	balanceAfter: number;
	source?: string;
	sourceType?: string | null;
	sourceId?: number | null;
}

export interface PointsPagination {
	total: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
	showing: number;
}

export interface PointsData {
	currentPoints: number;
	pointsEarned: number;
	pointsDeducted: number;
	netChange: number;
	transactions: PointTransaction[];
	transactionsPagination: PointsPagination;
	pagination: PointsPagination; // Alias for transactionsPagination
	monthlyBreakdown: {
		[key: string]: {
			earned: number;
			deducted: number;
			net: number;
		};
	};
	bySource: {
		automatic: {
			count: number;
			earned: number;
			deducted: number;
		};
		manual: {
			count: number;
			earned: number;
			deducted: number;
		};
	};
	summary: {
		totalTransactions: number;
		automaticTransactions: number;
		manualTransactions: number;
	};
}

// Grace Period Info
export interface GracePeriodInfo {
	allowedDays: number;
	daysUsed: number;
	remainingDays: number;
	isExpired: boolean;
	firstLateDate: string | null;
	gracePeriodEndDate: string | null;
	daysOverLimit: number;
}

// Deduction Info
export interface DailyDeduction {
	date: string;
	lateMinutes: number;
	deduction: number;
	clockIn: string | null;
}

export interface MonthlyDeduction {
	lateMinutes: number;
	deductions: number;
	lateDays: number;
}

export interface DeductionInfo {
	totalLateMinutes: number;
	deductionRate: number;
	totalDeductions: number;
	daysWithDeductions: number;
	dailyDeductions: DailyDeduction[];
	monthlyDeductions: {
		[key: string]: MonthlyDeduction;
	};
	gracePeriodDays: number;
	averageDeductionPerDay: number;
}

// Task Performance Analysis
export interface MonthlyTaskPerformance {
	total: number;
	onTime: number;
	late: number;
	onTimeRate: number;
}

export interface TaskPerformanceAnalysis {
	totalCompleted: number;
	onTimeCount: number;
	lateCount: number;
	onTimeRate: string;
	averageDelayDays: string;
	byMonth: {
		[key: string]: MonthlyTaskPerformance;
	};
}

// Quality Metrics
export interface QualityMetrics {
	totalTasks: number;
	tasksWithBounces: number;
	tasksWithoutBounces: number;
	firstTimePassRate: string;
	averageBounceRate: string;
	totalBounces: number;
}

// Productivity Trends
export interface WeeklyTimeTracking {
	week: string;
	totalHours: number;
	entries: number;
}

export interface WeeklyTaskCompletion {
	week: string;
	completed: number;
	onTime: number;
}

export interface ProductivityTrends {
	weeklyTimeTracking: WeeklyTimeTracking[];
	weeklyTaskCompletion: WeeklyTaskCompletion[];
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
	points: PointsData;
	gracePeriod: GracePeriodInfo;
	deductions: DeductionInfo;
	taskPerformance: TaskPerformanceAnalysis;
	qualityMetrics: QualityMetrics;
	trends: ProductivityTrends;
}

export interface EmployeeReviewFilters {
	userId: number;
	dateFrom?: string;
	dateTo?: string;
	page?: number;
	perPage?: number;
}
