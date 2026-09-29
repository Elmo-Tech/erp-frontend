import { describe, expect, it } from "vitest";
import { buildEmployeeLeavePayload, buildLeaveTypePayload, getDefaultLeaveRequestFormValues, isLeaveDateRangeValid, isValidLeaveDate, leaveRequestSchema, leaveTypeFormSchema } from "../leave-management";
import type { LeaveRequestFormValues, LeaveTypeFormValues } from "../../types/leave-management";

const request: LeaveRequestFormValues = {
	leaveTypeId: "4",
	startDate: "2026-02-27",
	endDate: "2026-03-02",
	reason: "  Family event  ",
};

const leaveType: LeaveTypeFormValues = {
	name: " Annual leave ",
	slug: "annual-leave",
	annualAllowanceDays: 21,
	isPaid: true,
	isActive: true,
	displayOrder: 10,
};

describe("leave management helpers", () => {
	it("accepts real calendar dates and rejects invalid dates", () => {
		expect(isValidLeaveDate("2028-02-29")).toBe(true);
		expect(isValidLeaveDate("2026-02-29")).toBe(false);
		expect(isValidLeaveDate("2026-2-09")).toBe(false);
	});

	it("requires an ordered, valid leave date range", () => {
		expect(isLeaveDateRangeValid("2026-03-01", "2026-03-01")).toBe(true);
		expect(isLeaveDateRangeValid("2026-03-02", "2026-03-01")).toBe(false);
		expect(isLeaveDateRangeValid("2026-02-30", "2026-03-01")).toBe(false);
	});

	it("enforces request requirements before submitting", () => {
		expect(leaveRequestSchema.safeParse(request).success).toBe(true);
		expect(
		leaveRequestSchema.safeParse({
			...request,
			leaveTypeId: "",
			startDate: "2026-03-03",
			endDate: "2026-03-02",
			reason: "x".repeat(2001),
		}).success
	).toBe(false);
	});

	it("builds the API payload without an empty optional reason", () => {
		expect(buildEmployeeLeavePayload(request)).toEqual({
			leaveTypeId: 4,
			startDate: "2026-02-27",
			endDate: "2026-03-02",
			reason: "Family event",
		});
		expect(buildEmployeeLeavePayload({ ...request, reason: " " })).not.toHaveProperty("reason");
	});

	it("defaults both leave dates to the local current date", () => {
		expect(getDefaultLeaveRequestFormValues(new Date("2026-04-10T12:00:00"))).toMatchObject({
			startDate: "2026-04-10",
			endDate: "2026-04-10",
			leaveTypeId: "",
		});
	});

	it("validates and builds leave-type payloads", () => {
		expect(leaveTypeFormSchema.safeParse(leaveType).success).toBe(true);
		expect(leaveTypeFormSchema.safeParse({ ...leaveType, slug: "Annual Leave", annualAllowanceDays: 367, displayOrder: 65536 }).success).toBe(false);
		expect(buildLeaveTypePayload(leaveType)).toEqual({ ...leaveType, name: "Annual leave" });
	});
});
