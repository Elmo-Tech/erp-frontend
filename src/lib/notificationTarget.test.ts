import { expect, it } from "vitest";
import { notificationTarget } from "./notificationTarget";
import type { Notification } from "@/store/notificationStore";

it("routes leave notifications directly to the employee review even if the old URL points only to the profile", () => {
	const notice: Notification = { notificationId: "1", type: "leave_submitted", message: "", readAt: null, createdAt: "", data: { employee_id: "12", body: "2027-02-01 to 2027-02-03", url: "/dashboard/employees/12" } };
	expect(notificationTarget(notice)).toBe("/dashboard/employees/12?review=leave&month=2027-02");
});
