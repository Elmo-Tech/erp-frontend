"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/store/timerStore";

export function TimerReminderDialog() {
	const [reminder, setReminder] = useState<{ timer_id: number; body?: string } | null>(null);
	const activeTimer = useTimerStore((state) => state.activeTimer);
	const lastShown = useRef(new Map<number, number>());
	useEffect(() => {
		const show = (data: { timer_id: number; body?: string; reminderMinutes?: number }) => {
			if (!data?.timer_id) return;
			const now = Date.now();
			if (now - (lastShown.current.get(data.timer_id) ?? 0) < ((data.reminderMinutes ?? 15) * 60 - 5) * 1000) return;
			lastShown.current.set(data.timer_id, now);
			setReminder(data);
		};
		const receive = (event: Event) => show((event as CustomEvent).detail);
		const worker = (event: MessageEvent) => { if (event.data?.type === "timer_reminder") show(event.data); };
		window.addEventListener("timer-reminder", receive);
		navigator.serviceWorker?.addEventListener("message", worker);
		return () => { window.removeEventListener("timer-reminder", receive); navigator.serviceWorker?.removeEventListener("message", worker); };
	}, []);
	return <Dialog open={!!reminder && !activeTimer?.afterHoursPromptAt && activeTimer?.timeEntryId === reminder.timer_id} onOpenChange={(open) => { if (!open) setReminder(null); }}><DialogContent><DialogHeader><DialogTitle>Your work timer is still running</DialogTitle><DialogDescription>{reminder?.body || activeTimer?.trackableDisplayName} — stop the timer if you have finished working. Otherwise you will be reminded again at your selected interval.</DialogDescription></DialogHeader><Button onClick={() => setReminder(null)}>Continue working</Button></DialogContent></Dialog>;
}
