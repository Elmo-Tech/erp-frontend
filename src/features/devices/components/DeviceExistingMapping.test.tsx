import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";
import { DeviceDetailPanel } from "./DeviceDetailPanel";
import { devicesApi } from "../api/devices";

vi.mock("../api/devices", () => ({ devicesApi: { getOne: vi.fn(), getEvents: vi.fn(), mapExistingUser: vi.fn(), linkUser: vi.fn(), testConnection: vi.fn(), poll: vi.fn(), pushUsers: vi.fn(), enableWebhook: vi.fn(), disableWebhook: vi.fn(), unlinkUser: vi.fn() } }));
it("links existing terminal numbers without invoking device provisioning", async () => {
	vi.mocked(devicesApi.getOne).mockResolvedValue({ deviceId: 1, name: "Entrance", ipAddress: "192.168.1.20", port: 80, deviceUsers: [] } as never);
	vi.mocked(devicesApi.getEvents).mockResolvedValue({ events: [], pagination: { currentPage: 1, totalPages: 1 } } as never);
	vi.mocked(devicesApi.mapExistingUser).mockResolvedValue({});
	const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
	render(<QueryClientProvider client={client}><DeviceDetailPanel deviceId={1} onClose={() => {}} /></QueryClientProvider>);
	fireEvent.change(await screen.findByLabelText("Existing ERP user id"), { target: { value: "7" } });
	fireEvent.change(screen.getByLabelText("Existing terminal employee number"), { target: { value: "00042" } });
	fireEvent.click(screen.getByRole("button", { name: "Link existing" }));
	await waitFor(() => expect(devicesApi.mapExistingUser).toHaveBeenCalledWith(1, 7, "00042"));
	expect(devicesApi.linkUser).not.toHaveBeenCalled();
	expect(devicesApi.pushUsers).not.toHaveBeenCalled();
});
