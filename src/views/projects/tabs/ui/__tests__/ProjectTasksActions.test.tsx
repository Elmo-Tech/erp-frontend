import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { ProjectTasksActionHeader, ProjectTasksEmptyState } from "../ProjectTasksActions";

function grantProjectTaskPermissions() {
	useAuthStore.setState({
		user: { userId: 1, name: "Admin", email: "admin@example.test", avatar: "", role: "admin" },
		permissions: [
			{ permissionName: "manage_projects", access: true },
			{ permissionName: "manage_all_projects", access: true },
			{ permissionName: "create_tasks", access: true },
			{ permissionName: "manage_tasks", access: true },
		],
	});
}

describe("ProjectTasksActions", () => {
	beforeEach(() => {
		useAuthStore.setState({
			user: null,
			permissions: [],
		});
	});

	it("renders task counts and runs header actions", () => {
		grantProjectTaskPermissions();
		const onAddMilestone = vi.fn();
		const onAddTask = vi.fn();

		render(
			<ProjectTasksActionHeader
				milestoneCount={1}
				taskCount={2}
				canAddMilestones
				canAddTasks
				onAddMilestone={onAddMilestone}
				onAddTask={onAddTask}
			/>,
		);

		expect(screen.getByText("1 milestone · 2 tasks")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Add Milestone" }));
		fireEvent.click(screen.getByRole("button", { name: "Add Task" }));

		expect(onAddMilestone).toHaveBeenCalledTimes(1);
		expect(onAddTask).toHaveBeenCalledTimes(1);
	});

	it("renders empty state actions only when the caller allows creation", () => {
		grantProjectTaskPermissions();
		const onAddMilestone = vi.fn();
		const onAddTask = vi.fn();

		const { rerender } = render(
			<ProjectTasksEmptyState
				canAddMilestones
				canAddTasks
				onAddMilestone={onAddMilestone}
				onAddTask={onAddTask}
			/>,
		);

		expect(screen.getByText("No tasks yet")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Add Milestone" }));
		fireEvent.click(screen.getByRole("button", { name: "Add Task" }));
		expect(onAddMilestone).toHaveBeenCalledTimes(1);
		expect(onAddTask).toHaveBeenCalledTimes(1);

		rerender(
			<ProjectTasksEmptyState
				canAddMilestones={false}
				canAddTasks={false}
				onAddMilestone={onAddMilestone}
				onAddTask={onAddTask}
			/>,
		);

		expect(screen.queryByRole("button", { name: "Add Milestone" })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Add Task" })).not.toBeInTheDocument();
	});

	it("shows task creation for the global project-management umbrella", () => {
		useAuthStore.setState({ permissions: [{ permissionName: "manage_all_projects", access: true }] });

		render(
			<ProjectTasksActionHeader
				milestoneCount={0}
				taskCount={0}
				canAddMilestones={false}
				canAddTasks
				onAddMilestone={vi.fn()}
				onAddTask={vi.fn()}
			/>,
		);

		expect(screen.getByRole("button", { name: "Add Task" })).toBeInTheDocument();
	});
});
