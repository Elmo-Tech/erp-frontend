"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { NotificationSetupError, registerNotificationWorker } from "@/lib/desktopPush";
import { handleApiError } from "@/lib/errorHandling";

export interface NotificationPreferences { publicKey: string | null; enabled: boolean; reminderMinutes: number; intervals: number[] }

export function useNotificationPreferences() {
	return useQuery({ queryKey: ["notification-preferences"], queryFn: async () => (await api.get<{ data: NotificationPreferences }>("/notifications/settings")).data.data });
}

function applicationKey(key: string): Uint8Array<ArrayBuffer> {
	const bytes = atob(key.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - key.length % 4) % 4));
	return Uint8Array.from(bytes, (char) => char.charCodeAt(0));
}

export function DesktopNotificationSettings() {
	const query = useNotificationPreferences();
	const [status, setStatus] = useState("");
	const [technicalDetails, setTechnicalDetails] = useState("");
	const [busy, setBusy] = useState(false);
	const save = useMutation({ mutationFn: (reminderMinutes: number) => api.put("/notifications/preferences", { reminderMinutes }), onSuccess: () => query.refetch() });
	const enable = async () => {
		setBusy(true);
		setStatus("");
		setTechnicalDetails("");
		try {
			if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window) || !window.isSecureContext) throw new Error("Desktop notifications need HTTPS and a browser with Web Push support, such as an updated Chrome or Edge.");
			if (!query.data?.enabled || !query.data.publicKey) throw new Error("Web Push keys need to be configured on the server.");
			if (await Notification.requestPermission() !== "granted") throw new Error("Allow notifications in your browser's site settings.");
			const registration = await registerNotificationWorker();
			const subscription = await registration.pushManager.getSubscription() ?? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: applicationKey(query.data.publicKey) });
			await api.post("/notifications/push-subscriptions", subscription.toJSON());
			setStatus("Desktop notifications enabled on this browser.");
		} catch (error) {
			setStatus(handleApiError(error));
			if (error instanceof NotificationSetupError) setTechnicalDetails(error.technicalDetails ?? "");
		}
		finally { setBusy(false); }
	};
	const disable = async () => {
		setBusy(true);
		try {
			const registration = await navigator.serviceWorker.getRegistration("/push-sw.js");
			const subscription = await registration?.pushManager.getSubscription();
			if (subscription) { await api.delete("/notifications/push-subscriptions", { data: { endpoint: subscription.endpoint } }); await subscription.unsubscribe(); }
			setStatus("Desktop notifications disabled on this browser.");
		} catch { setStatus("Unable to disable notifications. Please try again."); }
		finally { setBusy(false); }
	};
	return <section className="space-y-3 rounded-xl border p-5"><h2 className="font-semibold">Desktop notifications & timer reminders</h2><p className="text-sm text-muted-foreground">Reminders repeat while a timer is running. Closed-page delivery depends on browser and operating-system background notification support.</p>
		{query.isLoading ? <p>Loading preferences…</p> : query.isError ? <Button variant="outline" onClick={() => query.refetch()}>Retry preferences</Button> : <label className="flex flex-wrap items-center gap-3 text-sm">Remind me every<select aria-label="Timer reminder interval" className="rounded-md border bg-background p-2" disabled={save.isPending} value={query.data?.reminderMinutes ?? 15} onChange={(event) => save.mutate(Number(event.target.value))}>{query.data?.intervals.map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}</select></label>}
		<div className="flex flex-wrap gap-2"><Button onClick={enable} disabled={busy || !query.data?.enabled}>Enable desktop notifications</Button><Button variant="outline" onClick={disable} disabled={busy}>Disable on this browser</Button></div>
		{query.data && !query.data.enabled && <p className="text-sm text-muted-foreground">Desktop delivery awaits server Web Push configuration. In-app timer reminders remain available.</p>}
		{status && <p role="status" className="text-sm">{status}</p>}
		{technicalDetails && <details className="text-xs text-muted-foreground"><summary>Browser technical details</summary><p className="mt-2 break-words">{technicalDetails}</p></details>}
	</section>;
}
