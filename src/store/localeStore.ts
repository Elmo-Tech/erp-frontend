import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppLocale = "en" | "ar";

const localeDir: Record<AppLocale, "ltr" | "rtl"> = {
	en: "ltr",
	ar: "rtl",
};

function applyLocale(locale: AppLocale) {
	if (typeof document === "undefined") return;
	document.documentElement.lang = locale;
	document.documentElement.dir = localeDir[locale];
}

interface LocaleState {
	locale: AppLocale;
	dir: "ltr" | "rtl";
	setLocale: (locale: AppLocale) => void;
	toggleLocale: () => void;
}

export const useLocaleStore = create<LocaleState>()(
	persist(
		(set, get) => ({
			locale: "en",
			dir: "ltr",
			setLocale: (locale) => {
				applyLocale(locale);
				set({ locale, dir: localeDir[locale] });
			},
			toggleLocale: () => {
				get().setLocale(get().locale === "en" ? "ar" : "en");
			},
		}),
		{
			name: "locale-storage",
			onRehydrateStorage: () => (state) => {
				if (state) applyLocale(state.locale);
			},
		}
	)
);
