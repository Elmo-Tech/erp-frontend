import { describe, expect, it } from "vitest";
import { buildEmployeeOvertimeRequestPayload, calculateOvertimeDurationMinutes, formatOvertimeCurrency, formatOvertimeMinutes, getCurrentOvertimePeriod, getDefaultOvertimeRequestFormValues, getOvertimeStatusLabel, isFutureOvertimeDate, isOvertimeTimeRangeValid, isValidOvertimeDate, isValidOvertimePeriod, isValidOvertimeTime, overtimeRequestSchema } from "../overtime-requests";
import type { OvertimeRequestFormValues } from "../../types/overtime-requests";

const request: OvertimeRequestFormValues = {
	overtimeDate: getDefaultOvertimeRequestFormValues().overtimeDate,
	startTime: "18:15",
	endTime: "20:45",
	reason: "  Production release  ",
};

describe("overtime request helpers", () => {
	it("validates calendar dates, future dates, times, and periods", () => {
		expect(isValidOvertimeDate("2028-02-29")).toBe(true);
		expect(isValidOvertimeDate("2026-02-29")).toBe(false);
		expect(isFutureOvertimeDate("2026-04-11", new Date("2026-04-10T12:00:00"))).toBe(true);
		expect(isFutureOvertimeDate("2026-04-10", new Date("2026-04-10T12:00:00"))).toBe(false);
		expect(isValidOvertimeTime("23:59")).toBe(true);
		expect(isValidOvertimeTime("24:00")).toBe(false);
		expect(isValidOvertimePeriod(2026, 5)).toBe(true);
		expect(isValidOvertimePeriod(2026, 13)).toBe(false);
	});

	it("calculates only positive same-day duration previews", () => {
		expect(calculateOvertimeDurationMinutes("18:15", "20:45")).toBe(150);
		expect(calculateOvertimeDurationMinutes("20:45", "20:45")).toBeNull();
		expect(calculateOvertimeDurationMinutes("23:00", "01:00")).toBeNull();
		expect(isOvertimeTimeRangeValid("18:15", "20:45")).toBe(true);
		expect(isOvertimeTimeRangeValid("20:45", "18:15")).toBe(false);
	});

	it("enforces the request contract and formats minutes, amounts, and statuses", () => {
		expect(overtimeRequestSchema.safeParse(request).success).toBe(true);
		expect(overtimeRequestSchema.safeParse({ ...request, overtimeDate: "2020-01-01", endTime: "18:15", reason: " " }).success).toBe(false);
		expect(formatOvertimeMinutes(45)).toBe("45m");
		expect(formatOvertimeMinutes(150)).toBe("2h 30m");
		expect(formatOvertimeMinutes(null)).toBe("Not recorded");
		expect(formatOvertimeCurrency(1234.5)).toBe("1,234.50");
		expect(formatOvertimeCurrency(1234.5, "USD")).toBe("$1,234.50");
		expect(formatOvertimeCurrency(null)).toBe("Not calculated");
		expect(getOvertimeStatusLabel("approved")).toBe("Approved");
	});

	it("builds a trimmed required reason and defaults to tomorrow", () => {
		expect(buildEmployeeOvertimeRequestPayload(request)).toEqual({
			overtimeDate: request.overtimeDate,
			startTime: "18:15",
			endTime: "20:45",
			reason: "Production release",
		});
		expect(getCurrentOvertimePeriod(new Date("2026-04-10T12:00:00"))).toEqual({ year: 2026, month: 4 });
		expect(getDefaultOvertimeRequestFormValues(new Date("2026-04-10T12:00:00"))).toMatchObject({
			overtimeDate: "2026-04-11",
			startTime: "",
			endTime: "",
			reason: "",
		});
	});
});
