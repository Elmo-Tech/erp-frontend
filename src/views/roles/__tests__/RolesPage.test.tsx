import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { useAuthStore } from "@/entities/user/model/auth.store";
import RolesPage from "../RolesPage";

vi.mock("@/shared/api/base", () => ({
	default: {
		get: vi.fn(),
		put: vi.fn(),
	},
}));

const mockedApi = api as unknown as { get: Mock; put: Mock };

describe("RolesPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useAuthStore.setState({
			permissions: [{ permissionName: "manage_roles", access: true }],
		});
		mockedApi.get.mockImplementation((url: string) => {
			if (url === "/admin/roles") {
				return Promise.resolve({ data: { data: [{ id: 5, name: "dev", permissions: [] }] } });
			}

			return Promise.resolve({
				data: { data: [{ name: "create_tasks", description: "Create project tasks", group: "Task Management" }] },
			});
		});
	});

	it("requires protected-account access to edit protected role permissions", async () => {
		mockedApi.put.mockResolvedValueOnce({ data: { data: { id: 5, name: "dev", permissions: ["create_tasks"] } } });
		renderWithQueryClient(<RolesPage />);

		const lockedPermission = await screen.findByRole("checkbox", { name: "create_tasks for dev" });
		expect(lockedPermission).toBeDisabled();
		expect(screen.queryByRole("button", { name: "Delete dev" })).not.toBeInTheDocument();

		useAuthStore.setState({
			permissions: [
				{ permissionName: "manage_roles", access: true },
				{ permissionName: "manage_protected_users", access: true },
			],
		});

		const editablePermission = screen.getByRole("checkbox", { name: "create_tasks for dev" });
		await waitFor(() => expect(editablePermission).toBeEnabled());
		fireEvent.click(editablePermission);

		await waitFor(() => {
			expect(mockedApi.put).toHaveBeenCalledWith("/admin/roles/5", { permissions: ["create_tasks"] });
		});
	});
});

function renderWithQueryClient(children: ReactNode) {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
	return render(<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
}
