export interface ProjectHistoryChangedByUser {
	userId: number;
	name: string;
	email: string;
}

export interface RawProjectHistoryEntry {
	historyId: number;
	projectId: number;
	fieldName: string;
	oldValue: string;
	newValue: string;
	reason: string;
	changedBy: number;
	changedByUser?: ProjectHistoryChangedByUser | null;
	createdAt: string;
	updatedAt: string;
}

export interface ProjectHistoryEntry {
	historyId: number;
	projectId: number;
	fieldName: string;
	oldValue: string;
	newValue: string;
	reason: string;
	changedBy: number;
	changedByUser?: ProjectHistoryChangedByUser | null;
	createdAt: string;
	updatedAt: string;
}

export interface ProjectHistoryListData {
	histories: RawProjectHistoryEntry[];
}

export function mapProjectHistoryEntry(resource: RawProjectHistoryEntry): ProjectHistoryEntry {
	return {
		historyId: resource.historyId,
		projectId: resource.projectId,
		fieldName: resource.fieldName,
		oldValue: resource.oldValue,
		newValue: resource.newValue,
		reason: resource.reason,
		changedBy: resource.changedBy,
		...("changedByUser" in resource ? { changedByUser: resource.changedByUser ?? null } : {}),
		createdAt: resource.createdAt,
		updatedAt: resource.updatedAt,
	};
}

export function mapProjectHistoryListData(historyListData: ProjectHistoryListData): ProjectHistoryEntry[] {
	return historyListData.histories.map(mapProjectHistoryEntry);
}
