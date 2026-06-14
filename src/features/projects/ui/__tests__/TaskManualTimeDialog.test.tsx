import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import type { ManualTimeFormData } from "../../model/use-task-manual-time-dialog";
import { TaskManualTimeDialog } from "../TaskManualTimeDialog";

function ManualTimeDialogHarness({ isEditing = false, onSubmit = vi.fn() }: { isEditing?: boolean; onSubmit?: () => void }) {
	const form = useForm<ManualTimeFormData>({
		defaultValues: {
			date: "2026-06-13",
			startTime: "09:00",
			endTime: "10:00",
			note: "",
		},
	});

	return (
		<TaskManualTimeDialog
			open
			form={form}
			isEditing={isEditing}
			isLoading={false}
			onOpenChange={vi.fn()}
			onSubmit={onSubmit}
		/>
	);
}

describe("TaskManualTimeDialog", () => {
	it("renders manual time fields for a new time entry", () => {
		render(<ManualTimeDialogHarness />);

		expect(screen.getByRole("dialog", { name: /log time manually/i })).toBeInTheDocument();
		expect(screen.getByText("Record past work time for this task.")).toBeInTheDocument();
		expect(screen.getByText("Date")).toBeInTheDocument();
		expect(screen.getByLabelText("Start time")).toBeInTheDocument();
		expect(screen.getByLabelText("End time")).toBeInTheDocument();
		expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /log time/i })).toBeInTheDocument();
	});

	it("renders edit copy when editing an existing time entry", () => {
		render(<ManualTimeDialogHarness isEditing />);

		expect(screen.getByRole("dialog", { name: /edit time entry/i })).toBeInTheDocument();
		expect(screen.getByText("Update the recorded work time for this task.")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /save time/i })).toBeInTheDocument();
	});
});
