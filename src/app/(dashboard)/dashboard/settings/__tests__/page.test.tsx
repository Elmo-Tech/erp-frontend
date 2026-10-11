import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import SettingsPage from "../page";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock("@/features/settings/components/LookupOptionsManager", () => ({ LookupOptionsManager: () => <p>Lookup settings</p> }));
vi.mock("@/features/settings/components/TagsManager", () => ({ TagsManager: () => null }));
vi.mock("@/features/settings/components/GoogleDriveSettings", () => ({ GoogleDriveSettings: () => null }));
vi.mock("@/features/hr/components/HrPoliciesSettings", () => ({ HrPoliciesSettings: () => null }));
vi.mock("@/features/hr/components/LeaveTypesSettings", () => ({ LeaveTypesSettings: () => null }));
vi.mock("@/features/hr/components/DeductionTypesSettings", () => ({ DeductionTypesSettings: () => <p>Create deduction type</p> }));

it("excludes Create an active deduction type from the simplified supported UI", () => {
	render(<SettingsPage />);
	expect(screen.queryByRole("tab", { name: "Deduction Types" })).not.toBeInTheDocument();
	expect(screen.queryByText("Create deduction type")).not.toBeInTheDocument();
});
