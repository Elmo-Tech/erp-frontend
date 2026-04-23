/**
 * Client Portal Project Types
 * These types represent the "Black Box" view of projects for clients.
 * Internal data (tasks, developers, wikis, etc.) is hidden.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 13.1, 14.1
 */

import { ClientInvoice } from "./clientInvoice";

/**
 * Client-facing project interface with limited visibility.
 * HIDDEN: description, tasks, developers, wikis, timeEntries, internalNotes
 */
export interface ClientProject {
	projectId: number;
	title: string;
	status: string;
	statusLabel: string;
	progressPercentage: number;
	deadline: string;
	budget: number;
	currency: string;
	uiApprovedAt: string;
	canApproveUI: boolean;
	createdAt: string;
	invoices?: ClientInvoice[];
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
