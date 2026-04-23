import api from "@/shared/api/base";

export interface TaskCategoryOption {
	value: string;
	label: string;
	color: string;
}

export interface TaskCategoriesResponse {
	data: TaskCategoryOption[];
}

export const enumConfigApi = {
	async getTaskCategories(): Promise<TaskCategoriesResponse> {
		const response = await api.get<TaskCategoriesResponse>("/enums/task-categories");

		return response.data;
	},
};

export const enumConfigKeys = {
	all: ["enums"] as const,
	taskCategories: () => [...enumConfigKeys.all, "task-categories"] as const,
};
