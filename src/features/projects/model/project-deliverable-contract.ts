export interface TaskDeliverable {
	deliverableId: number;
	taskId: number;
	title: string;
	isCompleted: boolean;
	createdAt: string;
	updatedAt: string;
}

export type RawTaskDeliverableResource = TaskDeliverable;

export function mapTaskDeliverableResource(resource: RawTaskDeliverableResource): TaskDeliverable {
	return {
		deliverableId: resource.deliverableId,
		taskId: resource.taskId,
		title: resource.title,
		isCompleted: resource.isCompleted,
		createdAt: resource.createdAt,
		updatedAt: resource.updatedAt,
	};
}

export function mapTaskDeliverableList(deliverables: RawTaskDeliverableResource[] | undefined): TaskDeliverable[] | undefined {
	return deliverables?.map(mapTaskDeliverableResource);
}
