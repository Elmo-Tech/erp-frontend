/**
 * UserPerformanceCard Component Tests
 * Tests for the user performance card component functionality
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { UserPerformanceCard } from "../UserPerformanceCard";
import { UserPerformance } from "../../types";

// Mock Next.js Link component
import { vi } from "vitest";

vi.mock("next/link", () => ({
	default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

const mockUserPerformance: UserPerformance = {
	userId: 1,
	name: "John Doe",
	email: "john.doe@example.com",
	avatar: "https://example.com/avatar.jpg",
	totalTrackedMinutes: 480, // 8 hours
	totalIdleMinutes: 60, // 1 hour
	taskCompletionRate: 85.5,
	averageBounceRate: 5.2,
	attendanceDays: 22,
	completedTasks: 15,
	totalTasks: 18,
};

const mockUserWithConcerns: UserPerformance = {
	userId: 2,
	name: "Jane Smith",
	email: "jane.smith@example.com",
	totalTrackedMinutes: 240, // 4 hours
	totalIdleMinutes: 180, // 3 hours (high idle time)
	taskCompletionRate: 65.0, // Low completion rate
	averageBounceRate: 25.0, // High bounce rate
	attendanceDays: 12,
	completedTasks: 8,
	totalTasks: 12,
};

describe("UserPerformanceCard", () => {
	it("renders user information correctly", () => {
		render(<UserPerformanceCard user={mockUserPerformance} />);

		// Check user name and email are displayed
		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
	});

	it("displays performance metrics correctly", () => {
		render(<UserPerformanceCard user={mockUserPerformance} />);

		// Check completion rate
		expect(screen.getByText("85.5%")).toBeInTheDocument();
		expect(screen.getByText("15/18 tasks")).toBeInTheDocument();

		// Check bounce rate
		expect(screen.getByText("5.2%")).toBeInTheDocument();

		// Check attendance
		expect(screen.getByText("22 days")).toBeInTheDocument();
	});

	it("formats time correctly", () => {
		render(<UserPerformanceCard user={mockUserPerformance} />);

		// Should show tracked time (8 hours)
		expect(screen.getByText("8h")).toBeInTheDocument();
	});

	it("highlights concerning metrics in red", () => {
		render(<UserPerformanceCard user={mockUserWithConcerns} />);

		// Should show concerning badges for poor performance
		expect(screen.getByText("Needs Support")).toBeInTheDocument();
		expect(screen.getByText("High Idle Time")).toBeInTheDocument();
		expect(screen.getByText("Quality Issues")).toBeInTheDocument();
	});

	it("shows positive indicators for good performance", () => {
		render(<UserPerformanceCard user={mockUserPerformance} />);

		// Should show positive badge for good performance
		expect(screen.getByText("Excellent")).toBeInTheDocument();
	});

	it("renders detail link when enabled", () => {
		render(
			<UserPerformanceCard
				user={mockUserPerformance}
				showDetailLink={true}
			/>
		);

		// Should have a link to detailed view
		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "/dashboard/admin/users/1/performance");
	});

	it("does not render detail link when disabled", () => {
		render(
			<UserPerformanceCard
				user={mockUserPerformance}
				showDetailLink={false}
			/>
		);

		// Should not have a link
		expect(screen.queryByRole("link")).not.toBeInTheDocument();
	});

	it("uses custom detail link href when provided", () => {
		const customHref = "/custom/performance/1";
		render(
			<UserPerformanceCard
				user={mockUserPerformance}
				showDetailLink={true}
				detailLinkHref={customHref}
			/>
		);

		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", customHref);
	});

	it("handles user without avatar gracefully", () => {
		const userWithoutAvatar = { ...mockUserPerformance, avatar: undefined };
		render(<UserPerformanceCard user={userWithoutAvatar} />);

		// Should still render the user name
		expect(screen.getByText("John Doe")).toBeInTheDocument();
	});

	it("calculates idle percentage correctly", () => {
		render(<UserPerformanceCard user={mockUserPerformance} />);

		// Total time: 480 + 60 = 540 minutes
		// Idle percentage: (60 / 540) * 100 = 11.1%
		expect(screen.getByText("Idle: 11.1%")).toBeInTheDocument();
		expect(screen.getByText("Tracked: 88.9%")).toBeInTheDocument();
	});

	it("does not display internal hourly cost", () => {
		// This test ensures requirement 13.5 is met
		render(<UserPerformanceCard user={mockUserPerformance} />);

		// Should not contain any cost-related text
		expect(screen.queryByText(/cost/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/hourly/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
	});
});
