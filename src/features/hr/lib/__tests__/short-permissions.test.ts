import { describe, expect, it } from "vitest";
import { buildEmployeeShortPermissionPayload, calculatePermissionDurationMinutes, formatPermissionDuration, getCurrentPermissionMonth, getDefaultShortPermissionRequestFormValues, isPermissionTimeRangeValid, isValidPermissionDate, isValidPermissionMonth, isValidPermissionTime, shortPermissionRequestSchema } from "../short-permissions";
import type { ShortPermissionRequestFormValues } from "../../types/short-permissions";

const request: ShortPermissionRequestFormValues = {
	permissionDate: "2028-02-29",
	startTime: "09:15",
	endTime: "10:45",
	reason: "  Medical appointment  ",
};

describe("short permission helpers", () => {
	it("validates calendar dates and selected months", () => {
		expect(isValidPermissionDate("2028-02-29")).toBe(true);
		expect(isValidPermissionDate("2026-02-29")).toBe(false);
		expect(isValidPermissionDate("2026-2-09")).toBe(false);
		expect(isValidPermissionMonth("2026-01")).toBe(true);
		expect(isValidPermissionMonth("2026-13")).toBe(false);
	});

	it("validates 24-hour times and calculates only positive same-day durations", () => {
		expect(isValidPermissionTime("00:00")).toBe(true);
		expect(isValidPermissionTime("23:59")).toBe(true);
		expect(isValidPermissionTime("24:00")).toBe(false);
		expect(isValidPermissionTime("9:15")).toBe(false);
		expect(calculatePermissionDurationMinutes("09:15", "10:45")).toBe(90);
		expect(calculatePermissionDurationMinutes("10:45", "10:45")).toBeNull();
		expect(calculatePermissionDurationMinutes("23:00", "01:00")).toBeNull();
		expect(isPermissionTimeRangeValid("09:15", "10:45")).toBe(true);
		expect(isPermissionTimeRangeValid("10:45", "09:15")).toBe(false);
	});

	it("enforces request validation and formats duration previews", () => {
		expect(shortPermissionRequestSchema.safeParse(request).success).toBe(true);
		expect(shortPermissionRequestSchema.safeParse({ ...request, endTime: "09:15", reason: "x".repeat(2001) }).success).toBe(false);
		expect(formatPermissionDuration(45)).toBe("45m");
		expect(formatPermissionDuration(60)).toBe("1h");
		expect(formatPermissionDuration(105)).toBe("1h 45m");
	});

	it("builds a trimmed optional reason and uses local dates for defaults", () => {
		expect(buildEmployeeShortPermissionPayload(request)).toEqual({
			permissionDate: "2028-02-29",
			startTime: "09:15",
			endTime: "10:45",
			reason: "Medical appointment",
		});
		expect(buildEmployeeShortPermissionPayload({ ...request, reason: " " })).not.toHaveProperty("reason");
		expect(getCurrentPermissionMonth(new Date("2026-04-10T12:00:00"))).toBe("2026-04");
		expect(getDefaultShortPermissionRequestFormValues(new Date("2026-04-10T12:00:00"))).toMatchObject({
			permissionDate: "2026-04-10",
			startTime: "09:00",
			endTime: "10:00",
		});
	});
});
