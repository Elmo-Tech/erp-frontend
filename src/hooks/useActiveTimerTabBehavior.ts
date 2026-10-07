"use client";

import { useEffect, useRef } from "react";
import { TABLES_APP_NAME } from "@/config/simplification";
import { formatDuration } from "@/lib/dateUtils";
import type { TimeEntryData } from "@/store/timerStore";

const REMINDER_INTERVAL_SECONDS = 45 * 60;
const FLASH_DURATION_MS = 10_000;

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
	if (typeof window === "undefined") return null;
	const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
	if (!Ctor) return null;
	if (!sharedAudioContext) sharedAudioContext = new Ctor();
	if (sharedAudioContext.state === "suspended") {
		void sharedAudioContext.resume().catch(() => undefined);
	}
	return sharedAudioContext;
}

function playReminderBeep(): void {
	const ctx = getAudioContext();
	if (!ctx) return;
	try {
		const start = ctx.currentTime;
		[0, 0.3].forEach((offset, index) => {
			const oscillator = ctx.createOscillator();
			const gain = ctx.createGain();
			oscillator.connect(gain);
			gain.connect(ctx.destination);
			oscillator.type = "sine";
			oscillator.frequency.value = index === 0 ? 880 : 660;
			gain.gain.setValueAtTime(0.0001, start + offset);
			gain.gain.exponentialRampToValueAtTime(0.25, start + offset + 0.05);
			gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.25);
			oscillator.start(start + offset);
			oscillator.stop(start + offset + 0.3);
		});
	} catch {
		// Audio is best-effort; title/favicon flash still covers the alert.
	}
}

export function useActiveTimerTabBehavior(activeTimer: TimeEntryData | null, elapsedSeconds: number) {
	const originalTitle = useRef<string | null>(null);
	const originalFavicon = useRef<string | null>(null);
	const isShowingTimerTitle = useRef(false);
	const hasActiveTimer = activeTimer !== null;
	const lastReminderBucket = useRef(0);
	const flashUntil = useRef(0);

	const setFavicon = (alertBadge: boolean) => {
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
		if (alertBadge) {
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

	// Browsers require a user gesture before audio can play; unlock on first interaction.
	useEffect(() => {
		if (typeof window === "undefined") return;
		const unlock = () => {
			getAudioContext();
			window.removeEventListener("pointerdown", unlock);
			window.removeEventListener("keydown", unlock);
		};
		window.addEventListener("pointerdown", unlock);
		window.addEventListener("keydown", unlock);
		return () => {
			window.removeEventListener("pointerdown", unlock);
			window.removeEventListener("keydown", unlock);
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
			lastReminderBucket.current = 0;
			flashUntil.current = 0;
			setFavicon(false);
			return;
		}

		if (!isShowingTimerTitle.current) {
			originalTitle.current = document.title;
			isShowingTimerTitle.current = true;
		}

		const bucket = Math.floor(elapsedSeconds / REMINDER_INTERVAL_SECONDS);
		if (bucket >= 1 && bucket > lastReminderBucket.current) {
			lastReminderBucket.current = bucket;
			flashUntil.current = Date.now() + FLASH_DURATION_MS;
			playReminderBeep();
		}

		const isFlashing = Date.now() < flashUntil.current;
		const flashOn = Math.floor(Date.now() / 1000) % 2 === 0;
		const timerTitle = `[Timer] ${activeTimer.trackableDisplayName} - ${formatDuration(elapsedSeconds)} | ${TABLES_APP_NAME}`;

		document.title = isFlashing && flashOn
			? `⚠ TIMER RUNNING ${formatDuration(elapsedSeconds)} — ${activeTimer.trackableDisplayName}`
			: timerTitle;
		setFavicon(isFlashing ? flashOn : true);
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
