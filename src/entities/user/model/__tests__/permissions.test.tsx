import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore, type Permission } from "../auth.store";
import { useEmployeePermissions, useInvoicePermissions, usePointPermissions, useSalesPermissions } from "../permissions";

function grant(...permissionNames: string[]): Permission[] {
	return permissionNames.map((permissionName) => ({ permissionName, access: true }));
}

describe("permission capabilities", () => {
	beforeEach(() => {
		useAuthStore.setState({ permissions: [] });
	});

	it("treats manage_invoices as the invoice umbrella", () => {
		useAuthStore.setState({ permissions: grant("manage_invoices") });
		const { result } = renderHook(() => useInvoicePermissions());

		expect(result.current).toMatchObject({
			canViewInvoices: true,
			canCreateInvoices: true,
			canEditInvoices: true,
			canDeleteInvoices: true,
			canSendInvoices: true,
			canCancelInvoices: true,
		});
	});

	it("keeps sensitive user actions outside the manage_users umbrella", () => {
		useAuthStore.setState({ permissions: grant("manage_users") });
		const { result } = renderHook(() => useEmployeePermissions());

		expect(result.current).toMatchObject({
			canViewUsers: true,
			canCreateUsers: true,
			canEditUsers: true,
			canDeleteUsers: false,
			canToggleUserStatus: false,
			canAssignUserRoles: false,
			canResetUserCredentials: false,
		});
	});

	it("grants each sensitive user action only from its dedicated permission", () => {
		useAuthStore.setState({ permissions: grant("delete_users", "toggle_user_status", "assign_user_roles", "reset_user_credentials") });
		const { result } = renderHook(() => useEmployeePermissions());

		expect(result.current).toMatchObject({
			canDeleteUsers: true,
			canToggleUserStatus: true,
			canAssignUserRoles: true,
			canResetUserCredentials: true,
			canCreateUsers: false,
			canEditUsers: false,
		});
	});

	it("treats manage_employees as a delete umbrella while supporting exact deletion", () => {
		useAuthStore.setState({ permissions: grant("manage_employees") });
		const manager = renderHook(() => useEmployeePermissions());
		expect(manager.result.current.canDeleteEmployees).toBe(true);
		manager.unmount();

		useAuthStore.setState({ permissions: grant("delete_employees") });
		const exact = renderHook(() => useEmployeePermissions());
		expect(exact.result.current.canDeleteEmployees).toBe(true);
		expect(exact.result.current.canEditEmployees).toBe(false);
	});

	it("applies the sales umbrellas while preserving exact quotation capabilities", () => {
		useAuthStore.setState({ permissions: grant("manage_leads", "manage_contracts", "calculate_quotations") });
		const { result } = renderHook(() => useSalesPermissions());

		expect(result.current).toMatchObject({
			canCreateLeads: true,
			canEditLeads: true,
			canConvertLeads: true,
			canCreateQuotations: true,
			canCalculateQuotations: true,
			canCreateContracts: true,
			canSignContracts: true,
		});
	});

	it("keeps point awards and deductions direction-specific", () => {
		useAuthStore.setState({ permissions: grant("award_points") });
		const { result } = renderHook(() => usePointPermissions());

		expect(result.current.canAwardPoints).toBe(true);
		expect(result.current.canDeductPoints).toBe(false);

		act(() => {
			useAuthStore.setState({ permissions: grant("deduct_points") });
		});

		expect(result.current.canAwardPoints).toBe(false);
		expect(result.current.canDeductPoints).toBe(true);
	});

	it("reacts immediately when employee permissions refresh", () => {
		const { result } = renderHook(() => useEmployeePermissions());
		expect(result.current.canEditEmployees).toBe(false);

		act(() => {
			useAuthStore.setState({ permissions: grant("edit_employees", "view_employee_salary") });
		});

		expect(result.current.canEditEmployees).toBe(true);
		expect(result.current.canViewEmployeeSalary).toBe(true);
	});
});
