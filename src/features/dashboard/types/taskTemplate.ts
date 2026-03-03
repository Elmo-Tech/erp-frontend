/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Task Template Types
 * Represents reusable task structures with default values and subtasks
 */

export interface TaskTemplate {
	id: number;
	name: string;
	description: string | null;
	category: string | null;
	code: string | null;
	defaultValues: Record<string, any> | null;
	subtasks: Array<{
		title: string;
		description?: string;
		estimatedHours?: number;
		priority?: string;
	}> | null;
	usageCount: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	createdBy: number | null;
	updatedBy: number | null;

	// Relationships
	creator?: {
		id: number;
		name: string;
	};
}

export interface CreateTaskTemplateData {
	name: string;
	description?: string;
	category?: string;
	code?: string;
	defaultValues?: Record<string, any>;
	subtasks?: Array<{
		title: string;
		description?: string;
		estimatedHours?: number;
		priority?: string;
	}>;
	isActive?: boolean;
}

export interface UpdateTaskTemplateData {
	name?: string;
	description?: string;
	category?: string;
	code?: string;
	defaultValues?: Record<string, any>;
	subtasks?: Array<{
		title: string;
		description?: string;
		estimatedHours?: number;
		priority?: string;
	}>;
	isActive?: boolean;
}

export interface TaskTemplateFilters {
	category?: string;
	isActive?: boolean;
	search?: string;
	page?: number;
	perPage?: number;
}

export interface InstantiateTaskData {
	projectId: number;
	parentId?: number;
	overrides?: Record<string, any>;
}

export const TEMPLATE_CATEGORIES = ["Development", "Testing", "Design", "Documentation", "Deployment", "Meeting", "Review", "Bug Fix", "Feature", "Maintenance", "Other"];

import { z } from "zod";
import { taskTemplateSchema, instantiateTaskSchema } from "../schemas/taskTemplateSchema";

export type TaskTemplateFormData = z.output<typeof taskTemplateSchema>;
export type InstantiateTaskFormData = z.output<typeof instantiateTaskSchema>;
