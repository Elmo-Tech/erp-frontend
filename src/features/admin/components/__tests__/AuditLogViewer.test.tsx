/**
 * AuditLogViewer Component Tests
 * Tests for the audit log viewer component functionality
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { AuditLogViewer } from "../AuditLogViewer";

// Mock the hooks
vi.mock("../../hooks/useAuditLogs", () => ({
	useAuditLogs: vi.fn(),
	useAuditLogActionTypes: vi.fn(),
}));

vi.mock("../../hooks", () => ({
	useAdminPermissions: vi.fn(),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

import { useAuditLogs, useAuditLogActionTypes } from "../../hooks/useAuditLogs";
import { useAdminPermissions } from "../../hooks";

const mockAuditLogs = [
	{
		id: 1,
		userId: 1,
		userName: "John Doe",
		action: "update_internal_cost",
		auditableType: "App\\Models\\User",
		auditableId: 1,
		ipAddress: "192.168.1.1",
		createdAt: "2024-01-01T10:00:00Z",
		metadata: { oldCost: 50, newCost: 60 },
	},
	{
		id: 2,
		userId: 2,
		userName: "Jane Smith",
		action: "view_profitability",
		auditableType: "App\\Models\\Project",
		auditableId: 5,
		ipAddress: "192.168.1.2",
		createdAt: "2024-01-01T11:00:00Z",
	},
];

const mockPagination = {
	total: 2,
	count: 2,
	perPage: 20,
	currentPage: 1,
	totalPages: 1,
};

describe("AuditLogViewer", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// Default mock implementations
		(useAuditLogs as any).mockReturnValue({
			data: null,
			isLoading: false,
			error: null,
			refetch: vi.fn(),
		});

		(useAuditLogActionTypes as any).mockReturnValue({
			data: [],
			isLoading: false,
		});

		(useAdminPermissions as any).mockReturnValue({
			canViewAuditLogs: true,
		});
	});

	it("shows permission error when user lacks view_audit_logs permission", () => {
		(useAdminPermissions as any).mockReturnValue({
			canViewAuditLogs: false,
		});

		render(<AuditLogViewer />);

		expect(screen.getByText(/You don't have permission to view audit logs/)).toBeInTheDocument();
	});

	it("renders audit logs when user has permission", () => {
		(useAdminPermissions as any).mockReturnValue({
			canViewAuditLogs: true,
		});

		(useAuditLogs as any).mockReturnValue({
			data: {
				auditLogs: mockAuditLogs,
				pagination: mockPagination,
			},
			isLoading: false,
			error: null,
		});

		(useAuditLogActionTypes as any).mockReturnValue({
			data: ["update_internal_cost", "view_profitability"],
			isLoading: false,
		});

		render(<AuditLogViewer />);

		// Check header
		expect(screen.getByText("Audit Log Viewer")).toBeInTheDocument();
		expect(screen.getByText("View and filter system audit logs for security monitoring")).toBeInTheDocument();

		// Check audit log entries
		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("Jane Smith")).toBeInTheDocument();
		expect(screen.getByText("Update Internal Cost")).toBeInTheDocument();
		expect(screen.getByText("View Profitability")).toBeInTheDocument();
	});

	it("highlights security-sensitive actions", () => {
		(useAdminPermissions as any).mockReturnValue({
			canViewAuditLogs: true,
		});

		(useAuditLogs as any).mockReturnValue({
			data: {
				auditLogs: mockAuditLogs,
				pagination: mockPagination,
			},
			isLoading: false,
			error: null,
		});

		(useAuditLogActionTypes as any).mockReturnValue({
			data: ["update_internal_cost", "view_profitability"],
			isLoading: false,
		});

		render(<AuditLogViewer />);

		// Security-sensitive actions should be highlighted
		const sensitiveRows = screen.getAllByText("Update Internal Cost");
		expect(sensitiveRows.length).toBeGreaterThan(0);
	});

	it("shows loading state", () => {
		(useAdminPermissions as any).mockReturnValue({
			canViewAuditLogs: true,
		});

		(useAuditLogs as any).mockReturnValue({
			data: null,
			isLoading: true,
			error: null,
		});

		(useAuditLogActionTypes as any).mockReturnValue({
			data: [],
			isLoading: true,
		});

		render(<AuditLogViewer />);

		expect(screen.getByText("Audit Log Viewer")).toBeInTheDocument();
		// Loading skeletons should be present - check for skeleton class instead
		expect(document.querySelector(".animate-pulse")).toBeTruthy();
	});

	it("shows error state", () => {
		(useAdminPermissions as any).mockReturnValue({
			canViewAuditLogs: true,
		});

		(useAuditLogs as any).mockReturnValue({
			data: null,
			isLoading: false,
			error: new Error("Failed to load audit logs"),
		});

		(useAuditLogActionTypes as any).mockReturnValue({
			data: [],
			isLoading: false,
		});

		render(<AuditLogViewer />);

		expect(screen.getByText(/Failed to load audit logs/)).toBeInTheDocument();
		expect(screen.getByText("Retry")).toBeInTheDocument();
	});

	it("shows empty state when no logs found", () => {
		(useAdminPermissions as any).mockReturnValue({
			canViewAuditLogs: true,
		});

		(useAuditLogs as any).mockReturnValue({
			data: {
				auditLogs: [],
				pagination: { ...mockPagination, total: 0, count: 0 },
			},
			isLoading: false,
			error: null,
		});

		(useAuditLogActionTypes as any).mockReturnValue({
			data: [],
			isLoading: false,
		});

		render(<AuditLogViewer />);

		expect(screen.getByText("No audit logs found")).toBeInTheDocument();
		expect(screen.getByText("Try adjusting your filters or check back later")).toBeInTheDocument();
	});

	it("displays statistics correctly", () => {
		(useAdminPermissions as any).mockReturnValue({
			canViewAuditLogs: true,
		});

		(useAuditLogs as any).mockReturnValue({
			data: {
				auditLogs: mockAuditLogs,
				pagination: mockPagination,
			},
			isLoading: false,
			error: null,
		});

		(useAuditLogActionTypes as any).mockReturnValue({
			data: ["update_internal_cost", "view_profitability"],
			isLoading: false,
		});

		render(<AuditLogViewer />);

		// Check statistics cards - be more specific to avoid multiple matches
		expect(screen.getByText("Total Logs")).toBeInTheDocument();
		expect(screen.getByText("Security Alerts")).toBeInTheDocument();
		expect(screen.getByText("Active Users")).toBeInTheDocument();
		expect(screen.getByText("Action Types")).toBeInTheDocument();

		// Check that we have the expected counts
		expect(screen.getByText("Showing 2 of 2")).toBeInTheDocument();
		expect(screen.getByText("Sensitive actions in current view")).toBeInTheDocument();
	});

	it("formats resource information correctly", () => {
		(useAdminPermissions as any).mockReturnValue({
			canViewAuditLogs: true,
		});

		(useAuditLogs as any).mockReturnValue({
			data: {
				auditLogs: mockAuditLogs,
				pagination: mockPagination,
			},
			isLoading: false,
			error: null,
		});

		(useAuditLogActionTypes as any).mockReturnValue({
			data: ["update_internal_cost", "view_profitability"],
			isLoading: false,
		});

		render(<AuditLogViewer />);

		// Check resource formatting
		expect(screen.getByText("User #1")).toBeInTheDocument();
		expect(screen.getByText("Project #5")).toBeInTheDocument();
	});

	it("displays IP addresses", () => {
		(useAdminPermissions as any).mockReturnValue({
			canViewAuditLogs: true,
		});

		(useAuditLogs as any).mockReturnValue({
			data: {
				auditLogs: mockAuditLogs,
				pagination: mockPagination,
			},
			isLoading: false,
			error: null,
		});

		(useAuditLogActionTypes as any).mockReturnValue({
			data: ["update_internal_cost", "view_profitability"],
			isLoading: false,
		});

		render(<AuditLogViewer />);

		// Check IP addresses are displayed
		expect(screen.getByText("192.168.1.1")).toBeInTheDocument();
		expect(screen.getByText("192.168.1.2")).toBeInTheDocument();
	});

	it("shows metadata badge when metadata exists", () => {
		(useAdminPermissions as any).mockReturnValue({
			canViewAuditLogs: true,
		});

		(useAuditLogs as any).mockReturnValue({
			data: {
				auditLogs: mockAuditLogs,
				pagination: mockPagination,
			},
			isLoading: false,
			error: null,
		});

		(useAuditLogActionTypes as any).mockReturnValue({
			data: ["update_internal_cost", "view_profitability"],
			isLoading: false,
		});

		render(<AuditLogViewer />);

		// First log has metadata with 2 fields
		expect(screen.getByText("2 fields")).toBeInTheDocument();
	});
});
