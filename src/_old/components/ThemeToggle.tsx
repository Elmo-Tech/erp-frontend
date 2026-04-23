"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/shared/ui/button";

const getInitialTheme = (): "light" | "dark" => {
	if (typeof window === "undefined") {
		return "light";
	}

	const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	return savedTheme || (prefersDark ? "dark" : "light");
};

export function ThemeToggle() {
	const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [theme]);

	const toggleTheme = () => {
		const newTheme = theme === "light" ? "dark" : "light";
		setTheme(newTheme);
		localStorage.setItem("theme", newTheme);
		document.documentElement.classList.toggle("dark", newTheme === "dark");
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className="h-9 w-9"
		>
			{theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
