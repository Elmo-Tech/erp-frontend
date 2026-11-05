"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRealtimeTimer } from "@/hooks/useTimerSocket";
import { useTimerStore } from "@/store/timerStore";
import api from "@/lib/axios";
import { notifyApiError } from "@/lib/errorHandling";
import type { TimeEntryData } from "@/store/timerStore";

export function AfterHoursTimerDialog() {
	const active = useTimerStore((state) => state.activeTimer);
	const { refetch } = useRealtimeTimer();
	const [busy, setBusy] = useState(false);
	const prompt = active?.afterHoursPromptAt;
	const respond = async (stop: boolean) => {
		if (!active || !prompt) return;
		setBusy(true);
		try {
			const response = await api.post<{ data: TimeEntryData }>("/time-entries/confirm-after-hours", { timeEntryId: active.timeEntryId, promptAt: prompt, stop });
			const current = useTimerStore.getState().activeTimer;
			if (current?.timeEntryId === active.timeEntryId && current.afterHoursPromptAt === prompt) {
				useTimerStore.setState(stop ? { activeTimer: null, resumableTimer: response.data.data } : { activeTimer: response.data.data });
			}
		} catch (error) {
			notifyApiError(error);
			await refetch();
		} finally { setBusy(false); }
	};
	return <Dialog open={Boolean(prompt)}><DialogContent showCloseButton={false} onEscapeKeyDown={(event) => event.preventDefault()} onInteractOutside={(event) => event.preventDefault()}>
		<DialogHeader><DialogTitle>Are you still working?</DialogTitle><DialogDescription>Your scheduled workday has ended. Confirm that you are still working, or pause your timer. If you do not respond within {active?.afterHoursGraceMinutes ?? 10} minutes, the timer will pause at the time this reminder was sent.</DialogDescription></DialogHeader>
		<DialogFooter><Button variant="outline" disabled={busy} onClick={() => void respond(true)}>Pause timer</Button><Button disabled={busy} onClick={() => void respond(false)}>Still working</Button></DialogFooter>
	</DialogContent></Dialog>;
}
