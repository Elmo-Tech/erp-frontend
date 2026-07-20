import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskExecutionTabs } from "../TaskExecutionTabs";
import type { ProjectTask } from "../../api/execution.api";
import { TaskPriority } from "@/shared/lib/statusHelpers";

const mutationStub = {
	mutate: vi.fn(),
	isPending: false,
};

vi.mock("../../api/execution.api", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../../api/execution.api")>();

	return {
		...actual,
		useToggleDeliverable: () => mutationStub,
		useCreateDeliverable: () => mutationStub,
		useUpdateDeliverable: () => mutationStub,
		useDeleteDeliverable: () => mutationStub,
	};
});

const task: ProjectTask = {
	taskId: 10,
	projectId: 2,
	milestoneId: null,
	title: "Build Login",
	description: "Ship the login workflow with QA-ready deliverables.",
	status: "in_progress",
	statusLabel: "In Progress",
	priority: TaskPriority.MEDIUM,
	estimatedHours: 2,
	startDate: "2026-06-10",
	dueDate: "2026-06-12",
	assigneeId: 7,
	isInBacklog: false,
	totalLoggedMinutes: 75,
	assignee: { userId: 7, name: "Mona", avatar: null },
	milestone: null,
	deliverables: [
		{
			deliverableId: 41,
			taskId: 10,
			title: "Wire authenticated dashboard",
			isCompleted: true,
			createdAt: "2026-06-12T08:00:00.000Z",
			updatedAt: "2026-06-12T09:15:00.000Z",
		},
	],
	timeEntries: [
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
	],
	createdAt: "2026-06-01T10:00:00.000Z",
	updatedAt: "2026-06-02T10:00:00.000Z",
};

describe("TaskExecutionTabs", () => {
	it("keeps execution details and persisted time logs in one tabbed surface", async () => {
		render(
			<TaskExecutionTabs
				task={task}
				projectId={2}
				totalLogged="1h 15m"
				access={{
					isDone: false,
					canToggleDeliverables: true,
					canCreateDeliverables: true,
					canEditDeliverables: true,
					canDeleteDeliverables: true,
					canLogTime: true,
					canEditTimeEntry: () => true,
					canDeleteTimeEntry: () => true,
				}}
				handlers={{
					onLogTime: vi.fn(),
					onEditTimeEntry: vi.fn(),
					onDeleteTimeEntry: vi.fn(),
				}}
			/>,
		);

		expect(screen.getByRole("tab", { name: /execution/i })).toBeInTheDocument();
		expect(screen.getByText("Ship the login workflow with QA-ready deliverables.")).toBeInTheDocument();
		expect(screen.getByText("Wire authenticated dashboard")).toBeInTheDocument();

		const timeLogsTab = screen.getByRole("tab", { name: /time logs/i });
		fireEvent.mouseDown(timeLogsTab, { button: 0, ctrlKey: false });
		fireEvent.mouseUp(timeLogsTab);
		fireEvent.click(timeLogsTab);

		await waitFor(() => expect(screen.getByText("Time Entries")).toBeInTheDocument());
		expect(screen.getAllByText("1h 15m")).toHaveLength(2);
		expect(screen.getByText("Mona Hassan")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /log time/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /edit time entry/i })).toBeInTheDocument();
	});
});
