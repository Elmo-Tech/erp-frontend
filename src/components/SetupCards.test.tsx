import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { SetupCards } from "./SetupCards";
import { enableBrowserPush } from "@/lib/desktopPush";

const state = vi.hoisted(() => ({ userId: 42, prompt: null as null | object, install: vi.fn(), installed: false }));
vi.mock("@/store/authStore", () => ({ useAuthStore: (selector: (value: unknown) => unknown) => selector({ user: { userId: state.userId } }) }));
vi.mock("@/components/PwaInstall", () => ({ usePwaInstall: () => ({ prompt: state.prompt, install: state.install, installed: state.installed, error: null }) }));
vi.mock("@/lib/axios", () => ({ default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } }));
vi.mock("@/lib/desktopPush", () => ({ PUSH_CHANGED_EVENT: "erp-push-subscription-changed", enableBrowserPush: vi.fn(), subscriptionMatchesKey: vi.fn(() => true) }));

const prefs = { enabled: true, publicKey: "key", reminderMinutes: 15, intervals: [15] };
let saved: Map<string, string>;
function device(ua: string, standalone = false, permission = "default", existing: unknown = null) {
	vi.stubGlobal("navigator", { userAgent: ua, platform: "", maxTouchPoints: 0, serviceWorker: { getRegistration: vi.fn().mockResolvedValue({ pushManager: { getSubscription: vi.fn().mockResolvedValue(existing) } }) } });
	vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: standalone, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
	vi.stubGlobal("isSecureContext", true);
	vi.stubGlobal("Notification", { permission, requestPermission: vi.fn() });
	vi.stubGlobal("PushManager", function PushManager() {});
}
function show() {
	const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
	return render(<QueryClientProvider client={client}><SetupCards /></QueryClientProvider>);
}
beforeEach(() => {
	saved = new Map();
	vi.mocked(localStorage.getItem).mockImplementation((key) => saved.get(key) ?? null);
	vi.mocked(localStorage.setItem).mockImplementation((key, value) => { saved.set(key, String(value)); });
	state.userId = 42; state.prompt = null; state.installed = false; state.install.mockReset();
	vi.mocked(api.get).mockResolvedValue({ data: { data: prefs } });
	vi.mocked(api.post).mockResolvedValue({ data: { data: { registered: false } } });
	vi.mocked(enableBrowserPush).mockReset().mockResolvedValue(undefined);
});
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

it("guides an iPhone user to install before prompting for notifications", async () => {
	device("Mozilla/5.0 (iPhone) AppleWebKit");
	show();
	expect(screen.getByRole("region", { name: "Install the app" })).toBeVisible();
	fireEvent.click(screen.getByRole("button", { name: "How to install" }));
	expect(screen.getByText(/Add to Home Screen/)).toBeVisible();
	fireEvent.click(screen.getByRole("button", { name: "Later" }));
	expect(screen.queryByRole("region", { name: "Set up notifications" })).not.toBeInTheDocument();
	expect(saved.get("erp:setup:install:later:v1:42")).toBeTruthy();
});

it("uses the Android browser installation prompt, and permits a seven-day deferment", async () => {
	device("Mozilla/5.0 (Linux; Android 14)");
	state.prompt = {}; show();
	fireEvent.click(screen.getByRole("button", { name: "Install app" }));
	expect(state.install).toHaveBeenCalledOnce();
	fireEvent.click(screen.getByRole("button", { name: "Later" }));
	expect(await screen.findByRole("region", { name: "Set up notifications" })).toBeVisible();
	fireEvent.click(screen.getByRole("button", { name: "Later" }));
	expect(saved.get("erp:setup:notification:later:v1:42")).toBeTruthy();
});

it("checks the current subscription belongs to the current account before hiding the card", async () => {
	device("Desktop Chrome", false, "granted", { endpoint: "https://fcm.googleapis.com/test" });
	vi.mocked(api.post).mockResolvedValue({ data: { data: { registered: true } } });
	show();
	await waitFor(() => expect(api.post).toHaveBeenCalledWith("/notifications/push-subscriptions/status", { endpoint: "https://fcm.googleapis.com/test" }, expect.anything()));
	await waitFor(() => expect(screen.queryByRole("region", { name: "Set up notifications" })).not.toBeInTheDocument());
});

it("offers to register an existing permission for the current account and hides after verification", async () => {
	device("Desktop Chrome", false, "granted", { endpoint: "https://fcm.googleapis.com/test" });
	vi.mocked(api.post).mockResolvedValueOnce({ data: { data: { registered: false } } }).mockResolvedValue({ data: { data: { registered: true } } });
	vi.mocked(enableBrowserPush).mockImplementation(async () => { window.dispatchEvent(new Event("erp-push-subscription-changed")); });
	show();
	fireEvent.click(await screen.findByRole("button", { name: "Enable notifications" }));
	await waitFor(() => expect(enableBrowserPush).toHaveBeenCalledWith("key", api));
	await waitFor(() => expect(screen.queryByRole("region", { name: "Set up notifications" })).not.toBeInTheDocument());
});

it("keeps the card visible when the test push fails after registration", async () => {
	device("Desktop Chrome", false, "granted", { endpoint: "https://fcm.googleapis.com/test" });
	vi.mocked(api.post).mockImplementation(async (url) => {
		if (url === "/notifications/test-push") throw new Error("Test delivery failed");
		return { data: { data: { registered: false } } };
	});
	show();
	fireEvent.click(await screen.findByRole("button", { name: "Enable notifications" }));
	expect(await screen.findByText("Test delivery failed")).toBeVisible();
	expect(screen.getByRole("region", { name: "Set up notifications" })).toBeVisible();
});

it("explains blocked permissions instead of requesting permission repeatedly", async () => {
	device("Desktop Chrome", false, "denied"); show();
	fireEvent.click(await screen.findByRole("button", { name: "How to allow" }));
	expect(screen.getByText(/Notifications are blocked/)).toBeVisible();
	expect(Notification.requestPermission).not.toHaveBeenCalled();
});

it("explains server configuration and never claims notifications are active", async () => {
	device("iPhone", true, "default");
	vi.mocked(api.get).mockResolvedValue({ data: { data: { ...prefs, enabled: false, publicKey: null } } });
	show();
	expect(await screen.findByText(/not yet configured/)).toBeVisible();
	expect(screen.queryByRole("button", { name: "Enable notifications" })).not.toBeInTheDocument();
});

it("remembers install choices per browser and deferrals per account", async () => {
	device("Android");
	const view = show();
	fireEvent.click(screen.getByRole("button", { name: "Later" }));
	view.unmount();
	state.userId = 77;
	show();
	expect(screen.getByRole("region", { name: "Install the app" })).toBeVisible();
	fireEvent.click(screen.getByRole("button", { name: "Already installed" }));
	expect(saved.get("erp:install:already-added:v1")).toBe("1");
	await act(async () => {});
});

it("directs an iPhone user who already installed the app to open its home-screen icon", () => {
	device("iPhone"); show();
	fireEvent.click(screen.getByRole("button", { name: "Already installed" }));
	expect(screen.getByText(/open The Tables from its home-screen icon/i)).toBeVisible();
	expect(screen.queryByRole("button", { name: "Enable notifications" })).not.toBeInTheDocument();
});

it("shows notification setup in an installed iPhone app", async () => {
	device("iPhone", true); show();
	expect(await screen.findByRole("button", { name: "Enable notifications" })).toBeVisible();
	expect(screen.queryByRole("region", { name: "Install the app" })).not.toBeInTheDocument();
});

it("keeps later hidden for seven days and displays again after expiry", () => {
	device("Android");
	saved.set("erp:setup:install:later:v1:42", String(Date.now() + 60_000));
	const view = show();
	expect(screen.queryByRole("region", { name: "Install the app" })).not.toBeInTheDocument();
	view.unmount();
	saved.set("erp:setup:install:later:v1:42", String(Date.now() - 1));
	show();
	expect(screen.getByRole("region", { name: "Install the app" })).toBeVisible();
});

it("shows iPhone notification settings when an installed app has blocked permission", async () => {
	device("iPhone", true, "denied"); show();
	fireEvent.click(await screen.findByRole("button", { name: "How to allow" }));
	expect(screen.getByText(/iPhone Settings → Notifications → The Tables/)).toBeVisible();
});
