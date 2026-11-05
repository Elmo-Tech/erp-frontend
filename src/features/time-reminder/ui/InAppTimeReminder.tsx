"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellOff, Clock3, Settings2, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import type { ReminderMessages } from "../i18n/messages";

interface InAppTimeReminderProps {
	messages: ReminderMessages;
	body: string;
	onDismiss: () => void;
	onSnooze: () => void;
	settingsHref: string;
}

function useClock(locale: string) {
	const [now, setNow] = useState(() => new Date());
	useEffect(() => {
		const id = window.setInterval(() => setNow(new Date()), 15_000);
		return () => window.clearInterval(id);
	}, []);
	return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : locale, { hour: "numeric", minute: "2-digit" }).format(now);
}

/**
 * Unobtrusive reminder card: does not steal focus or block the page.
 * Announced politely to assistive technology.
 */
export function InAppTimeReminder({ messages, body, onDismiss, onSnooze, settingsHref }: InAppTimeReminderProps) {
	const time = useClock(messages.lang);

	return (
		<div
			role="status"
			aria-live="polite"
			lang={messages.lang}
			dir={messages.dir}
			data-slot="time-reminder"
			className={cn(
				"fixed right-4 bottom-4 left-4 z-[65] sm:left-auto sm:w-[23rem]",
				"overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl",
				"backdrop-blur-[var(--glass-blur)] backdrop-saturate-150",
				"animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
			)}
		>
			<span className="absolute inset-y-0 start-0 w-1 bg-primary" aria-hidden="true" />
			<div className="flex items-start gap-3 p-4 ps-5">
				<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary" aria-hidden="true">
					<Clock3 className="size-4.5" strokeWidth={2} />
				</span>
				<div className="min-w-0 flex-1">
					<p className="text-[0.9375rem] leading-6 font-semibold text-foreground">{messages.title}</p>
					<p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
					<p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
						{messages.currentTime}
						<span className="font-semibold tabular-nums">{time}</span>
					</p>
				</div>
				<button type="button" onClick={onDismiss} className="-me-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label={messages.dismiss}>
					<X className="size-4" />
				</button>
			</div>
			<div className="flex flex-wrap items-center gap-2 border-t border-border bg-surface-subtle/60 px-4 py-2.5 ps-5">
				<Button type="button" size="sm" onClick={onDismiss}>
					{messages.dismiss}
				</Button>
				<Button type="button" size="sm" variant="ghost" onClick={onSnooze}>
					<BellOff data-icon="inline-start" />
					{messages.snooze}
				</Button>
				<Link href={settingsHref} className="ms-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground" onClick={onDismiss}>
					<Settings2 className="size-3.5" />
					{messages.settings}
				</Link>
			</div>
		</div>
	);
}
