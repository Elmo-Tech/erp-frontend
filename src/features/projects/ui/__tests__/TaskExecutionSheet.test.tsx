import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskExecutionSheet } from "../TaskExecutionSheet";
import type { ProjectTask } from "../../api/execution.api";
import { useAuthStore } from "@/entities/user/model/auth.store";

const mutationStub = {
	mutate: vi.fn(),
	mutateAsync: vi.fn(),
	isPending: false,
};

vi.mock("../../api/execution.api", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../../api/execution.api")>();

	return {
		...actual,
		useToggleDeliverable: () => mutationStub,
		useCompleteTask: () => mutationStub,
		useToggleTaskTimer: () => mutationStub,
		useCreateDeliverable: () => mutationStub,
		useUpdateDeliverable: () => mutationStub,
		useDeleteDeliverable: () => mutationStub,
		useUpdateTaskStatus: () => mutationStub,
		useLogManualTime: () => mutationStub,
		useUpdateTimeEntry: () => mutationStub,
		useDeleteTimeEntry: () => mutationStub,
		useProjectMembers: () => ({ data: [], isLoading: false }),
	};
});

const task: ProjectTask = {
	taskId: 10,
	projectId: 2,
	milestoneId: null,
	title: "Build operations dashboard",
	description: "Ship the first usable execution surface.",
	status: "to_do",
	statusLabel: "To Do",
	estimatedHours: 4,
	startDate: "2026-06-10",
	dueDate: "2026-06-12",
	assigneeId: 7,
	isInBacklog: false,
	totalLoggedMinutes: 0,
	assignee: { userId: 7, name: "Mona", avatar: null },
	milestone: null,
	deliverables: [],
	timeEntries: [],
	createdAt: "2026-06-01T10:00:00.000Z",
	updatedAt: "2026-06-02T10:00:00.000Z",
};

describe("TaskExecutionSheet", () => {
	it("hides controls that are not backed by persisted backend contracts or permissions", () => {
		useAuthStore.setState({
			user: { userId: 7, name: "Mona", email: "mona@example.test", avatar: "", role: "developer" },
			permissions: [],
		});

		render(
			<TaskExecutionSheet
				task={task}
				projectId={2}
				open
				onOpenChange={vi.fn()}
			/>,
		);

		expect(screen.queryByRole("tab", { name: /notes/i })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /upload/i })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /start timer/i })).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole("tab", { name: /time logs/i }));

		expect(screen.queryByRole("button", { name: /log time/i })).not.toBeInTheDocument();
	});
});
