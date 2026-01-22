export type PointTransactionType =
	| "task_completed"
	| "task_on_time"
	| "code_review_approved"
	| "innovation_verified"
	| "attendance_bonus"
	| "quality_bonus"
	| "performance_bonus"
	| "manual_bonus"
	| "general_cleanliness_bonus"
	| "bug_found"
	| "task_late"
	| "code_review_rejected"
	| "attendance_late"
	| "task_reopened"
	| "manual_deduction"
	| "general_cleanliness_deduction";

export interface PointTransactionTypeOption {
	name: string;
	value: PointTransactionType;
	label: string;
	points: number;
	is_positive: boolean;
}

export interface UserPoint {
	userPointId: number;
	userId: number;
	pointsChange: number;
	pointsBefore: number;
	pointsAfter: number;
	reason: string;
	type: "manual" | "automatic";
	transactionType?: PointTransactionType;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface UserWithPoints {
	userId: number;
	name: string;
	email: string;
	avatar: string;
	totalPoints: number;
	isActive: boolean;
	createdAt: string;
}

export interface UnifiedPointTransaction {
	id: string;
	points: number;
	type: string;
	reason: string;
	createdAt: string;
	createdBy: string;
	balanceAfter: number;
	source: "automatic" | "manual";
	sourceType?: string;
	sourceId?: number;
}

export interface UnifiedPointsHistoryResponse {
	transactions: UnifiedPointTransaction[];
	summary: {
		totalEarned: number;
		totalDeducted: number;
		netPoints: number;
		transactionCount: number;
		byType: Record<string, { count: number; total: number }>;
		bySource: Record<string, { count: number; total: number }>;
	};
	currentPoints: number;
}

export interface LeaderboardUser {
	userId: number;
	name: string;
	avatar: string;
	totalPoints: number;
	rank: number;
}

export interface PointsStatistics {
	totalUsers: number;
	totalPoints: number;
	averagePoints: number;
	monthlyActivity: number;
	topUser: {
		name: string;
		points: number;
	} | null;
}

export interface AddPointsFormData {
	userId: number;
	type: PointTransactionType;
	points: number;
	reason: string;
}

export interface DeductPointsFormData {
	userId: number;
	type: PointTransactionType;
	points: number;
	reason: string;
}

export interface SetPointsFormData {
	userId: number;
	points: number;
	reason: string;
}

export interface UserPointsFilters {
	search?: string;
	isActive?: boolean;
	sortBy?: "total_points" | "name" | "created_at";
	sortOrder?: "asc" | "desc";
	dateFrom?: string;
	dateTo?: string;
}

export interface PointsReportFilters {
	dateFrom?: string;
	dateTo?: string;
	userId?: number;
	type?: "manual" | "automatic" | "all";
}

export interface PointsReportResponse {
	activities: UserPoint[];
	summary: {
		totalActivities: number;
		totalPointsAdded: number;
		totalPointsDeducted: number;
		netChange: number;
		period: {
			from: string;
			to: string;
		};
	};
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}

export interface UserPointsHistoryResponse {
	pointsHistory: UserPoint[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}

export interface UsersWithPointsResponse {
	users: UserWithPoints[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}
