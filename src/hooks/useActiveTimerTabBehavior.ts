"use client";

import { useEffect, useRef } from "react";
import { TABLES_APP_NAME } from "@/config/simplification";
import { formatDuration } from "@/lib/dateUtils";
import type { TimeEntryData } from "@/store/timerStore";

export function useActiveTimerTabBehavior(activeTimer: TimeEntryData | null, elapsedSeconds: number) {
	const originalTitle = useRef<string | null>(null);
	const isShowingTimerTitle = useRef(false);
	const hasActiveTimer = activeTimer !== null;

	useEffect(() => {
		return () => {
			if (typeof document !== "undefined" && isShowingTimerTitle.current && originalTitle.current !== null) {
				document.title = originalTitle.current;
			}
		};
	}, []);

	useEffect(() => {
		if (typeof document === "undefined") return;

		if (!activeTimer) {
			if (isShowingTimerTitle.current && originalTitle.current !== null) {
				document.title = originalTitle.current;
			}
			originalTitle.current = document.title;
			isShowingTimerTitle.current = false;
			return;
		}

		if (!isShowingTimerTitle.current) {
			originalTitle.current = document.title;
			isShowingTimerTitle.current = true;
		}

		document.title = `[Timer] ${activeTimer.trackableDisplayName} - ${formatDuration(elapsedSeconds)} | ${TABLES_APP_NAME}`;
	}, [activeTimer, elapsedSeconds]);

	useEffect(() => {
		if (!hasActiveTimer || typeof window === "undefined") return;

		const confirmBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = "";
		};

		window.addEventListener("beforeunload", confirmBeforeUnload);

		return () => window.removeEventListener("beforeunload", confirmBeforeUnload);
	}, [hasActiveTimer]);
}
