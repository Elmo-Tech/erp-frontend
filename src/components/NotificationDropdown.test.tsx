import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationDropdown } from "./NotificationDropdown";
import { useNotificationStore } from "@/store/notificationStore";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/axios", () => ({ default: { post: vi.fn().mockResolvedValue({}) } }));

describe("HR notifications", () => {
 beforeEach(() => { push.mockReset(); useNotificationStore.setState({ notifications: [], unreadCount: 0 }); });
 it.each([
  ["leave_submitted", "2027-02-01 to 2027-02-03", "/dashboard/employees/12?review=leave&month=2027-02"],
  ["permission_pending", "2026-11-10", "/dashboard/employees/12?review=permission&month=2026-11"],
  ["leave_approved", "2026-11-10", "/dashboard/my-requests"],
 ])("opens the relevant review for %s", (type, body, destination) => {
  useNotificationStore.setState({ notifications: [{ notificationId: "1", type, message: "Request update", data: { employee_id: 12, body }, readAt: new Date().toISOString(), createdAt: new Date().toISOString() }], unreadCount: 0 });
  render(<NotificationDropdown />);
  fireEvent.keyDown(screen.getByRole("button", { name: /Notifications/ }), { key: "Enter" });
  fireEvent.click(screen.getByText("Request update"));
  expect(push).toHaveBeenCalledWith(destination);
 });
});
