import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuditLogViewer } from "../AuditLogViewer";
import type { AuditLogEntry, AuditLogListResponse } from "../../types";

vi.mock("../../hooks/useAuditLogs", () => ({
	useAuditLogs: vi.fn(),
	useAuditLogActionTypes: vi.fn(),
}));

vi.mock("../../hooks", () => ({
	useAdminPermissions: vi.fn(),
}));

import { useAuditLogs, useAuditLogActionTypes } from "../../hooks/useAuditLogs";
import { useAdminPermissions } from "../../hooks";

const mockUseAuditLogs = vi.mocked(useAuditLogs);
const mockUseAuditLogActionTypes = vi.mocked(useAuditLogActionTypes);
const mockUseAdminPermissions = vi.mocked(useAdminPermissions);

const createAuditLogsResult = (
	overrides: Partial<ReturnType<typeof useAuditLogs>> = {}
): ReturnType<typeof useAuditLogs> =>
	({
		data: listResponse,
		isLoading: false,
		error: null,
		refetch: vi.fn(),
		...overrides,
	}) as unknown as ReturnType<typeof useAuditLogs>;

const createAuditLogActionTypesResult = (
	overrides: Partial<ReturnType<typeof useAuditLogActionTypes>> = {}
): ReturnType<typeof useAuditLogActionTypes> =>
	({
		data: ["login", "update_internal_cost"],
		isLoading: false,
		...overrides,
	}) as unknown as ReturnType<typeof useAuditLogActionTypes>;

const auditLogs: AuditLogEntry[] = [
	{
		id: 1,
		userId: 1,
		userName: "John Doe",
		action: "update_internal_cost",
		eventType: "admin_action",
		severity: "warning",
		description: "Update internal cost for User #1",
		auditableType: "App\\Models\\User",
		auditableId: 1,
		ipAddress: "192.168.1.1",
		userAgent: "Mozilla/5.0",
		createdAt: "2024-01-01T10:00:00Z",
		isSensitive: true,
		metadata: { oldCost: "50.00", newCost: "60.00" },
	},
	{
		id: 2,
		userId: 2,
		userName: "Jane Smith",
		action: "login",
		eventType: "security",
		severity: "info",
		description: "Login",
		auditableType: "App\\Models\\User",
		auditableId: 2,
		ipAddress: "192.168.1.2",
		userAgent: "Mozilla/5.0",
		createdAt: "2024-01-01T11:00:00Z",
		isSensitive: false,
		metadata: {},
	},
];

const listResponse: AuditLogListResponse = {
	auditLogs,
	pagination: {
		total: 2,
		count: 2,
		perPage: 20,
		currentPage: 1,
		totalPages: 1,
	},
};

describe("AuditLogViewer", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		mockUseAdminPermissions.mockReturnValue({
			canViewAuditLogs: true,
		} as ReturnType<typeof useAdminPermissions>);

		mockUseAuditLogs.mockReturnValue(createAuditLogsResult());

		mockUseAuditLogActionTypes.mockReturnValue(createAuditLogActionTypesResult());
	});

	it("shows a permission error when the user lacks access", () => {
		mockUseAdminPermissions.mockReturnValue({
			canViewAuditLogs: false,
		} as ReturnType<typeof useAdminPermissions>);

		render(<AuditLogViewer />);

		expect(screen.getByText(/permission to view audit logs/i)).toBeInTheDocument();
	});

	it("renders the audit log table and statistics", () => {
		render(<AuditLogViewer />);

		expect(screen.getByText("Audit Log Viewer")).toBeInTheDocument();
		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("Jane Smith")).toBeInTheDocument();
		expect(screen.getByText("Showing 2 of 2")).toBeInTheDocument();
		expect(screen.getByText("Sensitive actions in current view")).toBeInTheDocument();
	});

	it("shows the loading state", () => {
		mockUseAuditLogs.mockReturnValue(createAuditLogsResult({
			data: undefined,
			isLoading: true,
		}));

		render(<AuditLogViewer />);

		expect(screen.getByText("Audit Logs")).toBeInTheDocument();
	});

	it("shows the error state", () => {
		mockUseAuditLogs.mockReturnValue(createAuditLogsResult({
			data: undefined,
			isLoading: false,
			error: new Error("Failed to load audit logs"),
		}));

		render(<AuditLogViewer />);

		expect(screen.getByText("Error loading data")).toBeInTheDocument();
		expect(screen.getByText("Failed to load audit logs")).toBeInTheDocument();
	});

	it("shows the empty state when no logs are returned", () => {
		mockUseAuditLogs.mockReturnValue(createAuditLogsResult({
			data: {
				auditLogs: [],
				pagination: {
					total: 0,
					count: 0,
					perPage: 20,
					currentPage: 1,
					totalPages: 0,
				},
			},
		}));

		render(<AuditLogViewer />);

		expect(screen.getByText("No audit logs found")).toBeInTheDocument();
	});
});
