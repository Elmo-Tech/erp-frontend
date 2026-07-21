import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { userKeys } from "@/entities/user/model/query-keys";
import { useUpdateRole } from "../use-role-actions";

vi.mock("@/shared/api/base", () => ({
	default: { put: vi.fn() },
}));

const mockedApi = api as unknown as { put: Mock };

describe("useUpdateRole", () => {
	it("invalidates the active profile after its role permissions change", async () => {
		useAuthStore.setState({ role: "dev" });
		mockedApi.put.mockResolvedValueOnce({ data: { data: { id: 5, name: "dev", permissions: ["create_tasks"] } } });
		const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
		queryClient.setQueryData(userKeys.profile(7), { data: { role: "dev" } });
		const { result } = renderHook(() => useUpdateRole(), { wrapper: createQueryWrapper(queryClient) });

		await act(() => result.current.mutateAsync({ id: 5, payload: { permissions: ["create_tasks"] } }));

		expect(queryClient.getQueryState(userKeys.profile(7))?.isInvalidated).toBe(true);
	});
});

function createQueryWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}
