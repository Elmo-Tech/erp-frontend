import { focusManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { useAuthProfileSync } from "../use-auth-profile-sync";

vi.mock("@/shared/api/base", () => ({
	default: { get: vi.fn() },
}));

const mockedApi = api as unknown as { get: Mock };

describe("useAuthProfileSync", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		focusManager.setFocused(undefined);
		useAuthStore.setState({
			user: { userId: 7, name: "Old name", email: "mona@example.test", avatar: "", role: "dev" },
			role: "dev",
			permissions: [],
			isAuthenticated: true,
		});
	});

	it("refreshes the active user's role and permissions from the profile endpoint", async () => {
		mockedApi.get.mockResolvedValueOnce(profileResponse(["create_tasks"]));

		renderHook(() => useAuthProfileSync(true), { wrapper: createQueryWrapper() });

		await waitFor(() => expect(useAuthStore.getState().hasPermission("create_tasks")).toBe(true));
		expect(useAuthStore.getState().role).toBe("developer");
		expect(useAuthStore.getState().user?.name).toBe("Mona");
	});

	it("refreshes permissions on every window focus even while profile data is fresh", async () => {
		mockedApi.get.mockResolvedValueOnce(profileResponse([])).mockResolvedValueOnce(profileResponse(["create_tasks"]));
		renderHook(() => useAuthProfileSync(true), { wrapper: createQueryWrapper() });

		await waitFor(() => expect(mockedApi.get).toHaveBeenCalledTimes(1));
		focusManager.setFocused(false);
		focusManager.setFocused(true);

		await waitFor(() => expect(mockedApi.get).toHaveBeenCalledTimes(2));
		await waitFor(() => expect(useAuthStore.getState().hasPermission("create_tasks")).toBe(true));
	});
});

function profileResponse(permissionNames: string[]) {
	return {
		data: {
			success: true,
			message: "Profile fetched",
			data: {
				profile: { userId: 7, name: "Mona", email: "mona@example.test", avatar: "/avatar.png" },
				role: "developer",
				permissions: permissionNames.map((permissionName) => ({ permissionName, access: true })),
			},
		},
	};
}

function createQueryWrapper() {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return function QueryWrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}
