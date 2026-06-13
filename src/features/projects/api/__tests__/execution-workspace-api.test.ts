import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { getActiveProjectTimeEntry, getMyActiveProjectTasks, getProjectChangeRequests, getProjectFiles, getProjectTasks, getProjectTimeline } from "../execution.api";

vi.mock("@/shared/api/base", () => ({
	default: {
		get: vi.fn(),
	},
}));

const mockedApi = api as unknown as {
	get: Mock;
};

describe("execution workspace API", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("maps project tasks through the flat execution contract", async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: {
				data: {
					tasks: [
						{
							taskId: 10,
							projectId: 2,
							milestoneId: null,
							parentId: 99,
							title: "Build dashboard",
							description: null,
							status: "to_do",
							statusLabel: "To Do",
							estimatedHours: 4,
							startDate: "2026-06-10",
							dueDate: "2026-06-12",
							assigneeId: 7,
							isInBacklog: true,
							totalLoggedMinutes: 90,
							assignee: { userId: 7, name: "Mona", avatar: null },
							milestone: null,
							subtasks: [{ taskId: 99 }],
							deliverables: [],
							timeEntries: [],
							createdAt: "2026-06-01T10:00:00.000Z",
							updatedAt: "2026-06-02T10:00:00.000Z",
						},
					],
				},
			},
		});

		const tasks = await getProjectTasks(2, {
			status: "to_do",
			milestoneId: 3,
			assigneeId: 7,
			isInBacklog: true,
			dueFrom: "2026-06-01",
			dueTo: "2026-06-30",
			search: "dashboard",
		});

		expect(mockedApi.get).toHaveBeenCalledWith("/projects/2/tasks?filter%5Bstatus%5D=to_do&filter%5BmilestoneId%5D=3&filter%5BassigneeId%5D=7&filter%5BisInBacklog%5D=true&filter%5BdueFrom%5D=2026-06-01&filter%5BdueTo%5D=2026-06-30&filter%5Bsearch%5D=dashboard");
		expect(tasks).toEqual([
			{
				taskId: 10,
				projectId: 2,
				milestoneId: null,
				title: "Build dashboard",
				description: null,
				status: "to_do",
				statusLabel: "To Do",
				estimatedHours: 4,
				startDate: "2026-06-10",
				dueDate: "2026-06-12",
				assigneeId: 7,
				isInBacklog: true,
				totalLoggedMinutes: 90,
				assignee: { userId: 7, name: "Mona", avatar: null },
				milestone: null,
				project: undefined,
				deliverables: [],
				timeEntries: [],
				createdAt: "2026-06-01T10:00:00.000Z",
				updatedAt: "2026-06-02T10:00:00.000Z",
			},
		]);
		expect("parentId" in tasks[0]).toBe(false);
		expect("subtasks" in tasks[0]).toBe(false);
	});

	it("fetches the current user's active project time entry", async () => {
		mockedApi.get.mockResolvedValueOnce({ data: { data: null } });

		await expect(getActiveProjectTimeEntry()).resolves.toBeNull();

		expect(mockedApi.get).toHaveBeenCalledWith("/projects/time-entries/active");
	});

	it("fetches active project tasks assigned to the current user", async () => {
		mockedApi.get.mockResolvedValueOnce({ data: { data: { tasks: [] } } });

		await expect(getMyActiveProjectTasks()).resolves.toEqual([]);

		expect(mockedApi.get).toHaveBeenCalledWith("/projects/tasks/my-active");
	});

	it("maps project files through the lightweight list contract", async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: {
				data: {
					files: [
						{
							fileId: 22,
							projectId: 2,
							name: "Launch Brief",
							type: "link",
							fileUrl: "https://example.test/launch-brief",
							mimeType: "",
							size: 0,
							description: "Kickoff document",
							category: "document",
							createdAt: "2026-06-01T10:00:00.000Z",
							isClientVisible: true,
							isDownloadable: false,
							visibleToRoles: ["manager"],
							createdBy: 1,
						},
					],
				},
			},
		});

		const files = await getProjectFiles(2);

		expect(mockedApi.get).toHaveBeenCalledWith("/projects/2/files");
		expect(files).toEqual([
			{
				fileId: 22,
				projectId: 2,
				name: "Launch Brief",
				type: "link",
				fileUrl: "https://example.test/launch-brief",
				mimeType: "",
				size: 0,
				description: "Kickoff document",
				category: "document",
				createdAt: "2026-06-01T10:00:00.000Z",
			},
		]);
		expect("isClientVisible" in files[0]).toBe(false);
		expect("visibleToRoles" in files[0]).toBe(false);
	});

	it("maps change requests through the backend enum contract", async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: {
				data: {
					changeRequests: [
						{
							changeRequestId: 15,
							projectId: 2,
							title: "Extra onboarding workshop",
							description: "Add a second workshop for client admins.",
							price: 750,
							status: "sent_to_client",
							statusLabel: "Sent to Client",
							createdAt: "2026-06-03T10:00:00.000Z",
							updatedAt: "2026-06-04T10:00:00.000Z",
							internalCost: 300,
							approvedBy: 7,
						},
					],
				},
			},
		});

		const changeRequests = await getProjectChangeRequests(2);

		expect(mockedApi.get).toHaveBeenCalledWith("/projects/2/change-requests");
		expect(changeRequests).toEqual([
			{
				changeRequestId: 15,
				projectId: 2,
				title: "Extra onboarding workshop",
				description: "Add a second workshop for client admins.",
				price: 750,
				status: "sent_to_client",
				statusLabel: "Sent to Client",
				createdAt: "2026-06-03T10:00:00.000Z",
				updatedAt: "2026-06-04T10:00:00.000Z",
			},
		]);
		expect("internalCost" in changeRequests[0]).toBe(false);
		expect("approvedBy" in changeRequests[0]).toBe(false);
	});

	it("fetches team timeline with date and multi-select filters", async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: {
				data: {
					range: { startDate: "2026-06-07", endDate: "2026-06-11" },
					users: [],
					items: [],
					conflicts: [],
					suggestions: [],
				},
			},
		});

		await expect(
			getProjectTimeline({
				startDate: "2026-06-07",
				endDate: "2026-06-11",
				projectIds: [2, 7],
				userIds: [3],
			})
		).resolves.toEqual({
			range: { startDate: "2026-06-07", endDate: "2026-06-11" },
			users: [],
			items: [],
			conflicts: [],
			suggestions: [],
		});

		expect(mockedApi.get).toHaveBeenCalledWith("/projects/timeline?startDate=2026-06-07&endDate=2026-06-11&projectIds%5B%5D=2&projectIds%5B%5D=7&userIds%5B%5D=3");
	});
});
