import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import SettingsPage from "../page";
import { useAuthStore } from "@/store/authStore";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock("@/features/settings/components/LookupOptionsManager", () => ({ LookupOptionsManager: () => <p>Lookup settings</p> }));
vi.mock("@/features/settings/components/TagsManager", () => ({ TagsManager: () => null }));
vi.mock("@/features/settings/components/GoogleDriveSettings", () => ({ GoogleDriveSettings: () => null }));
vi.mock("@/features/hr/components/HrPoliciesSettings", () => ({ HrPoliciesSettings: () => null }));
vi.mock("@/features/hr/components/LeaveTypesSettings", () => ({ LeaveTypesSettings: () => null }));
vi.mock("@/features/hr/components/DeductionTypesSettings", () => ({ DeductionTypesSettings: () => <p>Create deduction type</p> }));

it("lets the super admin manage direct deduction types in simplified mode", () => {
	useAuthStore.setState({ role: "super-admin" });
	const { unmount } = render(<SettingsPage />);
	fireEvent.mouseDown(screen.getByRole("tab", { name: "Deduction Types" }), { button: 0, ctrlKey: false });
	expect(screen.getByText("Create deduction type")).toBeVisible();
	unmount();
	useAuthStore.setState({ role: null, permissions: [] });
});

it("hides deduction type management from users without HR permissions", () => {
	useAuthStore.setState({ role: "employee", permissions: [] });
	render(<SettingsPage />);
	expect(screen.queryByRole("tab", { name: "Deduction Types" })).not.toBeInTheDocument();
	expect(screen.queryByText("Create deduction type")).not.toBeInTheDocument();
});
