import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UpdateProjectForm } from "../UpdateProjectForm";
import { ProjectStatus } from "@/features/projects/types/project";

const mutateAsync = vi.fn();

vi.mock("@/features/projects/hooks/useProjects", () => ({
	useUpdateProject: () => ({ mutateAsync, isPending: false }),
}));

vi.mock("@/features/settings/hooks/useLookupOptions", () => ({
	useLookupOptions: () => ({ data: { data: [] }, isLoading: false }),
}));

vi.mock("@/components/shared", () => ({
	FormDialog: ({ children, onSubmit, submitLabel, isSubmitDisabled }: { children: React.ReactNode; onSubmit: () => void; submitLabel: string; isSubmitDisabled: boolean }) => (
		<div>
			{children}
			<button
				type="button"
				disabled={isSubmitDisabled}
				onClick={onSubmit}
			>
				{submitLabel}
			</button>
		</div>
	),
}));

vi.mock("../ProjectFormFields", () => ({
	ProjectFormFields: ({ form }: { form: { register: (name: string) => Record<string, unknown> } }) => (
		<div>
			<input
				aria-label="Project Title"
				{...form.register("title")}
			/>
		</div>
	),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

describe("UpdateProjectForm", () => {
	it("allows project updates when budget is hidden from the API response", async () => {
		mutateAsync.mockResolvedValueOnce({});

		render(
			<UpdateProjectForm
				open
				onOpenChange={vi.fn()}
				project={{
				projectId: 1,
				clientId: 1,
				projectTypeId: 3,
				quotationId: null,
					title: "QA Project",
					description: "",
					status: ProjectStatus.ACTIVE,
					previousStatus: null,
					budget: null,
					deadline: null,
					uiApprovedAt: null,
					tasks: [],
					createdAt: "2026-07-05T00:00:00.000Z",
					updatedAt: "2026-07-05T00:00:00.000Z",
					createdBy: null,
					updatedBy: null,
				} as never}
			/>
		);

		const submit = screen.getByRole("button", { name: "Update Project" });
		await waitFor(() => expect(submit).not.toBeDisabled());

		fireEvent.click(submit);

		await waitFor(() =>
			expect(mutateAsync).toHaveBeenCalledWith({
				id: 1,
				payload: expect.objectContaining({ projectTypeId: 3 }),
			})
		);
		expect(mutateAsync.mock.calls[0][0].payload).not.toHaveProperty("budget");
	});
});
