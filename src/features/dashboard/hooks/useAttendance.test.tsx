import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { attendanceApi } from "../api/attendance";
import { useAttendanceHistory, useAttendanceStatus, useClockOut } from "./useAttendance";
import type { Attendance, TodayAttendance } from "../types/attendance";

vi.mock("../api/attendance", () => ({ attendanceApi: { getTodayAttendance: vi.fn(), getAttendanceHistory: vi.fn(), clockOut: vi.fn() } }));
const record: Attendance = { attendanceId: 1, userId: 13, date: "2026-10-27", clockIn: "2026-10-27T15:17:00", clockOut: "2026-10-27T15:19:00", idleMinutes: 2, lateMinutes: 317, createdAt: "", updatedAt: "" };
function wrapper() {
 const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
 return function AttendanceTestProvider({ children }: { children: React.ReactNode }) { return <QueryClientProvider client={client}>{children}</QueryClientProvider>; };
}
describe("attendance summary and history", () => {
 beforeEach(() => vi.clearAllMocks());
 it("keeps a completed idle-only day's total and idle minutes after reload", async () => {
  vi.mocked(attendanceApi.getTodayAttendance).mockResolvedValue({ attendance: record, hasActiveTimer: false, totalWorkedMinutes: 0 });
  const view = renderHook(useAttendanceStatus, { wrapper: wrapper() });
  await waitFor(() => expect(view.result.current.isClockedOut).toBe(true));
  expect(view.result.current.summary).toMatchObject({ totalDuration: "2m", workedDuration: "0m", idleDuration: "2m" });
 });
 it("includes work and idle in the elapsed attendance total", async () => {
  vi.mocked(attendanceApi.getTodayAttendance).mockResolvedValue({ attendance: { ...record, clockIn: "2026-10-27T10:00:00", clockOut: "2026-10-27T11:00:00", idleMinutes: 15 }, hasActiveTimer: false, totalWorkedMinutes: 45 });
  const view = renderHook(useAttendanceStatus, { wrapper: wrapper() });
  await waitFor(() => expect(view.result.current.isClockedOut).toBe(true));
  expect(view.result.current.summary).toMatchObject({ totalDuration: "1h 0m", workedDuration: "45m", idleDuration: "15m" });
 });
 it("refreshes the visible history as soon as clock-out succeeds", async () => {
  let closed = false;
  vi.mocked(attendanceApi.getTodayAttendance).mockImplementation(async (): Promise<TodayAttendance> => ({ attendance: { ...record, clockOut: closed ? record.clockOut : null }, hasActiveTimer: false, totalWorkedMinutes: 0 }));
  vi.mocked(attendanceApi.getAttendanceHistory).mockImplementation(async () => ({ attendances: [{ ...record, clockOut: closed ? record.clockOut : null, workedMinutes: 0, workedDuration: "0m", idleDuration: closed ? "2m" : "0m" }], pagination: { total: 1, perPage: 10, currentPage: 1, totalPages: 1 } }));
  vi.mocked(attendanceApi.clockOut).mockImplementation(async () => { closed = true; return record; });
  const view = renderHook(() => ({ history: useAttendanceHistory(), clockOut: useClockOut() }), { wrapper: wrapper() });
  await waitFor(() => expect(view.result.current.history.data?.records[0].clockOut).toBeNull());
  await act(() => view.result.current.clockOut.mutateAsync());
  await waitFor(() => expect(view.result.current.history.data?.records[0].clockOut).toBe(record.clockOut));
  expect(view.result.current.history.data?.records[0].idleDuration).toBe("2m");
 });
});
