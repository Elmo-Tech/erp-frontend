import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { useNotificationStore } from "../notification.store";
import { useNotifications } from "../use-notification-actions";

vi.mock("@/shared/api/base", () => ({
	default: {
		get: vi.fn(),
		patch: vi.fn(),
	},
}));

const mockedApi = api as unknown as {
	get: Mock;
};

describe("useNotifications", () => {
	it("normalizes backend paginated database notifications for the bell", async () => {
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
		mockedApi.get.mockResolvedValueOnce({
			data: {
				data: {
					notifications: [
						{
							id: "abc",
							type: "App\\Modules\\Notification\\Notifications\\MeetingScheduledNotification",
							data: { title: "Meeting scheduled", message: "Discovery Call", url: "/dashboard/calendar" },
							read_at: null,
							created_at: "2026-05-14T09:00:00.000000Z",
						},
					],
				},
			},
		});

		const { result } = renderHook(() => useNotifications(20), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(useNotificationStore.getState().notifications[0]).toMatchObject({
			notificationId: "abc",
			title: "Meeting scheduled",
			body: "Discovery Call",
			readAt: null,
		});
	});
});
