/**
 * Reminder copy. The ERP has no app-wide localization system yet, so messages are kept
 * in this catalog keyed by locale; wire `resolveReminderLocale` to an i18n provider when one exists.
 */

export type ReminderLocale = "ar" | "en";

export const DEFAULT_REMINDER_LOCALE: ReminderLocale = "ar";

export interface ReminderMessages {
	dir: "rtl" | "ltr";
	lang: string;
	title: string;
	body: (hours: number) => string;
	currentTime: string;
	dismiss: string;
	snooze: string;
	settings: string;
}

const arabicNumber = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 });

/** Arabic hour phrasing with correct dual/plural forms: ساعة، ساعتين، ٦ ساعات، ١٢ ساعة. */
export function formatArabicHours(hours: number) {
	if (hours === 1) return "ساعة";
	if (hours === 2) return "ساعتين";
	const value = arabicNumber.format(hours);
	return hours >= 3 && hours <= 10 ? `${value} ساعات` : `${value} ساعة`;
}

export const reminderMessages: Record<ReminderLocale, ReminderMessages> = {
	ar: {
		dir: "rtl",
		lang: "ar",
		title: "خد بالك من الوقت ⏰",
		body: (hours) => `أنت شغال على السيستم بقالك ${formatArabicHours(hours)}. خد بريك صغير وراجع وقتك.`,
		currentTime: "الساعة دلوقتي",
		dismiss: "تمام",
		snooze: "فكّرني بعد ساعة",
		settings: "إعدادات التذكير",
	},
	en: {
		dir: "ltr",
		lang: "en",
		title: "Mind the time ⏰",
		body: (hours) => `You've been working in the system for ${hours} ${hours === 1 ? "hour" : "hours"}. Take a short break and check your time.`,
		currentTime: "Current time",
		dismiss: "Got it",
		snooze: "Remind me in 1 hour",
		settings: "Reminder settings",
	},
};

export function resolveReminderLocale(preferred?: string | null): ReminderLocale {
	const language = preferred?.toLowerCase().split("-")[0];
	return language && language in reminderMessages ? (language as ReminderLocale) : DEFAULT_REMINDER_LOCALE;
}

export function getReminderMessages(locale: ReminderLocale = DEFAULT_REMINDER_LOCALE): ReminderMessages {
	return reminderMessages[locale] ?? reminderMessages[DEFAULT_REMINDER_LOCALE];
}
