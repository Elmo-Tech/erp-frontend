"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { HOUR_MS, getRuntimeConfig } from "../config";
import { getReminderMessages, resolveReminderLocale } from "../i18n/messages";
import { closeDesktopReminder, getDesktopPermission, showDesktopReminder } from "../lib/desktop-notifications";
import { TimeReminderController } from "../model/controller";
import { isSnoozed, reminderHours } from "../model/engine";
import { useReminderActions, useReminderPreferences, useReminderProgress } from "../model/preferences";
import { InAppTimeReminder } from "./InAppTimeReminder";

export const TIME_REMINDER_SETTINGS_HREF = "/dashboard/profile#time-reminders";

/**
 * Mounted once inside the authenticated shell. Owns the active-time controller for the
 * signed-in user and renders the in-app reminder when desktop delivery is not available.
 */
export function TimeReminderHost() {
	const userId = useAuthStore((state) => state.user?.userId ?? null);
	const preferences = useReminderPreferences(userId);
	const progress = useReminderProgress(userId);
	const actions = useReminderActions(userId);
	const config = useMemo(() => getRuntimeConfig(), []);
	const messages = getReminderMessages(resolveReminderLocale());

	const preferencesRef = useRef(preferences);
	useEffect(() => {
		preferencesRef.current = preferences;
		if (!preferences.enabled) closeDesktopReminder();
	}, [preferences]);

	useEffect(() => {
		if (userId == null) return;
		const controller = new TimeReminderController({
			userId,
			config,
			getPreferences: () => preferencesRef.current,
			canDeliverDesktop: () => getDesktopPermission() === "granted",
			deliverDesktop: (trigger) => showDesktopReminder(messages, messages.body(trigger.hours)),
		});
		controller.start();
		if (process.env.NODE_ENV !== "production") (window as Window & { __elmoTimeReminder?: TimeReminderController }).__elmoTimeReminder = controller;

		// Logout or user switch: stop counting and drop in-memory state.
		return () => {
			controller.stop();
			closeDesktopReminder();
		};
		// messages are static per locale; config is read once per mount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId, config]);

	if (userId == null || !preferences.enabled || progress.pendingReminderAt === null || isSnoozed(preferences, Date.now())) return null;

	const intervalMs = config.intervalMsOverride ?? preferences.intervalHours * HOUR_MS;

	return (
		<InAppTimeReminder
			messages={messages}
			body={messages.body(reminderHours(progress, preferences, HOUR_MS))}
			onDismiss={() => void actions.dismiss()}
			onSnooze={() => void actions.snooze(config.snoozeMs, intervalMs)}
			settingsHref={TIME_REMINDER_SETTINGS_HREF}
		/>
	);
}
