import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { TaskPriority } from "@/shared/lib/statusHelpers";
import { ExecutionTaskStatus, type ProjectTask } from "../../api/execution.api";
import { ProjectTaskCard } from "../ProjectTaskCard";

function makeTask(overrides: Partial<ProjectTask> = {}): ProjectTask {
	return {
		taskId: 10,
		projectId: 2,
		milestoneId: null,
		title: "Build Login",
		description: null,
		status: ExecutionTaskStatus.TO_DO,
		statusLabel: "To Do",
		priority: TaskPriority.MEDIUM,
		estimatedHours: 2,
		startDate: null,
		dueDate: null,
		assigneeId: null,
		isInBacklog: false,
		totalLoggedMinutes: 0,
		assignee: null,
		milestone: null,
		deliverables: [],
		timeEntries: [],
		createdAt: "2026-06-01T10:00:00.000Z",
		updatedAt: "2026-06-02T10:00:00.000Z",
		...overrides,
	};
}

function renderWithQueryClient(children: ReactNode) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});

	return render(<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
}

describe("ProjectTaskCard", () => {
	it("runs edit and delete actions without opening the task sheet", () => {
		const onClick = vi.fn();
		const onEdit = vi.fn();
		const onDelete = vi.fn();

		renderWithQueryClient(
			<ProjectTaskCard
				task={makeTask()}
				projectId={2}
				onClick={onClick}
				canEdit
				canDelete
				onEdit={onEdit}
				onDelete={onDelete}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Edit task: Build Login" }));
		fireEvent.click(screen.getByRole("button", { name: "Delete task: Build Login" }));

		expect(onEdit).toHaveBeenCalledWith(makeTask());
		expect(onDelete).toHaveBeenCalledWith(makeTask());
		expect(onClick).not.toHaveBeenCalled();
	});
});
