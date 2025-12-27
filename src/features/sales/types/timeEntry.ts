export enum TrackableType {
	LEAD = "lead",
	QUOTATION = "quotation",
	TASK = "task",
}

export interface TimeEntry {
	timeEntryId: number;
	userId: number;
	trackableId: number;
	trackableType: TrackableType;
	trackableDisplayName: string;
	startTime: string;
	endTime?: string;
	durationMinutes?: number;
	createdAt: string;
	updatedAt: string;
}

export interface StartTimerPayload {
	trackableId: number;
	trackableType: TrackableType;
}

export interface ActiveTimerResponse {
	timeEntry: TimeEntry | null;
	isActive: boolean;
}

export interface TimeEntryListResponse {
	timeEntries: TimeEntry[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}

export interface TimeEntryFilters {
	trackableType?: TrackableType;
	trackableId?: number;
	userId?: number;
	startDate?: string;
	endDate?: string;
	page?: number;
	perPage?: number;
}
