/**
 * Recurring Task Types
 * Represents configurations for automatically generating recurring tasks
 */

import { z } from "zod";
import { recurringTaskSchema } from "../schemas/recurringTaskSchema";

export type RecurringFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";

export type RecurringTaskFormData = z.input<typeof recurringTaskSchema>;

export interface RecurringTaskConfig {
	id: number;
	templateTaskId: number;
	frequency: RecurringFrequency;
	interval: number;
	daysOfWeek: number[] | null;
	dayOfMonth: number | null;
	startDate: string;
	endDate: string | null;
	maxOccurrences: number | null;
	occurrenceCount: number;
	nextOccurrenceDate: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;

	// Relationships
	templateTask?: {
		id: number;
		title: string;
		description: string | null;
		status: string;
	};
	generatedTasks?: Array<{
		id: number;
		title: string;
		status: string;
		createdAt: string;
	}>;
}

export interface CreateRecurringTaskData {
	templateTaskId: number;
	frequency: RecurringFrequency;
	interval?: number;
	daysOfWeek?: number[];
	dayOfMonth?: number;
	startDate: string;
	endDate?: string;
	maxOccurrences?: number;
	isActive?: boolean;
}

export interface UpdateRecurringTaskData {
	frequency?: RecurringFrequency;
	interval?: number;
	daysOfWeek?: number[];
	dayOfMonth?: number;
	startDate?: string;
	endDate?: string;
	maxOccurrences?: number;
	isActive?: boolean;
}

export interface RecurringTaskFilters {
	frequency?: RecurringFrequency;
	isActive?: boolean;
	page?: number;
	perPage?: number;
}

export const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
	daily: "Daily",
	weekly: "Weekly",
	biweekly: "Bi-weekly",
	monthly: "Monthly",
	quarterly: "Quarterly",
	yearly: "Yearly",
};

export const FREQUENCY_DESCRIPTIONS: Record<RecurringFrequency, string> = {
	daily: "Repeats every X days",
	weekly: "Repeats every X weeks on selected days",
	biweekly: "Repeats every 2 weeks",
	monthly: "Repeats every X months on a specific day",
	quarterly: "Repeats every 3 months",
	yearly: "Repeats every X years",
};

export const DAYS_OF_WEEK = [
	{ value: 0, label: "Sunday" },
	{ value: 1, label: "Monday" },
	{ value: 2, label: "Tuesday" },
	{ value: 3, label: "Wednesday" },
	{ value: 4, label: "Thursday" },
	{ value: 5, label: "Friday" },
	{ value: 6, label: "Saturday" },
];
