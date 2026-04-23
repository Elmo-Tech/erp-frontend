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
	user?: {
		userId: number;
		name: string;
		email: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface StartTimerPayload {
	trackableId: number;
	trackableType: TrackableType;
}

export interface UpdateTimeEntryPayload {
	startTime?: string;
	endTime?: string;
	durationMinutes?: number;
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
