import { describe, expect, it } from "vitest";
import { createMeetingSchema } from "../meeting.schema";

const baseMeeting = {
	meetingType: "discovery",
	title: "Discovery",
	date: "2026-05-01",
	time: "10:00",
	locationType: "online",
	locationDetails: "",
	internalAttendees: ["1"],
	externalAttendees: [],
	description: "Backfilled meeting notes.",
};

describe("createMeetingSchema", () => {
	it("allows a past meeting date and blank online meeting link", () => {
		expect(createMeetingSchema.safeParse(baseMeeting).success).toBe(true);
	});

	it("rejects invalid non-empty online meeting links", () => {
		const result = createMeetingSchema.safeParse({
			...baseMeeting,
			locationDetails: "not a link",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.some((issue) => issue.path.join(".") === "locationDetails")).toBe(true);
		}
	});
});
