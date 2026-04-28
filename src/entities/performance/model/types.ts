export type EvaluationStatus = "pending" | "in_progress" | "completed" | "approved";
export type PeriodStatus = "draft" | "active" | "completed";
export type BonusTier = "excellent" | "good" | "average" | "poor";

export interface EvaluationPeriod {
	periodId: number;
	name: string;
	startDate: string;
	endDate: string;
	status: PeriodStatus;
	createdAt: string;
	updatedAt: string;
}

export interface PerformanceEvaluation {
	evaluationId: number;
	userId: number;
	userName: string;
	periodId: number;
	periodName: string;
	totalScore: number;
	bonusTier: BonusTier;
	bonusTierLabel: string;
	bonusAmount: number;
	status: EvaluationStatus;
	evaluatorNotes?: string;
	createdAt: string;
	updatedAt: string;
}

export interface PeriodBonusSummary {
	periodId: number;
	periodName: string;
	evaluations: Array<{
		userId: number;
		userName: string;
		totalScore: number;
		bonusTier: BonusTier;
		bonusTierLabel: string;
		baseAmount: number;
		percentage: number;
		finalBonusAmount: number;
	}>;
	summary: {
		totalEmployees: number;
		totalBonusAmount: number;
		averageScore: number;
	};
}

export interface EvaluationListResponse {
	evaluations: PerformanceEvaluation[];
	pagination?: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}

export interface EvaluationPeriodListResponse {
	periods: EvaluationPeriod[];
	pagination?: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}

export interface EmployeeReviewSummary {
	employee?: {
		userId: number;
		name: string;
		email: string;
		avatar?: string | null;
		totalPoints?: number;
	};
	overview?: {
		totalTrackedHours?: number;
		totalIdleHours?: number;
		taskCompletionRate?: string;
		averageBounceRate?: string;
		attendanceDays?: number;
		productivityScore?: string;
		pointsEarned?: number;
		pointsDeducted?: number;
		netPointsChange?: number;
	};
	tasks?: {
		total?: number;
		completed?: number;
		inProgress?: number;
		totalBounces?: number;
		recentTasks?: Array<{
			taskId: number;
			title: string;
			status: string;
			projectTitle?: string | null;
			reopenCount?: number;
		}>;
	};
	projects?: {
		total?: number;
		active?: number;
		completed?: number;
	};
}

export interface LeaderboardUser {
	userId: number;
	name: string;
	avatar?: string | null;
	totalPoints: number;
	rank: number;
}
