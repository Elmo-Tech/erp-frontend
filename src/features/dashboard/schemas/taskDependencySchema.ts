import { z } from "zod";

export const taskDependencySchema = z.object({
	dependsOnTaskId: z.number().positive("Task ID must be positive"),
	dependencyType: z.enum(["finish_to_start", "start_to_start", "finish_to_finish", "start_to_finish"]),
	lagDays: z.number().min(0, "Lag days cannot be negative").default(0),
});

export type TaskDependencyFormData = z.input<typeof taskDependencySchema>;
