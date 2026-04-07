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

const createAttendanceStatusResult = (
	overrides: Partial<ReturnType<typeof useAttendanceStatus>> = {}
): ReturnType<typeof useAttendanceStatus> =>
	({
		todayAttendance: undefined,
		isLoading: false,
		error: null,
		refetch: vi.fn(),
		isClocked: false,
		isClockedOut: false,
		hasActiveTimer: false,
		totalWorkedMinutes: 0,
		currentIdleMinutes: undefined,
		getCurrentWorkDuration: vi.fn(() => 0),
		getCurrentIdleTime: vi.fn(() => 0),
		formatDuration: vi.fn((minutes: number) => `${minutes}m`),
		getAttendanceSummary: vi.fn(),
		summary: {
			status: "not_clocked_in",
			message: "Not clocked in",
			clockInTime: null,
			clockOutTime: null,
			totalDuration: "0m",
			workedDuration: "0m",
			idleDuration: "0m",
		},
		...overrides,
	}) as unknown as ReturnType<typeof useAttendanceStatus>;

const createClockOutResult = (
	overrides: Partial<ReturnType<typeof useClockOut>> = {}
): ReturnType<typeof useClockOut> =>
	({
		mutateAsync: vi.fn(),
		isPending: false,
		...overrides,
	}) as unknown as ReturnType<typeof useClockOut>;

describe("AttendanceDashboard", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		mockUseAttendanceStatus.mockReturnValue(createAttendanceStatusResult());

		mockUseClockOut.mockReturnValue(createClockOutResult());

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
		mockUseAttendanceStatus.mockReturnValue(createAttendanceStatusResult({
			isLoading: true,
		}));

		render(<AttendanceDashboard />);

		expect(screen.getByText("Loading attendance...")).toBeInTheDocument();
	});

	it("renders in compact mode", () => {
		render(<AttendanceDashboard compact />);

		expect(screen.getByText("Not Clocked In")).toBeInTheDocument();
	});
});
