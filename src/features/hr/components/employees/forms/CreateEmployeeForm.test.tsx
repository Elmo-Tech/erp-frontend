import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CreateEmployeeForm } from "./CreateEmployeeForm";

const createEmployee = vi.fn().mockResolvedValue({ userId: 7 });
vi.mock("@/features/hr/hooks", () => ({
	useCreateEmployee: () => ({ mutateAsync: createEmployee, isPending: false }),
	useUploadEmployeeAvatar: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("@/features/admin/hooks/useEnums", () => ({ useUserSpecializations: () => ({ data: { data: [] } }) }));

describe("CreateEmployeeForm", () => {
	it("Inspect add employee form fields", async () => {
		render(<CreateEmployeeForm open onOpenChange={vi.fn()} />);
		expect(screen.queryByLabelText("Grace Days/Month")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("Start Time")).not.toBeInTheDocument();
		expect(screen.getByLabelText("Work Hours/Day")).toBeInTheDocument();
		fireEvent.change(screen.getByLabelText("Name"), { target: { value: "New Employee" } });
		fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@example.com" } });
		fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
		const submit = screen.getByRole("button", { name: "Create" });
		await waitFor(() => expect(submit).toBeEnabled());
		fireEvent.click(submit);
		await waitFor(() => expect(createEmployee).toHaveBeenCalled());
		expect(createEmployee.mock.calls[0][0]).not.toHaveProperty("graceDaysAllowed");
		expect(createEmployee.mock.calls[0][0]).not.toHaveProperty("workStartTime");
	});
});
