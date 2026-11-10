import { afterEach, expect, it, vi } from "vitest";
import { enableBrowserPush, PUSH_CHANGED_EVENT } from "../desktopPush";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("requests permission from the click and registers the subscription on the current account", async () => {
	const subscription = { endpoint: "https://fcm.googleapis.com/test", options: { applicationServerKey: Uint8Array.from([1, 2]).buffer }, toJSON: () => ({ endpoint: "https://fcm.googleapis.com/test", keys: { p256dh: "key", auth: "auth" } }), unsubscribe: vi.fn() };
	const subscribe = vi.fn().mockResolvedValue(subscription);
	const registration = { active: true, pushManager: { getSubscription: vi.fn().mockResolvedValue(null), subscribe } };
	vi.stubGlobal("navigator", { serviceWorker: { register: vi.fn().mockResolvedValue(registration) } });
	vi.stubGlobal("isSecureContext", true);
	vi.stubGlobal("PushManager", function PushManager() {});
	const requestPermission = vi.fn().mockResolvedValue("granted");
	vi.stubGlobal("Notification", { requestPermission });
	vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("worker", { headers: { "content-type": "text/javascript" } })));
	const api = { post: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}) };
	const changed = vi.fn(); window.addEventListener(PUSH_CHANGED_EVENT, changed);
	const pending = enableBrowserPush("AQI", api);
	expect(requestPermission).toHaveBeenCalledOnce();
	await pending;
	expect(subscribe).toHaveBeenCalledWith(expect.objectContaining({ userVisibleOnly: true, applicationServerKey: Uint8Array.from([1, 2]) }));
	expect(api.post).toHaveBeenCalledWith("/notifications/push-subscriptions", subscription.toJSON());
	expect(changed).toHaveBeenCalledOnce();
	window.removeEventListener(PUSH_CHANGED_EVENT, changed);
});

it("does not register when permission is denied", async () => {
	vi.stubGlobal("navigator", { serviceWorker: {} }); vi.stubGlobal("isSecureContext", true);
	vi.stubGlobal("PushManager", function PushManager() {});
	vi.stubGlobal("Notification", { requestPermission: vi.fn().mockResolvedValue("denied") });
	const api = { post: vi.fn(), delete: vi.fn() };
	await expect(enableBrowserPush("AQI", api)).rejects.toThrow("Allow notifications");
	expect(api.post).not.toHaveBeenCalled();
});

it("replaces a subscription made with a different push key", async () => {
	const previous = { endpoint: "https://fcm.googleapis.com/old", options: { applicationServerKey: Uint8Array.from([3, 4]).buffer }, unsubscribe: vi.fn().mockResolvedValue(true) };
	const next = { endpoint: "https://fcm.googleapis.com/new", toJSON: () => ({ endpoint: "https://fcm.googleapis.com/new" }) };
	const registration = { active: true, pushManager: { getSubscription: vi.fn().mockResolvedValue(previous), subscribe: vi.fn().mockResolvedValue(next) } };
	vi.stubGlobal("navigator", { serviceWorker: { register: vi.fn().mockResolvedValue(registration) } });
	vi.stubGlobal("isSecureContext", true); vi.stubGlobal("PushManager", function PushManager() {});
	vi.stubGlobal("Notification", { requestPermission: vi.fn().mockResolvedValue("granted") });
	vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("worker", { headers: { "content-type": "text/javascript" } })));
	const api = { post: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}) };
	await enableBrowserPush("AQI", api);
	expect(api.delete).toHaveBeenCalledWith("/notifications/push-subscriptions", { data: { endpoint: previous.endpoint } });
	expect(previous.unsubscribe).toHaveBeenCalledOnce();
	expect(api.post).toHaveBeenCalledWith("/notifications/push-subscriptions", next.toJSON());
});
