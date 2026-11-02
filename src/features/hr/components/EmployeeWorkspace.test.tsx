import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EmployeeWorkspace } from "./EmployeeWorkspace";
import type { Employee } from "../types";
import { useAuthStore } from "@/store/authStore";
import { HrAction } from "./HrAction";

afterEach(() => { cleanup(); useAuthStore.setState({ role: null, permissions: [] }); });

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
vi.mock("./EmployeeAttendancePanel", () => ({ EmployeeAttendancePanel: panelMock("attendance-panel") }));
vi.mock("./EmployeeSupervisionPanel", () => ({ EmployeeSupervisionPanel: panelMock("supervision-panel") }));
vi.mock("./EmployeeOverviewPanel", () => ({ EmployeeOverviewPanel: () => <div>Employee overview</div> }));
vi.mock("./EmployeeFinancialPanel", () => ({ EmployeeFinancialPanel: panelMock("financial-panel") }));
vi.mock("./EmployeeTimeOffPanel", () => ({ EmployeeTimeOffPanel: panelMock("time-off-panel") }));
vi.mock("./EmployeeReportDialog", () => ({ EmployeeReportDialog: ({ open }: { open: boolean }) => open ? <div role="dialog">Comprehensive employee report</div> : null }));

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
	it("shows the balance shortcut only to users with allocation access", () => {
		useAuthStore.setState({ role: "hr", permissions: [{ permissionName: "allocate_leaves", access: true }] });
		const { unmount } = render(<EmployeeWorkspace employee={employee} canManage={false} onEdit={vi.fn()} />);
		expect(screen.getByRole("button", { name: "Adjust leave balance" })).toBeInTheDocument();
		unmount();
		useAuthStore.setState({ role: "hr", permissions: [{ permissionName: "view_leaves", access: true }] });
		render(<EmployeeWorkspace employee={employee} canManage={false} onEdit={vi.fn()} />);
		expect(screen.queryByRole("button", { name: "Adjust leave balance" })).not.toBeInTheDocument();
	});
	it("opens time off when arriving from a review notification", () => {
		render(<EmployeeWorkspace employee={employee} canManage onEdit={vi.fn()} reviewKind="leave" reviewMonth="2027-02" />);
		expect(screen.getByRole("tab", { name: "Attendance & time off" })).toHaveAttribute("data-state", "active");
		expect(screen.getByTestId("time-off-panel")).toHaveAttribute("data-active", "true");
	});
	it("opens the contracts tab for a contract creator and hides unrelated sections and approval actions", () => {
		useAuthStore.setState({ role: "contract-clerk", permissions: [{ permissionName: "create_employee_contracts", access: true }] });
		render(<><EmployeeWorkspace employee={employee} canManage={false} onEdit={vi.fn()} /><HrAction resource="employee_contracts" action="create"><button>Create agreement</button></HrAction><HrAction resource="leaves" action="approve"><button>Approve leave</button></HrAction></>);
		expect(screen.getByRole("tab", { name: "Contracts" })).toBeInTheDocument();
		expect(screen.queryByRole("tab", { name: "Salary & advances" })).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Create agreement" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Approve leave" })).not.toBeInTheDocument();
	});
	it("shows one workflow per tab and keeps form state mounted while activating only the selected panel", () => {
		render(<EmployeeWorkspace employee={employee} canManage onEdit={vi.fn()} />);

		expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("data-state", "active");
		expect(screen.getAllByRole("tab")).toHaveLength(5);

		fireEvent.mouseDown(screen.getByRole("tab", { name: "Contracts" }), { button: 0, ctrlKey: false });
		expect(screen.getByRole("tab", { name: "Contracts" })).toHaveAttribute("data-state", "active");
		expect(screen.getByTestId("contracts-panel")).toHaveAttribute("data-active", "true");
		expect(screen.getByTestId("documents-panel")).not.toBeVisible();

		fireEvent.mouseDown(screen.getByRole("tab", { name: "Salary & advances" }), { button: 0, ctrlKey: false });
		expect(screen.getByTestId("contracts-panel")).toHaveAttribute("data-active", "false");
		expect(screen.getByTestId("contracts-panel")).not.toBeVisible();
		expect(screen.getByTestId("financial-panel")).toHaveAttribute("data-active", "true");
		expect(screen.queryByTestId("partial-pays-panel")).not.toBeInTheDocument();
		fireEvent.mouseDown(screen.getByRole("tab", { name: "Attendance & time off" }), { button: 0, ctrlKey: false });
		expect(screen.getByTestId("time-off-panel")).toHaveAttribute("data-active", "true");
		fireEvent.click(screen.getByRole("button", { name: "Employee report" }));
		expect(screen.getByRole("dialog")).toHaveTextContent("Comprehensive employee report");
	});

	it("shows only the overview and does not mount protected panels for non-managers", () => {
		render(<EmployeeWorkspace employee={employee} canManage={false} onEdit={vi.fn()} />);

		expect(screen.getByText("Employee overview")).toBeInTheDocument();
		expect(screen.getAllByRole("tab")).toHaveLength(1);
		expect(screen.queryByTestId("contracts-panel")).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
	});
});
