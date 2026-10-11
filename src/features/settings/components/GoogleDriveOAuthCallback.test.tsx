import { StrictMode } from "react";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { projectDriveApi } from "@/features/projects/api/projectDrive";
import CallbackPage from "@/app/auth/google/callback/page";

const mocks = vi.hoisted(() => ({ replace: vi.fn(), params: new URLSearchParams() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }), useSearchParams: () => mocks.params }));
vi.mock("@/features/projects/api/projectDrive", () => ({ projectDriveApi: { completeOAuth: vi.fn() } }));

beforeEach(() => { vi.clearAllMocks(); mocks.params = new URLSearchParams("code=TEST_CODE&scope=drive&state=integration"); });

it("Handle Google Drive OAuth callback after authorization", async () => {
	vi.mocked(projectDriveApi.completeOAuth).mockResolvedValueOnce();
	render(<StrictMode><CallbackPage /></StrictMode>);
	await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/dashboard/settings?tab=google_drive"));
	expect(projectDriveApi.completeOAuth).toHaveBeenCalledExactlyOnceWith("TEST_CODE");
});

it("returns failed authorization to Google Drive settings", async () => {
	vi.mocked(projectDriveApi.completeOAuth).mockRejectedValueOnce(new Error("Invalid code"));
	render(<CallbackPage />);
	await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/dashboard/settings?tab=google_drive&googleDrive=error"));
});

it("handles provider cancellation and does not exchange a missing code", async () => {
	mocks.params = new URLSearchParams("error=access_denied");
	render(<CallbackPage />);
	await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/dashboard/settings?tab=google_drive&googleDrive=error"));
	expect(projectDriveApi.completeOAuth).not.toHaveBeenCalled();
});

it("ignores external redirect state", async () => {
	mocks.params = new URLSearchParams("code=TEST_CODE&state=https://example.com");
	vi.mocked(projectDriveApi.completeOAuth).mockResolvedValueOnce();
	render(<CallbackPage />);
	await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/dashboard/settings?tab=google_drive"));
});
