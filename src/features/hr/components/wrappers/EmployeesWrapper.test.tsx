import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmployeesWrapper } from "./EmployeesWrapper";

const { employeeQuery, retry } = vi.hoisted(() => ({ employeeQuery: vi.fn(), retry: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("../../hooks", () => ({
	useEmployees: employeeQuery,
	useDeactivateEmployee: () => ({}), useActivateEmployee: () => ({}), useDeleteEmployee: () => ({}),
}));
vi.mock("@/features/admin/hooks/useRoles", () => ({ useRoles: () => ({}) }));
vi.mock("@/store/authStore", () => ({ useAuthStore: (selector: (state: { hasPermission: () => boolean }) => unknown) => selector({ hasPermission: () => false }) }));
vi.mock("../employees", () => ({ CreateEmployeeForm: () => null, UpdateEmployeeForm: () => null }));
vi.mock("@/components/shared/dialogs/ConfirmDialog", () => ({ ConfirmDialog: () => null }));

describe("EmployeesWrapper feedback", () => {
	beforeEach(() => { vi.clearAllMocks(); });
	it("shows an error and offers a retry instead of an empty directory", () => {
		employeeQuery.mockReturnValue({ isLoading: false, isError: true, refetch: retry });
		render(<EmployeesWrapper />);
		expect(screen.getByRole("alert")).toHaveTextContent("Could not load employees");
		fireEvent.click(screen.getByRole("button", { name: "Retry" }));
		expect(retry).toHaveBeenCalledOnce();
	});
	it("allows clearing a search that returned no matches", () => {
		employeeQuery.mockReturnValue({ isLoading: false, isError: false, data: { employees: [] }, refetch: retry });
		render(<EmployeesWrapper />);
		fireEvent.change(screen.getByRole("textbox", { name: "Search employees" }), { target: { value: "Maya" } });
		expect(screen.getByText("No employees match your filters")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
		expect(screen.getByRole("textbox", { name: "Search employees" })).toHaveValue("");
		expect(screen.getByText("No employees found")).toBeInTheDocument();
	});
});
