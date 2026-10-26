import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { registerNotificationWorker } from "../desktopPush";

const register = vi.fn();
beforeEach(() => {
	vi.stubGlobal("fetch", vi.fn());
	vi.stubGlobal("navigator", { serviceWorker: { register } });
	register.mockReset();
});
afterEach(() => vi.unstubAllGlobals());

it("reports missing deployed workers instead of a generic browser failure", async () => {
	vi.mocked(fetch).mockResolvedValue(new Response("Not found", { status: 404 }));
	await expect(registerNotificationWorker()).rejects.toThrow("HTTP 404");
	expect(register).not.toHaveBeenCalled();
});

it("rejects an HTML login/proxy response at the script URL", async () => {
	vi.mocked(fetch).mockResolvedValue(new Response("<html>Login</html>", { headers: { "content-type": "text/html" } }));
	await expect(registerNotificationWorker()).rejects.toThrow("returned a page instead of JavaScript");
	expect(register).not.toHaveBeenCalled();
});

it("bypasses worker update caches and returns the registered worker", async () => {
	vi.mocked(fetch).mockResolvedValue(new Response("self.addEventListener('push', () => {})", { headers: { "content-type": "application/javascript; charset=utf-8" } }));
	const registration = { active: { state: "activated" } };
	register.mockResolvedValue(registration);
	await expect(registerNotificationWorker()).resolves.toBe(registration);
	expect(register).toHaveBeenCalledWith("/push-sw.js", { scope: "/", updateViaCache: "none" });
});

it("distinguishes a browser registration failure from a missing server asset", async () => {
	vi.mocked(fetch).mockResolvedValue(new Response("worker", { headers: { "content-type": "text/javascript" } }));
	register.mockRejectedValue(new Error("Unknown error when fetching script"));
	await expect(registerNotificationWorker()).rejects.toMatchObject({ message: expect.stringContaining("script is reachable"), technicalDetails: "Unknown error when fetching script" });
});
