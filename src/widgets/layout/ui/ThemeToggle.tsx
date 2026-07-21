"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/shared/ui/button";

interface ThemeToggleProps {
	className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
	const { resolvedTheme, setTheme } = useTheme();
	const isDarkTheme = resolvedTheme === "dark";
	const nextTheme = isDarkTheme ? "light" : "dark";

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onClick={() => setTheme(nextTheme)}
			className={className}
		>
			<Sun className="hidden dark:block" />
			<Moon className="dark:hidden" />
			<span className="sr-only dark:hidden">Switch to dark theme</span>
			<span className="sr-only hidden dark:inline">Switch to light theme</span>
		</Button>
	);
}
