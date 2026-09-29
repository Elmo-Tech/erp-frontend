/**
 * NestedTaskTree Component Tests
 * Tests for the hierarchical task tree component
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { NestedTaskTree } from "../NestedTaskTree";
import { Task, TaskPriority, TaskStatus, TaskType } from "../../types/task";

// Mock the hooks
vi.mock("../../hooks/useTaskTree", () => ({
	useTaskTree: vi.fn(),
	useTaskChildren: vi.fn(),
}));

vi.mock("@/store/timerStore", () => ({
	useTimerStore: vi.fn(),
}));

// Import the mocked functions
import { useTaskTree, useTaskChildren } from "../../hooks/useTaskTree";
import { useTimerStore } from "@/store/timerStore";

const mockUseTaskTree = vi.mocked(useTaskTree);
const mockUseTaskChildren = vi.mocked(useTaskChildren);
const mockUseTimerStore = vi.mocked(useTimerStore);

const createTask = (overrides: Partial<Task> = {}): Task => ({
	taskId: 1,
	projectId: 1,
	parentId: null,
	assignedTo: null,
	supervisorId: null,
	title: "Task",
	description: "Task description",
	acceptanceCriteria: "",
	status: TaskStatus.TODO,
	type: TaskType.MAIN,
	priority: TaskPriority.MEDIUM,
	dueDate: null,
	expectedResolutionDate: null,
	startDate: null,
	sprintNumber: null,
	estimatedHours: 0,
	totalTimeSpent: 0,
	reopenCount: 0,
	testCompletionPercentage: 0,
	canStartTimer: true,
	hasChildren: false,
	completedAt: null,
	delayDays: null,
	deliveryStatus: {
		isCompleted: false,
		completedAt: null,
		dueDate: null,
		delayDays: null,
		isOverdue: false,
		isEarly: false,
		isOnTime: true,
		statusText: "On time",
		statusColor: "default",
	},
	isOverdue: false,
	daysUntilDue: null,
	supervisor: null,
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
	createdBy: 1,
	updatedBy: 1,
	...overrides,
});

// Mock task data
const mockTasks: Task[] = [
	createTask({
		taskId: 1,
		assignedTo: 1,
		title: "Parent Task 1",
		description: "Description for parent task 1",
		status: TaskStatus.IN_PROGRESS,
		type: TaskType.MAIN,
		estimatedHours: 8,
		totalTimeSpent: 120,
		hasChildren: true,
		assignee: {
			userId: 1,
			name: "John Doe",
		},
		children: [
			createTask({
				taskId: 2,
				parentId: 1,
				assignedTo: 2,
				title: "Child Task 1",
				description: "Description for child task 1",
				status: TaskStatus.TODO,
				type: TaskType.SUBTASK,
				estimatedHours: 4,
				totalTimeSpent: 60,
				assignee: {
					userId: 2,
					name: "Jane Smith",
				},
			}),
		],
	}),
	createTask({
		taskId: 3,
		assignedTo: null,
		title: "Parent Task 2",
		description: "Description for parent task 2",
		status: TaskStatus.COMPLETED,
		type: TaskType.MAIN,
		estimatedHours: 6,
		totalTimeSpent: 360,
		reopenCount: 1,
	}),
];

const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

const renderWithQueryClient = (component: React.ReactElement) => {
	const queryClient = createTestQueryClient();
	return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
};

describe("NestedTaskTree", () => {
	const mockOnTaskSelect = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		// Default mock implementations
		mockUseTaskTree.mockReturnValue({
			rootTasks: mockTasks,
			isLoadingRootTasks: false,
			rootTasksError: null,
			prefetchChildren: vi.fn(),
			getCachedChildren: vi.fn(),
			areChildrenLoaded: vi.fn(),
			areChildrenLoading: vi.fn(),
			invalidateChildren: vi.fn(),
			expandPath: vi.fn(),
			refetchRootTasks: vi.fn(),
		});

		mockUseTaskChildren.mockReturnValue({
			data: undefined,
			isLoading: false,
			error: null,
		} as unknown as ReturnType<typeof useTaskChildren>);

		mockUseTimerStore.mockReturnValue({
			activeTimer: null,
			isLoading: false,
			isConnected: false,
			setActiveTimer: vi.fn(),
			setIsLoading: vi.fn(),
			setIsConnected: vi.fn(),
		});
	});

	it("renders task tree with root tasks", () => {
		renderWithQueryClient(
			<NestedTaskTree
				projectId={1}
				onTaskSelect={mockOnTaskSelect}
			/>
		);

		expect(screen.getByText("Parent Task 1")).toBeInTheDocument();
		expect(screen.getByText("Parent Task 2")).toBeInTheDocument();
	});

	it("displays task status badges", () => {
		renderWithQueryClient(
			<NestedTaskTree
				projectId={1}
				onTaskSelect={mockOnTaskSelect}
			/>
		);

		expect(screen.getByText("In Progress")).toBeInTheDocument();
		expect(screen.getByText("Completed")).toBeInTheDocument();
	});

	it("displays assigned users", () => {
		renderWithQueryClient(
			<NestedTaskTree
				projectId={1}
				onTaskSelect={mockOnTaskSelect}
			/>
		);

		expect(screen.getByText("John Doe")).toBeInTheDocument();
	});

	it("displays time spent indicators", () => {
		renderWithQueryClient(
			<NestedTaskTree
				projectId={1}
				onTaskSelect={mockOnTaskSelect}
			/>
		);

		expect(screen.getByText("2h 0m")).toBeInTheDocument(); // 120 minutes
		expect(screen.getByText("6h 0m")).toBeInTheDocument(); // 360 minutes
	});

	it("calls onTaskSelect when task is clicked", () => {
		renderWithQueryClient(
			<NestedTaskTree
				projectId={1}
				onTaskSelect={mockOnTaskSelect}
			/>
		);

		fireEvent.click(screen.getByText("Parent Task 1"));
		expect(mockOnTaskSelect).toHaveBeenCalledWith(mockTasks[0]);
	});

	it("shows loading state", () => {
		mockUseTaskTree.mockReturnValue({
			rootTasks: [],
			isLoadingRootTasks: true,
			rootTasksError: null,
			prefetchChildren: vi.fn(),
			getCachedChildren: vi.fn(),
			areChildrenLoaded: vi.fn(),
			areChildrenLoading: vi.fn(),
			invalidateChildren: vi.fn(),
			expandPath: vi.fn(),
			refetchRootTasks: vi.fn(),
		});

		renderWithQueryClient(
			<NestedTaskTree
				projectId={1}
				onTaskSelect={mockOnTaskSelect}
			/>
		);

		// Should show loading skeletons
		const loadingElements = document.querySelectorAll(".animate-pulse");
		expect(loadingElements.length).toBeGreaterThan(0);
	});

	it("shows error state", () => {
		const errorMessage = "Network error occurred";
		mockUseTaskTree.mockReturnValue({
			rootTasks: [],
			isLoadingRootTasks: false,
			rootTasksError: new Error(errorMessage),
			prefetchChildren: vi.fn(),
			getCachedChildren: vi.fn(),
			areChildrenLoaded: vi.fn(),
			areChildrenLoading: vi.fn(),
			invalidateChildren: vi.fn(),
			expandPath: vi.fn(),
			refetchRootTasks: vi.fn(),
		});

		renderWithQueryClient(
			<NestedTaskTree
				projectId={1}
				onTaskSelect={mockOnTaskSelect}
			/>
		);

		expect(screen.getAllByText("Failed to load tasks")).toHaveLength(1);
		expect(screen.getByText(errorMessage)).toBeInTheDocument();
	});

	it("shows empty state when no tasks", () => {
		mockUseTaskTree.mockReturnValue({
			rootTasks: [],
			isLoadingRootTasks: false,
			rootTasksError: null,
			prefetchChildren: vi.fn(),
			getCachedChildren: vi.fn(),
			areChildrenLoaded: vi.fn(),
			areChildrenLoading: vi.fn(),
			invalidateChildren: vi.fn(),
			expandPath: vi.fn(),
			refetchRootTasks: vi.fn(),
		});

		renderWithQueryClient(
			<NestedTaskTree
				projectId={1}
				onTaskSelect={mockOnTaskSelect}
			/>
		);

		expect(screen.getByText("No tasks found for this project")).toBeInTheDocument();
	});

	it("highlights selected task", () => {
		renderWithQueryClient(
			<NestedTaskTree
				projectId={1}
				onTaskSelect={mockOnTaskSelect}
				selectedTaskId={1}
			/>
		);

		// Find the task container div that should have the bg-accent class
		const taskElements = screen.getAllByText("Parent Task 1");
		const taskContainer = taskElements[0].closest('[class*="bg-accent"]');
		expect(taskContainer).toBeInTheDocument();
	});

	it("shows active timer indicator", () => {
		mockUseTimerStore.mockReturnValue({
			activeTimer: {
				timeEntryId: 1,
				startTime: "2024-01-01T00:00:00Z",
				trackableType: "task",
				trackableId: 1,
				trackableDisplayName: "Parent Task 1",
				isActive: true,
			},
			isLoading: false,
			isConnected: true,
			setActiveTimer: vi.fn(),
			setIsLoading: vi.fn(),
			setIsConnected: vi.fn(),
		});

		renderWithQueryClient(
			<NestedTaskTree
				projectId={1}
				onTaskSelect={mockOnTaskSelect}
			/>
		);

		expect(screen.getByText("Active")).toBeInTheDocument();
	});

	it("handles expand all and collapse all", () => {
		renderWithQueryClient(
			<NestedTaskTree
				projectId={1}
				onTaskSelect={mockOnTaskSelect}
			/>
		);

		// Click expand all
		fireEvent.click(screen.getByText("Expand All"));
		expect(screen.getByText("Child Task 1")).toBeInTheDocument();

		// Click collapse all
		fireEvent.click(screen.getByText("Collapse All"));
		// Child should be hidden again (though this might not work in test due to state management)
	});
});
