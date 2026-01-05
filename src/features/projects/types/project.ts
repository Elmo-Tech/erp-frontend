// Re-export enums from centralized statusHelpers
export { ProjectStatus, ProjectStatusLabels, ProjectStatusColors, PROJECT_STATUS_TRANSITIONS as STATUS_TRANSITIONS } from "@/lib/statusHelpers";
import { ProjectStatus } from "@/lib/statusHelpers";

export interface ProjectClient {
	clientId: number;
	name: string;
	email: string;
	company?: string;
	phone?: string;
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
	client?: ProjectClient;
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
