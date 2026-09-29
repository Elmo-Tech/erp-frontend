import { describe, expect, it } from "vitest";
import { formatSupervisionDuration, getSupervisionElapsedSeconds, getViableSupervisorCandidates, taskHelpRequestStatusLabels } from "./taskSupervision";

describe("taskSupervision helpers", () => {
	it("deduplicates viable supervisor users from project and task sources", () => {
		const candidates = getViableSupervisorCandidates([
			{ userId: 3, name: "Zoe" },
			{ userId: 1, name: "Avery" },
			{ userId: 3, name: "Zoe from team" },
			null,
		]);

		expect(candidates).toEqual([
			{ userId: 1, name: "Avery" },
			{ userId: 3, name: "Zoe" },
		]);
	});

	it("formats positive elapsed supervision time and guards invalid timestamps", () => {
		const startedAt = "2026-09-29T08:00:00.000Z";
		const now = new Date("2026-09-29T09:01:02.000Z").getTime();

		expect(getSupervisionElapsedSeconds(startedAt, now)).toBe(3_662);
		expect(getSupervisionElapsedSeconds("not-a-date", now)).toBe(0);
		expect(getSupervisionElapsedSeconds(startedAt, new Date("2026-09-29T07:00:00.000Z").getTime())).toBe(0);
		expect(formatSupervisionDuration(3_662.9)).toBe("01:01:02");
		expect(formatSupervisionDuration(-1)).toBe("00:00:00");
	});

	it("exposes all help request status labels", () => {
		expect(taskHelpRequestStatusLabels).toEqual({
			open: "Open",
			acknowledged: "Acknowledged",
			resolved: "Resolved",
			cancelled: "Cancelled",
		});
	});
});
