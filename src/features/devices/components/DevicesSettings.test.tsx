import { StrictMode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { DevicesSettings } from "./DevicesSettings";
import { devicesApi } from "../api/devices";
import { Device } from "../types/device";

vi.mock("@/features/devices/api/devices", () => ({
	devicesApi: {
		getAll: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		remove: vi.fn(),
		testConnection: vi.fn(),
		poll: vi.fn(),
		pushUsers: vi.fn(),
		pullUsers: vi.fn(),
		linkUser: vi.fn(),
		mapExistingUser: vi.fn(),
		unlinkUser: vi.fn(),
		getEvents: vi.fn(),
		enableWebhook: vi.fn(),
		disableWebhook: vi.fn(),
	},
}));

const device: Device = {
	deviceId: 1,
	name: "Main Entrance",
	vendor: "hikvision",
	model: "DS-K1T8003MF",
	location: "HQ",
	ipAddress: "192.168.1.64",
	port: 80,
	username: "admin",
	hasPassword: true,
	verifyTls: false,
	isActive: true,
	autoSync: true,
	syncIntervalMinutes: 5,
	webhookUrl: null,
	isOnline: true,
	lastEventAt: null,
	lastSeenAt: "2026-01-05T09:00:00",
	lastSyncedAt: "2026-01-05T09:00:00",
	lastStatus: "ok",
	lastError: null,
	linkedUsersCount: 12,
};

const client = () =>
	new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

const renderDevices = () =>
	render(
		<StrictMode>
			<QueryClientProvider client={client()}>
				<DevicesSettings />
			</QueryClientProvider>
		</StrictMode>
	);

beforeEach(() => {
	vi.clearAllMocks();
});

it("lists the registered devices", async () => {
	vi.mocked(devicesApi.getAll).mockResolvedValue([device]);

	renderDevices();

	await waitFor(() => expect(devicesApi.getAll).toHaveBeenCalled());

	expect(await screen.findByText("Main Entrance")).toBeInTheDocument();
	expect(screen.getByText("192.168.1.64:80")).toBeInTheDocument();
	expect(screen.getByText("12")).toBeInTheDocument();
	expect(screen.getByText("Online")).toBeInTheDocument();
});

it("shows an empty state when no device is registered", async () => {
	vi.mocked(devicesApi.getAll).mockResolvedValue([]);

	renderDevices();

	expect(await screen.findByText("No device registered yet")).toBeInTheDocument();
});

it("surfaces the error of a device that could not be reached", async () => {
	vi.mocked(devicesApi.getAll).mockResolvedValue([
		{ ...device, isOnline: false, lastStatus: "error", lastError: "The device could not be reached." },
	]);

	renderDevices();

	expect(await screen.findByText("Error")).toBeInTheDocument();
	expect(screen.queryByText("Inactive")).not.toBeInTheDocument();
});

it("marks a device that stopped reporting as offline", async () => {
	vi.mocked(devicesApi.getAll).mockResolvedValue([{ ...device, isOnline: false, lastStatus: "ok" }]);

	renderDevices();

	expect(await screen.findByText("Offline")).toBeInTheDocument();
});
