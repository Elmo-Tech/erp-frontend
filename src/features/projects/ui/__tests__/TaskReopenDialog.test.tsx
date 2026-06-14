import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskReopenDialog } from "../TaskReopenDialog";

describe("TaskReopenDialog", () => {
	it("renders current and target statuses with a required reason", () => {
		render(
			<TaskReopenDialog
				open
				currentStatusLabel="Done"
				pendingStatusLabel="In Progress"
				reason=""
				isSaving={false}
				onReasonChange={vi.fn()}
				onCancel={vi.fn()}
				onConfirm={vi.fn()}
				onOpenChange={vi.fn()}
			/>,
		);

		expect(screen.getByRole("dialog", { name: /reason for reopening/i })).toBeInTheDocument();
		expect(screen.getByText("Done")).toBeInTheDocument();
		expect(screen.getByText("In Progress")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /confirm reopen/i })).toBeDisabled();
	});

	it("sends reason changes and confirmation actions", () => {
		const onReasonChange = vi.fn();
		const onConfirm = vi.fn();

		render(
			<TaskReopenDialog
				open
				currentStatusLabel="QA"
				pendingStatusLabel="To Do"
				reason="Regression found"
				isSaving={false}
				onReasonChange={onReasonChange}
				onCancel={vi.fn()}
				onConfirm={onConfirm}
				onOpenChange={vi.fn()}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText(/qa found a regression/i), {
			target: { value: "Needs design update" },
		});
		fireEvent.click(screen.getByRole("button", { name: /confirm reopen/i }));

		expect(onReasonChange).toHaveBeenCalledWith("Needs design update");
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});
});
