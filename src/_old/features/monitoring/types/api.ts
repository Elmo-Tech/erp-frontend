/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
}

/**
 * API error response
 */
export interface ApiError {
	success: false;
	message: string;
	errors?: Record<string, string[]>;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
	items: T[];
	pagination: PaginationMeta;
}
