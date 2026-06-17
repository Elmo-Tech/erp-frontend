export const CHANGE_REQUEST_STATUSES = ["draft", "sent_to_client", "approved", "rejected"] as const;
export type ChangeRequestStatusValue = (typeof CHANGE_REQUEST_STATUSES)[number];

export interface ChangeRequest {
	changeRequestId: number;
	projectId: number;
	title: string;
	description: string | null;
	price: number;
	status: ChangeRequestStatusValue | null;
	statusLabel: string | null;
	createdAt: string;
	updatedAt: string;
}

export type RawChangeRequestResource = ChangeRequest & {
	internalCost?: unknown;
	approvedBy?: unknown;
};

export interface ChangeRequestListData {
	changeRequests: RawChangeRequestResource[];
}

export interface CreateChangeRequestPayload {
	title: string;
	description: string;
	price: number;
}

export function mapChangeRequestResource(resource: RawChangeRequestResource): ChangeRequest {
	return {
		changeRequestId: resource.changeRequestId,
		projectId: resource.projectId,
		title: resource.title,
		description: resource.description,
		price: resource.price,
		status: resource.status,
		statusLabel: resource.statusLabel,
		createdAt: resource.createdAt,
		updatedAt: resource.updatedAt,
	};
}

export function mapChangeRequestListData(changeRequestListData: ChangeRequestListData): ChangeRequest[] {
	return changeRequestListData.changeRequests.map(mapChangeRequestResource);
}
