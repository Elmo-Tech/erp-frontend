import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "../page";

vi.mock("next/link", () => ({
	default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

vi.mock("@/store/authStore", () => ({
	useAuthStore: () => ({
		user: { name: "Admin", userId: 1 },
	}),
}));

vi.mock("@/features/dashboard/hooks/useTasks", () => ({
	useMyAssignedTasks: () => ({ data: { tasks: [] } }),
}));

vi.mock("@/features/dashboard/hooks/useDashboardStats", () => ({
	useDashboardStats: vi.fn(),
}));

import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats";

const mockUseDashboardStats = vi.mocked(useDashboardStats);

const renderWithClient = (ui: React.ReactNode) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});

	return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe("DashboardPage", () => {
	beforeAll(() => {
		vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 800, 240));
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	beforeEach(() => {
		vi.clearAllMocks();
		mockUseDashboardStats.mockReturnValue({
			isLoading: false,
			isError: false,
			data: {
				success: true,
				message: "ok",
				data: {
					role: "admin",
					liveWork: { activeTimerCount: 2, working: [{ userId: 2, name: "Working Employee", taskId: 1, taskTitle: "Build interface", projectId: 1, startedAt: "2026-10-25T10:00:00Z" }], idle: [{ userId: 3, name: "Idle Employee" }] },
					stats: {
						totalProjects: 2,
						projectsChange: 5,
						monthlySales: 12500,
						salesChange: 10,
						workHours: 80,
						workHoursChange: 3,
						activeClients: 4,
						clientsChange: 1,
						activeProjects: 1,
						completedProjects: 1,
						openTasks: 8,
						overdueTasks: 2,
						employeesCount: 5,
						todayAttendance: 4,
					},
					recentProjects: [],
					recentActivities: [],
					timeline: [],
				},
			},
		} as unknown as ReturnType<typeof useDashboardStats>);
	});

	it("renders the admin KPI, operational charts, and delivery timeline", () => {
		renderWithClient(<DashboardPage />);

		expect(screen.getByText("Running Timers")).toBeInTheDocument();
		expect(screen.getByText("Working Employee")).toBeInTheDocument();
		expect(screen.getByText("Build interface")).toBeInTheDocument();
		expect(screen.getByText("Idle Employee")).toBeInTheDocument();
		expect(screen.getByText("Project portfolio")).toBeInTheDocument();
		expect(screen.getByText("Task attention")).toBeInTheDocument();
		expect(screen.getByText("Delivery timeline")).toBeInTheDocument();
	});
});
