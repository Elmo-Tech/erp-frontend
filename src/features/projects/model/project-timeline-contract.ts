export interface ProjectTimelineFilters {
	startDate: string;
	endDate: string;
	projectIds?: number[];
	userIds?: number[];
	status?: string;
	overloadOnly?: boolean;
}

export interface RawProjectTimelineUser {
	userId: number;
	name: string;
	avatar?: string | null;
	dailyCapacityHoursByDate: Record<string, number>;
}

export interface RawProjectTimelineItem {
	taskId: number;
	projectId: number;
	projectTitle: string | null;
	title: string;
	assigneeId: number | null;
	startDate: string | null;
	dueDate: string | null;
	estimatedHours: number | null;
	status: string | null;
	allocatedHoursByDate: Record<string, number>;
}

export interface RawProjectTimelineConflict {
	userId: number;
	date: string;
	capacityHours: number;
	allocatedHours: number;
	overloadHours: number;
	taskIds: number[];
}

export interface RawProjectTimelineSuggestion {
	type: "reschedule" | "reassign";
	risk: "low" | "medium" | "high";
	taskId: number;
	reason: string;
	current: {
		startDate: string | null;
		dueDate: string | null;
		assigneeId: number | null;
	};
	suggested: {
		startDate: string | null;
		dueDate: string | null;
		assigneeId: number | null;
		assigneeName?: string | null;
	};
}

export interface RawProjectTimelineResponse {
	range: {
		startDate: string;
		endDate: string;
	};
	users: RawProjectTimelineUser[];
	items: RawProjectTimelineItem[];
	conflicts: RawProjectTimelineConflict[];
	suggestions: RawProjectTimelineSuggestion[];
}

export type ProjectTimelineUser = RawProjectTimelineUser;
export type ProjectTimelineItem = RawProjectTimelineItem;
export type ProjectTimelineConflict = RawProjectTimelineConflict;
export type ProjectTimelineSuggestion = RawProjectTimelineSuggestion;
export type ProjectTimelineResponse = RawProjectTimelineResponse;

export function buildProjectTimelineQuery(filters: ProjectTimelineFilters): string {
	const params = new URLSearchParams();
	params.append("startDate", filters.startDate);
	params.append("endDate", filters.endDate);
	for (const projectId of filters.projectIds ?? []) params.append("projectIds[]", String(projectId));
	for (const userId of filters.userIds ?? []) params.append("userIds[]", String(userId));
	return params.toString();
}

export function mapProjectTimelineResponse(resource: RawProjectTimelineResponse): ProjectTimelineResponse {
	return {
		range: {
			startDate: resource.range.startDate,
			endDate: resource.range.endDate,
		},
		users: resource.users.map(mapProjectTimelineUser),
		items: resource.items.map(mapProjectTimelineItem),
		conflicts: resource.conflicts.map(mapProjectTimelineConflict),
		suggestions: resource.suggestions.map(mapProjectTimelineSuggestion),
	};
}

function mapProjectTimelineUser(user: RawProjectTimelineUser): ProjectTimelineUser {
	return {
		userId: user.userId,
		name: user.name,
		avatar: user.avatar,
		dailyCapacityHoursByDate: user.dailyCapacityHoursByDate,
	};
}

function mapProjectTimelineItem(item: RawProjectTimelineItem): ProjectTimelineItem {
	return {
		taskId: item.taskId,
		projectId: item.projectId,
		projectTitle: item.projectTitle,
		title: item.title,
		assigneeId: item.assigneeId,
		startDate: item.startDate,
		dueDate: item.dueDate,
		estimatedHours: item.estimatedHours,
		status: item.status,
		allocatedHoursByDate: item.allocatedHoursByDate,
	};
}

function mapProjectTimelineConflict(conflict: RawProjectTimelineConflict): ProjectTimelineConflict {
	return {
		userId: conflict.userId,
		date: conflict.date,
		capacityHours: conflict.capacityHours,
		allocatedHours: conflict.allocatedHours,
		overloadHours: conflict.overloadHours,
		taskIds: conflict.taskIds,
	};
}

function mapProjectTimelineSuggestion(suggestion: RawProjectTimelineSuggestion): ProjectTimelineSuggestion {
	return {
		type: suggestion.type,
		risk: suggestion.risk,
		taskId: suggestion.taskId,
		reason: suggestion.reason,
		current: {
			startDate: suggestion.current.startDate,
			dueDate: suggestion.current.dueDate,
			assigneeId: suggestion.current.assigneeId,
		},
		suggested: {
			startDate: suggestion.suggested.startDate,
			dueDate: suggestion.suggested.dueDate,
			assigneeId: suggestion.suggested.assigneeId,
			...("assigneeName" in suggestion.suggested ? { assigneeName: suggestion.suggested.assigneeName ?? null } : {}),
		},
	};
}
