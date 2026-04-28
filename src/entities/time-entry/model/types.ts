export enum TrackableType {
	LEAD = "lead",
	QUOTATION = "quotation",
	TASK = "task",
}

export type TrackableTypeValue = TrackableType | "App\\Models\\Lead" | "App\\Models\\Quotation" | "App\\Models\\Task" | string;

export interface TimeEntryUser {
	userId: number;
	name: string;
	email?: string;
}

export interface TimeEntry {
	timeEntryId: number;
	userId: number;
	trackableId: number;
	trackableType: TrackableTypeValue;
	trackableDisplayName: string;
	startTime: string;
	endTime: string | null;
	durationMinutes: number | null;
	isActive?: boolean;
	user?: TimeEntryUser | null;
	createdAt: string;
	updatedAt: string;
}

export interface StartTimerPayload {
	trackableId: number;
	trackableType: TrackableType;
}

export interface UpdateTimeEntryPayload {
	startTime?: string;
	endTime?: string | null;
	durationMinutes?: number | null;
}

export interface TimeEntryPagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

export interface TimeEntryListResponse {
	timeEntries: TimeEntry[];
	pagination: TimeEntryPagination;
}

export interface TimeEntryFilters {
	trackableType?: TrackableTypeValue;
	trackableId?: number;
	userId?: number;
	startDate?: string;
	endDate?: string;
	page?: number;
	perPage?: number;
}

export interface ActiveTimer {
	timeEntryId: number;
	userId: number;
	userName: string;
	trackableId: number;
	trackableType: string;
	trackableDisplayName: string;
	startTime: string;
	elapsedMinutes: number;
	createdAt: string;
}

