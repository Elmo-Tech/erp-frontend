import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskFormDialog } from "../TaskFormDialog";
import { TaskType } from "@/features/dashboard/types/task";

vi.mock("@/features/dashboard/hooks/useTasks", () => ({
	useCreateTask: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useUpdateTask: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useTags: () => ({ data: [] }),
}));

vi.mock("../../../hooks/useProjectMembers", () => ({
	useProjectMembers: () => ({ data: { members: [] } }),
}));

vi.mock("@/store/authStore", () => ({
	useAuthStore: () => ({ user: { userId: 1 } }),
}));

vi.mock("@/features/settings/hooks/useLookupOptions", () => ({ useLookupOptions: () => ({ data: { data: [] }, isLoading: false, isError: false }) }));

vi.mock("@/features/admin/hooks/useEnums", () => ({
	useTaskCategories: () => ({ data: { data: [{ value: "ui_ux", label: "UI/UX" }] } }),
}));

vi.mock("@/components/shared", () => ({
	FormDialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	FormInput: () => null,
	FormTextarea: () => null,
	FormDatePicker: () => null,
	FormSelect: ({ label, options }: { label: string; options: Array<{ value: string; label: string }> }) => (
		<label>
			{label}
			<select aria-label={label}>
				{options.map((option) => (
					<option
						key={option.value}
						value={option.value}
					>
						{option.label}
					</option>
				))}
			</select>
		</label>
	),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

describe("TaskFormDialog", () => {
	it("offers a visible no-category option", () => {
		render(
			<TaskFormDialog
				projectId={1}
				open
				onOpenChange={vi.fn()}
				defaultType={TaskType.MAIN}
			/>
		);

		expect(screen.getByRole("option", { name: "No category" })).toBeInTheDocument();
	});
});
