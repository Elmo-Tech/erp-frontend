import type { ReminderMessages } from "../i18n/messages";

export type DesktopPermission = NotificationPermission | "unsupported";

export const REMINDER_NOTIFICATION_TAG = "elmo-time-reminder";

export function getDesktopPermission(): DesktopPermission {
	if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
	return window.Notification.permission;
}

/**
 * Must only be called from an explicit user action (e.g. clicking "Enable desktop reminders").
 * Never call this on page load.
 */
export async function requestDesktopPermission(): Promise<DesktopPermission> {
	if (getDesktopPermission() === "unsupported") return "unsupported";
	try {
		return await window.Notification.requestPermission();
	} catch {
		return getDesktopPermission();
	}
}

let activeNotification: Notification | null = null;

/** Shows the reminder as a desktop notification. Returns false if the browser refused. */
export function showDesktopReminder(messages: ReminderMessages, body: string): boolean {
	if (getDesktopPermission() !== "granted") return false;
	try {
		activeNotification?.close();
		const notification = new window.Notification(messages.title, {
			body,
			tag: REMINDER_NOTIFICATION_TAG,
			lang: messages.lang,
			dir: messages.dir,
			icon: "/logo.webp",
			silent: false,
		});
		notification.onclick = () => {
			window.focus();
			notification.close();
		};
		activeNotification = notification;
		return true;
	} catch {
		// Some platforms (e.g. Android Chrome) only allow notifications from a service worker.
		return false;
	}
}

export function closeDesktopReminder() {
	activeNotification?.close();
	activeNotification = null;
}
