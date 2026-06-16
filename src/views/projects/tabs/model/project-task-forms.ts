import { z } from "zod";
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
	assigneeId: z.string().optional(),
	estimatedHours: optionalNumberInput().optional().pipe(z.number().min(0).optional()),
	startDate: z.string().optional(),
	dueDate: z.string().optional(),
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
	assigneeId: "",
	estimatedHours: undefined,
	startDate: "",
	dueDate: "",
};

export function mapAddMilestoneFormToPayload(data: AddMilestoneFormData): CreateMilestonePayload {
	return { title: data.title };
}

export function mapAddTaskFormToPayload(data: AddTaskFormData): CreateTaskPayload {
	return {
		title: data.title,
		description: data.description?.trim() || undefined,
		priority: data.priority as TaskPriority,
		milestoneId: data.milestoneId ? Number(data.milestoneId) : null,
		assigneeId: data.assigneeId ? Number(data.assigneeId) : null,
		estimatedHours: data.estimatedHours ?? null,
		startDate: data.startDate || null,
		dueDate: data.dueDate || null,
	};
}

export function buildEditTaskFormDefaults(task: ProjectTask): EditTaskFormData {
	return {
		title: task.title,
		description: task.description ?? "",
		priority: task.priority ?? "medium",
		milestoneId: task.milestoneId ? String(task.milestoneId) : "",
		assigneeId: task.assigneeId ? String(task.assigneeId) : "",
		estimatedHours: task.estimatedHours ?? undefined,
		startDate: task.startDate ?? "",
		dueDate: task.dueDate ?? "",
	};
}

export function mapEditTaskFormToPayload(data: EditTaskFormData): UpdateTaskPayload {
	return {
		title: data.title,
		description: data.description?.trim() || null,
		priority: data.priority as TaskPriority,
		milestoneId: data.milestoneId ? Number(data.milestoneId) : null,
		assigneeId: data.assigneeId ? Number(data.assigneeId) : null,
		estimatedHours: data.estimatedHours ?? null,
		startDate: data.startDate || null,
		dueDate: data.dueDate || null,
	};
}
