import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { ExecutionTaskStatus } from "../../api/execution.api";
import { TaskExecutionHeader } from "../TaskExecutionHeader";
import { Sheet, SheetContent } from "@/shared/ui/sheet";

const statusOptions = [
	{ value: ExecutionTaskStatus.TO_DO, label: "To Do" },
	{ value: ExecutionTaskStatus.IN_PROGRESS, label: "In Progress" },
];

function renderHeader(header: ReactElement) {
	return render(
		<Sheet open>
			<SheetContent>{header}</SheetContent>
		</Sheet>,
	);
}

describe("TaskExecutionHeader", () => {
	it("renders task meta and exposes the running timer action", () => {
		const onTimerToggle = vi.fn();

		renderHeader(
			<TaskExecutionHeader
				taskTitle="Build Login"
				taskStatus={ExecutionTaskStatus.IN_PROGRESS}
				totalLogged="1h 15m"
				estimatedHours={2}
				assigneeName="Hisham Atef"
				currentStatusColor="bg-blue-100 text-blue-700 border-blue-200"
				allowedStatusOptions={statusOptions}
				isDone={false}
				isTimerRunning
				canWriteTimeEntries
				isStatusPending={false}
				isTimerPending={false}
				onStatusChange={vi.fn()}
				onTimerToggle={onTimerToggle}
			/>,
		);

		expect(screen.getByText("Build Login")).toBeInTheDocument();
		expect(screen.getByText("Logged:")).toBeInTheDocument();
		expect(screen.getByText("1h 15m")).toBeInTheDocument();
		expect(screen.getByText("Estimated:")).toBeInTheDocument();
		expect(screen.getByText("2h")).toBeInTheDocument();
		expect(screen.getByText("Hisham Atef")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: /stop timer/i }));

		expect(onTimerToggle).toHaveBeenCalledTimes(1);
	});

	it("hides the timer action when time entry writes are not allowed", () => {
		renderHeader(
			<TaskExecutionHeader
				taskTitle="Build Login"
				taskStatus={ExecutionTaskStatus.TO_DO}
				totalLogged="0m"
				estimatedHours={null}
				assigneeName={null}
				currentStatusColor="bg-slate-100 text-slate-700 border-slate-200"
				allowedStatusOptions={statusOptions}
				isDone={false}
				isTimerRunning={false}
				canWriteTimeEntries={false}
				isStatusPending={false}
				isTimerPending={false}
				onStatusChange={vi.fn()}
				onTimerToggle={vi.fn()}
			/>,
		);

		expect(screen.queryByRole("button", { name: /start timer/i })).not.toBeInTheDocument();
	});
});
