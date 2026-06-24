/**
 * Client-facing project interface with limited visibility.
 * HIDDEN: invoices, payments, budget, tasks, developers, wikis, timeEntries, internalNotes, UI approval state
 */
export interface ClientProject {
	projectId: number;
	title: string;
	status: string;
	statusLabel: string;
	progressPercentage: number;
	deadline: string;
	files?: ClientProjectFile[];
	createdAt: string;
}

export interface ClientProjectFile {
	fileId: number;
	projectId: number;
	name: string;
	type: "file" | "link" | string;
	fileUrl: string | null;
	mimeType?: string;
	size?: number;
	category?: string;
	isDownloadable?: boolean;
	createdAt?: string;
}

/**
 * Pagination metadata for client project lists
 */
export interface ClientProjectPagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

/**
 * Response structure for client project list endpoint
 * GET /api/v1/client/projects
 */
export interface ClientProjectListResponse {
	projects: ClientProject[];
	pagination: ClientProjectPagination;
}

/**
 * Filters for client project list queries
 */
export interface ClientProjectFilters {
	status?: string;
	search?: string;
	page?: number;
	perPage?: number;
}
