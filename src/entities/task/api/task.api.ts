import api from "@/shared/api/base";
import type {
	AddAssigneePayload,
	AddCommentPayload,
	AddTestScenarioPayload,
	CreateTaskPayload,
	Tag,
	Task,
	TaskActivity,
	TaskAssignee,
	TaskChildrenResponse,
	TaskFilters,
	TaskListResponse,
	TaskTestScenario,
	UpdateTaskPayload,
	UserPointsSummary,
	VerifyTestScenarioPayload,
} from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

function buildTaskParams(filters?: TaskFilters) {
	const params = new URLSearchParams();

	if (filters?.projectId) {
		params.append("filter[projectId]", String(filters.projectId));
	}

	if (filters?.parentId !== undefined) {
		params.append("filter[parentId]", filters.parentId === null ? "null" : String(filters.parentId));
	}

	if (filters?.status) {
		params.append("filter[status]", filters.status);
	}

	if (filters?.type) {
		params.append("filter[type]", filters.type);
	}

	if (filters?.priority) {
		params.append("filter[priority]", filters.priority);
	}

	if (filters?.assignedTo) {
		params.append("filter[assignedTo]", String(filters.assignedTo));
	}

	if (filters?.tagId) {
		params.append("filter[tagId]", String(filters.tagId));
	}

	if (filters?.search) {
		params.append("filter[search]", filters.search);
	}

	if (filters?.page) {
		params.append("page", String(filters.page));
	}

	if (filters?.perPage) {
		params.append("perPage", String(filters.perPage));
	}

	return params;
}

function withQuery(path: string, params: URLSearchParams) {
	const query = params.toString();
	return query ? `${path}?${query}` : path;
}

export const taskApi = {
	async getTasks(filters?: TaskFilters): Promise<TaskListResponse> {
		const response = await api.get<ApiEnvelope<TaskListResponse>>(withQuery("/tasks", buildTaskParams(filters)));

		return response.data.data;
	},

	async getMyAssignedTasks(filters?: TaskFilters): Promise<TaskListResponse> {
		const response = await api.get<ApiEnvelope<TaskListResponse>>(withQuery("/tasks/my-assigned", buildTaskParams(filters)));

		return response.data.data;
	},

	async getTask(id: number): Promise<Task> {
		const response = await api.get<ApiEnvelope<Task>>(`/tasks/${id}`);

		return response.data.data;
	},

	async createTask(payload: CreateTaskPayload): Promise<Task> {
		const response = await api.post<ApiEnvelope<Task>>("/tasks", payload);

		return response.data.data;
	},

	async updateTask(id: number, payload: UpdateTaskPayload): Promise<Task> {
		const response = await api.put<ApiEnvelope<Task>>(`/tasks/${id}`, payload);

		return response.data.data;
	},

	async markComplete(id: number, reason?: string): Promise<Task> {
		const response = await api.post<ApiEnvelope<Task>>(`/tasks/${id}/mark-complete`, reason ? { reason } : {});

		return response.data.data;
	},

	async deleteTask(id: number): Promise<void> {
		await api.delete(`/tasks/${id}`);
	},

	async getTaskChildren(id: number): Promise<TaskChildrenResponse> {
		const response = await api.get<ApiEnvelope<Task[]>>(`/tasks/${id}/children`);

		return { children: response.data.data };
	},

	async getProjectTasks(projectId: number, page = 1, perPage = 100): Promise<TaskListResponse> {
		const params = new URLSearchParams({
			page: String(page),
			perPage: String(perPage),
		});
		const response = await api.get<ApiEnvelope<TaskListResponse>>(`/projects/${projectId}/tasks?${params.toString()}`);

		return response.data.data;
	},

	async getTags(): Promise<Tag[]> {
		const response = await api.get<ApiEnvelope<Tag[]>>("/tags");

		return response.data.data;
	},

	async addAssignee(taskId: number, payload: AddAssigneePayload): Promise<TaskAssignee> {
		const response = await api.post<ApiEnvelope<TaskAssignee>>(`/tasks/${taskId}/assignees`, payload);

		return response.data.data;
	},

	async removeAssignee(taskId: number, userId: number): Promise<void> {
		await api.delete(`/tasks/${taskId}/assignees/${userId}`);
	},

	async getTestScenarios(taskId: number): Promise<TaskTestScenario[]> {
		const response = await api.get<ApiEnvelope<TaskTestScenario[]>>(`/tasks/${taskId}/test-scenarios`);

		return response.data.data;
	},

	async addTestScenario(taskId: number, payload: AddTestScenarioPayload): Promise<TaskTestScenario> {
		const response = await api.post<ApiEnvelope<TaskTestScenario>>(`/tasks/${taskId}/test-scenarios`, payload);

		return response.data.data;
	},

	async completeTestScenario(scenarioId: number): Promise<TaskTestScenario> {
		const response = await api.post<ApiEnvelope<TaskTestScenario>>(`/test-scenarios/${scenarioId}/complete`);

		return response.data.data;
	},

	async verifyTestScenario(scenarioId: number, payload: VerifyTestScenarioPayload): Promise<TaskTestScenario> {
		const response = await api.post<ApiEnvelope<TaskTestScenario>>(`/test-scenarios/${scenarioId}/verify`, payload);

		return response.data.data;
	},

	async getActivities(taskId: number): Promise<TaskActivity[]> {
		const response = await api.get<ApiEnvelope<TaskActivity[]>>(`/tasks/${taskId}/activities`);

		return response.data.data;
	},

	async addComment(taskId: number, payload: AddCommentPayload): Promise<TaskActivity> {
		const response = await api.post<ApiEnvelope<TaskActivity>>(`/tasks/${taskId}/comments`, payload);

		return response.data.data;
	},

	async getPointsSummary(projectId: number): Promise<UserPointsSummary[]> {
		const response = await api.get<ApiEnvelope<UserPointsSummary[]>>(`/projects/${projectId}/points-summary`);

		return response.data.data;
	},
};
