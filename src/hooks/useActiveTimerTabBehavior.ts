"use client";

import { useEffect, useRef } from "react";
import { TABLES_APP_NAME } from "@/config/simplification";
import { formatDuration } from "@/lib/dateUtils";
import type { TimeEntryData } from "@/store/timerStore";

export function useActiveTimerTabBehavior(activeTimer: TimeEntryData | null, elapsedSeconds: number) {
	const originalTitle = useRef<string | null>(null);
	const originalFavicon = useRef<string | null>(null);
	const isShowingTimerTitle = useRef(false);
	const hasActiveTimer = activeTimer !== null;

	const setFavicon = (active: boolean) => {
		if (typeof document === "undefined") return;
		let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
		if (!link) {
			link = document.createElement("link");
			link.rel = "icon";
			document.head.appendChild(link);
		}
		if (originalFavicon.current === null) {
			originalFavicon.current = link.href;
		}
		if (active) {
			// Red dot badge so the running timer is visible outside the tab title.
			const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%231d4ed8'/><circle cx='22' cy='10' r='7' fill='%23ef4444' stroke='white' stroke-width='2'/><text x='9' y='22' font-size='14' fill='white' font-family='sans-serif' font-weight='bold'>T</text></svg>`;
			link.href = `data:image/svg+xml,${svg}`;
		} else if (originalFavicon.current) {
			link.href = originalFavicon.current;
		}
	};

	useEffect(() => {
		return () => {
			if (typeof document !== "undefined" && isShowingTimerTitle.current && originalTitle.current !== null) {
				document.title = originalTitle.current;
			}
			setFavicon(false);
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
			setFavicon(false);
			return;
		}

		if (!isShowingTimerTitle.current) {
			originalTitle.current = document.title;
			isShowingTimerTitle.current = true;
		}

		document.title = `[Timer] ${activeTimer.trackableDisplayName} - ${formatDuration(elapsedSeconds)} | ${TABLES_APP_NAME}`;
		setFavicon(true);
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
