export enum ProjectStatus {
	DRAFT = "draft",
	ACTIVE = "active",
	UI_UX = "ui_ux",
	DEVELOPMENT = "development",
	TESTING = "testing",
	COMPLETED = "completed",
	ON_HOLD = "on_hold",
	CANCELLED = "cancelled",
}

export interface Project {
	projectId: number;
	clientId: number;
	quotationId: number | null;
	title: string;
	description: string | null;
	status: ProjectStatus;
	previousStatus: ProjectStatus | null;
	budget: number;
	deadline: string | null;
	uiApprovedAt: string | null;
	client?: {
		userId: number;
		name: string;
		email: string;
	};
	quotation?: {
		quotationId: number;
		finalPrice: number;
	};
	createdAt: string;
	updatedAt: string;
	createdBy: number | null;
	updatedBy: number | null;
}

export interface CreateProjectPayload {
	quotationId: number;
	title?: string;
	description?: string;
	deadline?: string;
}

export interface UpdateProjectPayload {
	title?: string;
	description?: string;
	status?: ProjectStatus;
	budget?: number;
	deadline?: string;
	reason?: string; // Required when changing budget or deadline
}

export interface ConvertQuotationPayload {
	quotationId: number;
	title?: string;
	description?: string;
	deadline?: string;
}

export interface ProjectListResponse {
	projects: Project[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}

export interface ProjectFilters {
	search?: string;
	status?: ProjectStatus;
	clientId?: number;
	page?: number;
	perPage?: number;
}

// Status transition map for frontend validation
export const STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
	[ProjectStatus.DRAFT]: [ProjectStatus.ACTIVE],
	[ProjectStatus.ACTIVE]: [ProjectStatus.UI_UX, ProjectStatus.ON_HOLD, ProjectStatus.CANCELLED],
	[ProjectStatus.UI_UX]: [ProjectStatus.DEVELOPMENT, ProjectStatus.ON_HOLD, ProjectStatus.CANCELLED],
	[ProjectStatus.DEVELOPMENT]: [ProjectStatus.TESTING, ProjectStatus.ON_HOLD, ProjectStatus.CANCELLED],
	[ProjectStatus.TESTING]: [ProjectStatus.COMPLETED, ProjectStatus.DEVELOPMENT, ProjectStatus.ON_HOLD, ProjectStatus.CANCELLED],
	[ProjectStatus.COMPLETED]: [],
	[ProjectStatus.ON_HOLD]: [], // Dynamic - returns to previous status
	[ProjectStatus.CANCELLED]: [],
};
