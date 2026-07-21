import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { TaskPriority } from "@/shared/lib/statusHelpers";
import { ExecutionTaskStatus, type ProjectTask } from "../../api/execution.api";
import { useTaskStatusActions } from "../use-task-status-actions";

vi.mock("@/shared/api/base", () => ({
	default: {
		patch: vi.fn(),
		post: vi.fn(),
	},
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

const mockedApi = api as unknown as {
	patch: Mock;
	post: Mock;
};

const managerAccess = {
	canManageAllProjects: false,
	canManageTasks: false,
	canWorkOnTasks: false,
	canChangeTaskStatus: true,
	canCompleteTasks: true,
	canReopenTasks: true,
	currentUserId: 7,
} as const;

const developerAccess = {
	canManageAllProjects: false,
	canManageTasks: false,
	canWorkOnTasks: true,
	canChangeTaskStatus: false,
	canCompleteTasks: false,
	canReopenTasks: false,
	currentUserId: 7,
} as const;

function makeTask(overrides: Partial<ProjectTask> = {}): ProjectTask {
	return {
		taskId: 10,
		projectId: 2,
		milestoneId: null,
		title: "Build Login",
		description: null,
		status: ExecutionTaskStatus.TO_DO,
		statusLabel: "To Do",
		priority: TaskPriority.MEDIUM,
		estimatedHours: 2,
		startDate: null,
		dueDate: null,
		assigneeId: 7,
		isInBacklog: false,
		totalLoggedMinutes: 0,
		assignee: null,
		milestone: null,
		deliverables: [],
		timeEntries: [],
		createdAt: "2026-06-01T10:00:00.000Z",
		updatedAt: "2026-06-02T10:00:00.000Z",
		...overrides,
	};
}

describe("useTaskStatusActions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("updates ordinary task status through the canonical task endpoint", async () => {
		mockedApi.patch.mockResolvedValueOnce({ data: { success: true, data: makeTask({ status: ExecutionTaskStatus.IN_PROGRESS }) } });
		const wrapper = createQueryWrapper();
		const { result } = renderHook(
			() =>
				useTaskStatusActions({
					task: makeTask(),
					projectId: 2,
					taskExecutionAccess: managerAccess,
					onTaskCompleted: vi.fn(),
				}),
			{ wrapper },
		);

		act(() => {
			result.current.changeStatus(ExecutionTaskStatus.IN_PROGRESS);
		});

		await waitFor(() => {
			expect(mockedApi.patch).toHaveBeenCalledWith("/projects/2/tasks/10", { status: ExecutionTaskStatus.IN_PROGRESS });
		});
	});

	it("requires a reason before reopening done or QA tasks", async () => {
		mockedApi.patch.mockResolvedValueOnce({ data: { success: true, data: makeTask({ status: ExecutionTaskStatus.IN_PROGRESS }) } });
		const wrapper = createQueryWrapper();
		const { result } = renderHook(
			() =>
				useTaskStatusActions({
					task: makeTask({ status: ExecutionTaskStatus.DONE, statusLabel: "Done" }),
					projectId: 2,
					taskExecutionAccess: managerAccess,
					onTaskCompleted: vi.fn(),
				}),
			{ wrapper },
		);

		act(() => {
			result.current.changeStatus(ExecutionTaskStatus.IN_PROGRESS);
		});

		expect(mockedApi.patch).not.toHaveBeenCalled();
		expect(result.current.reopenDialog.open).toBe(true);
		expect(result.current.reopenDialog.currentStatusLabel).toBe("Done");
		expect(result.current.reopenDialog.pendingStatusLabel).toBe("In Progress");

		act(() => {
			result.current.reopenDialog.onReasonChange(" Regression fixed ");
		});

		await waitFor(() => expect(result.current.reopenDialog.reason).toBe(" Regression fixed "));

		act(() => {
			result.current.reopenDialog.onConfirm();
		});

		await waitFor(() => {
			expect(mockedApi.patch).toHaveBeenCalledWith("/projects/2/tasks/10", {
				status: ExecutionTaskStatus.IN_PROGRESS,
				reason: "Regression fixed",
			});
		});
		await waitFor(() => expect(result.current.reopenDialog.open).toBe(false));
	});

	it("uses the complete endpoint for manager mark-as-done actions", async () => {
		const onTaskCompleted = vi.fn();
		mockedApi.post.mockResolvedValueOnce({ data: { success: true, data: makeTask({ status: ExecutionTaskStatus.DONE }) } });
		const wrapper = createQueryWrapper();
		const { result } = renderHook(
			() =>
				useTaskStatusActions({
					task: makeTask(),
					projectId: 2,
					taskExecutionAccess: managerAccess,
					onTaskCompleted,
				}),
			{ wrapper },
		);

		act(() => {
			result.current.runPrimaryAction();
		});

		await waitFor(() => {
			expect(mockedApi.post).toHaveBeenCalledWith("/projects/2/tasks/10/complete");
		});
		await waitFor(() => expect(onTaskCompleted).toHaveBeenCalledTimes(1));
	});

	it("submits assignee work for review through a status update", async () => {
		mockedApi.patch.mockResolvedValueOnce({ data: { success: true, data: makeTask({ status: ExecutionTaskStatus.IN_REVIEW }) } });
		const wrapper = createQueryWrapper();
		const { result } = renderHook(
			() =>
				useTaskStatusActions({
					task: makeTask({ assigneeId: 7 }),
					projectId: 2,
					taskExecutionAccess: developerAccess,
					onTaskCompleted: vi.fn(),
				}),
			{ wrapper },
		);

		act(() => {
			result.current.runPrimaryAction();
		});

		await waitFor(() => {
			expect(mockedApi.patch).toHaveBeenCalledWith("/projects/2/tasks/10", { status: ExecutionTaskStatus.IN_REVIEW });
		});
	});
});

function createQueryWrapper() {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
	return function QueryWrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}
