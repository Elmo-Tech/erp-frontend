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
