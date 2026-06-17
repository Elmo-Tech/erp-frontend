export interface ProjectTimeEntryUser {
	userId: number;
	name: string;
	avatar?: string | null;
}

export interface ProjectTimeEntry {
	entryId: number;
	taskId: number;
	projectId?: number | null;
	userId: number;
	startTime: string | null;
	endTime: string | null;
	durationMinutes: number | null;
	isManual: boolean;
	isRunning: boolean;
	note: string | null;
	user?: ProjectTimeEntryUser | null;
	task?: {
		taskId: number;
		projectId: number;
		title: string;
		status: string | null;
	} | null;
	project?: {
		projectId: number;
		title: string;
	} | null;
	createdAt: string;
	updatedAt: string;
}

export type RawProjectTimeEntryResource = ProjectTimeEntry;

export interface LogManualTimePayload {
	startTime: string;
	endTime: string;
	note?: string;
}

export function mapProjectTimeEntryResource(resource: RawProjectTimeEntryResource): ProjectTimeEntry {
	return {
		entryId: resource.entryId,
		taskId: resource.taskId,
		projectId: resource.projectId,
		userId: resource.userId,
		startTime: resource.startTime,
		endTime: resource.endTime,
		durationMinutes: resource.durationMinutes,
		isManual: resource.isManual,
		isRunning: resource.isRunning,
		note: resource.note,
		user: resource.user,
		task: resource.task,
		project: resource.project,
		createdAt: resource.createdAt,
		updatedAt: resource.updatedAt,
	};
}

export function mapNullableProjectTimeEntryResource(resource: RawProjectTimeEntryResource | null): ProjectTimeEntry | null {
	return resource ? mapProjectTimeEntryResource(resource) : null;
}

export function mapProjectTimeEntryList(timeEntries: RawProjectTimeEntryResource[] | undefined): ProjectTimeEntry[] | undefined {
	return timeEntries?.map(mapProjectTimeEntryResource);
}
