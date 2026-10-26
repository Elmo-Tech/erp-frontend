import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { taskSupervisionApi } from "./taskSupervision";
import type { TaskSupervisionSession } from "../types/taskSupervision";

vi.mock("@/lib/axios", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		patch: vi.fn(),
	},
}));

const session: TaskSupervisionSession = {
	sessionId: 41,
	taskId: 12,
	supervisorId: 8,
	helpRequestId: 6,
	startedAt: "2026-09-29T08:00:00.000Z",
	lastHeartbeatAt: "2026-09-29T08:01:00.000Z",
	endedAt: null,
	durationMinutes: null,
	isActive: true,
};
const callerFeedback = { skipErrorToast: true, skipSuccessToast: true };

describe("taskSupervisionApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("uses the supervisor assignment and task supervision contract", async () => {
		const task = { taskId: 12, supervisorId: 8 };
		const supervision = { supervisor: { userId: 8, name: "Avery" }, helpRequests: [], sessions: [], summary: {} };
		vi.mocked(api.put).mockResolvedValue({ data: { data: task } });
		vi.mocked(api.get).mockResolvedValueOnce({ data: { data: supervision } });

		await expect(taskSupervisionApi.setSupervisor(12, { supervisorId: 8 })).resolves.toEqual(task);
		await expect(taskSupervisionApi.getTaskSupervision(12)).resolves.toEqual(supervision);

		expect(api.put).toHaveBeenCalledWith("/tasks/12/supervisor", { supervisorId: 8 }, callerFeedback);
		expect(api.get).toHaveBeenCalledWith("/tasks/12/supervision");
	});

	it("uses help-request create and status update payloads", async () => {
		const request = { helpRequestId: 6, status: "open" };
		vi.mocked(api.post).mockResolvedValueOnce({ data: { data: request } });
		vi.mocked(api.patch).mockResolvedValue({ data: { data: { ...request, status: "resolved" } } });

		await expect(taskSupervisionApi.createHelpRequest(12, { message: "Need a review" })).resolves.toEqual(request);
		await expect(taskSupervisionApi.updateHelpRequest(6, { status: "resolved", resolutionNote: "Reviewed together" })).resolves.toEqual({ ...request, status: "resolved" });

		expect(api.post).toHaveBeenCalledWith("/tasks/12/help-requests", { message: "Need a review" }, callerFeedback);
		expect(api.patch).toHaveBeenCalledWith("/task-help-requests/6", { status: "resolved", resolutionNote: "Reviewed together" }, callerFeedback);
	});

	it("uses independent supervision session endpoints and summary filters", async () => {
		const summary = {
			taskId: null,
			totalHelpRequests: 4,
			openHelpRequests: 1,
			acknowledgedHelpRequests: 1,
			resolvedHelpRequests: 1,
			cancelledHelpRequests: 1,
			totalSessions: 2,
			activeSessions: 1,
			totalDurationMinutes: 10,
		};

		vi.mocked(api.post)
			.mockResolvedValueOnce({ data: { data: session } })
			.mockResolvedValueOnce({ data: { data: session } })
			.mockResolvedValueOnce({ data: { data: { ...session, isActive: false, endedAt: "2026-09-29T08:10:00.000Z" } } });
		vi.mocked(api.get)
			.mockResolvedValueOnce({ data: { data: session } })
			.mockResolvedValueOnce({ data: { data: { summary } } });

		await expect(taskSupervisionApi.startSession(12, { helpRequestId: 6, notes: "Pairing" })).resolves.toEqual(session);
		await expect(taskSupervisionApi.heartbeatSession(41)).resolves.toEqual(session);
		await expect(taskSupervisionApi.stopSession(41, { stopReason: "Guidance delivered" })).resolves.toMatchObject({ isActive: false });
		await expect(taskSupervisionApi.getActiveSession()).resolves.toEqual(session);
		await expect(taskSupervisionApi.getSummary({ requestedBy: 4, supervisorId: 8, from: "2026-09-01" })).resolves.toEqual({ summary });

		expect(api.post).toHaveBeenNthCalledWith(1, "/tasks/12/supervision-sessions/start", { helpRequestId: 6, notes: "Pairing" }, callerFeedback);
		expect(api.post).toHaveBeenNthCalledWith(2, "/task-supervision-sessions/41/heartbeat", undefined, callerFeedback);
		expect(api.post).toHaveBeenNthCalledWith(3, "/task-supervision-sessions/41/stop", { stopReason: "Guidance delivered" }, callerFeedback);
		expect(api.get).toHaveBeenNthCalledWith(1, "/task-supervision-sessions/active");
		expect(api.get).toHaveBeenNthCalledWith(2, "/task-supervision/summary", { params: { requestedBy: 4, supervisorId: 8, from: "2026-09-01" } });
	});
});
