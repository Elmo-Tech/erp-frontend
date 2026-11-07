import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import SettingsPage from "../page";
import { useAuthStore } from "@/store/authStore";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock("@/features/settings/components/LookupOptionsManager", () => ({ LookupOptionsManager: () => <p>Lookup settings</p> }));
vi.mock("@/features/settings/components/GlobalWorkflowSettings", () => ({ GlobalWorkflowSettings: () => <p>Workflow settings</p> }));
vi.mock("@/features/settings/components/TagsManager", () => ({ TagsManager: () => null }));
vi.mock("@/features/settings/components/GoogleDriveSettings", () => ({ GoogleDriveSettings: () => null }));
vi.mock("@/features/hr/components/HrPoliciesSettings", () => ({ HrPoliciesSettings: () => null }));
vi.mock("@/features/hr/components/LeaveTypesSettings", () => ({ LeaveTypesSettings: () => null }));
vi.mock("@/features/hr/components/DeductionTypesSettings", () => ({ DeductionTypesSettings: () => <p>Create deduction type</p> }));

it("keeps HR settings accessible without the removed deduction type section", () => {
	useAuthStore.setState({ role: "super-admin" });
	const { unmount } = render(<SettingsPage />);
	expect(screen.getByRole("tab", { name: "HR Policies" })).toBeVisible();
	expect(screen.queryByRole("tab", { name: "Deduction Types" })).not.toBeInTheDocument();
	unmount();
	useAuthStore.setState({ role: null, permissions: [] });
});

it("hides deduction type management from users without HR permissions", () => {
	useAuthStore.setState({ role: "employee", permissions: [] });
	render(<SettingsPage />);
	expect(screen.queryByRole("tab", { name: "Deduction Types" })).not.toBeInTheDocument();
	expect(screen.queryByText("Create deduction type")).not.toBeInTheDocument();
});
