// Re-export enums from centralized statusHelpers
export { ProjectStatus, ProjectStatusLabels, ProjectStatusColors, PROJECT_STATUS_TRANSITIONS as STATUS_TRANSITIONS } from "@/lib/statusHelpers";

export interface ProjectClient {
	clientId: number;
	name: string;
	email: string;
	company?: string;
	phone?: string;
}

export interface ProjectTask {
	taskId: number;
	title: string;
	status: string;
	priority: string;
	assignedTo?: number;
	createdAt: string;
}

export interface ProjectContract {
	contractId: number;
	contractNumber: string;
	status: string;
	signedAt?: string;
}

export interface ProjectCreatedByUser {
	userId: number;
	name: string;
	email: string;
	avatar?: string;
}

export interface ProjectType {
	projectTypeId: number;
	label: string;
	value: string;
	color?: string | null;
	icon?: string | null;
	isActive?: boolean;
}

export interface Project {
	tasks: ProjectTask[];
	projectId: number;
	clientId: number;
	projectTypeId?: number | null;
	quotationId: number | null;
	title: string;
	description: string | null;
	status: string;
	previousStatus: string | null;
	budget: number | null;
	currency?: string;
	estimatedHours?: number;
	deadline: string | null;
	uiApprovedAt: string | null;
	progress?: number;
	totalTimeSpent?: number;
	client?: ProjectClient;
	projectType?: ProjectType | null;
	contract?: ProjectContract;
	createdByUser?: ProjectCreatedByUser;
	quotation?: {
		quotationId: number;
		finalPrice: number;
	};
	members?: ProjectMember[];
	files?: ProjectFile[];
	googleDriveFolderId?: string | null;
	googleDriveFolderName?: string | null;
	googleDriveFolderUrl?: string | null;
	createdAt: string;
	updatedAt: string;
	createdBy: number | null;
	updatedBy: number | null;
	canViewBudget?: boolean; // Permission flag from API
	isPinned?: boolean; // Whether the project is pinned by the current user
}

export interface ProjectDriveFolder {
	id: string;
	name: string;
	url?: string | null;
}

export interface ProjectDriveFile {
	id: string;
	name: string;
	mimeType?: string | null;
	size?: number | null;
	webViewLink?: string | null;
	webContentLink?: string | null;
	createdTime?: string | null;
	modifiedTime?: string | null;
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
	projectTypeId?: number;
	title: string;
	description?: string;
	budget: number;
	deadline?: string;
	status?: string;
}

export interface UpdateProjectPayload {
	projectTypeId?: number;
	title?: string;
	description?: string;
	status?: string;
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
	status?: string;
	clientId?: number;
	projectTypeId?: number;
	page?: number;
	perPage?: number;
}
