import { z } from "zod";
import { format } from "date-fns";
import { optionalNumberInput } from "@/shared/lib/zod-number";
import type { CreateMilestonePayload, CreateTaskPayload, ProjectTask, UpdateTaskPayload } from "@/features/projects/api/execution.api";
import type { TaskPriority } from "@/shared/lib/statusHelpers";

const taskPriorities = ["low", "medium", "high", "urgent"] as const;

export const addMilestoneSchema = z.object({
	title: z.string().trim().min(1, "Title is required").max(255),
});
export type AddMilestoneFormData = z.infer<typeof addMilestoneSchema>;

export const addTaskSchema = z.object({
	title: z.string().trim().min(1, "Title is required").max(255),
	description: z.string().optional(),
	priority: z.enum(taskPriorities),
	milestoneId: z.string().optional(),
	assigneeIds: z.array(z.string()).max(20),
	estimatedHours: optionalNumberInput().optional().pipe(z.number().min(0).optional()),
	startDate: z.string().optional(),
	dueDate: z.string().optional(),
	coverImage: z.custom<File>().optional(),
});
export type AddTaskFormData = z.infer<typeof addTaskSchema>;
export type EditTaskFormData = AddTaskFormData;

export const addMilestoneFormDefaults: AddMilestoneFormData = {
	title: "",
};

export const addTaskFormDefaults: AddTaskFormData = {
	title: "",
	description: "",
	priority: "medium",
	milestoneId: "",
	assigneeIds: [],
	estimatedHours: undefined,
	startDate: "",
	dueDate: "",
	coverImage: undefined,
};

export function buildAddTaskFormDefaults(currentUserId?: number | null): AddTaskFormData {
	return {
		...addTaskFormDefaults,
		assigneeIds: currentUserId ? [String(currentUserId)] : [],
		startDate: format(new Date(), "yyyy-MM-dd"),
	};
}

export function mapAddMilestoneFormToPayload(data: AddMilestoneFormData): CreateMilestonePayload {
	return { title: data.title };
}

export function mapAddTaskFormToPayload(data: AddTaskFormData): CreateTaskPayload {
	return {
		title: data.title,
		description: data.description?.trim() || undefined,
		priority: data.priority as TaskPriority,
		milestoneId: data.milestoneId ? Number(data.milestoneId) : null,
		assigneeIds: data.assigneeIds.map(Number),
		estimatedHours: data.estimatedHours ?? null,
		startDate: data.startDate || null,
		dueDate: data.dueDate || null,
		...(data.coverImage ? { coverImage: data.coverImage } : {}),
	};
}

export function buildEditTaskFormDefaults(task: ProjectTask): EditTaskFormData {
	return {
		title: task.title,
		description: task.description ?? "",
		priority: task.priority ?? "medium",
		milestoneId: task.milestoneId ? String(task.milestoneId) : "",
		assigneeIds: (task.assigneeIds?.length ? task.assigneeIds : task.assigneeId ? [task.assigneeId] : []).map(String),
		estimatedHours: task.estimatedHours ?? undefined,
		startDate: task.startDate ?? "",
		dueDate: task.dueDate ?? "",
		coverImage: undefined,
	};
}

function mapEditTaskMetadataToPayload(data: EditTaskFormData): UpdateTaskPayload {
	return {
		title: data.title,
		description: data.description?.trim() || null,
		priority: data.priority as TaskPriority,
		milestoneId: data.milestoneId ? Number(data.milestoneId) : null,
		estimatedHours: data.estimatedHours ?? null,
		startDate: data.startDate || null,
		dueDate: data.dueDate || null,
	};
}

export function mapEditTaskFormToPayload(data: EditTaskFormData): UpdateTaskPayload {
	return {
		...mapEditTaskMetadataToPayload(data),
		assigneeIds: data.assigneeIds.map(Number),
	};
}

export function mapEditTaskFormToPayloadWithoutAssignments(data: EditTaskFormData): UpdateTaskPayload {
	return mapEditTaskMetadataToPayload(data);
}
