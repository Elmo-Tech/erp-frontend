import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
					stats: {
						totalProjects: 2,
						projectsChange: 5,
						monthlySales: 12500,
						salesChange: 10,
						workHours: 80,
						workHoursChange: 3,
						activeClients: 4,
						clientsChange: 1,
					},
					recentProjects: [],
					recentActivities: [],
				},
			},
		} as unknown as ReturnType<typeof useDashboardStats>);
	});

	it("renders the admin monthly sales KPI from live dashboard data", () => {
		renderWithClient(<DashboardPage />);

		expect(screen.getByText("Monthly Sales")).toBeInTheDocument();
		expect(screen.getByText("$12,500")).toBeInTheDocument();
	});
});
