import { describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { meetingsApi } from "../meetings.api";

vi.mock("@/shared/api/base", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
	},
}));

const mockedApi = api as unknown as {
	post: Mock;
	patch: Mock;
};

describe("meetingsApi", () => {
	it("sends meeting type and attendee arrays to the backend", async () => {
		mockedApi.post.mockResolvedValueOnce({
			data: {
				data: {
					meetingId: 1,
					subjectId: 7,
					subjectType: "App\\Modules\\Client\\Models\\Client",
					status: "scheduled",
					title: "Discovery Call",
					scheduledAt: "2026-05-14T10:00:00.000Z",
					createdAt: "2026-05-14T09:00:00.000Z",
					updatedAt: "2026-05-14T09:00:00.000Z",
				},
			},
		});

		await meetingsApi.createMeeting({
			model_type: "App\\Modules\\Client\\Models\\Client",
			model_id: 7,
			meeting_type: "discovery-call",
			title: "Discovery Call",
			scheduled_at: "2026-05-14T10:00:00.000Z",
			location_type: "online",
			location_details: "https://meet.example.com/demo",
			internal_attendees: [11, 12],
			external_attendees: ["primary-contact"],
		});

		expect(mockedApi.post).toHaveBeenCalledWith("/meetings", expect.objectContaining({
			meetingType: "discovery-call",
			internalAttendees: [11, 12],
			externalAttendees: ["primary-contact"],
		}));
	});

	it("updates meeting status through the canonical meeting update endpoint", async () => {
		mockedApi.patch.mockResolvedValueOnce({
			data: {
				data: {
					meetingId: 1,
					subjectId: 7,
					subjectType: "App\\Modules\\Client\\Models\\Client",
					status: "completed",
					title: "Discovery Call",
					outcomeSummary: "Decision made.",
					scheduledAt: "2026-05-14T10:00:00.000Z",
					createdAt: "2026-05-14T09:00:00.000Z",
					updatedAt: "2026-05-14T09:30:00.000Z",
				},
			},
		});

		await meetingsApi.updateMeetingStatus(1, {
			status: "completed",
			completion_note: "Decision made.",
		});

		expect(mockedApi.patch).toHaveBeenCalledWith("/meetings/1", {
			status: "completed",
			outcomeSummary: "Decision made.",
		});
		expect(mockedApi.patch).not.toHaveBeenCalledWith(expect.stringContaining("/status"), expect.anything());
	});
});
