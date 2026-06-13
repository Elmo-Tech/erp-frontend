import { PROJECT_STATUS_TRANSITIONS, ProjectStatus, ProjectStatusColors, ProjectStatusLabels } from "@/shared/lib/statusHelpers";

export { PROJECT_STATUS_TRANSITIONS, ProjectStatus, ProjectStatusColors, ProjectStatusLabels };

export interface ProjectClient {
	clientId: number;
	name: string;
	email: string;
	company?: string | null;
	phone?: string | null;
}

export interface ProjectTask {
	taskId: number;
	title: string;
	status: string;
	priority: string;
	assignedTo?: number | null;
	createdAt: string;
}

export interface ProjectContract {
	contractId: number;
	contractNumber: string;
	status: string;
	signedAt?: string | null;
}

export interface ProjectCreatedByUser {
	userId: number;
	name: string;
	email: string;
	avatar?: string | null;
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
		avatar?: string | null;
	};
	createdAt: string;
}

export interface ProjectMemberListResponse {
	members: ProjectMember[];
}

export interface ProjectFile {
	fileId: number;
	projectId: number;
	name: string;
	type: "file" | "link";
	fileUrl?: string | null;
	mimeType?: string | null;
	size?: number | null;
	description?: string | null;
	category: string;
	createdAt: string;
}

export interface Project {
	projectId: number;
	clientId: number;
	quotationId: number | null;
	title: string;
	description: string | null;
	status: ProjectStatus;
	previousStatus: ProjectStatus | null;
	budget: number | null;
	currency?: string | null;
	estimatedHours?: number | null;
	deadline: string | null;
	uiApprovedAt: string | null;
	progress?: number | null;
	totalTimeSpent?: number | null;
	tasks?: ProjectTask[];
	client?: ProjectClient | null;
	contract?: ProjectContract | null;
	createdByUser?: ProjectCreatedByUser | null;
	quotation?: {
		quotationId: number;
		finalPrice: number;
	} | null;
	members?: ProjectMember[];
	files?: ProjectFile[];
	createdAt: string;
	updatedAt: string;
	createdBy: number | null;
	updatedBy: number | null;
	canViewBudget?: boolean;
	isPinned?: boolean;
}

export interface ProjectPagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

export interface ProjectListResponse {
	projects: Project[];
	pagination: ProjectPagination;
}

export interface ClientProjectListResponse {
	projects: Project[];
}

export interface ProjectFilters {
	search?: string;
	status?: ProjectStatus;
	clientId?: number;
	deadlineFrom?: string;
	deadlineTo?: string;
	page?: number;
	perPage?: number;
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
	reason?: string;
}

export interface ConvertQuotationPayload {
	quotationId: number;
	title?: string;
	description?: string;
	deadline?: string;
}
