export interface ProjectHistory {
	historyId: number;
	projectId: number;
	fieldName: string;
	oldValue: string | null;
	newValue: string | null;
	reason: string | null;
	changedBy: number | null;
	changedByUser?: {
		userId: number;
		name: string;
	};
	createdAt: string;
}

export interface ProjectHistoryListResponse {
	histories: ProjectHistory[];
}

export interface ProjectHistoryFilters {
	projectId: number;
	fieldName?: string;
}
