// Performance Evaluation Types

export type EvaluationStatus = "pending" | "in_progress" | "completed" | "approved";
export type BonusTier = "excellent" | "good" | "average" | "poor";
export type PeriodStatus = "draft" | "active" | "completed";
export type CodeReviewStatus = "pending" | "approved" | "needs_revision" | "rejected";
export type InnovationCategory = "ai_tool" | "automation" | "new_tech" | "process_improvement";
export type ImpactLevel = "low" | "medium" | "high";

// Evaluation Period
export interface EvaluationPeriod {
	periodId: number;
	name: string;
	startDate: string;
	endDate: string;
	status: PeriodStatus;
	createdAt: string;
	updatedAt: string;
}

// Performance Evaluation
export interface PerformanceEvaluation {
	evaluationId: number;
	userId: number;
	userName: string;
	periodId: number;
	periodName: string;
	bugSeverityScore: number;
	codeQualityScore: number;
	innovationScore: number;
	onTimeDeliveryScore: number;
	flexibilityScore: number;
	communicationScore: number;
	attendanceScore: number;
	initiativeScore: number;
	totalScore: number;
	bonusTier: BonusTier;
	bonusTierLabel: string;
	bonusAmount: number;
	status: EvaluationStatus;
	evaluatorNotes?: string;
	approvedAt?: string;
	createdAt: string;
	updatedAt: string;
}

// Score Summary
export interface EvaluationScoreSummary {
	scores: {
		technicalQuality: {
			bugSeverity: number;
			codeQuality: number;
			total: number;
			maxScore: number;
		};
		innovation: {
			score: number;
			maxScore: number;
		};
		productivity: {
			onTimeDelivery: number;
			flexibility: number;
			total: number;
			maxScore: number;
		};
		softSkills: {
			communication: number;
			attendance: number;
			initiative: number;
			total: number;
			maxScore: number;
		};
	};
	totalScore: number;
	bonusTier: BonusTier;
	bonusAmount: number;
}

// Bonus Summary
export interface PeriodBonusSummary {
	periodId: number;
	periodName: string;
	evaluations: {
		userId: number;
		userName: string;
		totalScore: number;
		bonusTier: BonusTier;
		bonusTierLabel: string;
		baseAmount: number;
		percentage: number;
		finalBonusAmount: number;
	}[];
	summary: {
		totalEmployees: number;
		totalBonusAmount: number;
		averageScore: number;
	};
}

// Code Review
export interface CodeReview {
	reviewId: number;
	taskId: number;
	taskTitle: string;
	reviewerId: number;
	reviewerName: string;
	developerId: number;
	developerName: string;
	codeQualityScore: number;
	readabilityScore: number;
	scalabilityScore: number;
	testingScore: number;
	documentationScore: number;
	overallScore: number;
	reviewNotes?: string;
	improvementSuggestions?: string;
	status: CodeReviewStatus;
	createdAt: string;
	updatedAt: string;
}

export interface CodeReviewStats {
	totalReviews: number;
	approved: number;
	needsRevision: number;
	rejected: number;
	averageScores: {
		codeQuality: number;
		readability: number;
		scalability: number;
		testing: number;
		documentation: number;
		overall: number;
	};
	approvalRate: number;
}

// Innovation Log
export interface InnovationLog {
	logId: number;
	userId: number;
	userName: string;
	projectId?: number;
	projectName?: string;
	taskId?: number;
	taskTitle?: string;
	toolName: string;
	category: InnovationCategory;
	categoryLabel: string;
	description: string;
	impactDescription?: string;
	impactLevel: ImpactLevel;
	timeSavedMinutes?: number;
	isVerified: boolean;
	verifiedAt?: string;
	verifierName?: string;
	createdAt: string;
}

export interface InnovationSummary {
	logs: InnovationLog[];
	summary: {
		total: number;
		verified: number;
		pending: number;
		byCategory: {
			aiTool: number;
			automation: number;
			newTech: number;
			processImprovement: number;
		};
		totalTimeSaved: number;
	};
}

// Request Types
export interface CreateEvaluationPeriodRequest {
	name: string;
	startDate: string;
	endDate: string;
}

export interface UpdateEvaluationRequest {
	bugSeverityScore?: number;
	codeQualityScore?: number;
	innovationScore?: number;
	onTimeDeliveryScore?: number;
	flexibilityScore?: number;
	communicationScore?: number;
	attendanceScore?: number;
	initiativeScore?: number;
	evaluatorNotes?: string;
}

export interface CreateCodeReviewRequest {
	taskId: number;
	developerId: number;
	codeQualityScore?: number;
	readabilityScore?: number;
	scalabilityScore?: number;
	testingScore?: number;
	documentationScore?: number;
	reviewNotes?: string;
	improvementSuggestions?: string;
}

export interface CreateInnovationLogRequest {
	projectId?: number;
	taskId?: number;
	toolName: string;
	category: InnovationCategory;
	description: string;
	impactDescription?: string;
	impactLevel?: ImpactLevel;
	timeSavedMinutes?: number;
}
