import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { PwaInstallProvider, PwaInstallSettings } from "./PwaInstall";

vi.mock("@/lib/desktopPush", () => ({ registerNotificationWorker: vi.fn().mockResolvedValue({}) }));

it("offers a browser install prompt when available and retains manual instructions", async () => {
	render(<PwaInstallProvider><PwaInstallSettings /></PwaInstallProvider>);
	expect(screen.getByText(/iPhone: open in Safari/)).toBeVisible();
	expect(screen.getByText(/Android: open in Chrome/)).toBeVisible();
	const install = vi.fn().mockResolvedValue(undefined);
	const event = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), { prompt: install, userChoice: Promise.resolve({ outcome: "accepted" }) });
	fireEvent(window, event);
	fireEvent.click(screen.getByRole("button", { name: "Install app" }));
	await waitFor(() => expect(install).toHaveBeenCalledOnce());
	fireEvent(window, new Event("appinstalled"));
	expect(screen.getByRole("status")).toHaveTextContent("installed");
});
