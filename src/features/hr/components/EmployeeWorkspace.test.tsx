import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmployeeWorkspace } from "./EmployeeWorkspace";
import type { Employee } from "../types";

function panelMock(testId: string) {
	return function MockPanel({ isActive }: { isActive: boolean }) {
		return <div data-testid={testId} data-active={String(isActive)}>{testId}</div>;
	};
}

vi.mock("./EmployeeContractsDialog", () => ({ EmployeeContractsPanel: panelMock("contracts-panel") }));
vi.mock("./EmployeeDocumentsDialog", () => ({ EmployeeDocumentsPanel: panelMock("documents-panel") }));
vi.mock("./EmployeeLeavesDialog", () => ({ EmployeeLeavesPanel: panelMock("leaves-panel") }));
vi.mock("./EmployeeShortPermissionsDialog", () => ({ EmployeeShortPermissionsPanel: panelMock("permissions-panel") }));
vi.mock("./EmployeeOvertimeRequestsDialog", () => ({ EmployeeOvertimeRequestsPanel: panelMock("overtime-panel") }));
vi.mock("./EmployeeLateDeductionsDialog", () => ({ EmployeeLateDeductionsPanel: panelMock("late-deductions-panel") }));
vi.mock("./EmployeeDirectDeductionsDialog", () => ({ EmployeeDirectDeductionsPanel: panelMock("direct-deductions-panel") }));
vi.mock("./EmployeeAdvancesDialog", () => ({ EmployeeAdvancesPanel: panelMock("advances-panel") }));
vi.mock("./EmployeePartialPaysDialog", () => ({ EmployeePartialPaysPanel: panelMock("partial-pays-panel") }));

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

describe("EmployeeWorkspace", () => {
	it("shows one workflow per tab and keeps form state mounted while activating only the selected panel", () => {
		render(<EmployeeWorkspace employee={employee} canManage onEdit={vi.fn()} />);

		expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("data-state", "active");
		expect(screen.getAllByRole("tab")).toHaveLength(10);

		fireEvent.mouseDown(screen.getByRole("tab", { name: "Contracts" }), { button: 0, ctrlKey: false });
		expect(screen.getByRole("tab", { name: "Contracts" })).toHaveAttribute("data-state", "active");
		expect(screen.getByTestId("contracts-panel")).toHaveAttribute("data-active", "true");
		expect(screen.getByTestId("documents-panel")).not.toBeVisible();

		fireEvent.mouseDown(screen.getByRole("tab", { name: "Advances" }), { button: 0, ctrlKey: false });
		expect(screen.getByTestId("contracts-panel")).toHaveAttribute("data-active", "false");
		expect(screen.getByTestId("contracts-panel")).not.toBeVisible();
		expect(screen.getByTestId("advances-panel")).toHaveAttribute("data-active", "true");
		expect(screen.getByTestId("partial-pays-panel")).not.toBeVisible();
	});

	it("shows only the overview and does not mount protected panels for non-managers", () => {
		render(<EmployeeWorkspace employee={employee} canManage={false} onEdit={vi.fn()} />);

		expect(screen.getByText("Employee overview")).toBeInTheDocument();
		expect(screen.getAllByRole("tab")).toHaveLength(1);
		expect(screen.queryByTestId("contracts-panel")).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
	});
});
