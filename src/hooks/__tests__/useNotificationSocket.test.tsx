import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, waitFor } from "@testing-library/react";
import { useNotificationSocketInit } from "../useNotificationSocket";
import { useNotificationStore } from "@/store/notificationStore";

const mocks = vi.hoisted(() => ({
	listen: vi.fn(),
	notification: vi.fn(),
	leave: vi.fn(),
	toastInfo: vi.fn(),
}));

vi.mock("@/lib/echo", () => ({
	getEcho: () => ({
		private: () => ({ listen: mocks.listen, notification: mocks.notification }),
		leave: mocks.leave,
	}),
}));

vi.mock("@/lib/axios", () => ({
	default: {
		get: vi.fn().mockResolvedValue({
			data: { data: { notifications: [], unreadCount: 0 } },
		}),
	},
}));

vi.mock("sonner", () => ({
	toast: { info: mocks.toastInfo },
}));

vi.mock("@/store/authStore", () => ({
	useAuthStore: () => ({ user: { userId: 7 } }),
}));

function SocketInit() {
	useNotificationSocketInit();
	return null;
}

describe("useNotificationSocketInit", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useNotificationStore.setState({ notifications: [], unreadCount: 0, isLoading: true });
	});

	it("adds socket notifications and routes task toast actions to my tasks", async () => {
		render(<SocketInit />);

		await waitFor(() => expect(mocks.listen).toHaveBeenCalledWith(".notification.created", expect.any(Function)));
		expect(mocks.notification).toHaveBeenCalledWith(expect.any(Function));

		const handler = mocks.listen.mock.calls[0][1];
		act(() => {
			handler({
				notificationId: "n1",
				type: "task_assigned",
				message: "Task assigned",
				data: { task_id: 42 },
				createdAt: "2026-06-30T10:00:00.000Z",
			});
		});

		expect(useNotificationStore.getState().unreadCount).toBe(1);
		expect(useNotificationStore.getState().notifications[0].notificationId).toBe("n1");

		const originalLocation = window.location;
		Object.defineProperty(window, "location", {
			configurable: true,
			value: { href: "" },
		});

		mocks.toastInfo.mock.calls[0][1].action.onClick();

		expect(window.location.href).toBe("/dashboard/my-tasks?highlight=42");

		Object.defineProperty(window, "location", {
			configurable: true,
			value: originalLocation,
		});
	});

	it("normalizes Laravel default notification broadcasts", async () => {
		render(<SocketInit />);

		await waitFor(() => expect(mocks.notification).toHaveBeenCalledWith(expect.any(Function)));

		const handler = mocks.notification.mock.calls[0][0];
		act(() => {
			handler({
				id: "n2",
				type: "App\\Notifications\\ProjectStatusChangedNotification",
				data: {
					type: "project_status_changed",
					message: "Project status changed",
					project_id: 99,
				},
				created_at: "2026-07-01T10:00:00.000Z",
			});
		});

		const notification = useNotificationStore.getState().notifications[0];
		expect(notification.notificationId).toBe("n2");
		expect(notification.type).toBe("project_status_changed");
		expect(notification.message).toBe("Project status changed");
		expect(notification.data.project_id).toBe(99);
	});
});
