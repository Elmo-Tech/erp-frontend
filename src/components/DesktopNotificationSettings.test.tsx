import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { DesktopNotificationSettings } from "./DesktopNotificationSettings";

vi.mock("@/lib/axios", () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("sends a test only to the current browser subscription", async () => {
	vi.mocked(api.get).mockResolvedValue({ data: { data: { enabled: true, publicKey: "public", reminderMinutes: 15, intervals: [15] } } });
	vi.mocked(api.post).mockResolvedValue({ data: {} });
	vi.stubGlobal("Notification", { permission: "granted" });
	let onMessage: ((event: MessageEvent) => void) | undefined;
	vi.stubGlobal("navigator", { serviceWorker: { addEventListener: vi.fn((_type, callback) => { onMessage = callback; }), removeEventListener: vi.fn(), getRegistration: vi.fn().mockResolvedValue({ pushManager: { getSubscription: vi.fn().mockResolvedValue({ endpoint: "https://fcm.googleapis.com/test" }) } }) } });
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	render(<QueryClientProvider client={client}><DesktopNotificationSettings /></QueryClientProvider>);
	const button = await screen.findByRole("button", { name: "Send test notification" });
	await waitFor(() => expect(button).toBeEnabled());
	fireEvent.click(button);
	await waitFor(() => expect(api.post).toHaveBeenCalledWith("/notifications/test-push", { endpoint: "https://fcm.googleapis.com/test", testId: expect.any(String) }, { skipSuccessToast: true }));
	expect(await screen.findByRole("status")).toHaveTextContent("Look for a separate notification");
	const testId = (vi.mocked(api.post).mock.calls[0][1] as { testId: string }).testId;
	act(() => onMessage?.({ data: { type: "notification_test_received", testId: "other" } } as MessageEvent));
	expect(screen.getByRole("status")).toHaveTextContent("Sending test");
	act(() => onMessage?.({ data: { type: "notification_test_received", testId } } as MessageEvent));
	expect(screen.getByRole("status")).toHaveTextContent("The browser received the test");
});
