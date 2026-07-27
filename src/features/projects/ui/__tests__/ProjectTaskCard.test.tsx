import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/entities/user/model/auth.store";
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
	beforeEach(() => {
		useAuthStore.setState({
			user: {
				userId: 7,
				name: "Mona Ali",
				email: "mona@example.test",
				avatar: "",
				role: "dev",
			},
		});
	});

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

	it("uses backend allowedActions instead of broader fallback permissions", () => {
		renderWithQueryClient(
			<ProjectTaskCard
				task={makeTask({
					allowedActions: {
						edit: false,
						delete: false,
						execute: false,
						startTimer: false,
						stopTimer: false,
						changeStatus: false,
						complete: false,
						reopen: false,
						createDeliverable: false,
						editDeliverable: false,
						deleteDeliverable: false,
						toggleDeliverable: false,
					},
				})}
				projectId={2}
				onClick={vi.fn()}
				canEdit
				canDelete
			/>,
		);

		expect(screen.queryByRole("button", { name: "Edit task: Build Login" })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Delete task: Build Login" })).not.toBeInTheDocument();
	});

	it("shows the cover, collaborator avatars, and hold controls for a running task", () => {
		renderWithQueryClient(
			<ProjectTaskCard
				task={makeTask({
					coverImageUrl: "https://example.test/task-cover.jpg",
					assigneeIds: [7, 9],
					assignees: [
						{ userId: 7, name: "Mona Ali", avatar: null },
						{ userId: 9, name: "Omar Said", avatar: null },
					],
					status: ExecutionTaskStatus.IN_PROGRESS,
					timeEntries: [
						{
							entryId: 3,
							taskId: 10,
							userId: 7,
							startTime: "2026-06-02T09:00:00.000Z",
							endTime: null,
							durationMinutes: null,
							isManual: false,
							isRunning: true,
							note: null,
							createdAt: "2026-06-02T09:00:00.000Z",
							updatedAt: "2026-06-02T09:00:00.000Z",
						},
					],
					allowedActions: {
						edit: false,
						delete: false,
						execute: true,
						startTimer: true,
						stopTimer: true,
						changeStatus: true,
						complete: false,
						reopen: false,
						createDeliverable: false,
						editDeliverable: false,
						deleteDeliverable: false,
						toggleDeliverable: false,
					},
				})}
				projectId={2}
				onClick={vi.fn()}
			/>,
		);

		expect(screen.getByRole("img", { name: "Build Login cover" })).toHaveStyle({
			backgroundImage: 'url("https://example.test/task-cover.jpg")',
		});
		expect(screen.getByTitle("Mona Ali")).toBeInTheDocument();
		expect(screen.getByTitle("Omar Said")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Hold timer" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "End timer" })).toBeInTheDocument();
	});

	it("does not show another employee's running timer as the current user's timer", () => {
		renderWithQueryClient(
			<ProjectTaskCard
				task={makeTask({
					status: ExecutionTaskStatus.IN_PROGRESS,
					allowedActions: {
						edit: false,
						delete: false,
						execute: true,
						startTimer: true,
						stopTimer: true,
						changeStatus: true,
						complete: false,
						reopen: false,
						createDeliverable: false,
						editDeliverable: false,
						deleteDeliverable: false,
						toggleDeliverable: false,
					},
					timeEntries: [
						{
							entryId: 4,
							taskId: 10,
							userId: 9,
							startTime: "2026-06-02T09:00:00.000Z",
							endTime: null,
							durationMinutes: null,
							isManual: false,
							isRunning: true,
							note: null,
							createdAt: "2026-06-02T09:00:00.000Z",
							updatedAt: "2026-06-02T09:00:00.000Z",
						},
					],
				})}
				projectId={2}
				onClick={vi.fn()}
			/>,
		);

		expect(screen.queryByRole("button", { name: "Hold timer" })).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Start timer" })).toBeInTheDocument();
	});
});
