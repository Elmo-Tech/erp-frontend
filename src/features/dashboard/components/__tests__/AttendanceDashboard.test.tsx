/**
 * AttendanceDashboard Component Tests
 * Basic functionality tests for the attendance dashboard widget
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AttendanceDashboard } from "../AttendanceDashboard";

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

describe("AttendanceDashboard", () => {
	it("renders without crashing", () => {
		renderWithQueryClient(<AttendanceDashboard />);
		// Component should render either loading state or content
		expect(screen.getByText(/Loading attendance|Today's Attendance|Not Clocked In/)).toBeInTheDocument();
	});

	it("renders in compact mode without crashing", () => {
		const { container } = renderWithQueryClient(<AttendanceDashboard compact />);
		// Component should render in compact mode
		expect(container.firstChild).toBeInTheDocument();
	});
});
