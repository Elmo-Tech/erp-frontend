import { z } from "zod";
import type { CreatePersonalTaskPayload, PersonalTaskPriority } from "@/features/personal-tasks/api/personal-tasks.api";

const taskPriorities = ["low", "medium", "high", "urgent"] as const;

export const personalTaskSchema = z.object({
	title: z.string().trim().min(1, "Title is required").max(255),
	description: z.string().optional(),
	dueDate: z.string().optional(),
	priority: z.enum(taskPriorities),
});

export type PersonalTaskFormData = z.infer<typeof personalTaskSchema>;

export const personalTaskFormDefaults: PersonalTaskFormData = {
	title: "",
	description: "",
	dueDate: "",
	priority: "medium",
};

export function mapPersonalTaskFormToPayload(data: PersonalTaskFormData): CreatePersonalTaskPayload {
	return {
		title: data.title,
		description: data.description?.trim() || undefined,
		dueDate: data.dueDate || null,
		priority: data.priority as PersonalTaskPriority,
	};
}
