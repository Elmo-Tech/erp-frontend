import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { useTaskManualTimeDialog } from "../use-task-manual-time-dialog";
import type { ProjectTask, ProjectTimeEntry } from "../../api/execution.api";

vi.mock("@/shared/api/base", () => ({
	default: {
		post: vi.fn(),
		patch: vi.fn(),
	},
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

const mockedApi = api as unknown as {
	post: Mock;
	patch: Mock;
};

const task: ProjectTask = {
	taskId: 10,
	projectId: 2,
	milestoneId: null,
	title: "Build Login",
	description: null,
	status: "in_progress",
	statusLabel: "In Progress",
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
};

const timeEntry: ProjectTimeEntry = {
	entryId: 31,
	taskId: 10,
	projectId: 2,
	userId: 7,
	startTime: "2026-06-13T09:30:00",
	endTime: "2026-06-13T10:45:00",
	durationMinutes: 75,
	isManual: true,
	isRunning: false,
	note: "Reviewed delivery risks.",
	user: null,
	task: null,
	project: null,
	createdAt: "2026-06-13T10:45:00",
	updatedAt: "2026-06-13T10:45:00",
};

describe("useTaskManualTimeDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("logs a new manual time entry with the canonical backend payload", async () => {
		mockedApi.post.mockResolvedValueOnce({ data: { success: true, data: timeEntry } });
		const wrapper = createQueryWrapper();
		const { result } = renderHook(() => useTaskManualTimeDialog({ task, projectId: 2 }), { wrapper });

		act(() => {
			result.current.openManualTimeDialog();
			result.current.manualTimeForm.setValue("date", "2026-06-13");
			result.current.manualTimeForm.setValue("startTime", "09:30");
			result.current.manualTimeForm.setValue("endTime", "10:45");
			result.current.manualTimeForm.setValue("note", " Reviewed delivery risks. ");
		});

		await act(async () => {
			await result.current.submitManualTime();
		});

		expect(mockedApi.post).toHaveBeenCalledWith("/projects/2/tasks/10/time-entries", {
			startTime: "2026-06-13T09:30:00",
			endTime: "2026-06-13T10:45:00",
			note: "Reviewed delivery risks.",
		});
		expect(mockedApi.patch).not.toHaveBeenCalled();
		expect(result.current.manualTimeOpen).toBe(false);
	});

	it("updates the selected time entry instead of creating a new one", async () => {
		mockedApi.patch.mockResolvedValueOnce({ data: { success: true, data: timeEntry } });
		const wrapper = createQueryWrapper();
		const { result } = renderHook(() => useTaskManualTimeDialog({ task, projectId: 2 }), { wrapper });

		act(() => {
			result.current.editTimeEntry(timeEntry);
		});

		expect(result.current.manualTimeOpen).toBe(true);
		expect(result.current.manualTimeForm.getValues()).toMatchObject({
			date: "2026-06-13",
			startTime: "09:30",
			endTime: "10:45",
			note: "Reviewed delivery risks.",
		});

		await act(async () => {
			await result.current.submitManualTime();
		});

		expect(mockedApi.patch).toHaveBeenCalledWith("/projects/2/tasks/10/time-entries/31", {
			startTime: "2026-06-13T09:30:00",
			endTime: "2026-06-13T10:45:00",
			note: "Reviewed delivery risks.",
		});
		expect(mockedApi.post).not.toHaveBeenCalled();
	});
});

function createQueryWrapper() {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
	return function QueryWrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}
