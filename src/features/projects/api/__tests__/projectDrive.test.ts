import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { normalizeGoogleDriveStatus, projectDriveApi } from "../projectDrive";

vi.mock("@/lib/axios", () => ({
	default: {
		get: vi.fn(),
	},
}));

describe("projectDriveApi Google Drive status", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("normalizes optional status fields for the settings UI", () => {
		expect(normalizeGoogleDriveStatus({
			connected: true,
			accountEmail: "  drive@example.com  ",
			expiresAt: " 2026-10-01T10:00:00Z ",
			reason: " ",
		})).toEqual({
			connected: true,
			accountEmail: "drive@example.com",
			expiresAt: "2026-10-01T10:00:00Z",
			reason: null,
		});
	});

	it("loads the current Google Drive connection status", async () => {
		vi.mocked(api.get).mockResolvedValue({
			data: {
				data: {
					connected: false,
					reason: "Authorization expired",
				},
			},
		});

		await expect(projectDriveApi.getStatus()).resolves.toEqual({
			connected: false,
			accountEmail: null,
			expiresAt: null,
			reason: "Authorization expired",
		});
		expect(api.get).toHaveBeenCalledWith("/google-drive/status");
	});
});
