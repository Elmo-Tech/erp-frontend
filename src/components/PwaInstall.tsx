"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { registerNotificationWorker } from "@/lib/desktopPush";

interface InstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallContext = createContext<{ prompt: InstallPromptEvent | null; install: () => Promise<void>; installed: boolean; error: string | null }>({ prompt: null, install: async () => {}, installed: false, error: null });

export function PwaInstallProvider({ children }: { children: ReactNode }) {
	const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
	const [installed, setInstalled] = useState(false);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => {
		const onPrompt = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPromptEvent); };
		const onInstalled = () => { setPrompt(null); setInstalled(true); };
		window.addEventListener("beforeinstallprompt", onPrompt);
		window.addEventListener("appinstalled", onInstalled);
		if ("serviceWorker" in navigator && window.isSecureContext) void registerNotificationWorker().catch(() => undefined);
		return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
	}, []);
	const install = async () => {
		if (!prompt) return;
		setError(null);
		try { await prompt.prompt(); await prompt.userChoice; } catch { setError("Installation could not start. Use your browser menu and try again."); } finally { setPrompt(null); }
	};
	return <InstallContext.Provider value={{ prompt, install, installed, error }}>{children}</InstallContext.Provider>;
}

export function PwaInstallSettings() {
	const { prompt, install, installed, error } = useContext(InstallContext);
	return <section className="space-y-3 rounded-xl border p-5"><h2 className="font-semibold">Install on your phone</h2>
		<p className="text-sm text-muted-foreground">Open this same website on your phone, sign in, then add it to your home screen. An internet connection is required.</p>
		<ol className="list-inside list-decimal space-y-1 text-sm"><li>iPhone: open in Safari, tap Share, then Add to Home Screen and Add. Select Open as Web App if shown.</li><li>Android: open in Chrome, open the menu, then choose Install app or Add to Home screen.</li></ol>
		{error && <p role="alert" className="text-sm text-destructive">{error}</p>}
		{installed ? <p role="status" className="text-sm">The app was installed on this device.</p> : prompt && <Button onClick={() => void install()}>Install app</Button>}
	</section>;
}
