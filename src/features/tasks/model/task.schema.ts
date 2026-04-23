import { z } from "zod";
import { TaskPriority, TaskStatus, TaskType } from "@/entities/task/model/types";
import type { CreateTaskPayload } from "@/entities/task/model/types";

export const createTaskSchema = z.object({
	title: z.string().trim().min(1, "Title is required").max(255),
	description: z.string().trim().optional().or(z.literal("")),
	projectId: z.string().optional(),
	status: z.nativeEnum(TaskStatus),
	type: z.nativeEnum(TaskType),
	priority: z.nativeEnum(TaskPriority),
	assignedTo: z.string().optional(),
	taskCategory: z.string().optional(),
	estimatedHours: z.number().min(0, "Estimated hours must be at least 0"),
	dueDate: z.string().optional().nullable(),
	expectedResolutionDate: z.string().optional().nullable(),
	startDate: z.string().optional().nullable(),
	sprintNumber: z.number().optional().nullable(),
	tagIds: z.array(z.number()).optional(),
	internalReviewerNotes: z.string().trim().optional().or(z.literal("")),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

function cleanOptional(value: string | null | undefined) {
	const trimmedValue = value?.trim();
	return trimmedValue || undefined;
}

function normalizeSelectNumber(value: string | undefined, emptyValue: string) {
	if (!value || value === emptyValue) {
		return undefined;
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

export function toCreateTaskPayload(data: CreateTaskFormData, fixedProjectId?: number, parentId?: number | null): CreateTaskPayload {
	const selectedProjectId = fixedProjectId ?? normalizeSelectNumber(data.projectId, "personal");
	const assignedTo = normalizeSelectNumber(data.assignedTo, "none");
	const taskCategory = data.taskCategory && data.taskCategory !== "none" ? data.taskCategory : undefined;

	return {
		projectId: selectedProjectId,
		parentId: parentId ?? null,
		title: data.title.trim(),
		description: cleanOptional(data.description),
		status: data.status,
		type: data.type,
		priority: data.priority,
		assignedTo: assignedTo ?? null,
		taskCategory,
		estimatedHours: data.estimatedHours,
		dueDate: cleanOptional(data.dueDate) ?? null,
		expectedResolutionDate: cleanOptional(data.expectedResolutionDate) ?? null,
		startDate: cleanOptional(data.startDate) ?? null,
		sprintNumber: data.sprintNumber ?? null,
		tagIds: data.tagIds,
		internalReviewerNotes: cleanOptional(data.internalReviewerNotes),
	};
}

export function getCreateTaskDefaultValues(options?: { projectId?: number; currentUserId?: number; defaultType?: TaskType }): CreateTaskFormData {
	const today = new Date().toISOString().split("T")[0];

	return {
		title: "",
		description: "",
		projectId: options?.projectId ? String(options.projectId) : "personal",
		status: TaskStatus.TODO,
		type: options?.defaultType ?? TaskType.MAIN,
		priority: TaskPriority.MEDIUM,
		assignedTo: options?.currentUserId ? String(options.currentUserId) : "none",
		taskCategory: "none",
		estimatedHours: 0,
		dueDate: null,
		expectedResolutionDate: null,
		startDate: today,
		sprintNumber: null,
		tagIds: [],
		internalReviewerNotes: "",
	};
}
