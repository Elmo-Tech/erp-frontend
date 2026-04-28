export interface QualityMetrics {
	overallBounceRate: number;
	qualityScore: number;
	totalBounces: number;
	tasksWithBounces: number;
	topBouncingTasks?: Array<{
		taskId: number;
		title: string;
		projectTitle: string;
		reopenCount: number;
		assignedTo: string;
		status: string;
	}>;
	bounceRateByDeveloper?: Array<{
		userId: number;
		name: string;
		totalBounces: number;
		totalTasks: number;
		averageBounceRate: number;
	}>;
}

export interface CodeReview {
	reviewId: number;
	taskId: number;
	taskTitle: string;
	reviewerName: string;
	developerName: string;
	overallScore: number;
	status: "pending" | "approved" | "needs_revision" | "rejected";
	createdAt: string;
}

export interface CodeReviewListResponse {
	codeReviews: CodeReview[];
	pagination?: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}
