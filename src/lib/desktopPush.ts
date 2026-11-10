export class NotificationSetupError extends Error {
	constructor(message: string, public readonly technicalDetails?: string) {
		super(message);
		this.name = "NotificationSetupError";
	}
}

/** Check the actual deployed asset before asking the browser to install it. */
export async function registerNotificationWorker(): Promise<ServiceWorkerRegistration> {
	let response: Response;
	try {
		response = await fetch("/push-sw.js", { cache: "no-store", redirect: "error" });
	} catch {
		throw new NotificationSetupError("The notification script could not be downloaded. Check the connection and any browser extensions filtering this website, then try again.");
	}
	if (!response.ok) {
		throw new NotificationSetupError(`The notification script is unavailable (HTTP ${response.status}). Redeploy the frontend with public/push-sw.js included.`);
	}
	if (!/\b(?:java|ecma)script\b/i.test(response.headers.get("content-type") ?? "")) {
		throw new NotificationSetupError("The notification script URL returned a page instead of JavaScript. Check the frontend deployment and proxy routing for /push-sw.js.");
	}
	try {
		const registration = await navigator.serviceWorker.register("/push-sw.js", { scope: "/", updateViaCache: "none" });
		if (registration.active) return registration;
		let timeout: ReturnType<typeof setTimeout> | undefined;
		try {
			return await Promise.race([
				navigator.serviceWorker.ready,
				new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error("Notification worker activation timed out")), 15_000); }),
			]);
		} finally { if (timeout) clearTimeout(timeout); }
	} catch (error) {
		throw new NotificationSetupError(
			"The script is reachable, but this browser could not register notifications. Check this site's browser permissions and extensions. If it still fails, try an updated Chrome or Edge browser.",
			error instanceof Error ? error.message : String(error),
		);
	}
}

export const PUSH_CHANGED_EVENT = "erp-push-subscription-changed";

export function applicationKey(key: string): Uint8Array<ArrayBuffer> {
	const bytes = atob(key.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - key.length % 4) % 4));
	return Uint8Array.from(bytes, (char) => char.charCodeAt(0));
}

export function subscriptionMatchesKey(subscription: PushSubscription, key: string): boolean {
	const existing = subscription.options?.applicationServerKey;
	if (!existing) return true;
	const oldKey = new Uint8Array(existing);
	const newKey = applicationKey(key);
	return oldKey.length === newKey.length && oldKey.every((byte, index) => byte === newKey[index]);
}

/** Call from a click handler: browsers require user activation for permission. */
export async function enableBrowserPush(publicKey: string, api: { post: (url: string, data: unknown) => Promise<unknown>; delete: (url: string, options: { data: { endpoint: string } }) => Promise<unknown> }): Promise<void> {
	if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window) || !window.isSecureContext) {
		throw new Error("Notifications are not supported in this browser. Use an up-to-date supported browser.");
	}
	const permission = await Notification.requestPermission();
	if (permission !== "granted") throw new Error("Allow notifications in your browser or device settings, then try again.");
	const registration = await registerNotificationWorker();
	let subscription = await registration.pushManager.getSubscription();
	if (subscription && !subscriptionMatchesKey(subscription, publicKey)) {
		await api.delete("/notifications/push-subscriptions", { data: { endpoint: subscription.endpoint } });
		await subscription.unsubscribe();
		subscription = null;
	}
	subscription ??= await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: applicationKey(publicKey) });
	await api.post("/notifications/push-subscriptions", subscription.toJSON());
	window.dispatchEvent(new Event(PUSH_CHANGED_EVENT));
}
