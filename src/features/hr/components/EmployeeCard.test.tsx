import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmployeeCard } from "./EmployeeCard";
import type { Employee } from "../types";

const employee: Employee = {
	userId: 7,
	name: "Avery Stone",
	email: "avery@example.com",
	avatar: "",
	isActive: true,
	role: "employee",
	workHoursPerDay: 8,
	workStartTime: "09:00",
	expectedClockOut: "17:00",
	graceDaysAllowed: 3,
	graceDaysUsed: 1,
	graceDaysRemaining: 2,
	totalPoints: 0,
	skills: ["React"],
	salary: null,
	totalDeductions: null,
	internalHourlyCost: null,
	createdAt: "2026-01-01T00:00:00.000Z",
};

describe("EmployeeCard", () => {
	it("opens the workspace from card click and keyboard activation", () => {
		const onOpen = vi.fn();
		render(<EmployeeCard employee={employee} onOpen={onOpen} />);

		const card = screen.getByRole("button", { name: /open employee workspace for avery stone/i });
		fireEvent.click(card);
		fireEvent.keyDown(card, { key: "Enter" });
		fireEvent.keyDown(card, { key: " " });

		expect(onOpen).toHaveBeenCalledTimes(3);
		expect(onOpen).toHaveBeenLastCalledWith(employee);
	});

	it("keeps quick menu actions from opening the workspace", () => {
		const onOpen = vi.fn();
		const onEdit = vi.fn();
		const onToggleStatus = vi.fn();
		render(<EmployeeCard employee={employee} onOpen={onOpen} onEdit={onEdit} onToggleStatus={onToggleStatus} />);

		fireEvent.pointerDown(screen.getByRole("button", { name: /employee actions/i }), { button: 0, ctrlKey: false });
		expect(screen.getByRole("menuitem", { name: /edit/i })).toBeInTheDocument();
		expect(screen.getByRole("menuitem", { name: /deactivate/i })).toBeInTheDocument();
		expect(screen.queryByRole("menuitem", { name: /contracts/i })).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole("menuitem", { name: /edit/i }));

		expect(onEdit).toHaveBeenCalledWith(employee);
		expect(onOpen).not.toHaveBeenCalled();
	});
});
