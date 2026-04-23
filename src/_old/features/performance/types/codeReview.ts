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

export type CodeReviewStatus = "pending" | "approved" | "needs_revision" | "rejected";

export interface CreateCodeReviewData {
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

export interface UpdateCodeReviewData {
	codeQualityScore?: number;
	readabilityScore?: number;
	scalabilityScore?: number;
	testingScore?: number;
	documentationScore?: number;
	reviewNotes?: string;
	improvementSuggestions?: string;
}

export interface CodeReviewFilters {
	asReviewer?: boolean;
	asDeveloper?: boolean;
	status?: CodeReviewStatus;
	taskId?: number;
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
