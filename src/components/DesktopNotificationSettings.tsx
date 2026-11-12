"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { NotificationSetupError, enableBrowserPush, PUSH_CHANGED_EVENT } from "@/lib/desktopPush";
import { handleApiError } from "@/lib/errorHandling";

export interface NotificationPreferences { publicKey: string | null; enabled: boolean; reminderMinutes: number; intervals: number[] }

export function useNotificationPreferences() {
	return useQuery({ queryKey: ["notification-preferences"], queryFn: async () => (await api.get<{ data: NotificationPreferences }>("/notifications/settings")).data.data });
}

export function DesktopNotificationSettings() {
	const query = useNotificationPreferences();
	const [status, setStatus] = useState("");
	const [technicalDetails, setTechnicalDetails] = useState("");
	const [busy, setBusy] = useState(false);
	const pendingTest = useRef<string | null>(null);
	const testTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	useEffect(() => {
		const receive = (event: MessageEvent) => {
			if (event.data?.type !== "notification_test_received" || !pendingTest.current || event.data?.testId !== pendingTest.current) return;
			pendingTest.current = null;
			if (testTimeout.current) clearTimeout(testTimeout.current);
			setStatus("The browser received the test and asked your device to display it. If you did not see it, check your device notification settings and Focus or Do Not Disturb.");
		};
		navigator.serviceWorker?.addEventListener?.("message", receive);
		return () => { navigator.serviceWorker?.removeEventListener?.("message", receive); if (testTimeout.current) clearTimeout(testTimeout.current); };
	}, []);
	const save = useMutation({ mutationFn: (reminderMinutes: number) => api.put("/notifications/preferences", { reminderMinutes }), onSuccess: () => query.refetch() });
	const enable = async () => {
		setBusy(true);
		setStatus("");
		setTechnicalDetails("");
		try {
			if (!query.data?.enabled || !query.data.publicKey) throw new Error("Web Push keys need to be configured on the server.");
			await enableBrowserPush(query.data.publicKey, api);
			setStatus("This browser is registered. Send a test notification to check delivery.");
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
			window.dispatchEvent(new Event(PUSH_CHANGED_EVENT));
			setStatus("Desktop notifications disabled on this browser.");
		} catch { setStatus("Unable to disable notifications. Please try again."); }
		finally { setBusy(false); }
	};
	const testNotification = async () => {
		setBusy(true);
		setStatus("");
		try {
			if (!("Notification" in window) || Notification.permission !== "granted") throw new Error("Enable notifications and allow them in your browser first.");
			const registration = await navigator.serviceWorker.getRegistration("/push-sw.js");
			const subscription = await registration?.pushManager.getSubscription();
			if (!subscription) throw new Error("Enable desktop notifications on this browser first.");
			const testId = crypto.randomUUID();
			pendingTest.current = testId;
			if (testTimeout.current) clearTimeout(testTimeout.current);
			setStatus("Sending test. Look for a separate notification from your device.");
			await api.post("/notifications/test-push", { endpoint: subscription.endpoint, testId }, { skipSuccessToast: true });
			if (pendingTest.current === testId) testTimeout.current = setTimeout(() => {
				if (pendingTest.current !== testId) return;
				pendingTest.current = null;
				setStatus("The notification service accepted the test, but this browser has not confirmed receiving it. Check browser permissions, connection, and device settings, then try again.");
			}, 20000);
		} catch (error) { pendingTest.current = null; setStatus(handleApiError(error)); }
		finally { setBusy(false); }
	};
	return <section className="space-y-3 rounded-xl border p-5"><h2 className="font-semibold">Desktop notifications & timer reminders</h2><p className="text-sm text-muted-foreground">Reminders repeat while a timer is running. Closed-page delivery depends on browser and operating-system background notification support.</p>
		{query.isLoading ? <p>Loading preferences…</p> : query.isError ? <Button variant="outline" onClick={() => query.refetch()}>Retry preferences</Button> : <label className="flex flex-wrap items-center gap-3 text-sm">Remind me every<select aria-label="Timer reminder interval" className="rounded-md border bg-background p-2" disabled={save.isPending} value={query.data?.reminderMinutes ?? 15} onChange={(event) => save.mutate(Number(event.target.value))}>{query.data?.intervals.map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}</select></label>}
		<div className="flex flex-wrap gap-2"><Button onClick={enable} disabled={busy || !query.data?.enabled}>Enable desktop notifications</Button><Button variant="outline" onClick={disable} disabled={busy}>Disable on this browser</Button><Button variant="outline" onClick={testNotification} disabled={busy || !query.data?.enabled}>Send test notification</Button></div>
		{query.data && !query.data.enabled && <p className="text-sm text-muted-foreground">Desktop delivery awaits server Web Push configuration. In-app timer reminders remain available.</p>}
		{status && <p role="status" className="text-sm">{status}</p>}
		{technicalDetails && <details className="text-xs text-muted-foreground"><summary>Browser technical details</summary><p className="mt-2 break-words">{technicalDetails}</p></details>}
	</section>;
}
