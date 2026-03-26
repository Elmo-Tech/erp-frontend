import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AttendanceDashboard } from "../attendance/AttendanceDashboard";

vi.mock("../../hooks/useAttendance", () => ({
	useAttendanceStatus: vi.fn(),
	useClockOut: vi.fn(),
}));

vi.mock("@/store/timerStore", () => ({
	useTimerStore: vi.fn(),
}));

import { useAttendanceStatus, useClockOut } from "../../hooks/useAttendance";
import { useTimerStore } from "@/store/timerStore";

const mockUseAttendanceStatus = vi.mocked(useAttendanceStatus);
const mockUseClockOut = vi.mocked(useClockOut);
const mockUseTimerStore = vi.mocked(useTimerStore);

describe("AttendanceDashboard", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		mockUseAttendanceStatus.mockReturnValue({
			summary: {
				clockInTime: null,
				clockOutTime: null,
			},
			isLoading: false,
			error: null,
			refetch: vi.fn(),
			isClocked: false,
			isClockedOut: false,
			hasActiveTimer: false,
		} as ReturnType<typeof useAttendanceStatus>);

		mockUseClockOut.mockReturnValue({
			mutateAsync: vi.fn(),
			isPending: false,
		} as ReturnType<typeof useClockOut>);

		mockUseTimerStore.mockReturnValue({
			activeTimer: null,
		} as ReturnType<typeof useTimerStore>);
	});

	it("renders the default attendance state", () => {
		render(<AttendanceDashboard />);

		expect(screen.getByText("Today's Attendance")).toBeInTheDocument();
		expect(screen.getByText("Not Clocked In")).toBeInTheDocument();
	});

	it("renders a loading state", () => {
		mockUseAttendanceStatus.mockReturnValue({
			summary: {
				clockInTime: null,
				clockOutTime: null,
			},
			isLoading: true,
			error: null,
			refetch: vi.fn(),
			isClocked: false,
			isClockedOut: false,
			hasActiveTimer: false,
		} as ReturnType<typeof useAttendanceStatus>);

		render(<AttendanceDashboard />);

		expect(screen.getByText("Loading attendance...")).toBeInTheDocument();
	});

	it("renders in compact mode", () => {
		render(<AttendanceDashboard compact />);

		expect(screen.getByText("Not Clocked In")).toBeInTheDocument();
	});
});
