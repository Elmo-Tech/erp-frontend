import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it, vi } from "vitest";

it("confirms a test only after the browser accepts showing the notification", async () => {
 const handlers: Record<string, (event: unknown) => void> = {};
 const postMessage = vi.fn();
 let complete!: () => void;
 const showNotification = vi.fn(() => new Promise<void>((resolve) => { complete = resolve; }));
 const worker = {
  addEventListener: (name: string, callback: (event: unknown) => void) => { handlers[name] = callback; },
  registration: { showNotification },
  clients: { matchAll: vi.fn().mockResolvedValue([{ postMessage }]) },
 };
 runInNewContext(readFileSync("public/push-sw.js", "utf8"), { self: worker, URL });
 let result!: Promise<void>;
 handlers.push({ data: { json: () => ({ type: "notification_test", testId: "test-123", message: "ERP" }) }, waitUntil: (promise: Promise<void>) => { result = promise; } });
 expect(postMessage).not.toHaveBeenCalled();
 complete();
 await result;
 expect(postMessage).toHaveBeenCalledWith({ type: "notification_test_received", testId: "test-123" });
});
