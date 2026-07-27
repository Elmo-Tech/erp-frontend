import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Employee } from "@/features/hr/types";
import { PipelineEmployeePicker } from "../PipelineEmployeePicker";

const employees = [
	{
		userId: 12,
		name: "Mona Hassan",
		email: "mona@example.com",
		avatar: "",
		isActive: true,
		role: "employee",
		workHoursPerDay: 8,
		workStartTime: "09:00:00",
		expectedClockOut: "17:00:00",
		graceDaysAllowed: 5,
		graceDaysUsed: 0,
		graceDaysRemaining: 5,
		totalPoints: 0,
		skills: [],
		salary: null,
		totalDeductions: null,
		internalHourlyCost: null,
		createdAt: "2026-07-27T00:00:00.000Z",
	},
	{
		userId: 18,
		name: "Omar Ali",
		email: "omar@example.com",
		avatar: "",
		isActive: true,
		role: "employee",
		workHoursPerDay: 8,
		workStartTime: "09:00:00",
		expectedClockOut: "17:00:00",
		graceDaysAllowed: 5,
		graceDaysUsed: 0,
		graceDaysRemaining: 5,
		totalPoints: 0,
		skills: [],
		salary: null,
		totalDeductions: null,
		internalHourlyCost: null,
		createdAt: "2026-07-27T00:00:00.000Z",
	},
] satisfies Employee[];

describe("PipelineEmployeePicker", () => {
	it("allows selecting multiple employees from the employee directory", () => {
		const onSelectionChange = vi.fn();
		const { rerender } = render(
			<PipelineEmployeePicker
				employees={employees}
				selectedUserIds={[]}
				onSelectionChange={onSelectionChange}
			/>
		);

		fireEvent.click(screen.getByRole("combobox", { name: "Choose employees for this task" }));
		fireEvent.click(screen.getByText("Mona Hassan"));
		expect(onSelectionChange).toHaveBeenLastCalledWith([12]);

		rerender(
			<PipelineEmployeePicker
				employees={employees}
				selectedUserIds={[12]}
				onSelectionChange={onSelectionChange}
			/>
		);
		fireEvent.click(screen.getByText("Omar Ali"));

		expect(onSelectionChange).toHaveBeenLastCalledWith([12, 18]);
	});
});
