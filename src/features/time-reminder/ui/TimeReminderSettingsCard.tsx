"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { BellRing, Clock3, Info, MonitorSmartphone } from "lucide-react";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { cn } from "@/shared/lib/utils";
import { DEFAULT_INTERVAL_HOURS, INTERVAL_HOUR_OPTIONS, MINUTE_MS, getRuntimeConfig } from "../config";
import { getDesktopPermission, requestDesktopPermission, type DesktopPermission } from "../lib/desktop-notifications";
import { isSnoozed, localDay } from "../model/engine";
import { useReminderActions, useReminderPreferences, useReminderProgress } from "../model/preferences";

function formatDuration(ms: number) {
	const totalMinutes = Math.floor(ms / MINUTE_MS);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

/** Permission can change in browser settings; re-read when the tab regains focus. */
function useDesktopPermission(): [DesktopPermission, (value: DesktopPermission) => void] {
	const [override, setOverride] = useState<DesktopPermission | null>(null);
	const permission = useSyncExternalStore(
		(onChange) => {
			window.addEventListener("focus", onChange);
			return () => window.removeEventListener("focus", onChange);
		},
		getDesktopPermission,
		() => "default" as DesktopPermission,
	);
	return [override ?? permission, setOverride];
}

function useNow(intervalMs: number) {
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
		const id = window.setInterval(() => setNow(Date.now()), intervalMs);
		return () => window.clearInterval(id);
	}, [intervalMs]);
	return now;
}

function SettingRow({ id, title, description, control, disabled }: { id?: string; title: string; description: React.ReactNode; control: React.ReactNode; disabled?: boolean }) {
	return (
		<div className={cn("flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0", disabled && "opacity-60")}>
			<div className="min-w-0">
				<Label htmlFor={id} className="text-sm font-medium">
					{title}
				</Label>
				<div className="mt-1 text-[0.8125rem] leading-5 text-muted-foreground">{description}</div>
			</div>
			<div className="shrink-0">{control}</div>
		</div>
	);
}

export function TimeReminderSettingsCard({ className }: { className?: string }) {
	const userId = useAuthStore((state) => state.user?.userId ?? null);
	const preferences = useReminderPreferences(userId);
	const progress = useReminderProgress(userId);
	const actions = useReminderActions(userId);
	const [permission, setPermission] = useDesktopPermission();
	const [isRequesting, setIsRequesting] = useState(false);
	const now = useNow(30_000);
	const config = useMemo(() => getRuntimeConfig(), []);
	const idleWindow = config.idleThresholdMs >= MINUTE_MS ? `${Math.round(config.idleThresholdMs / MINUTE_MS)} minutes` : `${Math.round(config.idleThresholdMs / 1000)} seconds`;

	const snoozed = isSnoozed(preferences, now);
	const activeToday = progress.day === localDay(now) ? progress.activeMs : 0;
	const desktopActive = preferences.desktopEnabled && permission === "granted";

	const enableDesktop = async () => {
		setIsRequesting(true);
		const result = await requestDesktopPermission();
		setPermission(result);
		setIsRequesting(false);
		actions.setDesktopEnabled(result === "granted");
	};

	let desktopControl: React.ReactNode;
	let desktopStatus: React.ReactNode;
	if (permission === "unsupported") {
		desktopStatus = "This browser doesn't support desktop notifications. Reminders appear inside the ERP instead.";
		desktopControl = <span className="text-xs font-medium text-muted-foreground">Not supported</span>;
	} else if (permission === "denied") {
		desktopStatus = "Notifications are blocked for this site. Allow them in your browser's site settings, then return here. Until then, reminders appear inside the ERP.";
		desktopControl = <span className="rounded-md bg-warning-soft px-2 py-1 text-xs font-medium text-warning">Blocked</span>;
	} else if (permission === "granted") {
		desktopStatus = desktopActive ? "Reminders are sent as desktop notifications." : "Reminders appear inside the ERP.";
		desktopControl = <Switch id="time-reminder-desktop" checked={preferences.desktopEnabled} onCheckedChange={actions.setDesktopEnabled} disabled={!preferences.enabled} aria-label="Desktop notifications" />;
	} else {
		desktopStatus = "Your browser will ask for permission. Until enabled, reminders appear inside the ERP.";
		desktopControl = (
			<Button type="button" size="sm" variant="outline" onClick={enableDesktop} disabled={!preferences.enabled || isRequesting}>
				<MonitorSmartphone data-icon="inline-start" />
				{isRequesting ? "Waiting…" : "Enable desktop reminders"}
			</Button>
		);
	}

	return (
		<Card id="time-reminders" className={cn("scroll-mt-24", className)}>
			<CardHeader className="border-b pb-4">
				<CardTitle className="flex items-center gap-2">
					<Clock3 className="size-4 text-muted-foreground" />
					Time reminders
				</CardTitle>
				<CardDescription>A friendly nudge to check the time and take a break after long stretches of active work.</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border bg-surface-subtle px-4 py-3 text-sm">
					<p>
						<span className="text-muted-foreground">Active time today </span>
						<span className="font-semibold tabular-nums">{formatDuration(activeToday)}</span>
					</p>
					{snoozed && preferences.snoozedUntil && (
						<p className="flex items-center gap-1.5 text-muted-foreground">
							<BellRing className="size-3.5" />
							Snoozed until <span className="font-medium text-foreground tabular-nums">{timeFormatter.format(preferences.snoozedUntil)}</span>
						</p>
					)}
				</div>

				<div className="divide-y divide-border">
					<SettingRow
						id="time-reminder-enabled"
						title="Time reminders"
						description={`Remind me after every ${preferences.intervalHours} ${preferences.intervalHours === 1 ? "hour" : "hours"} of active use.`}
						control={<Switch id="time-reminder-enabled" checked={preferences.enabled} onCheckedChange={(checked) => void actions.setEnabled(checked)} />}
					/>
					<SettingRow
						id="time-reminder-interval"
						title="Reminder interval"
						description={`Default is ${DEFAULT_INTERVAL_HOURS} hours of active use.`}
						disabled={!preferences.enabled}
						control={
							<Select value={String(preferences.intervalHours)} onValueChange={(value) => actions.setIntervalHours(Number(value))} disabled={!preferences.enabled}>
								<SelectTrigger id="time-reminder-interval" size="sm" className="w-32" aria-label="Reminder interval">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{INTERVAL_HOUR_OPTIONS.map((hours) => (
										<SelectItem key={hours} value={String(hours)}>
											{hours} {hours === 1 ? "hour" : "hours"}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						}
					/>
					<SettingRow id={permission === "granted" ? "time-reminder-desktop" : undefined} title="Desktop notifications" description={desktopStatus} disabled={!preferences.enabled} control={desktopControl} />
					<SettingRow
						title="Snooze"
						description={snoozed ? "Reminders are paused. Time is still counted." : "Pause reminders for the next hour."}
						disabled={!preferences.enabled}
						control={
							snoozed ? (
								<Button type="button" size="sm" variant="outline" onClick={actions.resume}>
									Resume now
								</Button>
							) : (
								<Button type="button" size="sm" variant="outline" onClick={() => void actions.snooze(config.snoozeMs)} disabled={!preferences.enabled}>
									Snooze for 1 hour
								</Button>
							)
						}
					/>
				</div>

				<div className="mt-5 flex gap-2.5 rounded-lg bg-info-soft px-3.5 py-3 text-[0.8125rem] leading-5 text-foreground/80">
					<Info className="mt-0.5 size-4 shrink-0 text-info" />
					<div className="space-y-1.5">
						<p>
							Active time counts only while the ERP is open, visible and focused, and you&apos;ve interacted with it in the last {idleWindow}. Breaks pause the counter without resetting it; it starts over each day.
						</p>
						<p>
							Browser reminders require the ERP to remain open in a tab. Your operating system&apos;s notification settings, such as Focus or Do Not Disturb, may delay or hide them. Progress is stored on this device only.
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
