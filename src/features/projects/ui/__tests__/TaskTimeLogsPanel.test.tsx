import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskTimeLogsPanel } from "../TaskTimeLogsPanel";
import type { ProjectTimeEntry } from "../../api/execution.api";

const timeEntries: ProjectTimeEntry[] = [
	{
		entryId: 31,
		taskId: 10,
		projectId: 2,
		userId: 7,
		startTime: "2026-06-12T08:00:00.000Z",
		endTime: "2026-06-12T09:15:00.000Z",
		durationMinutes: 75,
		isManual: true,
		isRunning: false,
		note: "Reviewed delivery risks.",
		user: { userId: 7, name: "Mona Hassan", avatar: null },
		task: null,
		project: null,
		createdAt: "2026-06-12T09:15:00.000Z",
		updatedAt: "2026-06-12T09:15:00.000Z",
	},
];

describe("TaskTimeLogsPanel", () => {
	it("renders persisted time entries and row actions", () => {
		render(
			<TaskTimeLogsPanel
				timeEntries={timeEntries}
				totalLogged="1h 15m"
				isDone={false}
				canLogTime
				canEditTimeEntry={() => true}
				canDeleteTimeEntry={() => true}
				onLogTime={vi.fn()}
				onEditTimeEntry={vi.fn()}
				onDeleteTimeEntry={vi.fn()}
			/>,
		);

		expect(screen.getByText("Time Entries")).toBeInTheDocument();
		expect(screen.getAllByText("1h 15m")).toHaveLength(2);
		expect(screen.getByText("Mona Hassan")).toBeInTheDocument();
		expect(screen.getByText("Manual")).toBeInTheDocument();
		expect(screen.getByText(/Reviewed delivery risks/)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /log time/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /edit time entry/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /delete time entry/i })).toBeInTheDocument();
	});

	it("hides write controls for read-only users", () => {
		render(
			<TaskTimeLogsPanel
				timeEntries={[]}
				totalLogged="0m"
				isDone={false}
				canLogTime={false}
				canEditTimeEntry={() => false}
				canDeleteTimeEntry={() => false}
				onLogTime={vi.fn()}
				onEditTimeEntry={vi.fn()}
				onDeleteTimeEntry={vi.fn()}
			/>,
		);

		expect(screen.queryByRole("button", { name: /log time/i })).not.toBeInTheDocument();
		expect(screen.getByText("Time entries will appear here once logged.")).toBeInTheDocument();
	});

	it("keeps edit and delete controls independently permissioned", () => {
		render(
			<TaskTimeLogsPanel
				timeEntries={timeEntries}
				totalLogged="1h 15m"
				isDone={false}
				canLogTime={false}
				canEditTimeEntry={() => true}
				canDeleteTimeEntry={() => false}
				onLogTime={vi.fn()}
				onEditTimeEntry={vi.fn()}
				onDeleteTimeEntry={vi.fn()}
			/>,
		);

		expect(screen.getByRole("button", { name: /edit time entry/i })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /delete time entry/i })).not.toBeInTheDocument();
	});
});
