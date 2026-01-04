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
	progress?: number;
	totalTimeSpent?: number;
	client?: {
		userId: number;
		name: string;
		email: string;
	};
	quotation?: {
		quotationId: number;
		finalPrice: number;
	};
	members?: ProjectMember[];
	files?: ProjectFile[];
	createdAt: string;
	updatedAt: string;
	createdBy: number | null;
	updatedBy: number | null;
}

export interface ProjectMember {
	memberId: number;
	projectId: number;
	userId: number;
	role: string;
	user?: {
		userId: number;
		name: string;
		email: string;
		avatar?: string;
	};
	createdAt: string;
}

export interface ProjectFile {
	fileId: number;
	projectId: number;
	name: string;
	type: "file" | "link";
	fileUrl?: string;
	mimeType?: string;
	size?: number;
	description?: string;
	category: string;
	isClientVisible: boolean;
	isDownloadable: boolean;
	visibleToRoles?: string[];
	createdAt: string;
}

export interface CreateProjectPayload {
	quotationId: number;
	title?: string;
	description?: string;
	deadline?: string;
}

export interface CreateDirectProjectPayload {
	clientId: number;
	title: string;
	description?: string;
	budget: number;
	deadline?: string;
	status?: ProjectStatus;
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
