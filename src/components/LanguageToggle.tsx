"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocaleStore } from "@/store/localeStore";

export function LanguageToggle() {
	const { locale, toggleLocale } = useLocaleStore();

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			onClick={toggleLocale}
			className="gap-2"
			aria-label="Toggle language"
		>
			<Languages className="h-4 w-4" />
			<span className="text-xs font-medium">{locale === "en" ? "عربي" : "EN"}</span>
		</Button>
	);
}
