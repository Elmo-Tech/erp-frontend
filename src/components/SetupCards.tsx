"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, CheckCircle2, Download, Share, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/components/PwaInstall";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { enableBrowserPush, PUSH_CHANGED_EVENT, subscriptionMatchesKey } from "@/lib/desktopPush";
import { handleApiError } from "@/lib/errorHandling";
import type { NotificationPreferences } from "@/components/DesktopNotificationSettings";

const DELAY = 7 * 24 * 60 * 60 * 1000;
const DEVICE_INSTALLED_KEY = "erp:install:already-added:v1";
const DEVICE_CHANGED = "erp-device-setup-changed";
const UNKNOWN_DEVICE = "";
type Device = { mobile: boolean; ios: boolean; standalone: boolean; installAcknowledged: boolean };

function readStorage(key: string): string | null {
	try { return localStorage.getItem(key); } catch { return null; }
}
function writeStorage(key: string, value: string): void {
	try { localStorage.setItem(key, value); } catch { /* The choice still applies for this page session. */ }
}
function deviceSnapshot(): string {
	const ua = navigator.userAgent;
	const ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
	const android = /Android/i.test(ua);
	const standalone = (typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches) || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
	return JSON.stringify({ mobile: ios || android, ios, standalone, installAcknowledged: readStorage(DEVICE_INSTALLED_KEY) === "1" });
}
function subscribeDevice(notify: () => void): () => void {
	const media = window.matchMedia?.("(display-mode: standalone)");
	window.addEventListener("storage", notify);
	window.addEventListener(DEVICE_CHANGED, notify);
	media?.addEventListener?.("change", notify);
	return () => { window.removeEventListener("storage", notify); window.removeEventListener(DEVICE_CHANGED, notify); media?.removeEventListener?.("change", notify); };
}
function untilKey(kind: string, userId: number): string { return `erp:setup:${kind}:later:v1:${userId}`; }
function isDeferred(kind: string, userId: number): boolean { return Number(readStorage(untilKey(kind, userId))) > Date.now(); }

/** Mounted inside ProtectedRoute, so prompts are scoped to a signed-in user. */
export function SetupCards() {
	const userId = useAuthStore((state) => state.user?.userId);
	if (!userId) return null;
	return <UserSetupCards key={userId} userId={userId} />;
}

function UserSetupCards({ userId }: { userId: number }) {
	const deviceValue = useSyncExternalStore(subscribeDevice, deviceSnapshot, () => UNKNOWN_DEVICE);
	const device: Device | null = deviceValue ? JSON.parse(deviceValue) : null;
	const { prompt, install, installed, error: installError } = usePwaInstall();
	const client = useQueryClient();
	const [installDeferred, setInstallDeferred] = useState(() => isDeferred("install", userId));
	const [notificationDeferred, setNotificationDeferred] = useState(() => isDeferred("notification", userId));
	const [installHelp, setInstallHelp] = useState(false);
	const [blockedHelp, setBlockedHelp] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [permissionRevision, setPermissionRevision] = useState(0);
	const supported = typeof window !== "undefined" && window.isSecureContext && "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
	const permission = supported ? Notification.permission : "unsupported";
	const shouldOfferInstall = !!device?.mobile && !device.standalone && !device.installAcknowledged && !installed && !installDeferred;
	const mayOfferNotifications = !!device && !shouldOfferInstall && !(device.ios && !device.standalone) && !notificationDeferred;

	const preferences = useQuery({
		queryKey: ["setup-notification-preferences", userId],
		queryFn: async () => (await api.get<{ data: NotificationPreferences }>("/notifications/settings", { skipErrorToast: true })).data.data,
		enabled: mayOfferNotifications,
		staleTime: 60_000,
	});
	const subscription = useQuery({
		queryKey: ["setup-push-status", userId, permissionRevision],
		enabled: mayOfferNotifications && supported && permission === "granted" && !!preferences.data?.enabled && !!preferences.data.publicKey,
		queryFn: async () => {
			const registration = await navigator.serviceWorker.getRegistration("/push-sw.js");
			const current = await registration?.pushManager.getSubscription();
			if (!current || !subscriptionMatchesKey(current, preferences.data!.publicKey!)) return false;
			return (await api.post<{ data: { registered: boolean } }>("/notifications/push-subscriptions/status", { endpoint: current.endpoint }, { skipErrorToast: true, skipSuccessToast: true })).data.data.registered;
		},
		staleTime: 30_000,
		retry: false,
	});
	const refresh = useCallback(() => {
		setPermissionRevision((revision) => revision + 1);
		void client.invalidateQueries({ queryKey: ["setup-notification-preferences", userId] });
	}, [client, userId]);
	useEffect(() => {
		const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
		window.addEventListener("focus", refresh);
		window.addEventListener(PUSH_CHANGED_EVENT, refresh);
		document.addEventListener("visibilitychange", onVisible);
		return () => { window.removeEventListener("focus", refresh); window.removeEventListener(PUSH_CHANGED_EVENT, refresh); document.removeEventListener("visibilitychange", onVisible); };
	}, [refresh]);

	const defer = (kind: "install" | "notification") => {
		writeStorage(untilKey(kind, userId), String(Date.now() + DELAY));
		if (kind === "install") setInstallDeferred(true); else setNotificationDeferred(true);
	};
	const acknowledgeInstall = () => {
		writeStorage(DEVICE_INSTALLED_KEY, "1");
		setInstallDeferred(true);
		window.dispatchEvent(new Event(DEVICE_CHANGED));
	};
	const enable = async () => {
		if (!preferences.data?.publicKey || !preferences.data.enabled) return;
		setBusy(true); setError("");
		try { await enableBrowserPush(preferences.data.publicKey, api); refresh(); }
		catch (cause) { setError(handleApiError(cause)); }
		finally { setBusy(false); }
	};

	if (!device) return null;
	if (shouldOfferInstall) return <section aria-label="Install the app" className="relative mb-5 flex flex-col gap-4 rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-card to-card p-4 shadow-sm dark:border-indigo-900 dark:from-indigo-950/40 sm:flex-row sm:items-start sm:p-5">
		<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200"><Smartphone className="size-5" aria-hidden="true" /></div>
		<div className="min-w-0 flex-1 space-y-2"><h2 className="font-semibold">The Tables, one tap away</h2><p className="text-sm text-muted-foreground">Add the app to your home screen for quick access to your work.</p>
			{installHelp && <div className="rounded-lg border bg-card p-3 text-sm" role="status">{device.ios ? <p>In your browser, tap <Share className="mx-1 inline size-4" aria-label="Share" /> <strong>Share</strong>, choose <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>. Open The Tables from your home screen.</p> : <p>Open your browser menu (⋮), then choose <strong>Install app</strong> or <strong>Add to home screen</strong> and confirm.</p>}</div>}
			{installError && <p role="alert" className="text-sm text-destructive">{installError}</p>}
			<div className="flex flex-wrap items-center gap-2 pt-1"><Button size="sm" onClick={() => { if (!device.ios && prompt) void install(); else setInstallHelp(true); }}><Download className="size-4" />{device.ios || !prompt ? "How to install" : "Install app"}</Button><Button variant="ghost" size="sm" onClick={() => defer("install")}>Later</Button><Button variant="link" size="sm" onClick={acknowledgeInstall}>Already installed</Button></div>
		</div><button type="button" aria-label="Remind me to install later" onClick={() => defer("install")} className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted"><X className="size-4" /></button>
	</section>;

	if (device.ios && !device.standalone && device.installAcknowledged && !notificationDeferred) return <section aria-label="Set up notifications" className="mb-5 flex items-start gap-4 rounded-2xl border border-sky-200/70 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/40">
		<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200"><BellRing className="size-5" aria-hidden="true" /></div>
		<div className="flex-1 space-y-2"><h2 className="font-semibold">Open the app to enable notifications</h2><p className="text-sm text-muted-foreground">On iPhone, open The Tables from its home-screen icon. You can then turn on notifications inside the app.</p><Button variant="ghost" size="sm" onClick={() => defer("notification")}>Later</Button></div>
	</section>;

	if (!mayOfferNotifications || preferences.isLoading || (permission === "granted" && preferences.data?.enabled && subscription.isLoading) || (permission === "granted" && subscription.data === true)) return null;
	return <section aria-label="Set up notifications" className="relative mb-5 flex flex-col gap-4 rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50 via-card to-card p-4 shadow-sm dark:border-sky-900 dark:from-sky-950/40 sm:flex-row sm:items-start sm:p-5">
		<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200"><BellRing className="size-5" aria-hidden="true" /></div>
		<div className="min-w-0 flex-1 space-y-2"><h2 className="font-semibold">Stay up to date</h2><p className="text-sm text-muted-foreground">Turn on notifications for task updates and reminders on this device.</p>
			{preferences.isError ? <p role="alert" className="text-sm text-destructive">Could not check notification settings. <button className="underline" type="button" onClick={() => void preferences.refetch()}>Try again</button></p> : preferences.data && !preferences.data.enabled ? <p className="text-sm text-muted-foreground">Notifications are not yet configured for your workspace. Please contact your administrator.</p> : !supported ? <p className="text-sm text-muted-foreground">{device.ios ? "On iPhone, use iOS 16.4 or newer and open The Tables from your home screen." : "This browser does not support notifications here. Try a current version of Chrome, Edge, or Safari."}</p> : subscription.isError ? <p role="alert" className="text-sm text-destructive">Could not verify this device. <button type="button" className="underline" onClick={() => void subscription.refetch()}>Try again</button></p> : null}
			{blockedHelp && <p className="rounded-lg border bg-card p-3 text-sm" role="status">{device.ios ? "Notifications are blocked. Open iPhone Settings → Notifications → The Tables and allow notifications, then return to the app." : "Notifications are blocked. Open your browser’s site settings and allow notifications for The Tables. Also check your device’s notification settings, then return here."}</p>}
			{error && <p role="alert" className="text-sm text-destructive">{error}</p>}
			<div className="flex flex-wrap items-center gap-2 pt-1">{supported && preferences.data?.enabled && !preferences.isError && !subscription.isError && <Button size="sm" disabled={busy} onClick={() => { if (permission === "denied") setBlockedHelp(true); else void enable(); }}><CheckCircle2 className="size-4" />{busy ? "Setting up…" : permission === "denied" ? "How to allow" : "Enable notifications"}</Button>}<Button variant="ghost" size="sm" onClick={() => defer("notification")}>Later</Button></div>
		</div><button type="button" aria-label="Remind me about notifications later" onClick={() => defer("notification")} className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted"><X className="size-4" /></button>
	</section>;
}
