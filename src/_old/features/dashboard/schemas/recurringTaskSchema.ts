import { z } from "zod";

export const recurringTaskSchema = z
	.object({
		templateTaskId: z.number().positive("Invalid template task"),
		frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"]),
		interval: z.number().positive("Interval must be positive").default(1),
		daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
		dayOfMonth: z.number().min(1, "Day must be between 1 and 31").max(31, "Day must be between 1 and 31").optional(),
		startDate: z.string().min(1, "Start date is required"),
		endDate: z.string().optional(),
		maxOccurrences: z.number().positive("Max occurrences must be positive").optional(),
		isActive: z.boolean().default(true),
	})
	.refine(
		(data) => {
			// If frequency is weekly, daysOfWeek is required
			if (data.frequency === "weekly" && (!data.daysOfWeek || data.daysOfWeek.length === 0)) {
				return false;
			}
			return true;
		},
		{
			message: "Please select at least one day of the week for weekly frequency",
			path: ["daysOfWeek"],
		},
	)
	.refine(
		(data) => {
			// If frequency is monthly/quarterly/yearly, dayOfMonth is required
			if (["monthly", "quarterly", "yearly"].includes(data.frequency) && !data.dayOfMonth) {
				return false;
			}
			return true;
		},
		{
			message: "Day of month is required for this frequency",
			path: ["dayOfMonth"],
		},
	);

export type RecurringTaskFormData = z.input<typeof recurringTaskSchema>;
